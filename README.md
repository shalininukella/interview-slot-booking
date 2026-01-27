Interview Slot Booking API

A production-ready backend service to manage interview slots and bookings for a hiring process.
The system supports Admins (slot management) and Candidates (slot booking) with proper authorization, validation, conflict handling, pagination, and Swagger documentation.

🚀 Tech Stack

Node.js + Express – REST API

MongoDB + Mongoose – Data persistence

MongoDB Transactions – Safe booking & capacity control

Swagger / OpenAPI 3.0 – API documentation

Joi – Request validation

Environment Variables – Configuration

📁 Project Structure
src/
├── config/        # DB & Swagger configuration
├── controllers/   # Request handlers
├── services/      # Business logic
├── models/        # Mongoose schemas & indexes
├── routes/        # Express routes
├── middleware/    # Auth, role, error handling
├── validations/   # Joi schemas
├── utils/         # Error & response helpers
├── docs/          # swagger.yaml
├── app.js
└── server.js

docs/
└── swagger.yaml

⚙️ Setup Instructions
1️⃣ Clone Repository
git clone <repo-url>
cd interview-slot-booking

2️⃣ Install Dependencies
npm install

3️⃣ Environment Variables

Create .env using .env.example:

PORT=3000
MONGO_URI=mongodb://localhost:27017/interview-slots

4️⃣ Run Server
npm run dev


Server will start at:

http://localhost:3000

⚠️ MongoDB Transactions Requirement

This project uses MongoDB transactions for safe booking capacity handling.
MongoDB must be running as a replica set (even locally).

Steps to enable replica set locally:

mongod --replSet rs0 --dbpath /data/db
mongosh
rs.initiate()


📘 Swagger Documentation

Swagger UI is available at:

http://localhost:3000/docs
Swagger documentation fully reflects implemented endpoints and supports complete API testing.

All endpoints are fully documented with:

Request/response schemas

Error responses

Authentication header (x-user-id)

Pagination & filters

🔐 Authentication & Authorization

Authentication is simulated using a request header:

x-user-id: <MongoDB User ObjectId>

Rules

User must exist in DB

Role is derived from user (ADMIN / CANDIDATE)

Invalid or missing header → 401 Unauthorized

Unauthorized role access → 403 Forbidden

👤 User Roles
ADMIN

Create, update, delete interview slots

View all slots

CANDIDATE

View available slots

Book a slot

Cancel own bookings

View own bookings

🔄 Core Business Rules
Slot Rules

startTime < endTime

Capacity ≥ 1

Admins cannot create overlapping slots

Overlap detection covers all cases:

Partial overlap

Fully inside

Fully covering

Booking Rules

One booking per candidate per slot

Slot capacity must never be exceeded

Duplicate booking → 409 Conflict

Capacity exceeded → 409 Conflict

Booking cancellation is idempotent

🧠 Capacity Handling (Important)

Slot capacity enforcement uses MongoDB transactions to prevent race conditions:

Concurrent booking requests are safely handled

Ensures no overbooking under high concurrency

✅ This satisfies the Bonus requirement from the assignment.

❌ Error Handling Format

All errors follow a consistent structure:

{
  "success": false,
  "message": "Human readable error message",
  "errors": ["optional", "details"]
}

Common Error Codes

400 – Validation errors

401 – Unauthorized

403 – Forbidden

404 – Resource not found

409 – Conflict (overlap, duplicate booking, capacity exceeded)

📌 API Highlights
Create User
POST /users

Create Slot (ADMIN)
POST /slots
x-user-id: <admin-id>

List Slots (with filters & pagination)
GET /slots?from=2025-01-01&availableOnly=true&page=1&limit=10

Book Slot (CANDIDATE)
POST /bookings
x-user-id: <candidate-id>

Cancel Booking
POST /bookings/{id}/cancel

📄 Pagination Response Format
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42
  }
}

🧪 Sample Curl Flow
1️⃣ Create Admin
curl -X POST http://localhost:3000/users \
-H "Content-Type: application/json" \
-d '{
  "name": "Admin User",
  "email": "admin@test.com",
  "role": "ADMIN"
}'

2️⃣ Create Slot
curl -X POST http://localhost:3000/slots \
-H "x-user-id: <admin-id>" \
-H "Content-Type: application/json" \
-d '{
  "startTime": "2025-02-01T10:00:00Z",
  "endTime": "2025-02-01T11:00:00Z",
  "capacity": 2,
  "tags": ["frontend"]
}'

3️⃣ Candidate Booking
curl -X POST http://localhost:3000/bookings \
-H "x-user-id: <candidate-id>" \
-H "Content-Type: application/json" \
-d '{
  "slotId": "<slot-id>"
}'

📝 Assumptions & Tradeoffs

Slot deletion fails with 409 if bookings exist (hard reject)

Slot availability (availableSeats) is computed dynamically

Booking cancellation updates status to CANCELLED (soft cancel)

Overlap logic is scoped per admin, not global

Slot tags match using OR logic (at least one tag)

✅ Assessment Checklist Coverage

✔ RESTful design
✔ Role-based authorization
✔ MongoDB indexes
✔ Slot overlap handling
✔ Capacity-safe booking
✔ Pagination & filtering
✔ Swagger completeness
✔ Bonus implemented (transactions)

🏁 Final Notes

This project is designed to reflect real-world backend engineering practices with focus on:

Correctness

Safety under concurrency

Clear API contracts

Maintainable architecture


 <!-- how validation works using Joi-->

<!-- Client sends request
        ↓
Joi validates ONLY what client is allowed to send
        ↓
Auth middleware adds candidateId
        ↓
Controller combines data
        ↓
Mongoose validates + saves to DB -->
