import json
import re
import os
from PyPDF2 import PdfReader
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from openpyxl import Workbook

OUTPUT_DIR = "new_database"

# ----------------------------
# Extract price mapping from PDF
# ----------------------------
def extract_prices(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"

    price_map = {}
    # Pattern: TEST NAME   50,000.00₦
    pattern = re.compile(r"^(.*?)(\d{1,3}(?:,\d{3})*(?:\.\d+)?₦)$")

    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        match = pattern.match(line)
        if match:
            test = match.group(1).strip().upper()
            price = match.group(2).strip()
            price_map[test] = price

    return price_map

# ----------------------------
# PDF Generation
# ----------------------------
def json_to_pdf(data, filename, title, price_map=None, include_prices=False):
    doc = SimpleDocTemplate(filename, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph(f"<b>{title} SERVICES</b>", styles["Title"]))
    elements.append(Spacer(1, 12))

    def render_dict(d, parent_key=""):
        for key, value in d.items():
            if isinstance(value, dict):
                elements.append(Paragraph(f"<b>{key}</b>", styles["Heading2"]))
                render_dict(value, parent_key=key)
            elif isinstance(value, list) and value:
                # Build table rows
                table_data = [["CATEGORY", "TEST NAME", "PRICE" if include_prices else ""]]
                for item in value:
                    clean_item = item.strip().upper()
                    price = price_map.get(clean_item, "") if include_prices else ""
                    row = [key, clean_item, price]
                    table_data.append(row)

                table = Table(table_data, colWidths=[120, 250, 100])
                table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0D47A1")),  # Blue header
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ]))

                # Make price column red
                if include_prices:
                    for i in range(1, len(table_data)):
                        table.setStyle(TableStyle([("TEXTCOLOR", (2, i), (2, i), colors.red)]))

                elements.append(table)
                elements.append(Spacer(1, 12))

    render_dict(data)
    doc.build(elements)

# ----------------------------
# Excel Generation
# ----------------------------
def json_to_excel(data, filename, price_map=None, include_prices=False):
    wb = Workbook()
    ws = wb.active
    ws.title = "Services"
    ws.append(["CATEGORY", "TEST NAME", "PRICE" if include_prices else ""])

    def render_dict(d, parent_key=""):
        for key, value in d.items():
            if isinstance(value, dict):
                render_dict(value, parent_key=key)
            elif isinstance(value, list):
                for item in value:
                    clean_item = item.strip().upper()
                    price = price_map.get(clean_item, "") if include_prices else ""
                    ws.append([key, clean_item, price])

    render_dict(data)
    wb.save(filename)

# ----------------------------
# Main
# ----------------------------
if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    price_map = extract_prices("EPICONSULT_PRICELIST_2025.pdf")

    configs = [
        ("diagnostics.json", "Diagnostics", True),
        ("laboratory.json", "Laboratory", True),
        ("clinic.json", "Clinic", False)
    ]

    for json_file, title, with_prices in configs:
        with open(json_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        pdf_file = os.path.join(OUTPUT_DIR, json_file.replace(".json", ".pdf"))
        xlsx_file = os.path.join(OUTPUT_DIR, json_file.replace(".json", ".xlsx"))

        json_to_pdf(data, pdf_file, title, price_map, with_prices)
        json_to_excel(data, xlsx_file, price_map, with_prices)

        print(f"✅ Generated {pdf_file} and {xlsx_file}")
