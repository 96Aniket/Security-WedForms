from config import BASE_URL

def approval_email_template(token, approver_name="User 2"):
    approve_link = f"{BASE_URL}/approval?token={token}&action=APPROVE"
    reject_link  = f"{BASE_URL}/approval?token={token}&action=REJECT"

    return f"""
    <h3>Hello {approver_name},</h3>

    <p>Please review the requisition request.</p>

    <a href="{approve_link}"
       style="display:inline-block;
              padding:10px 20px;
              background:#28a745;
              color:white;
              text-decoration:none;
              border-radius:5px;
              font-weight:bold;">
        APPROVE
    </a>

    &nbsp;&nbsp;

    <a href="{reject_link}"
       style="display:inline-block;
              padding:10px 20px;
              background:#dc3545;
              color:white;
              text-decoration:none;
              border-radius:5px;
              font-weight:bold;">
        REJECT
    </a>

    <p style="margin-top:15px;font-size:12px;color:gray;">
      This link is valid for one action only.
    </p>
    """
