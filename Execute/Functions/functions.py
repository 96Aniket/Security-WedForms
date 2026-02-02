from flask import request, jsonify, session
from Execute import queries

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
        success, data = queries.get_patrolling_data()
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
        success, data = queries.get_bba_test_data()
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

        # 🔥 ADD deleted_by
        data["deleted_by"] = session.get("user", {}).get("email", "system")

        success, msg = queries.delete_bba_test_data(data)
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
        success, data = queries.get_pipeline_mitra_data()
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
        if not data or "n_sr_no" not in data:
            return error_response("Invalid delete request")

        # 🔥 ADD deleted_by (CRITICAL)
        data["deleted_by"] = session.get("user", {}).get("email", "system")

        success, msg = queries.delete_pipeline_mitra_data(data)
        return success_response(msg) if success else error_response(msg)
    except Exception as e:
        return error_response(str(e), 500)


# =====================================================
# VEHICLE CHECKLIST
# =====================================================
def save_vehicle_data_fn():
    try:
        data = request.get_json()
        if not data:
            return error_response("No data received")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.save_vehicle_data(data, username)

        return success_response(msg) if success else error_response(msg)
    except Exception as e:
        return error_response(str(e), 500)


def get_vehicle_data():
    try:
        success, data = queries.get_vehicle_data()
        return success_response(data=data) if success else error_response("Failed to fetch data")
    except Exception as e:
        return error_response(str(e), 500)


def update_vehicle_data():
    try:
        data = request.get_json()
        if not data:
            return error_response("No data received")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.update_vehicle_data(data, username)

        return success_response(msg) if success else error_response(msg)
    except Exception as e:
        return error_response(str(e), 500)


def delete_vehicle_data():
    try:
        data = request.get_json()
        if not data or "n_sr_no" not in data:
            return error_response("Invalid delete request")

        # 🔥 ADD deleted_by
        data["deleted_by"] = session.get("user", {}).get("email", "system")

        success, msg = queries.delete_vehicle_data(data)
        return success_response(msg) if success else error_response(msg)
    except Exception as e:
        return error_response(str(e), 500)


# =====================================================
# VISITOR REGISTER
# =====================================================
def save_visitor_data_fn():
    try:
        data = request.get_json()
        if not data:
            return error_response("No data received")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.save_visitor_data(data, username)

        return success_response(msg) if success else error_response(msg)
    except Exception as e:
        return error_response(str(e), 500)


def get_visitor_data():
    try:
        success, data = queries.get_visitor_data()
        return success_response(data=data) if success else error_response("Failed to fetch data")
    except Exception as e:
        return error_response(str(e), 500)


def update_visitor_data():
    try:
        data = request.get_json()
        if not data:
            return error_response("No data received")

        username = session.get("user", {}).get("email", "system")
        success, msg = queries.update_visitor_data(data, username)

        return success_response(msg) if success else error_response(msg)
    except Exception as e:
        return error_response(str(e), 500)


def delete_visitor_data():
    try:
        data = request.get_json()
        if not data or "n_sr_no" not in data:
            return error_response("Invalid delete request")

        # 🔥 ADD deleted_by
        data["deleted_by"] = session.get("user", {}).get("email", "system")

        success, msg = queries.delete_visitor_data(data)
        return success_response(msg) if success else error_response(msg)
    except Exception as e:
        return error_response(str(e), 500)
