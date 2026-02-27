from Execute.executesql import get_connection
from datetime import datetime , date
import pandas as pd


#------------start Patrolling Observation Register-----------------
def save_patrolling_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        
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
def get_patrolling_data(user_role, user_location):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        if user_role == "admin":
            # Admin sees all records
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
        else:
            # Normal user sees only own location
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
                AND s_location_code = ?
                ORDER BY n_sr_no DESC
            """, (user_location,))

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

        cursor.execute("SELECT ISNULL(MAX(n_sr_no), 0) + 1 FROM dbo.BAA_Test_Record_Register")
        next_sr_no = cursor.fetchone()[0]

        sql = """
        INSERT INTO dbo.BAA_Test_Record_Register
        (
            n_sr_no,
            s_location_code,
            d_test_date,
            t_test_time,
            s_test_record_no,
            s_individual_name,
            s_card_no,
            s_person_type,
            s_test_result,
            n_bac_count,
            img_attachment,
            s_security_personnel_name,
            s_remarks,
            s_created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        cursor.execute(sql, (
            next_sr_no,
            data.get("s_location_code"),
            data.get("d_test_date"),
            data.get("t_test_time"),
            data.get("s_test_record_no"),
            data.get("s_individual_name"),
            data.get("s_card_no"),
            data.get("s_person_type"),
            data.get("s_test_result"),
            None if data.get("n_bac_count") in ("", None) else data.get("n_bac_count"),
            data.get("img_attachment"),
            data.get("s_security_personnel_name"),
            data.get("s_remarks"),
            username
        ))

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
def get_bba_test_data(user_role, user_location):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        base_query = """
            SELECT
                n_sr_no,
                s_location_code,
                d_test_date,
                t_test_time,
                s_test_record_no,
                s_individual_name,
                s_card_no,
                s_person_type,
                s_test_result,
                n_bac_count,
                img_attachment,
                s_security_personnel_name,
                s_remarks
            FROM dbo.BAA_Test_Record_Register
            WHERE ISNULL(delete_flag, 0) = 0
        """

        if user_role != "admin":
            base_query += " AND s_location_code = ?"
            cursor.execute(base_query + " ORDER BY n_sr_no DESC", (user_location,))
        else:
            cursor.execute(base_query + " ORDER BY n_sr_no DESC")

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
                "s_card_no": r[6],
                "s_person_type": r[7],
                "s_test_result": r[8],
                "n_bac_count": r[9],
                "img_attachment": r[10],
                "s_security_personnel_name": r[11],
                "s_remarks": r[12]
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
            s_card_no = ?,
            s_person_type = ?,
            s_test_result = ?,
            n_bac_count = COALESCE(?, n_bac_count),
            img_attachment = ISNULL(?, img_attachment),
            s_security_personnel_name = ?,
            s_remarks = ?,
            dt_updated_at = GETDATE(),
            s_updated_by = ?
        WHERE n_sr_no = ?
        """

        cursor.execute(sql, (
            data.get("s_location_code"),
            data.get("d_test_date"),
            data.get("t_test_time"),
            data.get("s_test_record_no"),
            data.get("s_individual_name"),
            data.get("s_card_no"),
            data.get("s_person_type"),
            data.get("s_test_result"),
            None if data.get("n_bac_count") in ("", None) else int(data.get("n_bac_count")),
            data.get("img_attachment"),
            data.get("s_security_personnel_name"),
            data.get("s_remarks"),
            username,
            int(data.get("n_sr_no"))   # 🔥 IMPORTANT
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return True, "BBA Test record updated successfully"

    except Exception as e:
        print("UPDATE ERROR:", e)  # 🔥 MUST SEE REAL ERROR
        return False, str(e)       

# ----------- DELETE ----------------
def delete_bba_test_data(data, username):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE dbo.BAA_Test_Record_Register
            SET
                delete_flag = 1,
                deleted_by = ?,
                deleted_on = GETDATE()
            WHERE n_sr_no = ?
        """, (username, data["n_sr_no"]))

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
        t_entry_time,
        s_chainage_no,
        s_pm_name,
        s_pm_village_name,
        s_pm_mobile_no,
        s_remarks,
        s_created_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """

    cursor.execute(sql, (
        n_sr_no,
        data.get("s_location_code"),
        data.get("d_entry_date"),
        data.get("t_entry_time"),     
        data.get("s_chainage_no"),
        data.get("s_pm_name"),
        data.get("s_pm_village_name"),
        data.get("s_pm_mobile_no"),
        data.get("s_remarks"),
        username
    ))

# ------------ READ -----------------
def get_pipeline_mitra_data(user_role, user_location):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        if user_role == "admin":
            # Admin sees all locations
            cursor.execute("""
                SELECT
                    n_sr_no,
                    s_location_code,
                    d_entry_date,
                    t_entry_time,
                    s_chainage_no,
                    s_pm_name,
                    s_pm_village_name,
                    s_pm_mobile_no,
                    s_remarks
                FROM dbo.PIPELINE_MITRA_REGISTER
                WHERE ISNULL(delete_flag, 0) = 0
                ORDER BY n_sr_no DESC
            """)
        else:
            # Normal user sees only own location
            cursor.execute("""
                SELECT
                    n_sr_no,
                    s_location_code,
                    d_entry_date,
                    t_entry_time,
                    s_chainage_no,
                    s_pm_name,
                    s_pm_village_name,
                    s_pm_mobile_no,
                    s_remarks
                FROM dbo.PIPELINE_MITRA_REGISTER
                WHERE ISNULL(delete_flag, 0) = 0
                AND s_location_code = ?
                ORDER BY n_sr_no DESC
            """, (user_location,))

        rows = cursor.fetchall()

        result = []
        for r in rows:
            result.append({
                "n_sr_no": r[0],
                "s_location_code": r[1],
                "d_entry_date": str(r[2]),
                "t_entry_time": str(r[3]) if r[3] else None,
                "s_chainage_no": r[4],
                "s_pm_name": r[5],
                "s_pm_village_name": r[6],
                "s_pm_mobile_no": r[7],
                "s_remarks": r[8]
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
                t_entry_time = ?,           
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
            data.get("t_entry_time"),   
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

        cursor.execute("""
            UPDATE dbo.PIPELINE_MITRA_REGISTER
            SET
                delete_flag = 1,
                deleted_at = GETDATE(),
                deleted_by = ?
            WHERE n_sr_no = ?
        """, (
            data["deleted_by"],
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

# =====================================================
# VEHICLE CHECKLIST
# =====================================================

def save_vehicle_checklist_full(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        master = data["master"]
        checklist = data["checklist"]

        entry_dt = datetime.strptime(
            master["dt_entry_datetime"], "%Y-%m-%dT%H:%M"
        )

        # ---------- INSERT MASTER ----------
        cursor.execute("""
            INSERT INTO dbo.VEHICLE_CHECKLIST_MASTER
            (
                s_location_code,
                dt_entry_datetime,
                s_vehicle_no,
                s_vehicle_type,
                s_driver_name,
                s_contact_no,
                s_occupants_name,
                s_transporter_name,
                s_id_card_no,
                s_dl_no,
                s_purpose_of_entry,
                s_created_by,
                n_flag
            )
            OUTPUT INSERTED.n_vc_id
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            master["s_location_code"],
            entry_dt,
            master["s_vehicle_no"],
            master.get("s_vehicle_type"),
            master.get("s_driver_name"),
            master.get("s_contact_no"),
            master.get("s_occupants_name"),
            master.get("s_transporter_name"),
            master.get("s_id_card_no"),
            master.get("s_dl_no"),
            master.get("s_purpose_of_entry"),
            username
        ))

        n_vc_id = cursor.fetchone()[0]

        # ---------- INSERT CHECKLIST ----------
        for row in checklist:
            cursor.execute("""
                INSERT INTO dbo.VEHICLE_CHECKLIST
                (
                    n_vc_id,
                    s_check_code,
                    s_check_label,
                    s_status,
                    s_remark,
                    s_created_by,
                    n_flag
                )
                VALUES (?, ?, ?, ?, ?, ?, 1)
            """, (
                n_vc_id,
                row["s_check_code"],
                row["s_check_label"],
                row["s_status"],
                row.get("s_remark"),
                username
            ))

        conn.commit()
        return True, "Vehicle checklist saved successfully"

    except Exception as e:
        conn.rollback()
        return False, str(e)
    
def get_vehicle_checklist_data(user_role, user_location):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        if user_role == "admin":
            cursor.execute("""
                SELECT
                    n_vc_id,
                    s_location_code,
                    dt_entry_datetime,
                    s_vehicle_no,
                    s_vehicle_type,
                    s_driver_name,
                    s_contact_no,
                    s_occupants_name,
                    s_transporter_name,
                    s_id_card_no,
                    s_dl_no,
                    s_purpose_of_entry
                FROM dbo.VEHICLE_CHECKLIST_MASTER
                WHERE n_flag = 1
                ORDER BY n_vc_id DESC
            """)
        else:
            cursor.execute("""
                SELECT
                    n_vc_id,
                    s_location_code,
                    dt_entry_datetime,
                    s_vehicle_no,
                    s_vehicle_type,
                    s_driver_name,
                    s_contact_no,
                    s_occupants_name,
                    s_transporter_name,
                    s_id_card_no,
                    s_dl_no,
                    s_purpose_of_entry
                FROM dbo.VEHICLE_CHECKLIST_MASTER
                WHERE n_flag = 1
                AND s_location_code = ?
                ORDER BY n_vc_id DESC
            """, (user_location,))

        masters = cursor.fetchall()
        result = []

        for m in masters:
            cursor.execute("""
                SELECT
                    n_sr_no,
                    s_check_code,
                    s_check_label,
                    s_status,
                    s_remark
                FROM dbo.VEHICLE_CHECKLIST
                WHERE n_vc_id = ? AND n_flag = 1
            """, (m[0],))

            checks = cursor.fetchall()

            result.append({
                "n_vc_id": m[0],
                "s_location_code": m[1],
                "dt_entry_datetime": str(m[2]),
                "s_vehicle_no": m[3],
                "s_vehicle_type": m[4],
                "s_driver_name": m[5],
                "s_contact_no": m[6],
                "s_occupants_name": m[7],
                "s_transporter_name": m[8],
                "s_id_card_no": m[9],
                "s_dl_no": m[10],
                "s_purpose_of_entry": m[11],
                "checklist": [
                    {
                        "n_sr_no": c[0],
                        "s_check_code": c[1],
                        "s_check_label": c[2],
                        "s_status": c[3],
                        "s_remark": c[4]
                    } for c in checks
                ]
            })

        cursor.close()
        conn.close()

        return True, result

    except Exception as e:
        return False, str(e)



def update_vehicle_checklist_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        master = data["master"]
        checklist = data["checklist"]

        entry_dt = datetime.strptime(
            master["dt_entry_datetime"], "%Y-%m-%dT%H:%M"
        )

        # ---------- UPDATE MASTER ----------
        cursor.execute("""
            UPDATE dbo.VEHICLE_CHECKLIST_MASTER
            SET
                s_location_code = ?,
                dt_entry_datetime = ?,
                s_vehicle_no = ?,
                s_vehicle_type = ?,
                s_driver_name = ?,
                s_contact_no = ?,
                s_occupants_name = ?,
                s_transporter_name = ?,
                s_id_card_no = ?,
                s_dl_no = ?,
                s_purpose_of_entry = ?,
                dt_updated_at = GETDATE(),
                s_updated_by = ?
            WHERE n_vc_id = ?
        """, (
            master["s_location_code"],
            entry_dt,
            master["s_vehicle_no"],
            master.get("s_vehicle_type"),
            master.get("s_driver_name"),
            master.get("s_contact_no"),
            master.get("s_occupants_name"),
            master.get("s_transporter_name"),
            master.get("s_id_card_no"),
            master.get("s_dl_no"),
            master.get("s_purpose_of_entry"),
            username,
            master["n_vc_id"]
        ))

        # ---------- SOFT DELETE OLD CHECKLIST ----------
        cursor.execute("""
            UPDATE dbo.VEHICLE_CHECKLIST
            SET n_flag = 0
            WHERE n_vc_id = ?
        """, (master["n_vc_id"],))

        # ---------- INSERT NEW CHECKLIST ----------
        for row in checklist:
            cursor.execute("""
                INSERT INTO dbo.VEHICLE_CHECKLIST
                (
                    n_vc_id,
                    s_check_code,
                    s_check_label,
                    s_status,
                    s_remark,
                    s_created_by,
                    n_flag
                )
                VALUES (?, ?, ?, ?, ?, ?, 1)
            """, (
                master["n_vc_id"],
                row["s_check_code"],
                row["s_check_label"],
                row["s_status"],
                row.get("s_remark"),
                username
            ))

        conn.commit()
        return True, "Vehicle checklist updated successfully"

    except Exception as e:
        conn.rollback()
        return False, str(e)


def delete_vehicle_checklist_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        n_vc_id = data["n_vc_id"]

        cursor.execute("""
            UPDATE dbo.VEHICLE_CHECKLIST_MASTER
            SET
                n_flag = 0,
                dt_deleted_at = GETDATE(),
                s_deleted_by = ?
            WHERE n_vc_id = ?
        """, (username, n_vc_id))

        cursor.execute("""
            UPDATE dbo.VEHICLE_CHECKLIST
            SET
                n_flag = 0,
                dt_deleted_at = GETDATE(),
                s_deleted_by = ?
            WHERE n_vc_id = ?
        """, (username, n_vc_id))

        conn.commit()
        return True, "Vehicle checklist deleted successfully"

    except Exception as e:
        conn.rollback()
        return False, str(e)


#------------- visitor start --------------

def save_visitor_declaration_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        master = data["master"]
        items = data["items"]

        visit_dt = datetime.strptime(
            master["dt_visit_datetime"], "%Y-%m-%dT%H:%M"
        )

        # ---- INSERT MASTER ----
        cursor.execute("""
            INSERT INTO dbo.VISITOR_DECLARATION_SLIP_MASTER
            (
                s_location,
                dt_visit_datetime,
                s_visitor_name,
                s_visitor_pass_no,
                s_whom_to_meet,
                s_created_by,
                n_flag
            )
            OUTPUT INSERTED.n_sl_no
            VALUES (?, ?, ?, ?, ?, ?, 1)
        """, (
            master["s_location"],
            visit_dt,
            master["s_visitor_name"],
            master["s_visitor_pass_no"],
            master["s_whom_to_meet"],
            username
        ))

        n_sl_no = cursor.fetchone()[0]

        # ---- INSERT CHILD ----
        for row in items:
            cursor.execute("""
                INSERT INTO dbo.VISITOR_DECLARATION_SLIP
                (
                    n_sl_no,
                    s_item_code_description,
                    s_uom,
                    n_quantity,
                    s_created_by,
                    n_flag
                )
                VALUES (?, ?, ?, ?, ?, 1)
            """, (
                n_sl_no,
                row["s_item_code_description"],
                row["s_uom"],
                row["n_quantity"],
                username
            ))

        conn.commit()
        return True, "Visitor declaration record saved successfully"

    except Exception as e:
        conn.rollback()
        return False, str(e)


def get_visitor_declaration_data(user_role, user_location):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # 🔹 Role-based filtering
        if user_role == "admin":
            cursor.execute("""
                SELECT
                    n_sl_no,
                    s_location,
                    dt_visit_datetime,
                    s_visitor_name,
                    s_visitor_pass_no,
                    s_whom_to_meet
                FROM dbo.VISITOR_DECLARATION_SLIP_MASTER
                WHERE n_flag = 1
                ORDER BY n_sl_no DESC
            """)
        else:
            cursor.execute("""
                SELECT
                    n_sl_no,
                    s_location,
                    dt_visit_datetime,
                    s_visitor_name,
                    s_visitor_pass_no,
                    s_whom_to_meet
                FROM dbo.VISITOR_DECLARATION_SLIP_MASTER
                WHERE n_flag = 1
                AND s_location = ?
                ORDER BY n_sl_no DESC
            """, (user_location,))

        masters = cursor.fetchall()
        result = []

        for m in masters:
            cursor.execute("""
                SELECT
                    n_sr_no,
                    s_item_code_description,
                    s_uom,
                    n_quantity
                FROM dbo.VISITOR_DECLARATION_SLIP
                WHERE n_sl_no = ? AND n_flag = 1
            """, (m[0],))

            items = cursor.fetchall()

            result.append({
                "n_sl_no": m[0],
                "s_location": m[1],
                "dt_visit_datetime": str(m[2]),
                "s_visitor_name": m[3],
                "s_visitor_pass_no": m[4],
                "s_whom_to_meet": m[5],
                "items": [
                    {
                        "n_sr_no": i[0],
                        "s_item_code_description": i[1],
                        "s_uom": i[2],
                        "n_quantity": i[3]
                    } for i in items
                ]
            })

        cursor.close()
        conn.close()

        return True, result

    except Exception as e:
        return False, str(e)


def update_visitor_declaration_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        master = data["master"]
        items = data["items"]

        visit_dt = datetime.strptime(
            master["dt_visit_datetime"], "%Y-%m-%dT%H:%M"
        )

        # ---- UPDATE MASTER ----
        cursor.execute("""
            UPDATE dbo.VISITOR_DECLARATION_SLIP_MASTER
            SET
                s_location = ?,
                dt_visit_datetime = ?,
                s_visitor_name = ?,
                s_visitor_pass_no = ?,
                s_whom_to_meet = ?,
                dt_updated_at = GETDATE(),
                s_updated_by = ?
            WHERE n_sl_no = ?
        """, (
            master["s_location"],
            visit_dt,
            master["s_visitor_name"],
            master["s_visitor_pass_no"],
            master["s_whom_to_meet"],
            username,
            master["n_sl_no"]
        ))

        # ---- SOFT DELETE OLD CHILD ----
        cursor.execute("""
            UPDATE dbo.VISITOR_DECLARATION_SLIP
            SET n_flag = 0
            WHERE n_sl_no = ?
        """, (master["n_sl_no"],))

        # ---- INSERT NEW CHILD ----
        for row in items:
            cursor.execute("""
                INSERT INTO dbo.VISITOR_DECLARATION_SLIP
                (
                    n_sl_no,
                    s_item_code_description,
                    s_uom,
                    n_quantity,
                    s_created_by,
                    n_flag
                )
                VALUES (?, ?, ?, ?, ?, 1)
            """, (
                master["n_sl_no"],
                row["s_item_code_description"],
                row["s_uom"],
                row["n_quantity"],
                username
            ))

        conn.commit()
        return True, "Visitor declaration record updated successfully"

    except Exception as e:
        conn.rollback()
        return False, str(e)


def delete_visitor_declaration_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        n_sl_no = data["n_sl_no"]

        cursor.execute("""
            UPDATE dbo.VISITOR_DECLARATION_SLIP_MASTER
            SET
                n_flag = 0,
                dt_deleted_at = GETDATE(),
                s_deleted_by = ?
            WHERE n_sl_no = ?
        """, (username, n_sl_no))

        cursor.execute("""
            UPDATE dbo.VISITOR_DECLARATION_SLIP
            SET
                n_flag = 0,
                dt_deleted_at = GETDATE(),
                s_deleted_by = ?
            WHERE n_sl_no = ?
        """, (username, n_sl_no))

        conn.commit()
        return True, "Visitor declaration record deleted successfully"

    except Exception as e:
        conn.rollback()
        return False, str(e)


# =====================================================
# CASUAL LABOUR REGISTER
# =====================================================

def save_casual_labour_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        master = data["master"]
        labours = data["labours"]

        work_dt = datetime.strptime(
            master["dt_work_datetime"], "%Y-%m-%dT%H:%M"
        )

        # ---- INSERT MASTER ----
        cursor.execute("""
            INSERT INTO dbo.CASUAL_LABOUR_LIST_MASTER
            (
                s_location,
                s_contractor_name,
                s_nature_of_work,
                s_place_of_work,
                dt_work_datetime,
                s_created_by,
                n_flag
            )
            OUTPUT INSERTED.n_sl_no
            VALUES (?, ?, ?, ?, ?, ?, 1)
        """, (
            master["s_location"],
            master["s_contractor_name"],
            master["s_nature_of_work"],
            master["s_place_of_work"],
            work_dt,
            username
        ))

        n_sl_no = cursor.fetchone()[0]

        # ---- INSERT CHILD ----
        for row in labours:
            cursor.execute("""
                INSERT INTO dbo.CASUAL_LABOUR_LIST
                (
                    n_sl_no,
                    s_labour_name,
                    n_age,
                    s_sex,
                    s_address,
                    s_temp_access_card_no,
                    s_mobile_no,
                    s_id_type,
                    s_govt_id_no,
                    s_created_by,
                    n_flag
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            """, (
                n_sl_no,
                row["s_labour_name"],
                row["n_age"],
                row["s_sex"],
                row["s_address"],
                row["s_temp_access_card_no"],
                row["s_mobile_no"],
                row["s_id_type"],
                row["s_govt_id_no"],
                username
            ))

        conn.commit()
        return True, "Casual labour record saved successfully"

    except Exception as e:
        conn.rollback()
        return False, str(e)

def get_casual_labour_data(user_role, user_location):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        if user_role == "admin":
            # Admin sees all locations
            cursor.execute("""
                SELECT
                    m.n_sl_no,
                    m.s_location,
                    m.s_contractor_name,
                    m.s_nature_of_work,
                    m.s_place_of_work,
                    m.dt_work_datetime
                FROM dbo.CASUAL_LABOUR_LIST_MASTER m
                WHERE m.n_flag = 1
                ORDER BY m.n_sl_no DESC
            """)
        else:
            # Normal user sees only own location
            cursor.execute("""
                SELECT
                    m.n_sl_no,
                    m.s_location,
                    m.s_contractor_name,
                    m.s_nature_of_work,
                    m.s_place_of_work,
                    m.dt_work_datetime
                FROM dbo.CASUAL_LABOUR_LIST_MASTER m
                WHERE m.n_flag = 1
                AND m.s_location = ?
                ORDER BY m.n_sl_no DESC
            """, (user_location,))

        masters = cursor.fetchall()
        result = []

        for m in masters:
            cursor.execute("""
                SELECT
                    n_sr_no,
                    s_labour_name,
                    n_age,
                    s_sex,
                    s_address,
                    s_temp_access_card_no,
                    s_mobile_no,
                    s_id_type,
                    s_govt_id_no
                FROM dbo.CASUAL_LABOUR_LIST
                WHERE n_sl_no = ? AND n_flag = 1
            """, (m[0],))

            labours = cursor.fetchall()

            result.append({
                "n_sl_no": m[0],
                "s_location": m[1],
                "s_contractor_name": m[2],
                "s_nature_of_work": m[3],
                "s_place_of_work": m[4],
                "dt_work_datetime": str(m[5]),
                "labours": [
                    {
                        "n_sr_no": l[0],
                        "s_labour_name": l[1],
                        "n_age": l[2],
                        "s_sex": l[3],
                        "s_address": l[4],
                        "s_temp_access_card_no": l[5],
                        "s_mobile_no": l[6],
                        "s_id_type": l[7],
                        "s_govt_id_no": l[8]
                    } for l in labours
                ]
            })

        cursor.close()
        conn.close()

        return True, result

    except Exception as e:
        return False, str(e)

def update_casual_labour_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        master = data["master"]
        labours = data["labours"]

        work_dt = datetime.strptime(
            master["dt_work_datetime"], "%Y-%m-%dT%H:%M"
        )

        # ---- UPDATE MASTER ----
        cursor.execute("""
            UPDATE dbo.CASUAL_LABOUR_LIST_MASTER
            SET
                s_location = ?,
                s_contractor_name = ?,
                s_nature_of_work = ?,
                s_place_of_work = ?,
                dt_work_datetime = ?,
                dt_updated_at = GETDATE(),
                s_updated_by = ?
            WHERE n_sl_no = ?
        """, (
            master["s_location"],
            master["s_contractor_name"],
            master["s_nature_of_work"],
            master["s_place_of_work"],
            work_dt,
            username,
            master["n_sl_no"]
        ))

        # ---- SOFT DELETE OLD CHILD ----
        cursor.execute("""
            UPDATE dbo.CASUAL_LABOUR_LIST
            SET n_flag = 0
            WHERE n_sl_no = ?
        """, (master["n_sl_no"],))

        # ---- INSERT NEW CHILD ----
        for row in labours:
            cursor.execute("""
                INSERT INTO dbo.CASUAL_LABOUR_LIST
                (
                    n_sl_no,
                    s_labour_name,
                    n_age,
                    s_sex,
                    s_address,
                    s_temp_access_card_no,
                    s_mobile_no,
                    s_id_type,
                    s_govt_id_no,
                    s_created_by,
                    n_flag
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            """, (
                master["n_sl_no"],
                row["s_labour_name"],
                row["n_age"],
                row["s_sex"],
                row["s_address"],
                row["s_temp_access_card_no"],
                row["s_mobile_no"],
                row["s_id_type"],
                row["s_govt_id_no"],
                username
            ))

        conn.commit()
        return True, "Casual labour record updated successfully"

    except Exception as e:
        conn.rollback()
        return False, str(e)

def delete_casual_labour_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        n_sl_no = data["n_sl_no"]

        cursor.execute("""
            UPDATE dbo.CASUAL_LABOUR_LIST_MASTER
            SET
                n_flag = 0,
                dt_deleted_at = GETDATE(),
                s_deleted_by = ?
            WHERE n_sl_no = ?
        """, (username, n_sl_no))

        cursor.execute("""
            UPDATE dbo.CASUAL_LABOUR_LIST
            SET
                n_flag = 0,
                dt_deleted_at = GETDATE(),
                s_deleted_by = ?
            WHERE n_sl_no = ?
        """, (username, n_sl_no))

        conn.commit()
        return True, "Casual labour record deleted successfully"

    except Exception as e:
        conn.rollback()
        return False, str(e)


# =====================================================
# REPORT MASTER TABLE CONFIG
# =====================================================


REPORT_COLUMNS = {
    "Patrolling_Observation_Register": [
        ("s_location_code", "Location Code"),
        ("d_patrol_date", "Patrol Date"),
        ("t_from_time", "From Time"),
        ("t_to_time", "To Time"),
        ("s_boundary_wall_condition", "Boundary Wall Condition"),
        ("s_patrolling_pathway_condition", "Patrolling Pathway Condition"),
        ("s_suspicious_movement", "Suspicious Movement"),
        ("s_wild_vegetation", "Wild Vegetation"),
        ("s_illumination_status", "Illumination Status"),
        ("s_workers_without_valid_permit", "Workers Without Permit"),
        ("s_unknown_person_without_authorization", "Unknown Person Without Authorization"),
        ("s_unattended_office_unlocked", "Unattended Office Unlocked"),
        ("s_other_observations_status", "Other Observations"),
        ("s_remarks", "Remarks"),
        ("s_patrolling_guard_name", "Guard Name")
    ],

    "BAA_Test_Record_Register": [
        ("s_location_code", "Location Code"),
        ("d_test_date", "Test Date"),
        ("t_test_time", "Test Time"),
        ("s_test_record_no", "Test Record No"),
        ("s_individual_name", "Individual Name"),
        ("s_person_type", "Person Type"),
        ("s_test_result", "Test Result"),
        ("n_bac_count", "BAC Count"),
        ("s_security_personnel_name", "Security Personnel"),
        ("s_remarks", "Remarks")
    ],

    "PIPELINE_MITRA_REGISTER": [
        ("s_location_code", "Location Code"),
        ("d_entry_date", "Entry Date"),
        ("s_chainage_no", "Chainage No"),
        ("s_pm_name", "Mitra Name"),
        ("s_pm_village_name", "Village Name"),
        ("s_pm_mobile_no", "Mobile No"),
        ("s_remarks", "Remarks")
    ],

    "VEHICLE_CHECKLIST_MASTER": [
        ("s_location_code", "Location Code"),
        ("dt_entry_datetime", "Entry Date & Time"),
        ("s_vehicle_no", "Vehicle No"),
        ("s_vehicle_type", "Vehicle Type"),
        ("s_driver_name", "Driver Name"),
        ("s_contact_no", "Contact No"),
        ("s_occupants_name", "Occupants Name"),
        ("s_purpose_of_entry", "Purpose of Entry")
    ],

    "VISITOR_DECLARATION_SLIP_MASTER": [
        ("s_location", "Location"),
        ("dt_visit_datetime", "Visit Date & Time"),
        ("s_visitor_name", "Visitor Name"),
        ("s_visitor_pass_no", "Visitor Pass No"),
        ("s_whom_to_meet", "Whom To Meet")
    ],

    "CASUAL_LABOUR_LIST_MASTER": [
        ("s_location", "Location"),
        ("s_contractor_name", "Contractor Name"),
        ("s_nature_of_work", "Nature Of Work"),
        ("s_place_of_work", "Place Of Work"),
        ("dt_work_datetime", "Work Date & Time")
    ]
}
REPORT_TABLES = [
    {
        "table": "Patrolling_Observation_Register",
        "label": "Patrolling Observation Register",
        "date_column": "d_patrol_date",
        "location_column": "s_location_code",
        "where": "ISNULL(delete_flag,0) = 0"
    },
    {
        "table": "BAA_Test_Record_Register",
        "label": "BBA Test Record Register",
        "date_column": "d_test_date",
        "location_column": "s_location_code",
        "where": "ISNULL(delete_flag,0) = 0"
    },
    {
        "table": "PIPELINE_MITRA_REGISTER",
        "label": "Pipeline Mitra Register",
        "date_column": "d_entry_date",
        "location_column": "s_location_code",
        "where": "ISNULL(delete_flag,0) = 0"
    },
    {
        "table": "VEHICLE_CHECKLIST_MASTER",
        "label": "Vehicle Checklist Register",
        "date_column": "dt_entry_datetime",
        "location_column": "s_location_code",
        "where": "n_flag = 1"
    },
    {
        "table": "VISITOR_DECLARATION_SLIP_MASTER",
        "label": "Visitor Declaration Register",
        "date_column": "dt_visit_datetime",
        "location_column": "s_location",
        "where": "n_flag = 1"
    },
    {
        "table": "CASUAL_LABOUR_LIST_MASTER",
        "label": "Casual Labour Register",
        "date_column": "dt_work_datetime",
        "location_column": "s_location",
        "where": "n_flag = 1"
    }
]

def get_all_locations():
    conn = get_connection()

    if conn is None:
        raise Exception("Database connection failed")

    cursor = conn.cursor()

    cursor.execute("""
        SELECT DISTINCT s_location_code
        FROM Patrolling_Observation_Register
        WHERE ISNULL(delete_flag, 0) = 0
          AND s_location_code IS NOT NULL
        ORDER BY s_location_code
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return [r[0] for r in rows]


def fetch_data_with_date(table, start_date, end_date, location):
    conn = get_connection()

    if conn is None:
        raise Exception("Database connection failed")

    table_cfg = next(
        (t for t in REPORT_TABLES if t["table"] == table),
        None
    )

    if not table_cfg:
        raise Exception("Invalid report table")

    cols = REPORT_COLUMNS.get(table)
    if not cols:
        raise Exception("No columns configured for report")

    db_columns = [c[0] for c in cols]
    display_columns = [c[1] for c in cols]

    date_column = table_cfg["date_column"]
    location_column = table_cfg["location_column"]
    where_clause = table_cfg.get("where", "1=1")

    col_sql_list = []
    for col in db_columns:
        if col.startswith("d_"):
            col_sql_list.append(f"FORMAT([{col}], 'yyyy-MM-dd') AS [{col}]")
        elif col.startswith("t_"):
            col_sql_list.append(f"CONVERT(varchar(8), [{col}], 108) AS [{col}]")
        elif col.startswith("dt_"):
            col_sql_list.append(f"FORMAT([{col}], 'yyyy-MM-dd HH:mm:ss') AS [{col}]")
        else:
            col_sql_list.append(f"[{col}]")

    col_sql = ", ".join(col_sql_list)

    query = f"""
        SELECT {col_sql}
        FROM {table}
        WHERE {where_clause}
          AND {date_column} >= ?
          AND {date_column} < DATEADD(day, 1, ?)
          AND {location_column} = ?
    """

    df = pd.read_sql(
        query,
        conn,
        params=[start_date, end_date, location]
    )

    conn.close()
    df.columns = display_columns
    return df

def get_report_master_tables():
    return [
        {"value": t["table"], "label": t["label"]}
        for t in REPORT_TABLES
    ]

# =====================================================
# Requisition – Request Master
# =====================================================

def create_request(sender_email, receiver_email):
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
    cursor.close()
    conn.close()
    return request_id


def get_initiator_email(request_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT initiator_email
        FROM APPROVAL_REQUEST_MASTER
        WHERE request_id = ?
    """, (request_id,))

    email = cursor.fetchone().initiator_email
    cursor.close()
    conn.close()
    return email


def update_request_after_submit(request_id, form_sr_no, approver_email):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE APPROVAL_REQUEST_MASTER
        SET form_sr_no = ?,
            current_level = 0,
            current_approver_email = ?,
            last_action_time = GETDATE()
        WHERE request_id = ?
    """, (form_sr_no, approver_email, request_id))

    conn.commit()
    cursor.close()
    conn.close()


# =====================================================
# Requisition Form
# =====================================================

def insert_requisition_form(data, created_by):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO REQUISITION_FORM_MASTER
    (
        s_location, dt_request_date, s_first_name, s_middle_name, s_last_name,
        s_photo, dt_date_of_birth, n_age, s_gender,
        s_agency_name, s_sap_vendor_code, s_nature_of_job, s_work_order_no,
        dt_work_order_validity, dt_date_of_joining, s_exact_work_location,
        n_height_cm, s_blood_group, s_identification_mark,
        s_aadhar_card_no, s_contact_no,
        s_present_address, s_present_city, s_present_state, s_present_pincode,
        s_emergency_contact_details, s_emergency_city, s_emergency_state,
        s_emergency_pincode, s_emergency_contact_no,
        s_police_verification_cert, s_medical_certificate,
        s_govt_id_proof, s_hsse_training,
        dt_created_at, s_created_by
    )
    OUTPUT INSERTED.n_sr_no
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,GETDATE(),?)
    """, (
        data["s_location"],
        data["dt_request_date"],
        data["s_first_name"],
        data["s_middle_name"],
        data["s_last_name"],
        data["s_photo"],
        data["dt_date_of_birth"],
        data["n_age"],
        data["s_gender"],

        data["s_agency_name"],
        data["s_sap_vendor_code"],
        data["s_nature_of_job"],
        data["s_work_order_no"],
        data["dt_work_order_validity"],
        data["dt_date_of_joining"],
        data["s_exact_work_location"],

        data["n_height_cm"],
        data["s_blood_group"],
        data["s_identification_mark"],

        data["s_aadhar_card_no"],
        data["s_contact_no"],

        data["s_present_address"],
        data["s_present_city"],
        data["s_present_state"],
        data["s_present_pincode"],

        data["s_emergency_contact_details"],
        data["s_emergency_city"],
        data["s_emergency_state"],
        data["s_emergency_pincode"],
        data["s_emergency_contact_no"],

        data["s_police_verification_cert"],
        data["s_medical_certificate"],
        data["s_govt_id_proof"],
        data["s_hsse_training"],

        created_by
    ))

    sr_no = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    conn.close()
    return sr_no


def get_form_by_request_id(request_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM REQUISITION_FORM_MASTER
        WHERE n_sr_no = (
            SELECT form_sr_no
            FROM APPROVAL_REQUEST_MASTER
            WHERE request_id = ?
        )
    """, (request_id,))

    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return row


# =====================================================
# Timeline & Dashboard
# =====================================================

def get_request_timeline(request_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("EXEC sp_get_request_timeline ?", request_id)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows


def get_dashboard_requests():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT request_id, overall_status, current_level,
               current_approver_email, last_action_time, sla_breached
        FROM APPROVAL_REQUEST_MASTER
        ORDER BY request_id DESC
    """)

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return [{
        "request_id": r.request_id,
        "overall_status": r.overall_status,
        "current_level": r.current_level,
        "current_approver_email": r.current_approver_email,
        "last_action_time": str(r.last_action_time),
        "sla_breached": r.sla_breached
    } for r in rows]

def is_final_level(level):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT is_final
        FROM APPROVAL_LEVEL_CONFIG
        WHERE level_no = ?
    """, (level,))

    row = cursor.fetchone()
    cursor.close()
    conn.close()

    return bool(row and row.is_final)

def get_previous_approver(request_id, current_level):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT TOP 1 approver_email
        FROM APPROVAL_ACTION_LOGS
        WHERE request_id = ?
          AND approval_level < ?
        ORDER BY action_time DESC
    """, (request_id, current_level))

    row = cursor.fetchone()
    cursor.close()
    conn.close()

    return row.approver_email if row else None

def reject_email_template(request_id, remark):
    return f"""
    <h3>Requisition Rejected</h3>
    <p><b>Request ID:</b> {request_id}</p>
    <p><b>Remark:</b> {remark}</p>

    <p>Please review and take action.</p>
    """

def update_requisition_form(data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE REQUISITION_FORM_MASTER
        SET
            s_nature_of_job = ?,
            s_location      = ?
        WHERE n_sr_no = (
            SELECT form_sr_no
            FROM APPROVAL_REQUEST_MASTER
            WHERE request_id = ?
        )
    """, (
        data.get('s_nature_of_job'),
        data.get('s_location'),
        data.get('request_id')
    ))

    conn.commit()
    cursor.close()
    conn.close()

def get_current_level(request_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT current_level
        FROM APPROVAL_REQUEST_MASTER
        WHERE request_id = ?
    """, (request_id,))

    row = cursor.fetchone()
    cursor.close()
    conn.close()

    return row.current_level if row else None


def get_current_approver(request_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT current_approver_email
        FROM APPROVAL_REQUEST_MASTER
        WHERE request_id = ?
    """, (request_id,))

    row = cursor.fetchone()
    cursor.close()
    conn.close()

    return row.current_approver_email if row else None

def get_rejector(request_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT rejected_from_level
        FROM APPROVAL_REQUEST_MASTER
        WHERE request_id = ?
    """, (request_id,))

    row = cursor.fetchone()

    if not row or row.rejected_from_level is None:
        cursor.close()
        conn.close()
        return None, None

    rejected_level = row.rejected_from_level

    cursor.execute("""
        SELECT approver_email
        FROM APPROVAL_ACTION_LOGS
        WHERE request_id = ?
          AND approval_level = ?
          AND action_taken = 'REJECT'
    """, (request_id, rejected_level))

    approver_row = cursor.fetchone()
    cursor.close()
    conn.close()

    return rejected_level, approver_row.approver_email if approver_row else None

