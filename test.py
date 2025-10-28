# test.py
# =============================================
# Simple test runner for Epiconsult booking mail
# =============================================

from booking import send_booking_emails

if __name__ == "__main__":
    print("🚀 Running Epiconsult Booking Email Test...")

    # Dummy test data
    test_data = {
        "name": "BAYO NIFEMI",
        "email": "spectrobana@gmail.com",  # 👈 change to your own address
        "phone": "+2347035765000",
        "sex": "Male",
        "service": "General Consultation",
        "date": "2025-10-30",
        "time": "Morning (9AM - 12PM)",
        "address": "48 Wuse Zone 3, Abuja.",
        "message": "I’d like to discuss my recent lab results."
    }

    # Send test email
    result = send_booking_emails(test_data)

    # Print results
    print("\n📬 Test Completed:")
    print(f"  ➤ Admin Email Sent:  {result['admin']}")
    print(f"  ➤ Client Email Sent: {result['client']}")

    if result["admin"] and result["client"]:
        print("\n✅ All emails sent successfully!")
    else:
        print("\n⚠️ One or more emails failed. Check your SMTP logs or .env configuration.")
