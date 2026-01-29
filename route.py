from flask import Blueprint, render_template , session
from Execute.Functions import functions

routes_bp = Blueprint('routes_bp', __name__)

@routes_bp.route('/')
def home():
    return render_template('main.html')

@routes_bp.route('/pil-patrolling')
def pil_patrolling():
    user = session.get('user', {})
    return render_template(
        'pil patrolling.html',
        user_location=user.get('location', '')
    )

@routes_bp.route('/pil-baa-test')
def pil_baa_test():
    user = session.get('user', {})
    return render_template(
        'pil baa test.html',
        user_location=user.get('location', '')
    )


@routes_bp.route('/casual-labour')
def casual_labour():
    return render_template('casual labour list.html')


@routes_bp.route('/pil-mitras')
def pil_mitras():
    return render_template('pil mitras cs.html')


@routes_bp.route('/pil-vehicle')
def pil_vehicle():
    user = session.get('user', {})
    return render_template(
        'pil vehicle checklist.html',
        user=user,                   
        user_location=user.get('location', '')
    )


@routes_bp.route('/pil-visitor')
def pil_visitor():
    return render_template('pil visitor slip.html')


@routes_bp.route('/government-visitor')
def gov_visitor():
    return render_template('government visitor.html')


@routes_bp.route('/requisition-form')
def requisition_form():
    return render_template('requisition form.html')


@routes_bp.route('/reports')
def reports():
    return render_template('reports.html')

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

# ------------ start Vehicle Checklist -----------------
routes_bp.add_url_rule('/save_vehicle_data',view_func=functions.save_vehicle_data_fn,methods=['POST'])
routes_bp.add_url_rule('/get_vehicle_data',view_func=functions.get_vehicle_data,methods=['GET'])
routes_bp.add_url_rule('/update_vehicle_data',view_func=functions.update_vehicle_data,methods=['POST'])
routes_bp.add_url_rule('/delete_vehicle_data',view_func=functions.delete_vehicle_data,methods=['POST'])

# ------------ VISITOR DECLARATION SLIP -----------------
routes_bp.add_url_rule('/save_visitor_data',view_func=functions.save_visitor_data_fn,methods=['POST'])
routes_bp.add_url_rule('/get_visitor_data',view_func=functions.get_visitor_data,methods=['GET'])
routes_bp.add_url_rule('/update_visitor_data',view_func=functions.update_visitor_data,methods=['POST'])
routes_bp.add_url_rule('/delete_visitor_data',view_func=functions.delete_visitor_data,methods=['POST'])

