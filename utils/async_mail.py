import threading
from flask import current_app

def send_mail_async(to_email, subject, body, sender_email):
    app = current_app._get_current_object()

    def task():
        with app.app_context():
            from utils.mailer import send_mail
            send_mail(to_email, subject, body, sender_email)

    threading.Thread(target=task, daemon=True).start()