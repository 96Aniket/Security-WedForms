from flask import request, jsonify
from Execute import queries
from flask import request, session
from Execute.executesql import get_connection

def save_patrolling_data_fn():
    created_by = session['user']['email']

    data = request.json

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO PatrollingRegister (location, date, remarks, created_by)
        VALUES (?, ?, ?, ?)
    """, (
        data['location'],
        data['date'],
        data['remarks'],
        created_by
    ))

    conn.commit()
    conn.close()

    return {"status": "success"}



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


# ------------ START BBA Test Record Register -----------------
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

# ------------ START PIPELINE MITRA REGISTER -----------------
# ------------ CREATE -----------------
def save_pipeline_mitra_data_fn():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data received"
            }), 400

        success, msg = queries.save_pipeline_mitra_data(data)

        return jsonify({
            "success": success,
            "message": msg
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ------------ READ -----------------
def get_pipeline_mitra_data():
    success, data = queries.get_pipeline_mitra_data()

    return jsonify({
        "success": success,
        "data": data
    })


# ------------ UPDATE -----------------
def update_pipeline_mitra_data():
    data = request.get_json()

    success, msg = queries.update_pipeline_mitra_data(data)

    return jsonify({
        "success": success,
        "message": msg
    })


# ------------ DELETE -----------------
def delete_pipeline_mitra_data():
    data = request.get_json()

    if not data or "n_sr_no" not in data:
        return jsonify({
            "success": False,
            "message": "Invalid delete request"
        }), 400

    success, msg = queries.delete_pipeline_mitra_data(data)

    return jsonify({
        "success": success,
        "message": msg
    })

#-------------- vehicle checklist ---------------
# ------------ CREATE -----------------
def save_vehicle_data_fn():
    try:
        data = request.get_json()
        username = session.get("user", {}).get("email", "system")

        if not data:
            return jsonify({"success": False, "message": "No data received"}), 400

        success, msg = queries.save_vehicle_data(data, username)

        return jsonify({
            "success": success,
            "message": msg
        }), 200 if success else 500

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# ------------ READ -----------------
def get_vehicle_data():
    success, data = queries.get_vehicle_data()
    return jsonify({
        "success": success,
        "data": data
    })


# ------------ UPDATE -----------------
def update_vehicle_data():
    try:
        data = request.get_json()
        username = session.get("user", {}).get("email", "system")

        success, msg = queries.update_vehicle_data(data, username)

        return jsonify({
            "success": success,
            "message": msg
        })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# ------------ DELETE -----------------
def delete_vehicle_data():
    data = request.get_json()

    if not data or "n_sr_no" not in data:
        return jsonify({
            "success": False,
            "message": "Invalid delete request"
        }), 400

    success, msg = queries.delete_vehicle_data(data)

    return jsonify({
        "success": success,
        "message": msg
    })

#-------------- visitor start------------
# ------------ CREATE -----------------
def save_visitor_data_fn():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data received"
            }), 400

        username = session.get("user", {}).get("email", "system")

        success, msg = queries.save_visitor_data(data, username)

        return jsonify({
            "success": success,
            "message": msg
        }), 200 if success else 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ------------ READ -----------------
def get_visitor_data():
    try:
        success, data = queries.get_visitor_data()

        return jsonify({
            "success": success,
            "data": data
        }), 200

    except Exception as e:
        print("❌ VISITOR GET ERROR (functions):", e)
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ------------ UPDATE -----------------
def update_visitor_data():
    data = request.get_json()
    username = session.get("user", {}).get("email", "system")

    success, msg = queries.update_visitor_data(data, username)

    return jsonify({
        "success": success,
        "message": msg
    })


# ------------ DELETE -----------------
def delete_visitor_data():
    data = request.get_json()

    if not data or "n_sr_no" not in data:
        return jsonify({
            "success": False,
            "message": "Invalid delete request"
        }), 400

    success, msg = queries.delete_visitor_data(data)

    return jsonify({
        "success": success,
        "message": msg
    })
