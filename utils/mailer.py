import smtplib
from email.mime.text import MIMEText
from flask import current_app

SYSTEM_SMTP_EMAIL = "aniketsupekar2004@gmail.com"

def send_mail(to_email, subject, body, sender_email=None):
    try:
        # ---------- HARD SAFETY ----------
        if isinstance(to_email, (list, tuple)):
            to_email = ", ".join([e for e in to_email if e])

        if not to_email or not isinstance(to_email, str):
            print("MAIL SKIPPED: Invalid to_email →", to_email)
            return

        from_email = SYSTEM_SMTP_EMAIL
        reply_to = sender_email or SYSTEM_SMTP_EMAIL

        msg = MIMEText(body, "html")
        msg["Subject"] = subject
        msg["From"] = from_email
        msg["To"] = to_email
        msg["Reply-To"] = reply_to

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(
            SYSTEM_SMTP_EMAIL,
            current_app.config['MAIL_APP_PASSWORD']
        )
        server.send_message(msg)
        server.quit()

        print(f"MAIL SENT OK → {to_email}")

    except Exception as e:
        print("MAIL FAILED (SMTP):", repr(e))