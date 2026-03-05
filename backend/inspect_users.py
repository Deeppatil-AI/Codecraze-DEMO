from config.db import users_collection
from bson import ObjectId

users = list(users_collection.find())
for u in users:
    u['_id'] = str(u['_id'])
    print(u)
