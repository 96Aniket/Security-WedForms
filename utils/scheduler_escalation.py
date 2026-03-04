from Execute.executesql import get_connection
from utils.mailer import send_mail

def escalate_sla_breach():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT r.request_id,
               r.current_approver_email,
               s.escalation_email
        FROM Atbl_SECURITY_APPROVAL_REQUEST_MASTER r
        JOIN tbl_SECURITY_APPROVAL_SLA_CONFIG s
          ON r.current_level = s.approval_level
        WHERE r.overall_status = 'PENDING'
          AND DATEDIFF(HOUR, r.last_action_time, GETDATE()) >= s.sla_hours
    """)

    rows = cursor.fetchall()

    for r in rows:
        send_mail(
            r.escalation_email,
            "SLA Breach – Approval Pending",
            f"""
            <p>Approval pending beyond SLA.</p>
            <p>Request ID: {r.request_id}</p>
            <p>Pending with: {r.current_approver_email}</p>
            """
        )

        cursor.execute("""
            UPDATE tbl_SECURITY_APPROVAL_REQUEST_MASTER
            SET sla_breached = 1
            WHERE request_id = ?
        """, r.request_id)

    conn.commit()
    cursor.close()
    conn.close()
