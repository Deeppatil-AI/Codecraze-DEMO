import os
import smtplib
import socket
from email.message import EmailMessage
from email.utils import formatdate
import logging

# Configure basic logging for the email service
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("EmailService")

class EmailService:
    """
    A robust Email Service for sending OTPs securely using standard libraries.
    
    Features:
    - HTML Templating for professional, responsive emails.
    - Connection retries for transient network errors.
    - Developer Mode fallback when SMTP is unconfigured.
    - Strict TLS (Port 587) utilization as per Gmail requirements.
    """
    
    def __init__(self):
        # Load configuration securely from environment variables
        self.host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.port = int(os.getenv("SMTP_PORT", "587"))
        self.username = os.getenv("SMTP_USERNAME")
        self.password = os.getenv("SMTP_PASSWORD")
        self.sender = os.getenv("EMAIL_FROM", self.username or "no-reply@parkmate.com")
        self.max_retries = 3
        
        # Determine operational mode
        self.developer_mode = self._is_developer_mode()
        
    def _is_developer_mode(self) -> bool:
        """
        Determines if the service should operate in Developer Mode (printing to console).
        Returns True if credentials are missing or are obvious placeholders.
        """
        if not self.username or not self.password:
            return True
        if "your_" in self.username or "your_" in self.password:
            return True
        return False
        
    def _get_html_template(self, otp: str, recipient_name: str = "User") -> str:
        """
        Generates a professional, mobile-responsive HTML email template.
        """
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Verification Code</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f4f7f6;
                    margin: 0;
                    padding: 0;
                    color: #333333;
                }}
                .container {{
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    overflow: hidden;
                }}
                .header {{
                    background: linear-gradient(135deg, #7c3aed, #4f46e5);
                    padding: 30px 20px;
                    text-align: center;
                    color: #ffffff;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 24px;
                    letter-spacing: 1px;
                }}
                .content {{
                    padding: 40px 30px;
                    text-align: left;
                    line-height: 1.6;
                }}
                .otp-box {{
                    background-color: #f8fafc;
                    border: 2px dashed #cbd5e1;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    margin: 30px 0;
                }}
                .otp-code {{
                    font-size: 36px;
                    font-weight: 800;
                    color: #4f46e5;
                    letter-spacing: 8px;
                    margin: 0;
                }}
                .warning {{
                    font-size: 13px;
                    color: #64748b;
                    margin-top: 20px;
                }}
                .footer {{
                    background-color: #f8fafc;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #94a3b8;
                    border-top: 1px solid #e2e8f0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>ParkMate Verification</h1>
                </div>
                <div class="content">
                    <p>Hello {recipient_name},</p>
                    <p>You recently requested to verify your account or reset your password. Please use the following One-Time Password (OTP) to complete your request.</p>
                    
                    <div class="otp-box">
                        <p class="otp-code">{otp}</p>
                    </div>
                    
                    <p><strong>Note:</strong> This code is valid for exactly <strong>10 minutes</strong>. Do not share this code with anyone. Our support team will never ask for it.</p>
                    
                    <p class="warning">If you did not request this code, please ignore this email or contact support immediately to secure your account.</p>
                </div>
                <div class="footer">
                    <p>&copy; {formatdate(timeval=None, localtime=False, usegmt=True)[-4:]} ParkMate Inc. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

    def send_otp_email(self, recipient: str, otp: str, recipient_name: str = "User") -> bool:
        """
        Sends the OTP email to the specified recipient.
        Handles connection retries silently and falls back to console if required.
        
        Args:
            recipient: The email address of the user.
            otp: The 6-digit OTP string.
            recipient_name: Optional name for greeting customization.
            
        Returns:
            bool: True if transmission (or fallback) was successful, False otherwise.
        """
        subject = "Your ParkMate Verification Code"
        
        # ── Developer Fallback Mode ──
        if self.developer_mode:
            self._print_developer_fallback(recipient, subject, otp)
            return True
            
        # ── Production Email Creation ──
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = self.sender
        msg["To"] = recipient
        msg["Date"] = formatdate(localtime=True)
        
        # Fallback raw text
        msg.set_content(f"Hi {recipient_name},\n\nYour ParkMate verification code is: {otp}\n\nThis code is valid for 10 minutes.")
        
        # Rich HTML Alternative
        html_body = self._get_html_template(otp, recipient_name)
        msg.add_alternative(html_body, subtype='html')
        
        # ── Robust TLS Transmission with Retries ──
        for attempt in range(1, self.max_retries + 1):
            try:
                logger.info(f"Attempting SMTP TLS connection to {self.host}:{self.port} (Attempt {attempt}/{self.max_retries})")
                
                # Enforce timeout to prevent hanging the main Flask thread
                with smtplib.SMTP(self.host, self.port, timeout=10) as server:
                    server.set_debuglevel(0) # Keep logs clean in production
                    server.ehlo()
                    server.starttls()
                    server.ehlo()
                    server.login(self.username, self.password)
                    server.send_message(msg)
                    
                logger.info(f"OTP successfully delivered via SMTP to {recipient}")
                return True
                
            except (smtplib.SMTPException, socket.timeout, socket.error) as e:
                logger.warning(f"SMTP Transient Error on attempt {attempt}: {str(e)}")
                if attempt == self.max_retries:
                    logger.error(f"Failed to send email to {recipient} after {self.max_retries} attempts.")
                    self._print_developer_fallback(recipient, subject, otp, error=str(e))
                    # Return True here if you want to allow the user to continue using the console fallback anyway
                    # Return False if you strictly want to block signup on network failure
                    return True 
                    
            except Exception as e:
                # Catch-all for formatting/auth errors that retries won't fix
                logger.error(f"Critical SMTP Failure: {str(e)}")
                self._print_developer_fallback(recipient, subject, otp, error=str(e))
                return True

        return False

    def _print_developer_fallback(self, recipient: str, subject: str, otp: str, error: str = None) -> None:
        """
        Prints the OTP cleanly to the console for development or production debugging.
        """
        mode_str = "[PRODUCTION SMTP FAILURE]" if error else "[DEVELOPER MODE - SMTP BYPASS]"
        print(f"\n{mode_str} -----------------------")
        if error:
            print(f"Reason: {error}")
        print(f"To: {recipient}")
        print(f"Subject: {subject}")
        print(f"-> OTP CODE: {otp} <-")
        print("----------------------------------------------------------\n")
