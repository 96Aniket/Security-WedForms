from Execute.executesql import get_connection

def execute_sp(sp_name, params=()):
    conn = get_connection()
    cursor = conn.cursor()

    placeholders = ",".join(["?"] * len(params))
    sql = f"EXEC {sp_name} {placeholders}"

    cursor.execute(sql, params)

    try:
        result = cursor.fetchone()
    except:
        result = None

    conn.commit()
    cursor.close()
    conn.close()

    return result
