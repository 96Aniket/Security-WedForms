from Execute.executesql import get_connection
from utils.mailer import send_mail, SYSTEM_SMTP_EMAIL
from utils.final_summary import send_final_summary
from config import BASE_URL
from utils.async_mail import send_mail_async

def process_approval(request_id, level, approver_email, action, remark=None, next_email=None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            EXEC sp_process_approval ?, ?, ?, ?, ?, ?
        """, (
            request_id,
            level,
            approver_email,
            action,
            remark,
            next_email
        ))
        row = cursor.fetchone()
        status = row[0] if row else None
        conn.commit()
        return status
    finally:
        cursor.close()
        conn.close()

