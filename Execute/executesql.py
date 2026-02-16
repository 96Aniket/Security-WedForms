import pyodbc # type: ignore
def get_connection():
    try:
        conn = pyodbc.connect(
            r'DRIVER={ODBC Driver 17 for SQL Server};'
            r'SERVER=DESKTOP-PE7348D\SQLEXPRESS;'
            r'DATABASE=Security_WebForms;'
            r'Trusted_Connection=yes;'
        )
        print("Connection Successful")
        return conn
    except Exception as e:
        print("Database connection failed:", e)
        return None