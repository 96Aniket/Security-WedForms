def approval_email_template(token, approver_name="User"):
    approve_link = f"http://localhost:5001/approval?token={token}&action=APPROVE"
    reject_link = f"http://localhost:5001/approval?token={token}&action=REJECT"

    return f"""
    <h3>Hello {approver_name},</h3>
    <p>Please review the request.</p>

    <a href="{approve_link}"
       style="padding:10px 20px;background:#28a745;color:white;
              text-decoration:none;border-radius:5px;">
       ✅ APPROVE
    </a>

    &nbsp;&nbsp;

    <a href="{reject_link}"
       style="padding:10px 20px;background:#dc3545;color:white;
              text-decoration:none;border-radius:5px;">
       ❌ REJECT
    </a>

    <p style="margin-top:15px;font-size:12px;color:gray;">
      This link is valid for one action only.
    </p>
    """
