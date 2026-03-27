# ❤️ Heart Beat - Backend API

The backend server for the **Heart Beat Healthcare Management Platform** built with Node.js and Express.

---

## 📌 Overview

This is a RESTful API that handles:
- User authentication and authorization
- Patient-doctor matchmaking
- Appointment management
- User profile management
- Admin operations

---

## 🏗️ Architecture

```
backend/
├── src/
│   ├── controllers/          # Business logic
│   │   ├── authController.js     - Auth operations
│   │   ├── adminController.js    - Admin operations
│   │   ├── doctorController.js   - Doctor operations
│   │   └── userController.js     - Patient operations
│   ├── models/               # Database schemas
│   │   ├── User.js              - User model with role
│   │   ├── DoctorProfile.js      - Doctor details
│   │   ├── UserProfile.js        - Patient details
│   │   ├── Appointment.js        - Appointment records
│   │   └── Notification.js       - System notifications
│   ├── routes/               # API endpoints
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── userRoutes.js
│   │   └── publicRoutes.js
│   ├── middleware/           # Custom middleware
│   │   └── auth.js              - JWT verification
│   ├── config/               # Configuration
│   │   └── db.js                - MongoDB connection
│   └── utils/                # Helper functions
│       ├── emailService.js      - Email notifications
│       └── generateToken.js     - JWT token generation
├── server.js                 # Entry point
├── .env                      # Environment variables
└── package.json
```

---

## 🚀 Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create `.env` file:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/heart-beat
JWT_SECRET=heart_beat_secret_key_development
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:3000,http://localhost:3001
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Start Production Server
```bash
npm start
```

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login user |
| GET | `/me` | Get current user (protected) |
| POST | `/logout` | Logout user (protected) |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/patients` | Get all patients |
| GET | `/doctors` | Get all doctors |
| GET | `/appointments` | Get all appointments |
| GET | `/dashboard` | Dashboard statistics |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

### Doctor (`/api/doctor`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/appointments` | Get doctor's appointments |
| POST | `/availability` | Set availability |
| GET | `/patients` | Get doctor's patients |
| PUT | `/profile` | Update profile |
| GET | `/stats` | Doctor statistics |

### Patient (`/api/patient`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/doctors` | Search doctors |
| POST | `/appointments` | Book appointment |
| GET | `/appointments` | Get user's appointments |
| PUT | `/appointments/:id` | Cancel appointment |
| GET | `/profile` | Get patient profile |
| PUT | `/profile` | Update profile |

---

## 🔐 Authentication

### JWT Token Structure
```javascript
{
  id: "user_id",
  role: "admin|doctor|patient",
  iat: 1616161616,
  exp: 1623339616
}
```

### Token Storage
- **Cookie**: `httpOnly, Secure, SameSite`
- **Authorization Header**: `Bearer <token>`

### Protected Routes
All routes except `/auth/register` and `/auth/login` require JWT authentication.

---

## 📊 Database Models

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed with bcrypt),
  role: String (admin|doctor|patient),
  isActive: Boolean,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### DoctorProfile Schema
```javascript
{
  user: ObjectId (ref: User),
  specialization: String,
  experience: Number,
  education: String,
  description: String,
  consultationFee: Number,
  availability: [{
    dayOfWeek: Number,
    slots: [String]
  }]
}
```

### UserProfile (Patient) Schema
```javascript
{
  user: ObjectId (ref: User),
  age: Number,
  gender: String,
  diseaseType: String,
  symptoms: String,
  bloodGroup: String,
  allergies: String
}
```

### Appointment Schema
```javascript
{
  patient: ObjectId (ref: User),
  doctor: ObjectId (ref: User),
  appointmentDate: Date,
  appointmentTime: String,
  symptoms: String,
  status: String (pending|confirmed|completed|cancelled),
  notes: String,
  createdAt: Date
}
```

---

## 🔒 Security Features

- ✅ **JWT Authentication** - Token-based auth
- ✅ **Password Hashing** - Bcrypt (10 salt rounds)
- ✅ **CORS Protection** - Configurable origins
- ✅ **Input Validation** - Express-validator
- ✅ **HTTP-Only Cookies** - Secure token storage
- ✅ **Role-Based Access Control** - Middleware protection
- ✅ **Email Validation** - Normalized & verified
- ✅ **SQL Injection Prevention** - MongoDB driver handles it

---

## 🛠️ Middleware

### authenticate.js
Verifies JWT token in request and attaches user to req.user

```javascript
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user: {...}, profile: {...} }
```

### authorize(...roles)
Checks if user has required role

```javascript
app.get('/admin/dashboard', authenticate, authorize('admin'), controller)
```

---

## 📝 Error Handling

### Standard Error Response
```javascript
{
  message: "Error description",
  error: "error details"
}
```

### HTTP Status Codes
- 200 - Success
- 201 - Created
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 409 - Conflict (email already registered)
- 500 - Server Error

---

## 🧪 Testing Endpoints

### Register Admin
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

---

## 📦 Dependencies

```json
{
  "express": "^5.1.0",
  "mongoose": "^8.20.1",
  "jwt": "jsonwebtoken ^9.0.2",
  "bcrypt": "^6.0.0",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "express-validator": "^7.3.1",
  "cookie-parser": "^1.4.7"
}
```

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Check MongoDB running, verify connection string |
| JWT errors | Check token not expired, verify JWT_SECRET |
| CORS blocked | Configure CLIENT_ORIGIN in .env |
| Password hash fails | Ensure bcrypt is properly installed |
| Port in use | Change PORT in .env or kill process |

---

## 🎯 Environment Variables Reference

```
NODE_ENV              - development|production
PORT                  - Server port (default: 5000)
MONGODB_URI          - MongoDB connection string
JWT_SECRET           - Secret key for JWT signing
JWT_EXPIRES_IN       - Token expiration time (default: 7d)
CLIENT_ORIGIN        - Allowed frontend URLs (CORS)
```

---

## 📈 Performance Tips

- Use MongoDB indexes on frequently queried fields
- Implement pagination for large result sets
- Cache frequently accessed data
- Use connection pooling for database
- Optimize query projections (select only needed fields)

---

## 🔄 API Response Format

### Success Response
```javascript
{
  message: "Operation successful",
  data: { /* response data */ },
  token: "JWT_TOKEN" // only for auth endpoints
}
```

### Error Response
```javascript
{
  message: "Error description",
  error: "Additional error info"
}
```

---

## 📞 Support

For issues or contributions, please contact the development team.

**Built with ❤️**
