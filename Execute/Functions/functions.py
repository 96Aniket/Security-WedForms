from flask import request, jsonify, session , send_file, render_template
from Execute import queries
from Execute.queries import fetch_data_with_date, get_report_master_tables
from excel_bp import write_excel
from services.approval_service import execute_sp
from utils.token import generate_token, mark_token_used, validate_token
from utils.mailer import SYSTEM_SMTP_EMAIL
from Execute.executesql import get_connection
from utils.approval_engine import process_approval
from utils.notification import send_approval_mail_to_user0
from config import BASE_URL
from utils.email_templates import approval_email_template
from utils.async_mail import send_mail_async
from utils.final_summary import send_final_summary
from flask import redirect
import random
import string
import pyodbc
import mimetypes
import io

# =====================================================
# LOGIN
# =====================================================

def login_user():

    if request.method == "POST":

        email = request.form.get("email")
        password = request.form.get("password")

        user = queries.authenticate_user(email, password)

        if not user:
            return render_template("login.html", error="Invalid User ID or Password")

        if user[1] == 1:
            role = "admin"
        elif user[1] == 3:
            role = "agency"
        else:
            role = "user"

        session["user"] = {
            "email": user[0],
            "name": user[0].split("@")[0],
            "location": user[2],
            "role": role
        }

        token = session.pop("form_token", None)

        if token:
            return redirect(f"/form-fill?token={token}")

        return redirect("/")

    return render_template("login.html")


# =====================================================
# COMMON RESPONSE HELPERS
# =====================================================

def success_response(message="", data=None, status=200):
    res = {"success": True, "message": message}
    if data is not None:
        res["data"] = data
    return jsonify(res), status


def error_response(message="Something went wrong", status=400):
    return jsonify({"success": False, "message": message}), status


# =====================================================
# PATROLLING OBSERVATION REGISTER
# =====================================================

def save_patrolling_data_fn():
    try:
        data = request.get_json()
        if not data:
            return error_response("No data received")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.save_patrolling_data(data, username)

        return success_response(msg) if success else error_response(msg)
    except Exception as e:
        return error_response(str(e), 500)


def get_patrolling_data():
    try:
        user = session.get("user", {})
        user_role = user.get("role")
        user_location = user.get("location")

        success, data = queries.get_patrolling_data(user_role, user_location)

        return success_response(data=data) if success else error_response("Failed to fetch data")

    except Exception as e:
        return error_response(str(e), 500)


def update_patrolling_data():
    try:
        data = request.get_json()
        if not data:
            return error_response("No data received")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.update_patrolling_data(data, username)

        return success_response(msg) if success else error_response(msg)
    except Exception as e:
        return error_response(str(e), 500)


def delete_patrolling_data():
    try:
        data = request.get_json()
        if not data or "n_sr_no" not in data:
            return error_response("Invalid delete request")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.delete_patrolling_data(data, username)

        return success_response(msg) if success else error_response(msg)

    except Exception as e:
        return error_response(str(e), 500)


# =====================================================
# BBA TEST RECORD REGISTER
# =====================================================

def save_bba_test_data_fn():
    try:
        data = request.get_json()
        if not data:
            return error_response("No data received")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.save_bba_test_data(data, username)

        return success_response(msg) if success else error_response(msg)
    except Exception as e:
        return error_response(str(e), 500)


def get_bba_test_data():
    try:
        user = session.get("user", {})
        user_role = user.get("role")
        user_location = user.get("location")

        success, data = queries.get_bba_test_data(user_role, user_location)
        return success_response(data=data) if success else error_response("Failed to fetch data")

    except Exception as e:
        return error_response(str(e), 500)


def update_bba_test_data():
    try:
        data = request.get_json()
        if not data:
            return error_response("No data received")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.update_bba_test_data(data, username)

        return success_response(msg) if success else error_response(msg)
    except Exception as e:
        return error_response(str(e), 500)


def delete_bba_test_data():
    try:
        data = request.get_json()
        if not data or "n_sr_no" not in data:
            return error_response("Invalid delete request")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.delete_bba_test_data(data, username)

        return success_response(msg) if success else error_response(msg)
    except Exception as e:
        return error_response(str(e), 500)


# =====================================================
# PIPELINE MITRA REGISTER
# =====================================================

def save_pipeline_mitra_data_fn():
    try:
        data = request.get_json(force=True)
        if not data:
            return error_response("No data received")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.save_pipeline_mitra_data(data, username)

        return success_response(msg) if success else error_response(msg)
    except Exception as e:
        return error_response(str(e), 500)


def get_pipeline_mitra_data():
    try:
        user = session.get("user", {})
        user_role = user.get("role")
        user_location = user.get("location")

        success, data = queries.get_pipeline_mitra_data(user_role, user_location)

        return success_response(data=data) if success else error_response("Failed to fetch data")

    except Exception as e:
        return error_response(str(e), 500)


def update_pipeline_mitra_data():
    try:
        data = request.get_json()
        if not data:
            return error_response("No data received")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.update_pipeline_mitra_data(data, username)

        return success_response(msg) if success else error_response(msg)
    except Exception as e:
        return error_response(str(e), 500)


def delete_pipeline_mitra_data():
    try:
        data = request.get_json()

        deleted_by = session.get("user", {}).get("name", "system")
        data["deleted_by"] = deleted_by

        success, msg = queries.delete_pipeline_mitra_data(data)
        return success_response(msg) if success else error_response(msg)

    except Exception as e:
        return error_response(str(e), 500)


# =====================================================
# VEHICLE CHECKLIST
# =====================================================

def save_vehicle_checklist_full_fn():
    try:
        data = request.get_json(force=True)
        if not data:
            return error_response("No data received")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.save_vehicle_checklist_full(data, username)

        return success_response(msg) if success else error_response(msg)

    except Exception as e:
        return error_response(str(e), 500)


def get_vehicle_checklist_data_fn():
    try:
        user = session.get("user", {})
        user_role = user.get("role")
        user_location = user.get("location")

        success, data = queries.get_vehicle_checklist_data(user_role, user_location)

        return success_response(data=data) if success else error_response("Failed to fetch data")

    except Exception as e:
        return error_response(str(e), 500)


def update_vehicle_checklist_data_fn():
    try:
        data = request.get_json(force=True)
        if not data:
            return error_response("No data received")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.update_vehicle_checklist_data(data, username)

        return success_response(msg) if success else error_response(msg)

    except Exception as e:
        return error_response(str(e), 500)


def delete_vehicle_checklist_data_fn():
    try:
        data = request.get_json(force=True)
        if not data or "n_vc_id" not in data:
            return error_response("Invalid delete request")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.delete_vehicle_checklist_data(data, username)

        return success_response(msg) if success else error_response(msg)

    except Exception as e:
        return error_response(str(e), 500)


# =====================================================
# VISITOR REGISTER
# =====================================================

def save_visitor_declaration_data_fn():
    try:
        data = request.get_json(force=True)
        if not data:
            return error_response("No data received")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.save_visitor_declaration_data(data, username)

        return success_response(msg) if success else error_response(msg)
    except Exception as e:
        return error_response(str(e), 500)


def get_visitor_declaration_data_fn():
    try:
        user = session.get("user", {})
        user_role = user.get("role")
        user_location = user.get("location")

        success, data = queries.get_visitor_declaration_data(
            user_role, user_location
        )

        return success_response(data=data) if success else error_response("Failed to fetch data")

    except Exception as e:
        return error_response(str(e), 500)


def update_visitor_declaration_data_fn():
    try:
        data = request.get_json(force=True)
        if not data:
            return error_response("No data received")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.update_visitor_declaration_data(data, username)

        return success_response(msg) if success else error_response(msg)
    except Exception as e:
        return error_response(str(e), 500)


def delete_visitor_declaration_data_fn():
    try:
        data = request.get_json(force=True)
        if not data or "n_sl_no" not in data:
            return error_response("Invalid delete request")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.delete_visitor_declaration_data(data, username)

        return success_response(msg) if success else error_response(msg)
    except Exception as e:
        return error_response(str(e), 500)


# =====================================================
# CASUAL LABOUR REGISTER
# =====================================================

def save_casual_labour_data_fn():
    try:
        data = request.get_json(force=True)
        if not data:
            return error_response("No data received")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.save_casual_labour_data(data, username)

        return success_response(msg) if success else error_response(msg)
    except Exception as e:
        return error_response(str(e), 500)


def get_casual_labour_data_fn():
    try:
        user = session.get("user", {})
        user_role = user.get("role")
        user_location = user.get("location")

        success, data = queries.get_casual_labour_data(user_role, user_location)

        return success_response(data=data) if success else error_response("Failed to fetch data")

    except Exception as e:
        return error_response(str(e), 500)


def update_casual_labour_data_fn():
    try:
        data = request.get_json(force=True)
        if not data:
            return error_response("No data received")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.update_casual_labour_data(data, username)

        return success_response(msg) if success else error_response(msg)
    except Exception as e:
        return error_response(str(e), 500)


def delete_casual_labour_data_fn():
    try:
        data = request.get_json(force=True)
        if not data or "n_sl_no" not in data:
            return error_response("Invalid delete request")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.delete_casual_labour_data(data, username)

        return success_response(msg) if success else error_response(msg)
    except Exception as e:
        return error_response(str(e), 500)


# =====================================================
# REPORT MASTER TABLE CONFIG
# =====================================================

def download_filtered_excel_logic(table, start, end, location):
    try:
        # ---------------- BASIC VALIDATION ----------------
        if not table or not start or not end:
            return jsonify({
                "success": False,
                "message": "Table and date range are required"
            }), 400

        # ---------------- USER CONTEXT ----------------
        user = session.get("user", {})
        role = user.get("role", "user")
        user_location = user.get("location")

        # ---------------- LOCATION ENFORCEMENT ----------------
        # Non-admin users can download ONLY their own location data
        if role != "admin":
            location = user_location

        # Admin must explicitly select location
        if not location:
            return jsonify({
                "success": False,
                "message": "Location is required"
            }), 400

        location = location.strip().upper()

        # ---------------- FETCH DATA ----------------
        df = fetch_data_with_date(
            table=table,
            start_date=start,
            end_date=end,
            location=location
        )

        if df is None or df.empty:
            return jsonify({
                "success": False,
                "message": "No data found for selected filters"
            }), 404

        # ---------------- GENERATE EXCEL ----------------
        excel_file = write_excel(df)

        return send_file(
            excel_file,
            as_attachment=True,
            download_name=f"{table}_{location}_{start}_to_{end}.xlsx",
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

    except Exception as e:
        import traceback
        traceback.print_exc()

        return jsonify({
            "success": False,
            "message": "Report generation failed"
        }), 500


def download_filtered_excel():
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({"success": False, "message": "Invalid JSON"}), 400

        return download_filtered_excel_logic(
            table=data.get("table"),
            start=data.get("start"),
            end=data.get("end"),
            location=data.get("location")  # ✅ REQUIRED
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": "Internal server error",
            "error": str(e)
        }), 500


def get_report_tables_fn():
    return jsonify(get_report_master_tables())


def get_report_tables():
    return get_report_tables_fn()


def get_locations_fn():
    try:
        user = session.get("user", {})
        if user.get("role") != "admin":
            return jsonify({"success": False, "message": "Unauthorized"}), 403

        locations = queries.get_all_locations()
        return jsonify({"success": True, "data": locations})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# =====================================================
# Requisition Form
# =====================================================

def create_request():

    data = request.get_json()
    if not data:
        return error_response("Invalid request body")

    receiver_email = data.get("first_user_email")
    sender_email = session.get("user", {}).get("email")

    if not sender_email:
        return error_response("User session expired", 401)

    if not receiver_email:
        return {"error": "Receiver email required"}, 400

    password = queries.create_agency_user(receiver_email)

    request_id = queries.create_request(sender_email, receiver_email)

    token = generate_token(request_id, 0, receiver_email)

    send_form_fill_mail(
        receiver_email,
        sender_email,
        request_id,
        password,
        token
    )

    return {"success": True, "request_id": request_id}


def send_form_fill_mail(receiver_email, sender_email, request_id, password, token):

    link = f"{BASE_URL}/login?token={token}"

    send_mail_async(
        receiver_email,
        "Form Submission Request",
        f"""
        <div style="font-family:Arial, Helvetica, sans-serif; background:#f4f6f8; padding:30px;">

        <div style="max-width:600px; margin:auto; background:white; border-radius:8px;
                    overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">

            <div style="background:#0d6efd; padding:18px; color:white;
                        font-size:18px; font-weight:bold;">
                Requisition Form Submission Request
            </div>

            <div style="padding:25px; color:#333; font-size:14px; line-height:1.6;">

                <p>Dear Sir/Madam,</p>

                <p>
                You have received a request from the <b>Security Department</b> to submit
                the required details for the security records process.
                </p>

                <p><b>Login Credentials</b></p>

                <p>
                User ID : {receiver_email}<br>
                Password : {password}
                </p>

                <p>
                Kindly click the button below to open the requisition form and complete
                the submission.
                </p>

                <div style="text-align:center; margin:25px 0;">
                    <a href="{link}"
                    style="
                        background:#6a11cb;
                        background:linear-gradient(135deg,#6a11cb,#2575fc);
                        padding:12px 26px;
                        color:white;
                        text-decoration:none;
                        border-radius:6px;
                        font-weight:bold;
                        display:inline-block;
                    ">
                    Fill Requisition Form
                    </a>
                </div>

                <table style="width:100%; border-collapse:collapse; margin-top:15px;">
                <tr>
                    <td style="padding:6px; font-weight:bold;">Requested By</td>
                    <td style="padding:6px;">{sender_email}</td>
                </tr>
                <tr style="background:#f7f7f7;">
                    <td style="padding:6px; font-weight:bold;">Request ID</td>
                    <td style="padding:6px;">{request_id}</td>
                </tr>
                </table>

                <p style="margin-top:20px;">
                Please ensure that all required information is filled accurately before submitting the form.
                </p>

                <p>
                If you face any issues while filling the form, please contact the Security Department.
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
                 This is an automated notification from the
                <b>Security Records Digitization System</b>.
                Please do not reply to this email.
            </div>

        </div>

        </div>
        """,
        sender_email
    )


def submit_form():
    data = request.form
    files = request.files

    used_token = request.form.get("token")
    token_data, error = validate_token(used_token)
    if error:
        return error

    request_id = data.get("request_id")
    if not request_id:
        return {"error": "request_id missing"}, 400
    
    # --------- CHECK FORM ALREADY SUBMITTED ---------
    status = queries.get_request_status(request_id)

    if status and status != "PENDING":
        return {"error": "Form already submitted"}, 400
    # -----------------------------------------------

    created_by = queries.get_receiver_email(request_id) or "unknown_user"

    # ---------- PHOTO (DB ONLY) ----------
    photo = files.get("s_photo")
    photo_bytes = photo.read() if photo and photo.filename else None

    def chk(name):
        return int(data.get(name, 0))

    form_data = {
        "s_location": data.get("s_location"),
        "dt_request_date": data.get("dt_request_date"),
        "s_first_name": data.get("s_first_name"),
        "s_middle_name": data.get("s_middle_name"),   
        "s_last_name": data.get("s_last_name"),
        "s_photo": photo_bytes,                    
        "dt_date_of_birth": data.get("dt_date_of_birth"),
        "n_age": data.get("n_age"),
        "s_agency_name": data.get("s_agency_name"),
        "s_sap_vendor_code": data.get("s_sap_vendor_code"), 
        "s_nature_of_job": data.get("s_nature_of_job"),
        "s_work_order_no": data.get("s_work_order_no"),
        "dt_work_order_validity": data.get("dt_work_order_validity"),
        "dt_date_of_joining": data.get("dt_date_of_joining"),
        "s_exact_work_location": data.get("s_exact_work_location"),
        "n_height_cm": data.get("n_height_cm"),       
        "s_gender": data.get("s_gender"),
        "s_blood_group": data.get("s_blood_group"),   
        "s_identification_mark": data.get("s_identification_mark"),
        "s_aadhar_card_no": data.get("s_aadhar_card_no"),
        "s_present_address": data.get("s_present_address"),
        "s_present_city": data.get("s_present_city"),
        "s_present_state": data.get("s_present_state"),
        "s_present_pincode": data.get("s_present_pincode"),
        "s_contact_no": data.get("s_contact_no"),
        "s_emergency_contact_details": data.get("s_emergency_contact_details"),
        "s_emergency_city": data.get("s_emergency_city"),
        "s_emergency_state": data.get("s_emergency_state"),
        "s_emergency_pincode": data.get("s_emergency_pincode"),
        "s_emergency_contact_no": data.get("s_emergency_contact_no"),
        "s_police_verification_cert": chk("s_police_verification_cert"),  
        "s_medical_certificate": chk("s_medical_certificate"),          
        "s_govt_id_proof": chk("s_govt_id_proof"),                        
        "s_hsse_training": chk("s_hsse_training"),                
    }

    form_sr_no = queries.insert_requisition_form(form_data, created_by)

    initiator_email = queries.get_initiator_email(request_id)
    receiver_email = queries.get_receiver_email(request_id)

    queries.insert_submit_log(request_id, receiver_email)

    queries.update_request_after_submit(
        request_id=request_id,
        form_sr_no=form_sr_no,
        approver_email=initiator_email
    )

    token = generate_token(request_id, 0, initiator_email)

    send_approval_mail_to_user0(
        request_id=request_id,
        token=token,
        user0_email=initiator_email, 
        submitted_by=receiver_email,       
        sender_email=created_by
    )
    mark_token_used(used_token)
    return jsonify({"status": "submitted successfully"})


def approve():
    data = request.get_json()
    if not data:
        return error_response("Invalid request body")

    result = process_approval(
        data['request_id'],
        data['current_level'],
        data['approver_email'],
        "APPROVE",
        None,
        data['next_approver_email']
    )

    return jsonify({"status": result})


def reject():
    data = request.get_json()
    if not data:
        return error_response("Invalid request body")

    execute_sp(
        "sp_reject_request",
        (
            data['request_id'],
            data['current_level'],
            data['approver_email'],
            data['remark']
        )
    )

    return jsonify({"status": "rejected"})


def approval_action():

    used_token = request.form.get('token')
    if not used_token:
        return error_response("Token missing")

    token_data, error = validate_token(used_token)
    if error:
        return error

    action = request.form['action']
    if action not in ["APPROVE", "REJECT"]:
        return error_response("Invalid action")

    remark = request.form.get('remark', '').strip()

    if action == "REJECT" and not remark:
        return error_response("Remark is mandatory for rejection")

    files = request.files

    # ================= DOCUMENT UPLOAD =================

    if action == "APPROVE" and token_data["approval_level"] == 0:

        police_img = files.get("s_police_verification_cert_img")
        medical_img = files.get("s_medical_certificate_img")
        govt_img = files.get("s_govt_id_proof_img")
        hsse_img = files.get("s_hsse_training_img")

        if police_img or medical_img or govt_img or hsse_img:

            queries.update_security_documents(
                token_data['request_id'],
                pyodbc.Binary(police_img.read()) if police_img and police_img.filename else None,
                pyodbc.Binary(medical_img.read()) if medical_img and medical_img.filename else None,
                pyodbc.Binary(govt_img.read()) if govt_img and govt_img.filename else None,
                pyodbc.Binary(hsse_img.read()) if hsse_img and hsse_img.filename else None,
                token_data['approver_email']
            )

    next_email = request.form.get('next_email', '').strip()

    is_final = queries.is_final_level(token_data['approval_level'] + 1)

    if action == "APPROVE" and not is_final and not next_email:
        return error_response("Next approver email required")

    mark_token_used(used_token)

    result = process_approval(
        token_data['request_id'],
        token_data['approval_level'],
        token_data['approver_email'],
        action,
        remark,
        next_email
    )

    # if action == "APPROVE" and queries.is_final_level(token_data['approval_level'] + 1):
    #     print("FINAL APPROVAL DETECTED → sending summary")

    #     try:
    #         send_final_summary(token_data['request_id'], "APPROVED")
    #     except Exception as e:
    #         print("Final summary mail failed:", e)

    # ================= NEXT APPROVER =================

    if result == "MOVED":

        next_token = generate_token(
            token_data['request_id'],
            token_data['approval_level'] + 1,
            next_email
        )

        body = approval_email_template(
            token=next_token,
            request_id=token_data['request_id'],
            last_approver=token_data['approver_email']
        )

        try:
            send_mail_async(
                next_email,
                "Approval Required",
                body,
                sender_email=token_data['approver_email']
            )
        except Exception as e:
            print("Next approver mail failed:", e)

    # ================= REJECT BACK =================

    elif result == "REJECTED_BACK":

        prev_email = queries.get_current_approver(token_data['request_id'])

        edit_token = generate_token(
            token_data['request_id'],
            token_data['approval_level'],
            prev_email
        )

        edit_link = f"{BASE_URL}/form-edit?token={edit_token}"

        try:
            send_mail_async(
                prev_email,
                "Requisition Rejected – Please Review",
                f"""
                <div style="font-family:Arial, Helvetica, sans-serif; background:#f4f6f8; padding:30px;">

                <div style="max-width:650px; margin:auto; background:white; border-radius:8px;
                            overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">

                    <div style="background:#dc3545; padding:18px; color:white;
                                font-size:18px; font-weight:bold;">
                        Requisition Rejected – Please Review
                    </div>

                    <div style="padding:25px; color:#333; font-size:14px; line-height:1.6;">

                        <p>Dear User,</p>

                        <p>
                        The requisition request has been reviewed and <b>rejected</b>.
                        Please check the details below and update the form accordingly.
                        </p>

                        <table style="width:100%; border-collapse:collapse; margin-top:15px;">
                            <tr>
                                <td style="padding:6px; font-weight:bold;">Request ID</td>
                                <td style="padding:6px;">{token_data['request_id']}</td>
                            </tr>

                            <tr style="background:#f7f7f7;">
                                <td style="padding:6px; font-weight:bold;">Rejected By</td>
                                <td style="padding:6px;">{token_data['approver_email']}</td>
                            </tr>

                            <tr>
                                <td style="padding:6px; font-weight:bold;">Remark</td>
                                <td style="padding:6px; color:#dc3545;"><b>{remark}</b></td>
                            </tr>
                        </table>

                        <div style="text-align:center; margin:25px 0;">
                            <a href="{edit_link}"
                            style="
                                background:#6a11cb;
                                background:linear-gradient(135deg,#6a11cb,#2575fc);
                                padding:12px 26px;
                                color:white;
                                text-decoration:none;
                                border-radius:6px;
                                font-weight:bold;
                                display:inline-block;
                            ">
                            Review & Modify Form
                            </a>
                        </div>

                        <p>
                        Please review the rejection remark, update the form if required,
                        and resubmit it for approval.
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
                         This is an automated notification from the
                        <b>Security Records Digitization System</b>.
                    </div>

                </div>

                </div>
                """,
                sender_email=token_data['approver_email']
            )
        except Exception as e:
            print("Reject mail failed:", e)

    # ================= FINAL WORKFLOW COMPLETE =================

    elif result in ["APPROVED", "FINAL_APPROVED", "DONE", "COMPLETED"]:

        print("FINAL APPROVAL DETECTED → sending summary")

        queries.update_request_status(
            token_data['request_id'],
            "APPROVED"
        )

        try:
            send_final_summary(token_data['request_id'], "APPROVED")
        except Exception as e:
            print("Final summary mail failed:", e)


    elif result in ["REJECTED_FINAL", "FINAL_REJECTED"]:

        print("FINAL REJECTION DETECTED → sending summary")

        try:
            send_final_summary(token_data['request_id'], "REJECTED")
        except Exception as e:
            print("Final reject mail failed:", e)

    return jsonify({"status": result})


def view_document_fn(doc_type, request_id):

    file_data = queries.get_document_file(doc_type, request_id)

    if not file_data:
        return "Document not found", 404

    mime_type = "application/octet-stream"

    if file_data[:4] == b'%PDF':
        mime_type = "application/pdf"

    elif file_data[:2] == b'PK':  
        mime_type = "application/vnd.openxmlformats-officedocument"

    elif file_data[:4] in (b'\xff\xd8\xff\xe0', b'\xff\xd8\xff\xe1'):
        mime_type = "image/jpeg"

    elif file_data[:8] == b'\x89PNG\r\n\x1a\n':
        mime_type = "image/png"

    return send_file(
        io.BytesIO(file_data),
        mimetype=mime_type,
        as_attachment=False
    )


def download_document_fn(doc_type, request_id):

    file_data = queries.get_document_file(doc_type, request_id)

    if not file_data:
        return "Document not found", 404

    return send_file(
        io.BytesIO(file_data),
        mimetype="application/octet-stream",
        as_attachment=True,
        download_name="document.pdf"
    )


def resend_approval():

    data = request.get_json()
    if not data:
        return error_response("Invalid request body")

    request_id = data['request_id']

    level = queries.get_current_level(request_id)
    approver = queries.get_current_approver(request_id)

    if not approver:
        return {"error": "No approver found"}, 400

    token = generate_token(request_id, level, approver)

    # ====================================
    # AGENCY FORM FILL STAGE
    # ====================================
    if level == 0:

        sender_email = queries.get_initiator_email(request_id)
        password = queries.get_user_password(approver)

        send_form_fill_mail(
            approver,
            sender_email,
            request_id,
            password,
            token
        )

    # ====================================
    # APPROVAL STAGE
    # ====================================
    else:

        body = approval_email_template(
            token=token,
            request_id=request_id,
            last_approver="Reminder"
        )

        send_mail_async(
            approver,
            "Approval Required",
            body,
            session['user']['email']
        )

    return {"status": "resent successfully"}


def save_form():
    data = request.get_json()
    if not data:
        return error_response("Invalid data")

    result = execute_sp(
        "sp_save_requisition_form",
        (
            data['s_location'],
            data['dt_request_date'],
            data['s_first_name'],
            data.get('s_middle_name'),
            data['s_last_name'],
            data['dt_date_of_birth'],
            data['n_age'],
            data['s_agency_name'],
            data.get('s_sap_vendor_code'),
            data['s_nature_of_job'],
            data['s_work_order_no'],
            data['dt_work_order_validity'],
            data['dt_date_of_joining'],
            data['s_exact_work_location'],
            data['s_gender'],
            data['s_aadhar_card_no'],
            data['s_present_address'],
            data['s_present_city'],
            data['s_present_state'],
            data['s_present_pincode'],
            data['s_contact_no'],
            data['s_emergency_contact_details'],
            data['s_emergency_city'],
            data['s_emergency_state'],
            data['s_emergency_pincode'],
            data['s_emergency_contact_no'],
            session['user']['email']
        )
    )

    if not result:
        return {"error": "Form save failed"}, 500

    return {
        "status": "success",
        "form_sr_no": result[0]
    }


def approval_page_fn(request):

    token = request.args.get("token")

    data, error = validate_token(token)
    if error:
        return error

    form = queries.get_form_by_request_id(data["request_id"])
    timeline = queries.get_request_timeline(data["request_id"])

    is_final = queries.is_final_level(data["approval_level"] + 1)

    can_upload = data["approval_level"] == 0

    return render_template(
        "approval_review.html",
        token=token,
        request_id=data["request_id"],
        form=form,
        timeline=timeline,
        is_final=is_final,
        can_upload=can_upload
    )


def get_timeline_fn(request_id):
    rows = queries.get_request_timeline(request_id)
    return jsonify([{
        "level": r.approval_level,
        "email": r.approver_email,
        "action": r.action_taken,
        "remark": r.remark,
        "time": str(r.action_time)
    } for r in rows])


def dashboard_requests_fn():

    user = session.get("user", {})
    user_email = user.get("email")
    role = user.get("role")

    data = queries.get_dashboard_requests(user_email, role)

    return jsonify(data)


def update_form():
    data = request.form
    request_id = data['request_id']

    queries.update_requisition_form(data)

    approver = queries.get_current_approver(request_id)

    token = generate_token(
        request_id,
        queries.get_current_level(request_id),
        approver
    )

    send_mail_async(
        to_email=approver,
        subject="Requisition Resubmitted",
        body=f"""
        <p>Form has been corrected and resubmitted.</p>
        <a href="{BASE_URL}/approval?token={token}">
            Review Again
        </a>
        """,
        sender_email=session.get("user", {}).get("email", "system")
    )

    return {"status": "resubmitted"}


def resubmit_form():
    data = request.form
    request_id = data['request_id']

    used_token = request.form.get("token")
    mark_token_used(used_token)

    queries.update_requisition_form(data)

    conn = get_connection()
    cursor = conn.cursor()

    # ------------------ GET LAST REJECTOR ------------------
    cursor.execute("""
    SELECT TOP 1 approver_email, approval_level
    FROM tbl_SECURITY_APPROVAL_ACTION_LOGS
    WHERE request_id = ?
    AND action_taken = 'REJECT'
    ORDER BY action_time DESC
    """, (request_id,))

    row = cursor.fetchone()

    if row is None:
        cursor.close()
        conn.close()
        return {"error": "Resubmit allowed only after rejection"}, 400

    rejector_email = row.approver_email
    reject_level = row.approval_level

    # ------------------ GET LAST APPROVER BEFORE REJECT ------------------
    cursor.execute("""
    SELECT TOP 1 approver_email
    FROM tbl_SECURITY_APPROVAL_ACTION_LOGS
    WHERE request_id = ?
    AND action_taken = 'APPROVE'
    AND approval_level < ?
    ORDER BY action_time DESC
    """, (request_id, reject_level))

    row_user = cursor.fetchone()
    resubmitted_by = row_user.approver_email if row_user else "Unknown User"

    # ------------------ INSERT RESUBMIT LOG ------------------
    cursor.execute("""
        INSERT INTO tbl_SECURITY_APPROVAL_ACTION_LOGS
        (request_id, approval_level, approver_email, action_taken, remark)
        VALUES (?, ?, ?, ?, ?)
    """, (
        request_id,
        reject_level,
        resubmitted_by,
        'RESUBMITTED',
        'Form corrected and resubmitted'
    ))

    # ------------------ UPDATE REQUEST MASTER ------------------
    cursor.execute("""
        UPDATE tbl_SECURITY_APPROVAL_REQUEST_MASTER
        SET
            current_level = ?,
            current_approver_email = ?,
            overall_status = 'PENDING',
            last_action_time = GETDATE()
        WHERE request_id = ?
    """, (reject_level, rejector_email, request_id))

    conn.commit()
    cursor.close()
    conn.close()

    token = generate_token(request_id, reject_level, rejector_email)

    # ------------------ SEND MAIL ------------------
    send_mail_async(
        to_email=rejector_email,
        subject="Requisition Resubmitted - Review Again",
        body=f"""
        <div style="font-family:Arial;background:#f4f6f8;padding:30px">

        <div style="max-width:650px;margin:auto;background:white;border-radius:8px;
                    box-shadow:0 2px 6px rgba(0,0,0,0.1)">

            <div style="background:#0d6efd;padding:18px;color:white;
                        font-size:18px;font-weight:bold">
                Requisition Resubmitted – Review Required
            </div>

            <div style="padding:25px;font-size:14px;color:#333">

                <p>Dear Approver,</p>

                <p>
                The requisition form has been <b>corrected and resubmitted</b>
                after addressing the rejection remarks.
                </p>

                <table style="width:100%;border-collapse:collapse;margin-top:15px">
                    <tr>
                        <td style="padding:6px;font-weight:bold">Request ID</td>
                        <td style="padding:6px">{request_id}</td>
                    </tr>

                    <tr style="background:#f7f7f7">
                        <td style="padding:6px;font-weight:bold">Resubmitted By</td>
                        <td style="padding:6px">{resubmitted_by}</td>
                    </tr>
                </table>

                <div style="text-align:center;margin:25px 0">
                    <a href="{BASE_URL}/approval?token={token}"
                       style="background:linear-gradient(135deg,#6a11cb,#2575fc);
                              padding:12px 26px;color:white;text-decoration:none;
                              border-radius:6px;font-weight:bold">
                       Review Again
                    </a>
                </div>

                <p>Please review the updated form and continue the approval process.</p>

                <p style="margin-top:25px">
                Regards,<br>
                <b>Security Department</b><br>
                Pipeline Infrastructure Limited
                </p>

            </div>

            <div style="background:#e9f2ff;padding:14px;text-align:center;
                        font-size:13px;color:#1a3c8b;border-top:2px solid #0d6efd">
                 This is an automated notification from the
                <b>Security Records Digitization System</b>.
            </div>

        </div>
        </div>
        """,
        sender_email=resubmitted_by
    )

    return {"status": "resubmitted"}


# =====================================================
# password creater
# =====================================================

def generate_password(length=6):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

