from flask import request, jsonify
from Execute import queries

#------------start Patrolling Observation Register-----------------
#------------create------------------
def save_patrolling_data_fn():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data received"
            }), 400

        success, msg = queries.save_patrolling_data(data)

        return jsonify({
            "success": success,
            "message": msg
        }), 200 if success else 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

#-----------------read-----------------
def get_patrolling_data():
    success, data = queries.get_patrolling_data()
    return jsonify({
        "success": success,
        "data": data
    })

#----------------edit------------------
def update_patrolling_data():
    from flask import request, jsonify
    data = request.get_json()

    success, msg = queries.update_patrolling_data(data)

    return jsonify({
        "success": success,
        "message": msg
    })

#----------------delete-------------
def delete_patrolling_data():
    from flask import request, jsonify
    data = request.get_json()

    if not data or "n_sr_no" not in data:
        return jsonify({
            "success": False,
            "message": "Invalid delete request"
        }), 400

    success, msg = queries.delete_patrolling_data(data)

    return jsonify({
        "success": success,
        "message": msg
    })
#------------ end Patrolling Observation Register-----------------



# ----------- CREATE ----------------
def save_bba_test_data_fn():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "message": "No data received"}), 400

        success, msg = queries.save_bba_test_data(data)

        return jsonify({"success": success, "message": msg})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# ----------- READ -----------------
def get_bba_test_data():
    success, data = queries.get_bba_test_data()
    return jsonify({"success": success, "data": data})


# ----------- UPDATE ----------------
def update_bba_test_data():
    data = request.get_json()
    success, msg = queries.update_bba_test_data(data)

    return jsonify({"success": success, "message": msg})


# ----------- DELETE ----------------
def delete_bba_test_data():
    data = request.get_json()

    if not data or "n_sr_no" not in data:
        return jsonify({"success": False, "message": "Invalid delete request"}), 400

    success, msg = queries.delete_bba_test_data(data)

    return jsonify({"success": success, "message": msg})
