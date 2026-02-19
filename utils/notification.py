from utils.mailer import send_mail, SYSTEM_SMTP_EMAIL
from config import BASE_URL

def send_approval_mail_to_user0(request_id, token, user0_email, submitted_by):
    link = f"{BASE_URL}/approval?token={token}&action=APPROVE"

    body = f"""
    <h3>Requisition Form Submitted</h3>

    <p><b>Agency</b> has submitted the requisition form.</p>

    <p>
      <b>Request ID:</b> {request_id}<br>
      <b>Submitted By:</b> {submitted_by}
    </p>

    <a href="{link}"
       style="padding:12px 20px;
              background:#0d6efd;
              color:white;
              text-decoration:none;
              border-radius:6px;">
       🔍 Review & Approve
    </a>

    <p style="margin-top:12px;font-size:12px;color:gray;">
      This link will work only on the system where the project is running.
    </p>
    """

    send_mail(
        to_email=user0_email,
        subject="Requisition Form Submitted – Approval Required",
        body=body,
        sender_email=SYSTEM_SMTP_EMAIL
    )
