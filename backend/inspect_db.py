from config.db import bookings_collection
from bson import ObjectId

bookings = list(bookings_collection.find())
for b in bookings:
    b['_id'] = str(b['_id'])
    print(b)
