from Execute.executesql import get_connection
from utils.mailer import send_mail, SYSTEM_SMTP_EMAIL
from utils.final_summary import send_final_summary
from config import BASE_URL


def process_approval(request_id, level, approver_email, action, remark=None, next_email=None):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO APPROVAL_ACTION_LOGS
        (request_id, approval_level, approver_email, action_taken, remark)
        VALUES (?, ?, ?, ?, ?)
    """, (request_id, level, approver_email, action, remark))

    if action == "REJECT":

        cursor.execute("""
            SELECT TOP 1 approver_email
            FROM APPROVAL_ACTION_LOGS
            WHERE request_id = ?
              AND approval_level < ?
            ORDER BY action_time DESC
        """, (request_id, level))

        prev = cursor.fetchone()
        prev_email = prev.approver_email if prev else None

        if prev_email:
            
            cursor.execute("""
                UPDATE APPROVAL_REQUEST_MASTER
                SET
                    rejected_from_level = ?,
                    current_level = ?,
                    current_approver_email = ?,
                    overall_status = 'PENDING',
                    last_action_time = GETDATE()
                WHERE request_id = ?
            """, (level, level - 1, prev_email, request_id))

            conn.commit()

            edit_link = f"{BASE_URL}/form-edit/{request_id}"

            send_mail(
                to_email=prev_email,
                subject="Requisition Rejected – Action Required",
                body=f"""
                <h3>Requisition Rejected</h3>

                <p><b>Request ID:</b> {request_id}</p>
                <p><b>Rejected By:</b> {approver_email}</p>
                <p><b>Remark:</b> {remark}</p>

                <a href="{edit_link}"
                style="display:inline-block;
                        margin-top:12px;
                        padding:10px 18px;
                        background:#0d6efd;
                        color:white;
                        text-decoration:none;
                        border-radius:6px;">
                    ✏️ Review & Modify Form
                </a>

                <p style="margin-top:12px;font-size:12px;color:gray;">
                Please correct the form and resubmit to continue approval.
                </p>
                """,
                sender_email=SYSTEM_SMTP_EMAIL
            )

            return "REJECTED_BACK"

        cursor.execute("""
            UPDATE APPROVAL_REQUEST_MASTER
            SET overall_status = 'REJECTED',
                last_action_time = GETDATE()
            WHERE request_id = ?
        """, request_id)

        conn.commit()
        send_final_summary(request_id, "REJECTED")
        return "REJECTED_FINAL"


    cursor.execute("""
        SELECT rejected_from_level
        FROM APPROVAL_REQUEST_MASTER
        WHERE request_id = ?
    """, (request_id,))
    row = cursor.fetchone()

    if row and row.rejected_from_level is not None:
        
        next_level = row.rejected_from_level
    else:
        
        next_level = level + 1

    cursor.execute("""
        SELECT is_final
        FROM APPROVAL_LEVEL_CONFIG
        WHERE level_no = ?
    """, (next_level,))
    final_row = cursor.fetchone()

    if final_row and final_row.is_final:
        cursor.execute("""
            UPDATE APPROVAL_REQUEST_MASTER
            SET
                overall_status = 'APPROVED',
                current_level = NULL,
                current_approver_email = NULL,
                rejected_from_level = NULL,
                last_action_time = GETDATE()
            WHERE request_id = ?
        """, request_id)

        conn.commit()
        send_final_summary(request_id, "APPROVED")
        return "APPROVED"

    cursor.execute("""
        UPDATE APPROVAL_REQUEST_MASTER
        SET
            current_level = ?,
            current_approver_email = ?,
            rejected_from_level = NULL,
            last_action_time = GETDATE()
        WHERE request_id = ?
    """, (next_level, next_email, request_id))

    conn.commit()
    return "MOVED"