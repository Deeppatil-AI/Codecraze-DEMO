import sys
sys.path.append('.')
from database import get_db

def fix_admin():
    db = get_db()
    # Update all admin users to be verified
    result = db.users.update_many(
        {"role": "admin"},
        {"$set": {"isVerified": True}}
    )
    print(f"Modified {result.modified_count} admin users.")
    
    # Verify
    admin = db.users.find_one({"role": "admin"})
    if admin:
        print(f"Admin ({admin.get('email')}) isVerified: {admin.get('isVerified')}")
    else:
        print("No admin user found.")

if __name__ == "__main__":
    fix_admin()
