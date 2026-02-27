import threading
from flask import current_app


def send_mail_async(to_email, subject, body, sender_email):
    if isinstance(to_email, list):
        to_email = ", ".join(to_email)
    elif not isinstance(to_email, str):
        print("MAIL ERROR: Invalid to_email:", to_email)
        return

    app = current_app._get_current_object()

    def task():
        with app.app_context():
            from utils.mailer import send_mail
            send_mail(
                to_email=to_email,
                subject=subject,
                body=body,
                sender_email=sender_email
            )

    threading.Thread(target=task, daemon=True).start()