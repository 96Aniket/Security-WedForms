from config import BASE_URL
from utils.async_mail import send_mail_async
from flask import session

def send_approval_mail_to_user0(request_id, token, user0_email, submitted_by, sender_email):
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
        Review & Approve
    </a>
    """


    send_mail_async(
        to_email=user0_email,
        subject="Requisition Form Submitted – Approval Required",
        body=body,
        sender_email=sender_email              
    )
