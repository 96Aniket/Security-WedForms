from config import BASE_URL

def approval_email_template(token, request_id, last_approver="Previous Approver"):

    link = f"{BASE_URL}/approval?token={token}&action=APPROVE"

    return f"""
    <div style="font-family:Arial, Helvetica, sans-serif; background:#f4f6f8; padding:30px;">

    <div style="max-width:600px; margin:auto; background:white; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">

        <div style="background:#0d6efd; padding:18px; color:white; font-size:18px; font-weight:bold;">
            Requisition Approval Required
        </div>

        <div style="padding:25px; color:#333; font-size:14px; line-height:1.6;">

            <p>Dear Sir/Madam,</p>

            <p>
            The requisition request has been reviewed and forwarded to you for the next level of approval.
            </p>

            <table style="width:100%; border-collapse:collapse; margin:15px 0;">
                <tr>
                    <td style="padding:8px; font-weight:bold;">Request ID</td>
                    <td style="padding:8px;">{request_id}</td>
                </tr>

                <tr style="background:#f7f7f7;">
                    <td style="padding:8px; font-weight:bold;">Last Approved By</td>
                    <td style="padding:8px;">{last_approver}</td>
                </tr>
            </table>

            <div style="text-align:center; margin:25px 0;">
                <a href="{link}"
                style="
                    background:#6a11cb;
                    background:linear-gradient(135deg,#6a11cb,#2575fc);
                    padding:12px 25px;
                    color:white;
                    text-decoration:none;
                    border-radius:6px;
                    font-weight:bold;
                    display:inline-block;
                ">
                Review & Approve
                </a>
            </div>

            <p>
            Please click the button above to review the requisition and take the necessary action.
            </p>

            <p style="margin-top:25px;">
            Regards,<br>
            <b>Security Department</b><br>
            Pipeline Infrastructure Limited
            </p>

        </div>

        <div style="
            background:#e9f2ff;
            padding:14px;
            text-align:center;
            font-size:13px;
            color:#1a3c8b;
            border-top:2px solid #0d6efd;
            font-weight:500;
        ">
            ⚠ This is an automated notification from the
            <b>Security Records Digitization System</b>.
            Please do not reply to this email.
        </div>

    </div>

    </div>
    """