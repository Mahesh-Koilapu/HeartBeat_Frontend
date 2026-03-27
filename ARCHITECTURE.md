# 🏗️ Heart Beat - System Architecture & Design

## 📋 Table of Contents
1. [High-Level Architecture](#high-level-architecture)
2. [Component Architecture](#component-architecture)
3. [Database Design](#database-design)
4. [Authentication Flow](#authentication-flow)
5. [API Design](#api-design)
6. [Data Flow Examples](#data-flow-examples)

---

## 🏢 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                    (React.js Frontend)                          │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Admin Panel │  │ Doctor Panel │  │ Patient Panel│           │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                │                 │                    │
│         └────────────────┼─────────────────┘                    │
│                          │                                      │
│                    ┌─────▼──────┐                               │
│                    │ Auth Guard  │                              │
│                    │ Role Router │                              │
│                    └─────┬──────┘                               │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │ HTTPS/REST API
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                   API LAYER                                     │
│              (Express.js Backend)                              │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │Auth Routes   │  │Admin Routes  │  │Doctor Routes │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                  │
│         └─────────────────┼─────────────────┘                  │
│                           │                                    │
│                    ┌──────▼──────────┐                         │
│                    │JWT Middleware   │                         │
│                    │Role Validation  │                         │
│                    └──────┬──────────┘                         │
│                           │                                    │
│              ┌────────────┼────────────┐                       │
│              │            │            │                       │
│         ┌────▼─┐    ┌─────▼──┐    ┌───▼────┐                 │
│         │Users │    │Doctors │    │Patients│                 │
│         │Ctrl  │    │Ctrl    │    │Ctrl    │                 │
│         └────┬─┘    └────┬───┘    └───┬────┘                 │
│              │           │            │                       │
│              └───────────┼────────────┘                        │
│                          │                                     │
└──────────────────────────┼─────────────────────────────────────┘
                           │ Queries/Writes
                           │
┌──────────────────────────┼─────────────────────────────────────┐
│                  DATA LAYER                                    │
│               (MongoDB Database)                               │
│                                                                 │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Users   │  │DoctorProfile │  │UserProfile   │              │
│  │Collection│  │ Collection   │  │ Collection   │              │
│  └──────────┘  └──────────────┘  └──────────────┘              │
│                                                                 │
│  ┌──────────────┐           ┌──────────────┐                   │
│  │Appointments  │           │Notifications │                   │
│  │ Collection   │           │ Collection   │                   │
│  └──────────────┘           └──────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Component Architecture

### Frontend Component Hierarchy

```
App.js (Root)
│
├── Routes
│   ├── /login → LoginPage
│   ├── /register → RegisterPage
│   │   ├── Step 1: Role Selection
│   │   ├── Step 2: Basic Info
│   │   └── Step 3: Role-specific Info
│   │
│   └── Protected Routes
│       ├── ProtectedRoute (Auth Guard)
│       │   │
│       │   └── RoleRoute (Role Checker)
│       │       │
│       │       ├── /admin/* → AdminDashboard
│       │       │   ├── Sidebar Navigation
│       │       │   └── Routes
│       │       │       ├── /overview → AdminOverview
│       │       │       ├── /appointments → ManageAppointments
│       │       │       ├── /doctors → ManageDoctors
│       │       │       ├── /patients → ManagePatients
│       │       │       └── /settings → AdminSettings
│       │       │
│       │       ├── /doctor/* → DoctorDashboard
│       │       │   ├── Sidebar Navigation
│       │       │   └── Routes
│       │       │       ├── /dashboard → DoctorOverview
│       │       │       ├── /appointments → DoctorAppointments
│       │       │       ├── /availability → DoctorAvailability
│       │       │       └── /profile → DoctorProfile
│       │       │
│       │       └── /patient/* → PatientDashboard
│       │           ├── Sidebar Navigation
│       │           └── Routes
│       │               ├── /overview → PatientOverview
│       │               ├── /doctors → PatientDoctors
│       │               ├── /appointments → PatientAppointments
│       │               ├── /chatbot → PatientChatbot
│       │               ├── /voice → VoiceAssistant
│       │               └── /profile → PatientProfile

Context & Hooks
│
├── AuthContext
│   ├── user state
│   ├── loading state
│   ├── login() function
│   ├── register() function
│   └── logout() function
│
└── useFetch Hook
    ├── data state
    ├── loading state
    ├── error state
    └── execute() function
```

---

## 💾 Database Design

### Collection: Users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, lowercase),
  password: String (bcrypt hashed),
  role: String ("admin" | "doctor" | "patient"),
  isActive: Boolean,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}

Indexes: email (unique), role, createdAt
```

### Collection: DoctorProfile
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref User),
  specialization: String,
  experience: Number (years),
  education: String,
  description: String,
  consultationFee: Number,
  availability: [
    {
      dayOfWeek: Number (0-6),
      slots: Array<String>
    }
  ],
  rating: Number (0-5),
  verified: Boolean,
  createdAt: Date,
  updatedAt: Date
}

Indexes: user, specialization, verified
```

### Collection: UserProfile (Patient)
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref User),
  age: Number,
  gender: String ("male" | "female" | "other"),
  diseaseType: String,
  symptoms: String,
  bloodGroup: String,
  allergies: Array<String>,
  medicalHistory: Array<String>,
  createdAt: Date,
  updatedAt: Date
}

Indexes: user
```

### Collection: Appointments
```javascript
{
  _id: ObjectId,
  patient: ObjectId (ref User),
  doctor: ObjectId (ref User),
  appointmentDate: Date,
  appointmentTime: String (HH:MM),
  diseaseCategory: String,
  symptoms: String,
  details: String,
  status: String ("pending" | "confirmed" | "completed" | "cancelled"),
  documents: Array<{label, url}>,
  notes: String,
  cancelReason: String,
  createdAt: Date,
  updatedAt: Date
}

Indexes: patient, doctor, appointmentDate, status
```

### Collection: Notifications
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref User),
  type: String ("appointment" | "profile" | "system"),
  title: String,
  message: String,
  data: Object,
  read: Boolean,
  createdAt: Date
}

Indexes: userId, read, createdAt
```

### Relationship Diagram
```
User (role: "doctor")
  │
  └──→ DoctorProfile
         │
         ├─← Appointment.doctor
         └── Specialization, Fee, Availability

User (role: "patient")
  │
  ├─→ UserProfile
  │   └── Age, Gender, Medical History
  │
  └─← Appointment.patient
      └── Booking Records

Appointment
  ├─→ User (patient)
  ├─→ User (doctor)
  └──→ Status, Date, Symptoms
```

---

## 🔐 Authentication Flow

### Registration Flow
```
User Registration Page
    ↓
Enter name, email, password, role
    ↓
POST /api/auth/register
    ↓
Backend validates input
    ↓
Check if email already exists
    ↓
Hash password with Bcrypt
    ↓
Create User document
    ↓
If doctor: Create DoctorProfile
If patient: Create UserProfile
    ↓
Generate JWT token
    ↓
Set HTTP-only cookie
    ↓
Return token & user data
    ↓
Frontend stores token
    ↓
Redirect to dashboard
```

### Login Flow
```
Login Page
    ↓
Enter email & password
    ↓
POST /api/auth/login
    ↓
Find user by email
    ↓
Compare password with hash
    ↓
If match: Generate JWT
If no match: Return error
    ↓
Set HTTP-only cookie
    ↓
Return token & user
    ↓
Frontend stores token in localStorage
    ↓
Redirect to dashboard
```

### Protected Route Flow
```
User navigates to /admin
    ↓
ProtectedRoute checks if user exists
    ↓
If not: Redirect to /login
If yes: Continue
    ↓
RoleRoute checks user.role == "admin"
    ↓
If wrong role: Redirect to user dashboard
If correct: Render AdminDashboard
```

### API Request with Auth
```
Client makes API request
    ↓
Include JWT in header: "Authorization: Bearer <token>"
    ↓
Backend JWT middleware
    ↓
Verify token signature
    ↓
Check if expired
    ↓
If invalid: Return 401
If valid: Attach user to req.user
    ↓
Route handler processes request
    ↓
Send response with data
```

---

## 📡 API Design

### Request/Response Format

**Request:**
```http
POST /api/patient/appointments
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "diseaseCategory": "Cardiology",
  "symptoms": "Chest pain",
  "details": "Occasional pain when exercising",
  "preferredDate": "2024-04-15",
  "preferredStart": "10:00",
  "preferredEnd": "12:00",
  "documents": []
}
```

**Success Response (200/201):**
```json
{
  "message": "Appointment booked successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "patient": "507f1f77bcf86cd799439012",
    "doctor": "507f1f77bcf86cd799439013",
    "appointmentDate": "2024-04-15",
    "status": "pending",
    "createdAt": "2024-03-27T10:00:00Z"
  }
}
```

**Error Response (400/401/500):**
```json
{
  "message": "Invalid appointment details",
  "error": "Preferred end time must be after start time"
}
```

---

## 🔄 Data Flow Examples

### Example 1: Patient Booking Appointment

```
FRONTEND:
1. Patient selects doctor from list
2. Clicks "Book Appointment"
3. Fills appointment form
4. Clicks "Submit"
5. Form data + JWT token sent to backend

↓ NETWORK REQUEST ↓

BACKEND:
6. Receives POST /api/patient/appointments
7. JWT middleware verifies token
8. Extract user info from token
9. Validate input data
10. Check doctor availability
11. Check for duplicate/conflicting appointments
12. Create Appointment document in MongoDB
13. Return appointment ID

↓ NETWORK RESPONSE ↓

FRONTEND:
14. Receive response with new appointment
15. Store in component state
16. Show success message
17. Update appointments list
18. Redirect to appointments page
```

### Example 2: Doctor Accepting Appointment

```
FRONTEND (Doctor Dashboard):
1. Doctor sees pending appointment request
2. Reviews patient details
3. Clicks "Accept" button
4. Sends PUT request with new status

↓ NETWORK REQUEST ↓

BACKEND:
5. Receives PUT /api/doctor/appointments/:id
6. JWT middleware verifies doctor role
7. Check if appointment belongs to this doctor
8. Update status to "confirmed"
9. Create notification for patient
10. Return updated appointment

↓ NETWORK RESPONSE ↓

FRONTEND:
11. Update UI to show confirmed status
12. Remove from pending list
13. Add to confirmed list
14. Show confirmation message
```

### Example 3: Admin Viewing Dashboard

```
FRONTEND (Admin Dashboard):
1. Admin logs in
2. Navigates to /admin
3. ProtectedRoute → checks auth
4. RoleRoute → checks role == "admin"
5. Dashboard component mounts
6. useFetch hook called with /api/admin/dashboard

↓ NETWORK REQUEST ↓

BACKEND:
7. Receives GET /api/admin/dashboard
8. JWT middleware verifies admin
9. Query counts:
   - Total users
   - Total appointments
   - Appointments by status
   - Doctor verification pending
10. Aggregate stats from MongoDB
11. Return statistics object

↓ NETWORK RESPONSE ↓

FRONTEND:
12. Receive stats in response
13. Update component state
14. Render charts/cards with data
15. Display on dashboard
```

---

## 🔌 API Endpoint Organization

### Auth Routes
```
POST   /api/auth/register        → Create account
POST   /api/auth/login           → Login
GET    /api/auth/me              → Get profile (protected)
POST   /api/auth/logout          → Logout (protected)

Middleware: registerValidation, loginValidation
```

### Admin Routes
```
GET    /api/admin/patients       → All patients (admin only)
GET    /api/admin/doctors        → All doctors (admin only)
GET    /api/admin/appointments   → All appointments (admin only)
GET    /api/admin/dashboard      → Dashboard stats (admin only)
PUT    /api/admin/users/:id      → Update user (admin only)

Middleware: authenticate, authorize("admin")
```

### Doctor Routes
```
GET    /api/doctor/appointments  → My appointments (doctor only)
POST   /api/doctor/availability  → Set availability (doctor only)
GET    /api/doctor/patients      → My patients (doctor only)
PUT    /api/doctor/profile       → Update profile (doctor only)

Middleware: authenticate, authorize("doctor")
```

### Patient Routes
```
GET    /api/patient/doctors      → Search doctors (patient only)
POST   /api/patient/appointments → Book appointment (patient only)
GET    /api/patient/appointments → My appointments (patient only)
PUT    /api/patient/appointments/:id → Cancel appointment (patient only)

Middleware: authenticate, authorize("patient")
```

---

## 🌐 Frontend to Backend Communication

### Axios Client Configuration
```javascript
// frontend/src/api/client.js

const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,  // Include cookies
});

// Request Interceptor
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 📊 Error Handling Strategy

### Frontend Error Handling
```
Try-Catch Block
    ↓
    ├─ API Error: error.response?.data?.message
    ├─ Network Error: error.message
    └─ Unknown Error: "Unknown error occurred"
    ↓
Display User-Friendly Message
    ↓
Log Details to Console
    ↓
Alternative: Show generic error UI
```

### Backend Error Handling
```
Endpoint Handler
    ↓
Validate Input
    ├─ If invalid: 400 Bad Request
    └─ If valid: Continue
    ↓
Check Authorization
    ├─ If not auth: 401 Unauthorized
    ├─ If wrong role: 403 Forbidden
    └─ If authorized: Continue
    ↓
Query Database
    ├─ If not found: 404 Not Found
    ├─ If error: 500 Internal Error
    └─ If success: Continue
    ↓
Send Response
    └─ Return 200/201 with data
```

---

## 🎯 Security Architecture

```
┌─────────────────────────────────────┐
│         REQUEST ARRIVES             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   1. CORS Validation                │ ← Check origin
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   2. Extract JWT Token              │ ← From header or cookie
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   3. Verify Token Signature         │ ← Check secret
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   4. Check Token Expiration         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   5. Attach User to Request         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   6. Check User Role/Permissions    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   7. Validate Input Data            │ ← express-validator
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   8. Execute Business Logic         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   9. Query Database (Secured)       │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   10. Return Response               │
└─────────────────────────────────────┘
```

---

## 🚀 Scalability Considerations

### Frontend Scalability
- Code splitting by route
- Lazy loading components
- Memoization for performance
- Proper state management
- CDN for static assets

### Backend Scalability
- Stateless design (horizontal scaling possible)
- Database query optimization
- Indexing strategy
- Connection pooling
- Caching layer ready

### Database Scalability
- Well-normalized schema
- Appropriate indexing
- Query optimization
- Sharding ready
- Replica sets for HA

---

<div align="center">

## This architecture is production-ready and interview-approved! 🚀

</div>
