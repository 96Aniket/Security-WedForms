from Execute.executesql import get_connection
from utils.mailer import send_mail
from utils.token import generate_token
from utils.final_summary import send_final_summary


def process_approval(request_id, level, approver_email, action, remark=None, next_email=None):
    conn = get_connection()
    cursor = conn.cursor()

    # Log action
    cursor.execute("""
        INSERT INTO APPROVAL_ACTION_LOGS
        (request_id, approval_level, approver_email, action_taken, remark)
        VALUES (?, ?, ?, ?, ?)
    """, (request_id, level, approver_email, action, remark))

    if action == "REJECT":
        cursor.execute("""
            UPDATE APPROVAL_REQUEST_MASTER
            SET overall_status='REJECTED',
                last_action_time=GETDATE()
            WHERE request_id=?
        """, request_id)

        conn.commit()
        send_final_summary(request_id, "REJECTED")
        return "REJECTED"

    # Check next level
    cursor.execute("""
        SELECT is_final
        FROM APPROVAL_LEVEL_CONFIG
        WHERE level_no = ?
    """, (level + 1,))
    row = cursor.fetchone()

    if not row or row.is_final:
        cursor.execute("""
            UPDATE APPROVAL_REQUEST_MASTER
            SET overall_status='APPROVED',
                last_action_time=GETDATE()
            WHERE request_id=?
        """, request_id)

        conn.commit()
        send_final_summary(request_id, "APPROVED")
        return "APPROVED"

    # Move forward
    cursor.execute("""
        UPDATE APPROVAL_REQUEST_MASTER
        SET current_level=?,
            current_approver_email=?,
            last_action_time=GETDATE()
        WHERE request_id=?
    """, (level + 1, next_email, request_id))

    conn.commit()
    return "MOVED"
