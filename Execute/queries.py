from Execute.executesql import get_connection
from datetime import datetime


#------------start Patrolling Observation Register-----------------
def save_patrolling_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # 🔹 Get next primary key safely
        cursor.execute("SELECT ISNULL(MAX(n_sr_no), 0) + 1 FROM dbo.Patrolling_Observation_Register")
        next_sr_no = cursor.fetchone()[0]

        insert_patrolling_record(cursor, data, next_sr_no, username)

        conn.commit()
        cursor.close()
        conn.close()

        return True, "Patrolling data saved successfully"

    except Exception as e:
        return False, str(e)

#--------------create---------------
def insert_patrolling_record(cursor, data, n_sr_no, username):
    sql = """
    INSERT INTO dbo.Patrolling_Observation_Register
    (
        n_sr_no,
        s_location_code,
        d_patrol_date,
        t_from_time,
        t_to_time,
        s_boundary_wall_condition,
        s_patrolling_pathway_condition,
        s_suspicious_movement,
        s_wild_vegetation,
        s_illumination_status,
        s_workers_without_valid_permit,
        s_unknown_person_without_authorization,
        s_unattended_office_unlocked,
        s_other_observations_status,
        s_remarks,
        s_patrolling_guard_name,
        s_created_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """

    cursor.execute(sql, (
        n_sr_no,
        data.get("s_location_code"),
        data.get("d_patrol_date"),
        data.get("t_from_time"),
        data.get("t_to_time"),
        data.get("s_boundary_wall_condition"),
        data.get("s_patrolling_pathway_condition"),
        data.get("s_suspicious_movement"),
        data.get("s_wild_vegetation"),
        data.get("s_illumination_status"),
        data.get("s_workers_without_valid_permit"),
        data.get("s_unknown_person_without_authorization"),
        data.get("s_unattended_office_unlocked"),
        data.get("s_other_observations_status"),
        data.get("s_remarks"),
        data.get("s_patrolling_guard_name"),
        username
    ))

#------------get data----------------------
def get_patrolling_data():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
           SELECT
    n_sr_no,
    s_location_code,
    d_patrol_date,
    t_from_time,
    t_to_time,
    s_boundary_wall_condition,
    s_patrolling_pathway_condition,
    s_suspicious_movement,
    s_wild_vegetation,
    s_illumination_status,
    s_workers_without_valid_permit,
    s_unknown_person_without_authorization,
    s_unattended_office_unlocked,
    s_other_observations_status,
    s_remarks,
    s_patrolling_guard_name
FROM dbo.Patrolling_Observation_Register
WHERE ISNULL(delete_flag, 0) = 0
ORDER BY n_sr_no DESC

        """)

        rows = cursor.fetchall()

        result = []
        for r in rows:
            result.append({
                "n_sr_no": r[0],
                "s_location_code": r[1],
                "d_patrol_date": str(r[2]),
                "t_from_time": str(r[3]),
                "t_to_time": str(r[4]),
                "s_boundary_wall_condition": r[5],
                "s_patrolling_pathway_condition": r[6],
                "s_suspicious_movement": r[7],
                "s_wild_vegetation": r[8],
                "s_illumination_status": r[9],
                "s_workers_without_valid_permit": r[10],
                "s_unknown_person_without_authorization": r[11],
                "s_unattended_office_unlocked": r[12],
                "s_other_observations_status": r[13],
                "s_remarks": r[14],
                "s_patrolling_guard_name": r[15]
            })

        cursor.close()
        conn.close()

        return True, result

    except Exception as e:
        return False, str(e)

#------------edit------------------------
def update_patrolling_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = """
        UPDATE dbo.Patrolling_Observation_Register
        SET
            s_location_code = ?,
            d_patrol_date = ?,
            t_from_time = ?,
            t_to_time = ?,
            s_boundary_wall_condition = ?,
            s_patrolling_pathway_condition = ?,
            s_suspicious_movement = ?,
            s_wild_vegetation = ?,
            s_illumination_status = ?,
            s_workers_without_valid_permit = ?,
            s_unknown_person_without_authorization = ?,
            s_unattended_office_unlocked = ?,
            s_other_observations_status = ?,
            s_remarks = ?,
            s_patrolling_guard_name = ?,
            dt_updated_at = GETDATE(),
            s_updated_by = ?
        WHERE n_sr_no = ?
        """

        cursor.execute(sql, (
            data["s_location_code"],
            data["d_patrol_date"],
            data["t_from_time"],
            data["t_to_time"],
            data["s_boundary_wall_condition"],
            data["s_patrolling_pathway_condition"],
            data["s_suspicious_movement"],
            data["s_wild_vegetation"],
            data["s_illumination_status"],
            data["s_workers_without_valid_permit"],
            data["s_unknown_person_without_authorization"],
            data["s_unattended_office_unlocked"],
            data["s_other_observations_status"],
            data["s_remarks"],
            data["s_patrolling_guard_name"],
            username,
            data["n_sr_no"]
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return True, "Record updated successfully"

    except Exception as e:
        return False, str(e)
#----------------delete-----------------------
def delete_patrolling_data(data, username):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = """
        UPDATE dbo.Patrolling_Observation_Register
        SET
            delete_flag = 1,
            deleted_at = GETDATE(),
            deleted_by = ?
        WHERE n_sr_no = ?
        """

        cursor.execute(sql, (
            username,
            data["n_sr_no"]
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return True, "Record deleted successfully"

    except Exception as e:
        return False, str(e)

    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = """
        UPDATE dbo.Patrolling_Observation_Register
        SET
            delete_flag = 1,
            deleted_at = GETDATE(),
            deleted_by = ?
        WHERE n_sr_no = ?
        """

        cursor.execute(sql, (
            username,
            data["n_sr_no"]
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return True, "Record deleted successfully"

    except Exception as e:
        return False, str(e)

    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = """
UPDATE dbo.Patrolling_Observation_Register
SET
    delete_flag = 1,
    deleted_at = GETDATE(),
    deleted_by = ?
WHERE n_sr_no = ?
"""
        cursor.execute(sql, (data["n_sr_no"],))

        conn.commit()
        cursor.close()
        conn.close()

        return True, "Record deleted successfully"

    except Exception as e:
        return False, str(e)
    


# ------------ START BBA Test Record Register -----------------

# ----------- CREATE ---------------
def save_bba_test_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Get next SR NO
        cursor.execute("SELECT ISNULL(MAX(n_sr_no), 0) + 1 FROM dbo.BAA_Test_Record_Register")
        next_sr_no = cursor.fetchone()[0]

        insert_bba_test_record(cursor, data, next_sr_no, username)

        conn.commit()
        cursor.close()
        conn.close()

        return True, "BBA Test record saved successfully"

    except Exception as e:
        return False, str(e)


def insert_bba_test_record(cursor, data, n_sr_no, username):
    sql = """
    INSERT INTO dbo.BAA_Test_Record_Register
    (
        n_sr_no,
        s_location_code,
        d_test_date,
        t_test_time,
        s_test_record_no,
        s_individual_name,
        s_person_type,
        s_test_result,
        n_bac_count,
        img_attachment,
        s_security_personnel_name,
        s_remarks,
        s_created_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """

    cursor.execute(sql, (
        n_sr_no,
        data.get("s_location_code"),
        data.get("d_test_date"),
        data.get("t_test_time"),
        data.get("s_test_record_no"),
        data.get("s_individual_name"),
        data.get("s_person_type"),
        data.get("s_test_result"),
        data.get("n_bac_count"),
        data.get("img_attachment"),
        data.get("s_security_personnel_name"),
        data.get("s_remarks"),
        username
    ))


# ----------- READ ----------------
def get_bba_test_data():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                n_sr_no,
                s_location_code,
                d_test_date,
                t_test_time,
                s_test_record_no,
                s_individual_name,
                s_person_type,
                s_test_result,
                n_bac_count,
                img_attachment,
                s_security_personnel_name,
                s_remarks
            FROM dbo.BAA_Test_Record_Register
            WHERE ISNULL(delete_flag, 0) = 0
            ORDER BY n_sr_no DESC
        """)

        rows = cursor.fetchall()

        result = []
        for r in rows:
            result.append({
                "n_sr_no": r[0],
                "s_location_code": r[1],
                "d_test_date": str(r[2]),
                "t_test_time": str(r[3]),
                "s_test_record_no": r[4],
                "s_individual_name": r[5],
                "s_person_type": r[6],
                "s_test_result": r[7],
                "n_bac_count": r[8],
                "img_attachment": r[9],
                "s_security_personnel_name": r[10],
                "s_remarks": r[11]
            })

        cursor.close()
        conn.close()

        return True, result

    except Exception as e:
        return False, str(e)


# ----------- UPDATE ---------------
def update_bba_test_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = """
        UPDATE dbo.BAA_Test_Record_Register
        SET
            s_location_code = ?,
            d_test_date = ?,
            t_test_time = ?,
            s_test_record_no = ?,
            s_individual_name = ?,
            s_person_type = ?,
            s_test_result = ?,
            n_bac_count = ?,
            img_attachment = ISNULL(?, img_attachment),
            s_security_personnel_name = ?,
            s_remarks = ?,
            dt_updated_at = GETDATE(),
            s_updated_by = ?
        WHERE n_sr_no = ?
        """

        cursor.execute(sql, (
            data["s_location_code"],
            data["d_test_date"],
            data["t_test_time"],
            data["s_test_record_no"],
            data["s_individual_name"],
            data["s_person_type"],
            data["s_test_result"],
            data["n_bac_count"],
            data.get("img_attachment"),
            data["s_security_personnel_name"],
            data["s_remarks"],
            username,
            data["n_sr_no"]
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return True, "BBA Test record updated successfully"

    except Exception as e:
        return False, str(e)

    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = """
        UPDATE dbo.BAA_Test_Record_Register
        SET
            s_location_code = ?,
            d_test_date = ?,
            t_test_time = ?,
            s_test_record_no = ?,
            s_individual_name = ?,
            s_person_type = ?,
            s_test_result = ?,
            n_bac_count = ?,
            img_attachment = ISNULL(?, img_attachment),
            s_security_personnel_name = ?,
            s_remarks = ?,
            dt_updated_at = GETDATE(),
            s_updated_by = ?
        WHERE n_sr_no = ?
        """

        cursor.execute(sql, (
            data["s_location_code"],
            data["d_test_date"],
            data["t_test_time"],
            data["s_test_record_no"],
            data["s_individual_name"],
            data["s_person_type"],
            data["s_test_result"],
            data["n_bac_count"],
            data.get("img_attachment"),   # NEW
            data["s_security_personnel_name"],
            data["s_remarks"],
            username,
            data["n_sr_no"]
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return True, "BBA Test record updated successfully"

    except Exception as e:
        return False, str(e)

    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = """
        UPDATE dbo.BAA_Test_Record_Register
        SET
            s_location_code = ?,
            d_test_date = ?,
            t_test_time = ?,
            s_test_record_no = ?,
            s_individual_name = ?,
            s_person_type = ?,
            s_test_result = ?,
            n_bac_count = ?,
            s_security_personnel_name = ?,
            s_remarks = ?,
            dt_updated_at = GETDATE(),
            s_updated_by = ?
        WHERE n_sr_no = ?
        """

        cursor.execute(sql, (
            data["s_location_code"],
            data["d_test_date"],
            data["t_test_time"],
            data["s_test_record_no"],
            data["s_individual_name"],
            data["s_person_type"],
            data["s_test_result"],
            data["n_bac_count"],
            data["s_security_personnel_name"],
            data["s_remarks"],
            username,
            data["n_sr_no"]
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return True, "BBA Test record updated successfully"

    except Exception as e:
        return False, str(e)


# ----------- DELETE ----------------
def delete_bba_test_data(data):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = """
        UPDATE dbo.BAA_Test_Record_Register
        SET
            delete_flag = 1,
            deleted_at = GETDATE(),
            deleted_by = ?
        WHERE n_sr_no = ?
        """

        cursor.execute(sql, (
            data.get("deleted_by", "system"),
            data["n_sr_no"]
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return True, "BBA Test record deleted successfully"

    except Exception as e:
        return False, str(e)

# ------------ START PIPELINE MITRA REGISTER -----------------

# ------------ CREATE -----------------
def save_pipeline_mitra_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT ISNULL(MAX(n_sr_no), 0) + 1 
            FROM dbo.PIPELINE_MITRA_REGISTER
        """)
        next_sr_no = cursor.fetchone()[0]

        insert_pipeline_mitra_record(cursor, data, next_sr_no, username)

        conn.commit()
        cursor.close()
        conn.close()

        return True, "Pipeline Mitra record saved successfully"

    except Exception as e:
        return False, str(e)


def insert_pipeline_mitra_record(cursor, data, n_sr_no, username):
    sql = """
    INSERT INTO dbo.PIPELINE_MITRA_REGISTER
    (
        n_sr_no,
        s_location_code,
        d_entry_date,
        s_chainage_no,
        s_pm_name,
        s_pm_village_name,
        s_pm_mobile_no,
        s_remarks,
        s_created_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """

    cursor.execute(sql, (
        n_sr_no,
        data.get("s_location_code"),
        data.get("d_entry_date"),
        data.get("s_chainage_no"),
        data.get("s_pm_name"),
        data.get("s_pm_village_name"),
        data.get("s_pm_mobile_no"),
        data.get("s_remarks"),
        username
    ))


# ------------ READ -----------------
def get_pipeline_mitra_data():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                n_sr_no,
                s_location_code,
                d_entry_date,
                s_chainage_no,
                s_pm_name,
                s_pm_village_name,
                s_pm_mobile_no,
                s_remarks
            FROM dbo.PIPELINE_MITRA_REGISTER
            WHERE ISNULL(delete_flag, 0) = 0
            ORDER BY n_sr_no DESC
        """)

        rows = cursor.fetchall()

        result = []
        for r in rows:
            result.append({
                "n_sr_no": r[0],
                "s_location_code": r[1],
                "d_entry_date": str(r[2]),
                "s_chainage_no": r[3],
                "s_pm_name": r[4],
                "s_pm_village_name": r[5],
                "s_pm_mobile_no": r[6],
                "s_remarks": r[7]
            })

        cursor.close()
        conn.close()

        return True, result

    except Exception as e:
        return False, str(e)

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                n_sr_no,
                s_location_code,
                d_entry_date,
                s_chainage_no,
                s_pm_name,
                s_pm_village_name,
                s_pm_mobile_no,
                s_remarks
            FROM dbo.PIPELINE_MITRA_REGISTER
            ORDER BY n_sr_no DESC
        """)

        rows = cursor.fetchall()

        result = []
        for r in rows:
            result.append({
                "n_sr_no": r[0],
                "s_location_code": r[1],
                "d_entry_date": str(r[2]),
                "s_chainage_no": r[3],
                "s_pm_name": r[4],
                "s_pm_village_name": r[5],
                "s_pm_mobile_no": r[6],
                "s_remarks": r[7]
            })

        cursor.close()
        conn.close()

        return True, result

    except Exception as e:
        return False, str(e)


# ------------ UPDATE -----------------
def update_pipeline_mitra_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = """
        UPDATE dbo.PIPELINE_MITRA_REGISTER
        SET
            s_location_code = ?,
            d_entry_date = ?,
            s_chainage_no = ?,
            s_pm_name = ?,
            s_pm_village_name = ?,
            s_pm_mobile_no = ?,
            s_remarks = ?,
            dt_updated_at = GETDATE(),
            s_updated_by = ?
        WHERE n_sr_no = ?
        """

        cursor.execute(sql, (
            data["s_location_code"],
            data["d_entry_date"],
            data["s_chainage_no"],
            data["s_pm_name"],
            data["s_pm_village_name"],
            data["s_pm_mobile_no"],
            data["s_remarks"],
            username,
            data["n_sr_no"]
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return True, "Pipeline Mitra record updated successfully"

    except Exception as e:
        return False, str(e)


# ------------ DELETE -----------------
def delete_pipeline_mitra_data(data):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = """
        UPDATE dbo.PIPELINE_MITRA_REGISTER
        SET
            delete_flag = 1,
            deleted_at = GETDATE(),
            deleted_by = ?
        WHERE n_sr_no = ?
        """

        # deleted_by → session user email will be passed from function layer
        cursor.execute(sql, (
            data.get("deleted_by", "system"),
            data["n_sr_no"]
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return True, "Pipeline Mitra record deleted successfully"

    except Exception as e:
        return False, str(e)

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "DELETE FROM dbo.PIPELINE_MITRA_REGISTER WHERE n_sr_no = ?",
            (data["n_sr_no"],)
        )

        conn.commit()
        cursor.close()
        conn.close()

        return True, "Pipeline Mitra record deleted successfully"

    except Exception as e:
        return False, str(e)


#------------- vehicle checklist start -------------
# ------------ CREATE -----------------
def save_vehicle_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT ISNULL(MAX(n_sr_no),0)+1 FROM dbo.VEHICLE_CHECK_LIST"
        )
        next_sr_no = cursor.fetchone()[0]

        # ✅ FIX datetime-local format
        entry_dt = data.get("dt_entry_datetime")
        if entry_dt:
            entry_dt = datetime.strptime(entry_dt, "%Y-%m-%dT%H:%M")

        insert_vehicle_record(
            cursor,
            data,
            next_sr_no,
            username,
            entry_dt
        )

        conn.commit()
        cursor.close()
        conn.close()

        return True, "Vehicle record saved successfully"

    except Exception as e:
        print("SAVE VEHICLE ERROR:", e)   # 🔥 IMPORTANT
        return False, str(e)


def insert_vehicle_record(cursor, data, n_sr_no, username, entry_dt):
    sql = """
    INSERT INTO dbo.VEHICLE_CHECK_LIST
    (
        n_sr_no,
        s_location_code,
        dt_entry_datetime,
        s_vehicle_no,
        s_vehicle_type,
        s_driver_name,
        s_contact_no,
        s_purpose_of_entry,
        s_created_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """

    cursor.execute(sql, (
        n_sr_no,
        data.get("s_location_code"),
        entry_dt,
        data.get("s_vehicle_no"),
        data.get("s_vehicle_type"),
        data.get("s_driver_name"),
        data.get("s_contact_no"),
        data.get("s_purpose_of_entry"),
        username
    ))



# ------------ READ -----------------
def get_vehicle_data():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                n_sr_no,
                s_location_code,
                dt_entry_datetime,
                s_vehicle_no,
                s_vehicle_type,
                s_driver_name,
                s_contact_no,
                s_purpose_of_entry
            FROM dbo.VEHICLE_CHECK_LIST
            ORDER BY n_sr_no DESC
        """)

        rows = cursor.fetchall()
        result = []

        for r in rows:
            result.append({
                "n_sr_no": r[0],
                "s_location_code": r[1],
                "dt_entry_datetime": str(r[2]),
                "s_vehicle_no": r[3],
                "s_vehicle_type": r[4],
                "s_driver_name": r[5],
                "s_contact_no": r[6],
                "s_purpose_of_entry": r[7]
            })

        cursor.close()
        conn.close()

        return True, result

    except Exception as e:
        return False, str(e)


# ------------ UPDATE -----------------
def update_vehicle_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        entry_dt = data.get("dt_entry_datetime")
        if entry_dt:
            entry_dt = datetime.strptime(entry_dt, "%Y-%m-%dT%H:%M")

        sql = """
        UPDATE dbo.VEHICLE_CHECK_LIST
        SET
            s_location_code = ?,
            dt_entry_datetime = ?,
            s_vehicle_no = ?,
            s_vehicle_type = ?,
            s_driver_name = ?,
            s_contact_no = ?,
            s_purpose_of_entry = ?,
            dt_updated_at = GETDATE(),
            s_updated_by = ?
        WHERE n_sr_no = ?
        """

        cursor.execute(sql, (
            data["s_location_code"],
            entry_dt,                   
            data["s_vehicle_no"],
            data["s_vehicle_type"],
            data["s_driver_name"],
            data["s_contact_no"],
            data["s_purpose_of_entry"],
            username,
            data["n_sr_no"]
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return True, "Vehicle record updated successfully"

    except Exception as e:
        print("UPDATE VEHICLE ERROR:", e)
        return False, str(e)


# ------------ DELETE -----------------
def delete_vehicle_data(data):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = """
        UPDATE dbo.VEHICLE_CHECK_LIST
        SET
            delete_flag = 1,
            deleted_at = GETDATE(),
            deleted_by = ?
        WHERE n_sr_no = ?
        """

        cursor.execute(sql, (
            data.get("deleted_by", "system"),
            data["n_sr_no"]
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return True, "Vehicle record deleted successfully"

    except Exception as e:
        return False, str(e)


#------------- visitor start --------------
# ------------ CREATE -----------------
def save_visitor_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT ISNULL(MAX(n_sr_no), 0) + 1 FROM dbo.VISITOR_DECLARATION_SLIP"
        )
        next_sr_no = cursor.fetchone()[0]

        sql = """
        INSERT INTO dbo.VISITOR_DECLARATION_SLIP
        (
            n_sr_no,
            s_location_code,
            dt_visit_datetime,
            s_visitor_name,
            s_visitor_pass_no,
            s_whom_to_meet,
            s_created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """

        cursor.execute(sql, (
            next_sr_no,
            data.get("s_location_code"),
            data.get("dt_visit_datetime").replace("T", " "),
            data.get("s_visitor_name"),
            data.get("s_visitor_pass_no"),
            data.get("s_whom_to_meet"),
            username
        ))


        conn.commit()
        cursor.close()
        conn.close()

        return True, "Visitor record saved successfully"

    except Exception as e:
        return False, str(e)


# ------------ READ -----------------
def get_visitor_data():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                n_sr_no,
                s_location_code,
                dt_visit_datetime,
                s_visitor_name,
                s_visitor_pass_no,
                s_whom_to_meet
            FROM dbo.VISITOR_DECLARATION_SLIP
                       WHERE ISNULL(delete_flag,0) = 0

            ORDER BY n_sr_no DESC
        """)

        rows = cursor.fetchall()

        result = []
        for r in rows:
            result.append({
                "n_sr_no": r[0],
                "s_location_code": r[1],
                "dt_visit_datetime": str(r[2]),
                "s_visitor_name": r[3],
                "s_visitor_pass_no": r[4],
                "s_whom_to_meet": r[5]
            })

        cursor.close()
        conn.close()

        return True, result

    except Exception as e:
        return False, str(e)


# ------------ UPDATE -----------------
def update_visitor_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = """
        UPDATE dbo.VISITOR_DECLARATION_SLIP
        SET
            s_location_code = ?,
            dt_visit_datetime = ?,
            s_visitor_name = ?,
            s_visitor_pass_no = ?,
            s_whom_to_meet = ?,
            dt_updated_at = GETDATE(),
            s_updated_by = ?
        WHERE n_sr_no = ?
        """

        cursor.execute(sql, (
            data.get("s_location_code"),
            data.get("dt_visit_datetime").replace("T", " "),
            data.get("s_visitor_name"),
            data.get("s_visitor_pass_no"),
            data.get("s_whom_to_meet"),
            username,
            data.get("n_sr_no")
        ))


        conn.commit()
        cursor.close()
        conn.close()

        return True, "Visitor record updated successfully"

    except Exception as e:
        return False, str(e)


# ------------ DELETE -----------------
def delete_visitor_data(data):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "DELETE FROM dbo.VISITOR_DECLARATION_SLIP WHERE n_sr_no = ?",
            (data.get("n_sr_no"),)
        )

        conn.commit()
        cursor.close()
        conn.close()

        return True, "Visitor record deleted successfully"

    except Exception as e:
        return False, str(e)
