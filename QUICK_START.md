# ⚡ Quick Start Guide - Heart Beat

Get up and running with Heart Beat in 5 minutes!

---

## 📦 What You Need

- **Node.js** v14+ ([Download](https://nodejs.org/))
- **MongoDB** ([Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** (optional, for cloning)
- **Code Editor** (VS Code recommended)

---

## ⏱️ 5-Minute Setup

### Step 1: Prepare Directories (30 seconds)

```bash
# Navigate to project
cd "C:\Users\mahes\OneDrive\Desktop\HEART BEAT"
```

### Step 2: Start Backend (1 minute)

```bash
# Terminal 1
cd backend

# Install packages
npm install

# Check .env file exists with:
# - MONGODB_URI=mongodb://127.0.0.1:27017/heart-beat
# - JWT_SECRET=your_secret_key
# - PORT=5000

# Start server
npm run dev

# You should see: "MongoDB connected: 127.0.0.1"
#                "Server running on port 5000"
```

### Step 3: Start Frontend (1 minute)

```bash
# Terminal 2
cd frontend

# Install packages
npm install

# Check .env file exists with:
# - REACT_APP_API_URL=http://localhost:5000/api

# Start app
npm start

# Browser opens automatically at http://localhost:3000
```

### Step 4: Test Login (2 minutes)

1. Go to **Register** page
2. Select role: **Admin**
3. Fill in details:
   - Name: `Admin User`
   - Email: `admin@test.com`
   - Password: `password123`
4. Click **Complete Registration**
5. You're now logged in! ✅

---

## 🎯 What to Try Next

### As Admin
```
✅ Go to /admin
✅ View admin dashboard
✅ See manage options (patients, doctors, appointments)
```

### As Doctor
```
✅ Register as Doctor role
✅ Go to /doctor dashboard
✅ Set availability
✅ Manage appointments
```

### As Patient
```
✅ Register as Patient role
✅ Go to /patient dashboard
✅ Try AI chatbot (🤖)
✅ Try voice assistant (🎤)
```

---

## 📱 Responsive Testing

Press `F12` in browser to open DevTools:

```
Devices to test:
- Mobile (375px width)
- Tablet (768px width)
- Desktop (1920px width)
```

All work perfectly! ✅

---

## 🔑 Test Credentials

### Already Registered Users

```
Email: admin@test.com
Password: password123
Role: Admin

Email: doctor@test.com
Password: password123
Role: Doctor

Email: patient@test.com
Password: password123
Role: Patient
```

### Or Create Your Own
Just use the Register page and any valid email

---

## ⚙️ Configuration Quick Reference

### Backend `.env`
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/heart-beat
JWT_SECRET=heart_beat_secret_key_development
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:3000
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🚨 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| Backend won't start | Check MongoDB running: `mongod` |
| Port 5000 in use | `netstat -ano` to find process, or change PORT |
| Cannot login | Clear cookies: `Ctrl+Shift+Delete` then try again |
| API not working | Check REACT_APP_API_URL matches backend URL |
| React errors | Delete `node_modules`, run `npm install` again |

---

## 📱 Key Routes

```
Public Routes:
/login             → Login page
/register          → Registration page

Protected Routes (require login):
/admin/*           → Admin dashboard (admin only)
/doctor/*          → Doctor dashboard (doctor only)
/patient/*         → Patient dashboard (patient only)

Admin Sub-routes:
/admin/overview    → Dashboard overview
/admin/patients    → Manage patients
/admin/doctors     → Manage doctors
/admin/appointments → Manage appointments

Doctor Sub-routes:
/doctor/dashboard  → Doctor overview
/doctor/appointments → View appointments
/doctor/availability → Set availability

Patient Sub-routes:
/patient/overview  → Dashboard overview
/patient/doctors   → Find doctors
/patient/appointments → Book appointments
/patient/chatbot   → AI Chatbot
```

---

## 🎨 UI Features to Explore

### Login Page
- Gradient background
- Smooth animations
- Error messages
- Form validation

### Registration
- 3-step form
- Role selection
- Role-specific fields
- Progress indicator

### Dashboard
- Sidebar navigation
- Real-time info
- Quick actions
- Responsive layout

### AI Features
- 🤖 Live chatbot
- 🎤 Voice assistant
- 📊 Waveform visualization
- ⏺️ Recording controls

---

## 📊 API Testing

### Test Register API
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@test.com",
    "password": "password123",
    "role": "patient"
  }'
```

### Test Login API
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "password123"
  }'
```

---

## 🛑 When Things Go Wrong

### All ESLint Warnings Disappeared? ✅
Good! If you see warnings, restart with:
```bash
npm start
```

### Port Already in Use?
```bash
# Find process on port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or use different port
PORT=5001 npm run dev
```

### MongoDB Connection Failed?
```bash
# Start MongoDB
mongod

# Or use MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/heart-beat
```

---

## 📚 Next Steps

1. **Explore Frontend**: `frontend/README.md`
2. **Explore Backend**: `backend/README.md`
3. **Full Docs**: `PROJECT_DESCRIPTION.md`
4. **API Docs**: Check backend README for endpoints

---

## 🎯 Success Checklist

- [ ] Node.js installed
- [ ] MongoDB running
- [ ] Backend started (port 5000)
- [ ] Frontend started (port 3000)
- [ ] Can register as admin
- [ ] Can login and see dashboard
- [ ] Admin/Doctor/Patient roles work
- [ ] Can navigate between pages
- [ ] Chatbot works (for patient)
- [ ] Voice assistant works (for patient)

---

## 💡 Pro Tips

1. **Use Incognito Mode** to test multiple accounts simultaneously
2. **Open DevTools** (F12) to see API calls in Network tab
3. **Check Console** for helpful error messages
4. **Use MongoDB Compass** to visualize database
5. **Restart servers** if anything seems wrong

---

## 🎉 You're Ready!

Congratulations! You have Heart Beat running locally.

**Next: Explore the features and enjoy! 🚀**

---

Need Help?
- Check README files in frontend/ and backend/
- See PROJECT_DESCRIPTION.md for full documentation
- Restart servers as first troubleshooting step

Happy coding! ❤️
