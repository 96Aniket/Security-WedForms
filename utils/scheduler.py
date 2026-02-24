from apscheduler.schedulers.background import BackgroundScheduler
from Execute.executesql import get_connection
from utils.token import generate_token
from utils.mailer import send_mail
from config import BASE_URL

def send_pending_reminders():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT request_id, current_level, current_approver_email
        FROM APPROVAL_REQUEST_MASTER
        WHERE overall_status = 'PENDING'WHERE overall_status IN ('PENDING','APPROVED','REJECTED')
        AND DATEDIFF(HOUR, last_action_time, GETDATE()) >= 24
    """)

    rows = cursor.fetchall()

    for r in rows:
        token = generate_token(
            r.request_id,
            r.current_level,
            r.current_approver_email
        )

        link = f"{BASE_URL}/approval?token={token}"

        send_mail(
            r.current_approver_email,
            "Reminder: Pending Approval",
            f"""
            <p>Your approval is pending.</p>
            <a href="{link}">Approve / Reject</a>
            """
        )

    cursor.close()
    conn.close()


def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(send_pending_reminders, 'interval', hours=24)
    scheduler.start()
