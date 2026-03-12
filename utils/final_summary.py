from Execute.executesql import get_connection
from utils.mailer import send_mail
from utils.mailer import SYSTEM_SMTP_EMAIL
from utils.async_mail import send_mail_async

def send_final_summary(request_id, final_status):
    conn = get_connection()
    cursor = conn.cursor()

    # Initiator (User-0)
    cursor.execute("""
        SELECT initiator_email
        FROM tbl_SECURITY_APPROVAL_REQUEST_MASTER
        WHERE request_id = ?
    """, (request_id,))
    row = cursor.fetchone()
    initiator = row.initiator_email if row else None

    # Form filler (User-1)
    cursor.execute("""
        SELECT s_created_by
        FROM tbl_SECURITY_REQUISITION_FORM_MASTER
        WHERE n_sr_no = (
            SELECT form_sr_no
            FROM tbl_SECURITY_APPROVAL_REQUEST_MASTER
            WHERE request_id = ?
        )
    """, (request_id,))
    form_user = cursor.fetchone().s_created_by

    # Timeline
    cursor.execute("""
        SELECT approver_email, action_taken, remark, action_time
        FROM tbl_SECURITY_APPROVAL_ACTION_LOGS
        WHERE request_id = ?
        ORDER BY action_time
    """, (request_id,))
    logs = cursor.fetchall()

    cursor.close()
    conn.close()

    timeline_html = ""
    for l in logs:
        action_time = l.action_time.strftime("%Y-%m-%d %I:%M:%S %p") if l.action_time else "-"
        timeline_html += f"""
        <tr>
            <td>{l.approver_email}</td>
            <td>{l.action_taken}</td>
            <td>{l.remark or '-'}</td>
            <td>{action_time}</td>
        </tr>
        """

    body = f"""
    <div style="font-family:Arial, Helvetica, sans-serif; background:#f4f6f8; padding:30px;">

    <div style="max-width:700px; margin:auto; background:white; border-radius:8px;
                overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">

        <div style="background:#0d6efd; padding:18px; color:white;
                    font-size:18px; font-weight:bold;">
            Requisition Request – Final Status
        </div>

        <div style="padding:25px; color:#333; font-size:14px; line-height:1.6;">

            <p>Dear User,</p>

            <p>
            The requisition request has completed the approval workflow.
            Please find the final decision and approval timeline below.
            </p>

            <table style="width:100%; border-collapse:collapse; margin-top:15px;">
                <tr>
                    <td style="padding:6px; font-weight:bold;">Request ID</td>
                    <td style="padding:6px;">{request_id}</td>
                </tr>
                <tr style="background:#f7f7f7;">
                    <td style="padding:6px; font-weight:bold;">Final Status</td>
                    <td style="padding:6px;">
                        <span style="padding:4px 10px;
                                    border-radius:4px;
                                    color:white;
                                    background:{'#28a745' if final_status == 'APPROVED' else '#dc3545'};">
                            {final_status}
                        </span>
                    </td>
                </tr>
            </table>

            <h4 style="margin-top:25px;">Approval Timeline</h4>

            <table style="width:100%; border-collapse:collapse; font-size:13px;">
                <tr style="background:#f1f1f1;">
                    <th style="padding:8px;border:1px solid #ddd;">User</th>
                    <th style="padding:8px;border:1px solid #ddd;">Action</th>
                    <th style="padding:8px;border:1px solid #ddd;">Remark</th>
                    <th style="padding:8px;border:1px solid #ddd;">Time</th>
                </tr>

                {timeline_html}

            </table>

            <p style="margin-top:25px;">
            This email is for your reference and records.
            </p>

            <p style="margin-top:20px;">
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
             This is an automated notification from the
            <b>Security Records Digitization System</b>.
            Please do not reply to this email.
        </div>

    </div>

    </div>
    """

    send_mail_async(initiator, "Final Approval Status", body, SYSTEM_SMTP_EMAIL)
    send_mail_async(form_user, "Final Approval Status", body, SYSTEM_SMTP_EMAIL)