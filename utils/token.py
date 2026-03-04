import uuid
from datetime import datetime, timedelta
from Execute.executesql import get_connection

def generate_token(request_id, level, approver_email):
    token = str(uuid.uuid4())
    expiry = datetime.now() + timedelta(hours=24)

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO tbl_SECURITY_APPROVAL_TOKENS
        (token, request_id, approval_level, approver_email, expires_at)
        VALUES (?, ?, ?, ?, ?)
    """, (token, request_id, level, approver_email, expiry))

    conn.commit()
    cursor.close()
    conn.close()

    return token


def validate_token(token):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT request_id, approval_level, approver_email,
               expires_at, is_used
        FROM tbl_SECURITY_APPROVAL_TOKENS
        WHERE token = ?
    """, token)

    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if not row:
        return None, "Invalid token"
    if row.is_used:
        return None, "Token already used"
    if row.expires_at < datetime.now():
        return None, "Token expired"

    return {
        "request_id": row.request_id,
        "approval_level": row.approval_level,
        "approver_email": row.approver_email
    }, None


def mark_token_used(token):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE tbl_SECURITY_APPROVAL_TOKENS
        SET is_used = 1
        WHERE token = ?
    """, token)

    conn.commit()
    cursor.close()
    conn.close()
