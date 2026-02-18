import smtplib
from email.mime.text import MIMEText
from flask import current_app

SYSTEM_SMTP_EMAIL = "" \
""  

def send_mail(to_email, subject, body, sender_email):
    try:
        msg = MIMEText(body, "html")
        msg["Subject"] = subject
        msg["From"] = sender_email         
        msg["To"] = to_email
        msg["Reply-To"] = sender_email

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(
            SYSTEM_SMTP_EMAIL,
            current_app.config['MAIL_APP_PASSWORD']
        )
        server.send_message(msg)
        server.quit()

        print(f"Mail sent to {to_email} by {sender_email}")

    except Exception as e:
        print("Mail failed:", e)
