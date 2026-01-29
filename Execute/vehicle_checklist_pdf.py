from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime
from Execute.executesql import get_connection


def fetch_vehicle_from_db(n_sr_no):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            s_location_code,
            dt_entry_datetime,
            s_vehicle_no,
            s_vehicle_type,
            s_driver_name,
            s_contact_no,
            s_purpose_of_entry
        FROM dbo.VEHICLE_CHECK_LIST
        WHERE n_sr_no = ?
    """, (n_sr_no,))

    r = cursor.fetchone()
    cursor.close()
    conn.close()

    return {
        "location": r[0],
        "date": str(r[1])[:10] if r[1] else "",
        "vehicle_no": r[2],
        "vehicle_type": r[3],
        "driver": r[4],
        "contact": r[5],
        "purpose": r[6] or ""
    }


def generate_vehicle_checklist_pdf(data):
    if "n_sr_no" in data:
        data = fetch_vehicle_from_db(data["n_sr_no"])

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=60
    )

    styles = getSampleStyleSheet()
    normal = styles["Normal"]

    elements = []

    # ---------------- TITLE ----------------
    elements.append(Paragraph(
        "<b>PIL VEHICLE CHECKLIST</b>",
        ParagraphStyle(
            "title",
            alignment=TA_CENTER,
            fontSize=14,
            spaceAfter=6
        )
    ))

    elements.append(Paragraph(
        "SAFETY / STATUTORY DOCUMENT - CHECKLIST",
        ParagraphStyle(
            "subtitle",
            alignment=TA_CENTER,
            fontSize=10,
            spaceAfter=20
        )
    ))

    # ---------------- DETAILS TABLE ----------------
    details_table = Table([
        [
            Paragraph("<b>Vehicle No:</b>", normal),
            Paragraph(data.get("vehicle_no"), normal),
            Paragraph("<b>Type:</b>", normal),
            Paragraph(data.get("vehicle_type"), normal),
        ],
        [
            Paragraph("<b>Driver Name:</b>", normal),
            Paragraph(data.get("driver"), normal),
            Paragraph("<b>Contact No:</b>", normal),
            Paragraph(data.get("contact"), normal),
        ],
        [
            Paragraph("<b>Location:</b>", normal),
            Paragraph(data.get("location"), normal),
            Paragraph("<b>Date:</b>", normal),
            Paragraph(data.get("date"), normal),
        ],
        [
            Paragraph("<b>Purpose of Vehicle Entry:</b>", normal),
            Paragraph(data.get("purpose"), normal),
            "", ""
        ],
    ], colWidths=[100, 160, 80, 140])

    details_table.setStyle(TableStyle([
        ("SPAN", (1, 3), (3, 3)),        # span purpose text
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 3), (-1, 3), 14),  # extra space for purpose row
    ]))

    elements.append(details_table)
    elements.append(Spacer(1, 22))

    # ---------------- CHECKLIST TABLE ----------------
    checklist_items = [
        "Valid Driving License",
        "Valid Registration Book",
        "Valid Insurance Certificate",
        "Valid Vehicle Fitness Certificate",
        "Valid PUC Certificate",
        "Spark Arrestor Fitted",
        "Fire Extinguisher",
        "Self-Start",
        "Driver compartment & undercarriage checked",
        "Tyres condition & spare wheel",
        "Emergency info panel painted",
        "Crew wearing proper shoes",
        "Inflammable / objectionable items",
        "Extra load with malafide intention",
        "Crew in drunken state",
        "Valid explosive certificate (if required)",
        "Body / Valves / Seals",
        "Any Other"
    ]

    table_data = [["Sr", "CHECKLIST", "YES", "NO", "REMARKS"]]

    for i, item in enumerate(checklist_items, 1):
        table_data.append([str(i), item, "", "", ""])

    checklist_table = Table(
        table_data,
        colWidths=[30, 250, 50, 50, 120]
    )

    checklist_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ("FONT", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("ALIGN", (2, 1), (3, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))

    elements.append(checklist_table)
    elements.append(Spacer(1, 40))

    # ---------------- FOOTER ----------------
    elements.append(Paragraph(
        "SECURITY NAME & SIGN",
        ParagraphStyle(
            "footer",
            alignment=TA_CENTER,
            fontSize=10
        )
    ))

    # ---------------- BUILD ----------------
    doc.build(elements)

    buffer.seek(0)
    filename = f"Vehicle_Checklist_{data.get('vehicle_no','NA')}_{datetime.now().strftime('%Y%m%d')}.pdf"

    return buffer, filename
