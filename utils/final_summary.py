from Execute.executesql import get_connection
from utils.mailer import send_mail
from utils.mailer import SYSTEM_SMTP_EMAIL

def send_final_summary(request_id, final_status):
    conn = get_connection()
    cursor = conn.cursor()

    # Initiator (User-0)
    cursor.execute("""
        SELECT initiator_email
        FROM APPROVAL_REQUEST_MASTER
        WHERE request_id = ?
    """, (request_id,))
    initiator = cursor.fetchone().initiator_email

    # Form filler (User-1)
    cursor.execute("""
        SELECT s_created_by
        FROM REQUISITION_FORM_MASTER
        WHERE n_sr_no = (
            SELECT form_sr_no
            FROM APPROVAL_REQUEST_MASTER
            WHERE request_id = ?
        )
    """, (request_id,))
    form_user = cursor.fetchone().s_created_by

    # Timeline
    cursor.execute("""
        SELECT approver_email, action_taken, remark, action_time
        FROM APPROVAL_ACTION_LOGS
        WHERE request_id = ?
        ORDER BY action_time
    """, (request_id,))
    logs = cursor.fetchall()

    cursor.close()
    conn.close()

    timeline_html = ""
    for l in logs:
        timeline_html += f"""
        <tr>
            <td>{l.approver_email}</td>
            <td>{l.action_taken}</td>
            <td>{l.remark or '-'}</td>
            <td>{l.action_time}</td>
        </tr>
        """

    body = f"""
    <h3>Requisition Request Summary</h3>
    <p><b>Request ID:</b> {request_id}</p>
    <p><b>Final Status:</b> {final_status}</p>

    <table border="1" cellpadding="6">
        <tr>
            <th>User</th>
            <th>Action</th>
            <th>Remark</th>
            <th>Time</th>
        </tr>
        {timeline_html}
    </table>
    """

    send_mail(initiator, "Final Approval Status", body, SYSTEM_SMTP_EMAIL)
    send_mail(form_user, "Final Approval Status", body, SYSTEM_SMTP_EMAIL)
