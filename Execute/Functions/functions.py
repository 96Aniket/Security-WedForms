from flask import request, jsonify, session , send_file, render_template
from Execute import queries
from Execute.queries import fetch_data_with_date, get_report_master_tables
from excel_bp import write_excel
from services.approval_service import execute_sp
from utils.token import generate_token, mark_token_used, validate_token
from utils.mailer import send_mail, SYSTEM_SMTP_EMAIL
from Execute.executesql import get_connection
from utils.approval_engine import process_approval
from utils.notification import send_approval_mail_to_user0
from config import BASE_URL
from utils.email_templates import approval_email_template
from utils.async_mail import send_mail_async
from werkzeug.utils import secure_filename
import os

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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

from flask import jsonify, send_file, session

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
        print("DEBUG JSON:", data)

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
    data = request.json
    receiver_email = data.get("first_user_email")
    sender_email = session['user']['email']

    if not receiver_email:
        return {"error": "Receiver email required"}, 400

    request_id = queries.create_request(sender_email, receiver_email)

    link = f"{BASE_URL}/form-fill/{request_id}"

    send_mail_async(
        receiver_email,
        "Form Fill Required",
        f"""
        <p>You have received a form request.</p>
        <p><b>Sent by:</b> {sender_email}</p>
        <a href="{link}">Click here to fill the form</a>
        """,
        sender_email
    )

    return {"success": True, "request_id": request_id}


def submit_form():
    data = request.form
    files = request.files

    request_id = data.get("request_id")
    if not request_id:
        return {"error": "request_id missing"}, 400

    created_by = data.get("s_created_by", "FORM_USER")

    # ---------- PHOTO ----------
    photo = files.get("s_photo")
    photo_name = None

    if photo and photo.filename:
        photo_name = secure_filename(photo.filename)
        photo_path = os.path.join(UPLOAD_FOLDER, photo_name)
        photo.save(photo_path)

    # ---------- CHECKBOX ----------
    def chk(name):
        return int(data.get(name, 0))

    # ---------- FORM DATA ----------
    form_data = {
        "s_location": data.get("s_location"),
        "dt_request_date": data.get("dt_request_date"),
        "s_first_name": data.get("s_first_name"),
        "s_middle_name": data.get("s_middle_name"),
        "s_last_name": data.get("s_last_name"),
        "s_photo": photo_name,
        "dt_date_of_birth": data.get("dt_date_of_birth"),
        "n_age": data.get("n_age"),
        "s_gender": data.get("s_gender"),

        "s_agency_name": data.get("s_agency_name"),
        "s_sap_vendor_code": data.get("s_sap_vendor_code"),
        "s_nature_of_job": data.get("s_nature_of_job"),
        "s_work_order_no": data.get("s_work_order_no"),
        "dt_work_order_validity": data.get("dt_work_order_validity"),
        "dt_date_of_joining": data.get("dt_date_of_joining"),
        "s_exact_work_location": data.get("s_exact_work_location"),

        "n_height_cm": data.get("n_height_cm"),
        "s_blood_group": data.get("s_blood_group"),
        "s_identification_mark": data.get("s_identification_mark"),

        "s_aadhar_card_no": data.get("s_aadhar_card_no"),
        "s_contact_no": data.get("s_contact_no"),

        "s_present_address": data.get("s_present_address"),
        "s_present_city": data.get("s_present_city"),
        "s_present_state": data.get("s_present_state"),
        "s_present_pincode": data.get("s_present_pincode"),

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

    # ---------- DB INSERT ----------
    form_sr_no = queries.insert_requisition_form(form_data, created_by)

    initiator_email = queries.get_initiator_email(request_id)
    if not initiator_email:
        return {"error": "Initiator email not found"}, 400

    queries.update_request_after_submit(
        request_id=request_id,
        form_sr_no=form_sr_no,
        approver_email=initiator_email
    )

    # ---------- SEND MAIL TO USER-0 ----------
    token = generate_token(request_id, 0, initiator_email)

    send_approval_mail_to_user0(
        request_id=request_id,
        token=token,
        user0_email=initiator_email,
        submitted_by=created_by,
        sender_email=created_by
    )

    return jsonify({"status": "submitted successfully"})


def approve():
    data = request.json

    request_id = data['request_id']
    next_email = data['next_approver_email']   
    approver_email = data['approver_email']    

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE APPROVAL_REQUEST_MASTER
        SET
            current_level = 1,
            current_approver_email = ?,
            last_action_time = GETDATE()
        WHERE request_id = ?
    """, (next_email, request_id))

    conn.commit()
    cursor.close()
    conn.close()

    token = generate_token(
        request_id,
        1,             
        next_email
    )

    body = approval_email_template(token)

    send_mail_async(
        next_email,
        "Approval Required",
        body,
        sender_email=approver_email  
    )

    return jsonify({"status": "MOVED"})


def reject():
    data = request.json

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
    used_token = request.form['token']
    action = request.form['action']
    remark = request.form.get('remark', '').strip()

    token_data, error = validate_token(used_token)
    if error:
        return error

    if action == "REJECT" and not remark:
        return "Remark is mandatory for rejection", 400

    mark_token_used(used_token)

    next_email = request.form.get('next_email')

    result = process_approval(
        token_data['request_id'],
        token_data['approval_level'],
        token_data['approver_email'],
        action,
        remark,
        next_email
    )

    if result == "MOVED" and next_email:
        next_token = generate_token(
            token_data['request_id'],
            token_data['approval_level'] + 1,
            next_email
        )

        body = approval_email_template(next_token)

        send_mail_async(
            next_email,
            "Approval Required",
            body,
            sender_email=token_data['approver_email']
        )

    return f"Request {result}"


def resend_approval():
    data = request.json

    level = queries.get_current_level(data['request_id'])
    approver = queries.get_current_approver(data['request_id'])

    token = generate_token(
        data['request_id'],
        level,
        approver
    )

    link = f"{BASE_URL}/approval?token={token}&action=APPROVE"

    send_mail_async(
        to_email=data['approver_email'],
        subject="Reminder: Approval Required",
        body=f"<a href='{link}'>Approve / Reject</a>",
        sender_email=session['user']['email']
    )

    return {"status": "resent successfully"}


def save_form():
    data = request.json

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

    return render_template(
        "approval_review.html",
        token=token,
        request_id=data["request_id"],
        form=form,
        timeline=timeline,
        is_final=is_final
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
    return jsonify(queries.get_dashboard_requests())


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

    send_mail(
        to_email=approver,
        subject="Requisition Resubmitted",
        body=f"""
        <p>Form has been corrected and resubmitted.</p>
        <a href="{BASE_URL}/approval?token={token}">
            Review Again
        </a>
        """,
        sender_email=session['user']['email']
    )

    return {"status": "resubmitted"}


def resubmit_form():
    data = request.form
    request_id = data['request_id']

    queries.update_requisition_form(data)

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT TOP 1 approver_email, approval_level
        FROM APPROVAL_ACTION_LOGS
        WHERE request_id = ?
          AND action_taken = 'REJECT'
        ORDER BY action_time DESC
    """, (request_id,))

    row = cursor.fetchone()
    if not row:
        cursor.close()
        conn.close()
        return {"error": "No reject record found"}, 400

    rejector_email = row.approver_email
    reject_level   = row.approval_level

    cursor.execute("""
        INSERT INTO APPROVAL_ACTION_LOGS
        (request_id, approval_level, approver_email, action_taken, remark)
        VALUES (?, ?, ?, ?, ?)
    """, (
        request_id,
        reject_level - 1,
        session['user']['email'],
        'RESUBMITTED',
        'Form corrected and resubmitted'
    ))

    cursor.execute("""
        UPDATE APPROVAL_REQUEST_MASTER
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

    send_mail_async(
        to_email=rejector_email,
        subject="Requisition Resubmitted - Review Again",
        body=f"""
        <p>The requisition form has been corrected and resubmitted.</p>
        <a href="{BASE_URL}/approval?token={token}">
            Review Again
        </a>
        """,
        sender_email=session['user']['email']
    )

    return {"status": "resubmitted"}

