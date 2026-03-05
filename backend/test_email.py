"""
Quick SMTP test - run this from the backend folder to check if email sending works.
Usage: python test_email.py your_test_email@gmail.com
"""
import sys
import os
from dotenv import load_dotenv

load_dotenv()

to_email = sys.argv[1] if len(sys.argv) > 1 else os.getenv("SMTP_USERNAME")

host = os.getenv("SMTP_HOST")
username = os.getenv("SMTP_USERNAME")
password = os.getenv("SMTP_PASSWORD")
from_email = os.getenv("EMAIL_FROM", username)
port = int(os.getenv("SMTP_PORT", "587"))

print(f"SMTP_HOST     : {host}")
print(f"SMTP_PORT     : {port}")
print(f"SMTP_USERNAME : {username}")
print(f"SMTP_PASSWORD : {'*' * len(password) if password else 'NOT SET'}")
print(f"EMAIL_FROM    : {from_email}")
print(f"Sending to    : {to_email}")
print()

if not all([host, username, password]):
    print("ERROR: SMTP credentials missing in .env")
    sys.exit(1)

from email.message import EmailMessage
import smtplib

msg = EmailMessage()
msg["Subject"] = "ParkMate SMTP Test"
msg["From"] = from_email
msg["To"] = to_email
msg.set_content("This is a test email from ParkMate OTP system. If you received this, SMTP is working.")

try:
    print(f"Connecting to {host}:{port} via STARTTLS ...")
    with smtplib.SMTP(host, port) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(username, password)
        server.send_message(msg)
    print(f"\n✅ Success! Test email sent to {to_email}")
except Exception as e:
    print(f"\n❌ FAILED: {e}")
    print("\nCommon fixes:")
    print("  - Make sure 2-Step Verification is ON in your Google Account")
    print("  - Use an App Password (NOT your regular Gmail password)")
    print("  - Generate it at: myaccount.google.com → Security → App passwords")
