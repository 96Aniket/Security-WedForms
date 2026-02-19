from flask import request, jsonify, session , send_file
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

        
        data["deleted_by"] = session.get("user", {}).get("email", "system")

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

    try:
        data = request.get_json()
        if not data or "n_sr_no" not in data:
            return error_response("Invalid delete request")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.delete_pipeline_mitra_data(data, username)

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
# Requisition Form
# =====================================================

# def save_requisition_form_fn():
#     try:
#         data = request.get_json(force=True)
#         if not data:
#             return error_response("No data received")

#         username = session.get("user", {}).get("email", "system")
#         success, msg = queries.create_requisition_form(data, username)

#         return success_response(msg) if success else error_response(msg)

#     except Exception as e:
#         return error_response(str(e), 500)


# def get_requisition_form_fn():
#     try:
#         user = session.get("user", {})
#         user_role = user.get("role")
#         user_location = user.get("location")

#         success, data = queries.get_requisition_forms(user_role, user_location)

#         return success_response(data=data) if success else error_response("Failed to fetch data")

#     except Exception as e:
#         return error_response(str(e), 500)


# def update_requisition_form_fn():
#     try:
#         data = request.get_json(force=True)
#         if not data:
#             return error_response("No data received")

#         username = session.get("user", {}).get("email", "system")
#         success, msg = queries.update_requisition_form(data, username)

#         return success_response(msg) if success else error_response(msg)

#     except Exception as e:
#         return error_response(str(e), 500)


# def delete_requisition_form_fn():
#     try:
#         data = request.get_json(force=True)
#         if not data or "n_sr_no" not in data:
#             return error_response("Invalid delete request")

#         username = session.get("user", {}).get("email", "system")
#         success, msg = queries.delete_requisition_form(data, username)

#         return success_response(msg) if success else error_response(msg)

#     except Exception as e:
#         return error_response(str(e), 500)


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

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO APPROVAL_REQUEST_MASTER
        (
            form_sr_no,
            initiator_email,
            current_level,
            current_approver_email,
            overall_status,
            last_action_time
        )
        OUTPUT INSERTED.request_id
        VALUES (NULL, ?, 1, ?, 'PENDING', GETDATE())
    """, (sender_email, receiver_email))

    request_id = cursor.fetchone()[0]
    conn.commit()

    approval_link = f"{BASE_URL}/form-fill/{request_id}"

    send_mail(
        to_email=receiver_email,
        subject="Form Fill Required",
        body=f"""
        <p>You have received a form request.</p>
        <p><b>Sent by:</b> {sender_email}</p>
        <a href="{approval_link}">Click here to fill the form</a>
        """,
        sender_email=sender_email
    )

    return {"success": True, "request_id": request_id}



def submit_form():
    data = request.json

    request_id = data.get("request_id")
    if not request_id:
        return {"error": "request_id missing"}, 400

    user_email = data.get("s_created_by", "FORM_USER")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO REQUISITION_FORM_MASTER
        (
            s_location, dt_request_date, s_first_name, s_last_name,
            dt_date_of_birth, n_age, s_agency_name, s_nature_of_job,
            s_work_order_no, dt_work_order_validity, dt_date_of_joining,
            s_exact_work_location, s_gender, s_aadhar_card_no,
            s_present_address, s_present_city, s_present_state,
            s_present_pincode, s_contact_no,
            s_emergency_contact_details, s_emergency_city,
            s_emergency_state, s_emergency_pincode,
            s_emergency_contact_no, s_created_by
        )
        OUTPUT INSERTED.n_sr_no
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (
        data['s_location'],
        data['dt_request_date'],
        data['s_first_name'],
        data['s_last_name'],
        data['dt_date_of_birth'],
        data['n_age'],
        data['s_agency_name'],
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
        user_email
    ))

    form_sr_no = cursor.fetchone()[0]

    cursor.execute("""
        SELECT initiator_email
        FROM APPROVAL_REQUEST_MASTER
        WHERE request_id = ?
    """, (request_id,))
    user0_email = cursor.fetchone().initiator_email

    cursor.execute("""
        UPDATE APPROVAL_REQUEST_MASTER
        SET form_sr_no = ?,
            current_level = 0,
            current_approver_email = ?,
            last_action_time = GETDATE()
        WHERE request_id = ?
    """, (form_sr_no, user0_email, request_id))

    conn.commit()
    cursor.close()
    conn.close()

    token = generate_token(request_id, 0, user0_email)

    send_approval_mail_to_user0(
        request_id=request_id,
        token=token,
        user0_email=user0_email,
        submitted_by=user_email
    )

    return {"status": "submitted successfully"}


def approve():
    data = request.json

    request_id = data['request_id']
    current_level = data['current_level']
    approver_email = data['approver_email']
    next_approver_email = data['next_approver_email']

    execute_sp(
        "sp_approve_request",
        (request_id, current_level, approver_email, next_approver_email)
    )

    token = generate_token(request_id, current_level + 1)
    approval_link = f"{BASE_URL}/approval?token={token}"

    send_mail(
        next_approver_email,
        "Approval required",
        f"""
        <p>Please review the request.</p>
        <a href="{approval_link}">Approve / Reject</a>
        """,
        sender_email=SYSTEM_SMTP_EMAIL
    )

    return jsonify({"status": "approved & mail sent"})

def reject():
    data = request.json

    request_id = data['request_id']
    current_level = data['current_level']
    approver_email = data['approver_email']
    remark = data['remark']

    execute_sp(
        "sp_reject_request",
        (request_id, current_level, approver_email, remark)
    )

    return jsonify({"status": "rejected"})



def approval_action():
    token = request.form['token']
    action = request.form['action']

    token_data, error = validate_token(token)
    if error:
        return error

    request_id = token_data['request_id']
    level = token_data['approval_level']
    approver_email = token_data['approver_email']

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 1 FROM APPROVAL_REQUEST_MASTER
        WHERE request_id = ?
          AND current_level = ?
          AND current_approver_email = ?
          AND overall_status = 'PENDING'
    """, (request_id, level, approver_email))

    if not cursor.fetchone():
        return "Invalid or expired approval attempt"

    cursor.close()
    conn.close()

    if action == "APPROVE":
        next_email = request.form['next_email']
        result = process_approval(
            request_id, level, approver_email,
            "APPROVE", None, next_email
        )
    else:
        remark = request.form['remark']
        result = process_approval(
            request_id, level, approver_email,
            "REJECT", remark, None
        )

    mark_token_used(token)
    return f"Request {result}"



def resend_approval():
    data = request.json
    request_id = data['request_id']
    current_level = data['current_level']
    approver_email = data['approver_email']

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE APPROVAL_TOKENS
        SET is_used = 1
        WHERE request_id = ? AND approval_level = ? AND is_used = 0
    """, (request_id, current_level))

    conn.commit()
    cursor.close()
    conn.close()

    token = generate_token(request_id, current_level, approver_email)

    
    link = f"{BASE_URL}/approval?token={token}&action=APPROVE"


    send_mail(
        approver_email,
        "Reminder: Approval Required",
        f"""
        <p>This is a reminder to approve the request.</p>
        <a href="{link}">Click here to Approve / Reject</a>
        """
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
