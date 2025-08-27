# email_service.py
import os
import sendgrid
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

# load .env file
load_dotenv()

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")

print("🔑 Loaded API Key:", "FOUND" if SENDGRID_API_KEY else "❌ NOT FOUND")

sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)

def send_email(to_email, subject, html_content):
    print(f"📩 Preparing email → TO: {to_email}, SUBJECT: {subject}")
    message = Mail(
        from_email="spectrobana@gmail.com",
        to_emails=to_email,
        subject=subject,
        html_content=html_content
    )
    try:
        response = sg.send(message)
        print("✅ Status Code:", response.status_code)
        print("✅ Response Body:", response.body)
        print("✅ Response Headers:", response.headers)
    except Exception as e:
        print("❌ Error sending email:", str(e))
