"""
booking_server.py — Dual Mail + Multi-Booking Support
Epiconsult Clinic & Diagnostics
Handles appointment confirmation and notifications (admin + client)
with support for multiple booked tests.
"""
import base64
import requests
import os
import io
import smtplib
import json
from datetime import datetime
from email.message import EmailMessage
from email.utils import formatdate
from dotenv import load_dotenv
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
# ==============================================================
# BOOKING EMAILS — Send directly via cPanel SMTP (no SendGrid)
# ==============================================================


# Load environment variables
load_dotenv()

# ======================================================
# 📧 CONFIG (Postmark)
# ======================================================
POSTMARK_SERVER_TOKEN = os.getenv("POSTMARK_SERVER_TOKEN", "").strip()
POSTMARK_MESSAGE_STREAM = os.getenv("POSTMARK_MESSAGE_STREAM", "outbound").strip()

EMAIL_FROM = os.getenv("EMAIL_FROM", "Epiconsult Clinic & Diagnostics <noreply@epidiagnostics.com>")
NOTIFY_EMAIL = os.getenv("NOTIFY_EMAIL", "bookings@epidiagnostics.com")


LOGO_PATH = os.path.join("static", "images", "logo.jpeg")
print("[postmark] token_set =", bool(POSTMARK_SERVER_TOKEN), "| stream =", POSTMARK_MESSAGE_STREAM, "| from =", EMAIL_FROM)



# ======================================================
# 🧾 PDF GENERATOR (Branded + Multi-Test Support)
# ======================================================
def _generate_booking_pdf(data: dict) -> bytes:
    """Generate a one-page PDF summary (supports multiple tests)."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    left = 25 * mm
    top = height - 25 * mm

    # --- Watermark ---
    c.saveState()
    c.setFont("Helvetica-Bold", 40)
    c.setFillColorRGB(0.9, 0.9, 0.9, alpha=0.15)
    c.translate(width / 2, height / 2)
    c.rotate(30)
    c.drawCentredString(0, 0, "Epiconsult Clinic & Diagnostics")
    c.restoreState()

    # --- Logo ---
    try:
        logo = ImageReader(LOGO_PATH)
        c.drawImage(logo, left, top - 10 * mm, width=30 * mm, height=30 * mm, mask='auto')
    except Exception as e:
        print(f"[booking_server] ⚠️ Logo not found: {e}")

    # --- Header ---
    c.setFont("Helvetica-Bold", 18)
    c.setFillColor(colors.HexColor("#0f2b46"))
    c.drawString(left + 40 * mm, top, "Epiconsult — Appointment Summary")

    c.setStrokeColor(colors.HexColor("#e11d48"))
    c.setLineWidth(2)
    c.line(left, top - 6 * mm, width - left, top - 6 * mm)

    # --- Content Rows ---
    y = top - 25 * mm

    def row(label, value):
        nonlocal y
        c.setFont("Helvetica-Bold", 11)
        c.setFillColor(colors.black)
        c.drawString(left, y, f"{label}:")
        c.setFont("Helvetica", 11)
        c.drawString(left + 45 * mm, y, str(value or "N/A"))
        y -= 8 * mm

    # --- Base Fields ---
    row("Full Name", data.get("name"))
    row("Email", data.get("email"))
    row("Phone", data.get("phone"))
    row("Sex", data.get("sex"))

    # --- Handle Multi-Service Display ---
    services = data.get("service", "")
    if isinstance(services, str):
        tests = [s.strip() for s in services.split(",") if s.strip()]
    elif isinstance(services, list):
        tests = [s.strip() for s in services if s.strip()]
    else:
        tests = [str(services)]

    if len(tests) > 1:
        c.setFont("Helvetica-Bold", 11)
        c.drawString(left, y, "Selected Tests:")
        y -= 7 * mm
        c.setFont("Helvetica", 11)
        for i, test in enumerate(tests, start=1):
            c.drawString(left + 8 * mm, y, f"{i}. {test}")
            y -= 6 * mm
        y -= 2 * mm
    else:
        row("Service / Test", tests[0] if tests else "N/A")

    # --- Remaining Rows ---
    row("Preferred Date", data.get("date"))
    row("Preferred Time", data.get("time"))
    row("Address", data.get("address"))
    row("Message", data.get("message"))

    # --- Footer ---
    c.setFont("Helvetica-Oblique", 9)
    c.setFillColor(colors.HexColor("#6b7280"))
    c.drawString(left, 20 * mm, "Generated automatically by Epiconsult Booking System")

    c.showPage()
    c.save()
    return buf.getvalue()


# ======================================================
# ✉️ BASE EMAIL BUILDER
# ======================================================
def _build_message(to_email: str, subject: str, text: str, html: str) -> EmailMessage:
    msg = EmailMessage()
    msg["From"] = EMAIL_FROM
    msg["To"] = to_email
    msg["Date"] = formatdate(localtime=True)
    msg["Subject"] = subject
    msg["Reply-To"] = EMAIL_FROM
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")
    return msg


# ======================================================
# 🔐 SECURE SMTP SEND
# ======================================================

POSTMARK_URL = "https://api.postmarkapp.com/email"

def _postmark_send(to_email: str, subject: str, text_body: str, html_body: str, attachments=None) -> bool:
    token = (POSTMARK_SERVER_TOKEN or "").strip()
    stream = (POSTMARK_MESSAGE_STREAM or "outbound").strip()

    if not token:
        print("[postmark] ❌ Missing POSTMARK_SERVER_TOKEN (Render env var not set?)")
        return False

    if not to_email:
        print("[postmark] ❌ Missing recipient email")
        return False

    payload = {
        "From": EMAIL_FROM,
        "To": to_email,
        "Subject": subject,
        "TextBody": text_body or " ",
        "HtmlBody": html_body or "<p> </p>",
        "MessageStream": stream,
    }

    if attachments:
        payload["Attachments"] = attachments

    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": token,
    }

    try:
        r = requests.post(POSTMARK_URL, headers=headers, json=payload, timeout=25)

        if 200 <= r.status_code < 300:
            print(f"[postmark] ✅ Email sent to {to_email} | stream={stream}")
            return True

        # show real error from Postmark
        try:
            err = r.json()
        except Exception:
            err = r.text

        print(f"[postmark] ❌ Send failed ({r.status_code}) to={to_email} stream={stream} from={EMAIL_FROM}")
        print(f"[postmark] ❌ Error: {err}")
        return False

    except Exception as e:
        print(f"[postmark] ❌ Request error: {e}")
        return False



def _pdf_attachment(pdf_bytes: bytes, filename: str) -> dict:
    return {
        "Name": filename,
        "Content": base64.b64encode(pdf_bytes).decode("utf-8"),
        "ContentType": "application/pdf",
    }


# ======================================================
# 📩 ADMIN EMAIL (Multi + Single)
# ======================================================
def send_admin_booking(data: dict) -> bool:
    """Notify Epiconsult team of new booking."""
    subject = f"[Epiconsult] NEW APPOINTMENT — {data.get('name', '')}"

    services = data.get("service", "")
    if isinstance(services, str):
        tests = [s.strip() for s in services.split(",") if s.strip()]
    else:
        tests = list(services)

    service_html = "<br>".join(f"• {s}" for s in tests) if len(tests) > 1 else (tests[0] if tests else "N/A")
    service_text = "\n".join(f"- {s}" for s in tests) if len(tests) > 1 else (tests[0] if tests else "N/A")

    text = f"""
Dear Epiconsult Team,

A new appointment has been booked via the online platform.

Name: {data.get('name')}
Email: {data.get('email')}
Phone: {data.get('phone')}
Sex: {data.get('sex')}
Service(s):
{service_text}
Preferred Date: {data.get('date')}
Preferred Time: {data.get('time')}
Address: {data.get('address')}
Message: {data.get('message') or 'N/A'}

A one-page PDF summary is attached.

Warm regards,
Epiconsult Booking System
"""

    html = f"""
    <div style="font-family:Segoe UI,Arial,sans-serif;color:#111827;line-height:1.6;">
      <h2 style="color:#e11d48;">NEW APPOINTMENT</h2>
      <p>Dear <b>Epiconsult Team</b>,</p>
      <p>A new appointment has been booked through the online platform.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:10px;">
        <tr><td><b>Name:</b></td><td>{data.get('name')}</td></tr>
        <tr><td><b>Email:</b></td><td>{data.get('email')}</td></tr>
        <tr><td><b>Phone:</b></td><td>{data.get('phone')}</td></tr>
        <tr><td><b>Sex:</b></td><td>{data.get('sex')}</td></tr>
        <tr><td><b>Service(s):</b></td><td>{service_html}</td></tr>
        <tr><td><b>Preferred Date:</b></td><td>{data.get('date')}</td></tr>
        <tr><td><b>Preferred Time:</b></td><td>{data.get('time')}</td></tr>
        <tr><td><b>Address:</b></td><td>{data.get('address')}</td></tr>
        <tr><td><b>Message:</b></td><td>{data.get('message') or 'N/A'}</td></tr>
      </table>
      <p style="margin-top:15px;">A one-page PDF summary is attached for your reference.</p>
      <p>— Epiconsult Clinic & Diagnostics<br><i>"A reference point in diagnostics"</i></p>
    </div>
    """.strip()

    pdf_bytes = _generate_booking_pdf(data)
    filename = f"Epiconsult_Appointment_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    attachments = [_pdf_attachment(pdf_bytes, filename)]
    return _postmark_send(NOTIFY_EMAIL, subject, text, html, attachments=attachments)


# ======================================================
# 📩 CLIENT EMAIL (Multi + Single)
# ======================================================
def send_client_booking(data: dict) -> bool:
    """Send confirmation email to the client."""
    user_email = data.get("email")
    if not user_email:
        print("[booking_server] ⚠️ No client email provided.")
        return False

    services = data.get("service", "")
    if isinstance(services, str):
        tests = [s.strip() for s in services.split(",") if s.strip()]
    else:
        tests = list(services)

    service_html = "<br>".join(f"• {s}" for s in tests) if len(tests) > 1 else (tests[0] if tests else "N/A")
    service_text = "\n".join(f"- {s}" for s in tests) if len(tests) > 1 else (tests[0] if tests else "N/A")

    subject = f"[Epiconsult] Appointment Received — {data.get('name')}"

    text = f"""
Dear {data.get('name')},

Your appointment has been successfully received. Thank you for booking with Epiconsult Clinic & Diagnostics.


Service(s):
{service_text}
Preferred Date: {data.get('date')}
Preferred Time: {data.get('time')}

Our team will contact you shortly to confirm your booking.

Warm regards,
Epiconsult Clinic & Diagnostics
"""

    html = f"""
    <div style="font-family:Segoe UI,Arial,sans-serif;color:#111827;line-height:1.6;">
      <p>Dear <b>{data.get('name')}</b>,</p>
      <p>Your appointment has been successfully received.</p>
      <p><b>Service(s):</b><br>{service_html}</p>
      <p><b>Date:</b> {data.get('date')}<br><b>Time:</b> {data.get('time')}</p>
      <p>Our team will contact you shortly to confirm your booking.</p>
      <p style="margin-top:20px;">Warm regards,<br><b>Epiconsult Clinic & Diagnostics</b><br><i>"A reference point in diagnostics"</i></p>
    </div>
    """.strip()

    pdf_bytes = _generate_booking_pdf(data)
    filename = f"Your_Appointment_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    attachments = [_pdf_attachment(pdf_bytes, filename)]
    return _postmark_send(user_email, subject, text, html, attachments=attachments)



# ==============================================================
# BOOKING EMAILS — Postmark (HTTPS) — Render-safe
# ==============================================================

def send_booking_emails(data: dict) -> dict:
    """
    Sends booking confirmation to client and notification to admin
    using Postmark (HTTPS) — works on Render.
    """
    client_email = (data.get("email") or "").strip()

    print(f"[booking] Admin recipient: {NOTIFY_EMAIL}")
    print(f"[booking] Client recipient: {client_email}")

    admin_ok = send_admin_booking(data)
    print(f"[booking] Admin send result: {admin_ok}")

    client_ok = send_client_booking(data)
    print(f"[booking] Client send result: {client_ok}")

    return {"admin": admin_ok, "client": client_ok}

