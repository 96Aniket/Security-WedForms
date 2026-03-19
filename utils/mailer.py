import smtplib
from email.mime.text import MIMEText
from flask import current_app

SYSTEM_SMTP_EMAIL = ""


def send_mail(to_email, subject, body, sender_email=None):
    try:
        # ---------- HARD SAFETY ----------
        if isinstance(to_email, (list, tuple)):
            to_email = ", ".join([e for e in to_email if e])

        if not to_email or not isinstance(to_email, str):
            print("MAIL SKIPPED: Invalid to_email →", to_email)
            return

        # ---------- FETCH ADMINS FROM DB ----------
        try:
            from Execute.executesql import get_connection
            from Execute.Functions.functions import get_admin_emails

            conn = get_connection()
            admin_emails = get_admin_emails(conn)
            conn.close()
        except Exception as db_error:
            print("ADMIN FETCH FAILED:", db_error)
            admin_emails = []

        admin_emails = [e for e in admin_emails if e != to_email]

        from_email = SYSTEM_SMTP_EMAIL
        reply_to = sender_email or SYSTEM_SMTP_EMAIL

        msg = MIMEText(body, "html")
        msg["Subject"] = subject
        msg["From"] = from_email
        msg["To"] = to_email
        msg["Reply-To"] = reply_to

        # ---------- ADD CC ----------
        if admin_emails:
            msg["Cc"] = ", ".join(admin_emails)

        recipients = [to_email] + admin_emails

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()

        server.login(
            SYSTEM_SMTP_EMAIL,
            current_app.config['MAIL_APP_PASSWORD']
        )

        server.sendmail(from_email, recipients, msg.as_string())
        server.quit()

        print(f"MAIL SENT OK → {to_email}")
        print("CC ADMINS →", admin_emails)

    except Exception as e:
        print("MAIL FAILED (SMTP):", repr(e))