from config import BASE_URL
from utils.async_mail import send_mail_async


def send_approval_mail_to_user0(
    request_id,
    token,
    user0_email,
    submitted_by,
    sender_email
):
    if not user0_email:
        print("MAIL ERROR: user0_email is empty")
        return

    link = f"{BASE_URL}/approval?token={token}&action=APPROVE"

    body = f"""
    <h3>Requisition Form Submitted</h3>

    <p>The requisition form has been submitted successfully.</p>

    <p>
        <b>Request ID:</b> {request_id}<br>
        <b>Submitted By:</b> {submitted_by}
    </p>

    <a href="{link}"
       style="
         padding:12px 20px;
         background:#0d6efd;
         color:white;
         text-decoration:none;
         border-radius:6px;
         display:inline-block;
       ">
        Review & Approve
    </a>
    """

    try:
        send_mail_async(
            to_email=user0_email,
            subject="Requisition Form Submitted – Approval Required",
            body=body,
            sender_email=sender_email
        )
        print("MAIL SENT TO USER-0:", user0_email)

    except Exception as e:
        print("MAIL FAILED:", e)