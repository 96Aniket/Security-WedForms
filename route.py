from flask import Blueprint, render_template , session, jsonify
from Execute.Functions import functions
from flask import request, send_file
from Execute.Functions.functions import download_filtered_excel_logic , get_report_tables_fn
from utils.token import validate_token
from Execute.executesql import get_connection
from Execute import queries


routes_bp = Blueprint('routes_bp', __name__)

def get_user_context():
    user = session.get('user', {})
    return {
        "user": user,
        "user_location": user.get('location', ''),
        "user_role": user.get('role', 'user')
    }

@routes_bp.route('/')
def home():
    return render_template('main.html')

@routes_bp.route('/pil-patrolling')
def pil_patrolling():
    return render_template(
        'pil patrolling.html',
        **get_user_context()
    )


@routes_bp.route('/pil-baa-test')
def pil_baa_test():
    return render_template(
        'pil baa test.html',
        **get_user_context()
    )

@routes_bp.route('/casual-labour')
def casual_labour():
    return render_template(
        'casual labour list.html',
        **get_user_context()
    )


@routes_bp.route('/pil-mitras')
def pil_mitras():
    return render_template(
        'pil mitras cs.html',
        **get_user_context()
    )


@routes_bp.route('/pil-vehicle')
def pil_vehicle():
    return render_template(
        'pil vehicle checklist.html',
        **get_user_context()
    )


@routes_bp.route('/pil-visitor')
def pil_visitor():
    return render_template(
        'pil visitor slip.html',
        **get_user_context()
    )


@routes_bp.route('/form-fill')
def form_fill():
    return render_template('form-fill.html')

@routes_bp.route('/approval_review')
def approval_reviews():
    return render_template('approval_review.html')

@routes_bp.route('/requisition-form')
def requisition_form():
    return render_template('requisition form.html')

@routes_bp.route('/form-fill/<int:request_id>')
def form_fill_page(request_id):
    return render_template(
        "form-fill.html",
        request_id=request_id
    )
@routes_bp.route('/form-edit/<int:request_id>')
def form_edit_page(request_id):
    form = queries.get_form_by_request_id(request_id)
    return render_template(
        "form_edit.html",
        request_id=request_id,
        form=form
    )

@routes_bp.route('/reports')
def reports():
    return render_template(
        'reports.html',
        **get_user_context()
    )


#------------start Patrolling Observation Register-----------------
routes_bp.add_url_rule('/save_patrolling_data',view_func=functions.save_patrolling_data_fn,methods=['POST'])
routes_bp.add_url_rule('/get_patrolling_data',view_func=functions.get_patrolling_data,methods=['GET'])
routes_bp.add_url_rule('/update_patrolling_data',view_func=functions.update_patrolling_data,methods=['POST'])
routes_bp.add_url_rule('/delete_patrolling_data',view_func=functions.delete_patrolling_data,methods=['POST'])

# ------------ BBA Test Record Register -----------------
routes_bp.add_url_rule('/save_bba_test_data',view_func=functions.save_bba_test_data_fn,methods=['POST'])
routes_bp.add_url_rule('/get_bba_test_data',view_func=functions.get_bba_test_data,methods=['GET'])
routes_bp.add_url_rule('/update_bba_test_data',view_func=functions.update_bba_test_data,methods=['POST'])
routes_bp.add_url_rule('/delete_bba_test_data',view_func=functions.delete_bba_test_data,methods=['POST'])

# ------------ PIPELINE MITRA REGISTER -----------------
routes_bp.add_url_rule('/save_pipeline_mitra_data',view_func=functions.save_pipeline_mitra_data_fn,methods=['POST'])
routes_bp.add_url_rule('/get_pipeline_mitra_data',view_func=functions.get_pipeline_mitra_data,methods=['GET'])
routes_bp.add_url_rule('/update_pipeline_mitra_data',view_func=functions.update_pipeline_mitra_data,methods=['POST'])
routes_bp.add_url_rule('/delete_pipeline_mitra_data',view_func=functions.delete_pipeline_mitra_data,methods=['POST'])

# ------------ VEHICLE CHECKLIST -----------------
routes_bp.add_url_rule('/save_vehicle_checklist_full',view_func=functions.save_vehicle_checklist_full_fn,methods=['POST'])
routes_bp.add_url_rule('/get_vehicle_checklist_data',view_func=functions.get_vehicle_checklist_data_fn,methods=['GET'])
routes_bp.add_url_rule('/update_vehicle_checklist_data',view_func=functions.update_vehicle_checklist_data_fn,methods=['POST'])
routes_bp.add_url_rule('/delete_vehicle_checklist_data',view_func=functions.delete_vehicle_checklist_data_fn,methods=['POST'])

# ------------ VISITOR DECLARATION SLIP -----------------
routes_bp.add_url_rule('/save_visitor_declaration_data',view_func=functions.save_visitor_declaration_data_fn,methods=['POST'])
routes_bp.add_url_rule('/get_visitor_declaration_data',view_func=functions.get_visitor_declaration_data_fn,methods=['GET'])
routes_bp.add_url_rule('/update_visitor_declaration_data',view_func=functions.update_visitor_declaration_data_fn,methods=['POST'])
routes_bp.add_url_rule('/delete_visitor_declaration_data',view_func=functions.delete_visitor_declaration_data_fn,methods=['POST'])

# ------------ CASUAL LABOUR REGISTER -----------------
routes_bp.add_url_rule('/save_casual_labour_data',view_func=functions.save_casual_labour_data_fn,methods=['POST'])
routes_bp.add_url_rule('/get_casual_labour_data',view_func=functions.get_casual_labour_data_fn,methods=['GET'])
routes_bp.add_url_rule('/update_casual_labour_data',view_func=functions.update_casual_labour_data_fn,methods=['POST'])
routes_bp.add_url_rule('/delete_casual_labour_data',view_func=functions.delete_casual_labour_data_fn,methods=['POST'])

#----------- report excel_bp --------------
routes_bp.add_url_rule('/download_filtered_excel',view_func=functions.download_filtered_excel,methods=['POST'])
routes_bp.add_url_rule('/get_report_tables',view_func=functions.get_report_tables,methods=['GET'])
routes_bp.add_url_rule("/get_locations",view_func=functions.get_locations_fn,methods=["GET"])

# ------------ REQUISITION FORM -----------------
routes_bp.add_url_rule('/api/create-request',view_func=functions.create_request,methods=['POST'])
routes_bp.add_url_rule('/api/submit-form',view_func=functions.submit_form,methods=['POST'])
routes_bp.add_url_rule('/api/approve',view_func=functions.approve,methods=['POST'])
routes_bp.add_url_rule('/api/reject',view_func=functions.reject,methods=['POST'])
routes_bp.add_url_rule('/approval-action',view_func=functions.approval_action,methods=['POST'])
routes_bp.add_url_rule('/api/resend-approval',view_func=functions.resend_approval,methods=['POST'])
routes_bp.add_url_rule('/api/save-form',view_func=functions.save_form,methods=['POST'])
routes_bp.add_url_rule('/api/resubmit-form',view_func=functions.resubmit_form,methods=['POST'])


@routes_bp.route('/approval')
def approval_page():
    return functions.approval_page_fn(request)


@routes_bp.route('/api/timeline/<int:request_id>')
def get_timeline(request_id):
    return functions.get_timeline_fn(request_id)

@routes_bp.route('/api/dashboard-requests')
def dashboard_requests():
    return functions.dashboard_requests_fn()