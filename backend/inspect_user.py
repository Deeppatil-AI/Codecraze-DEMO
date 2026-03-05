import sys
sys.path.append('.')
from database import get_db

db = get_db()
user = db.users.find_one({"email": "mr.matthew463@gmail.com"}, {"email": 1, "isVerified": 1, "signupOtp": 1, "signupOtpExpiresAt": 1})
print("User found:", user)
