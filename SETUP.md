# TravelBuddy - Full Stack Setup Guide

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Cloud - Recommended for beginners)

1. **Go to:** https://www.mongodb.com/cloud/atlas/register
2. **Sign up** for free account
3. **Create a cluster** (Free tier M0)
4. **Create Database User:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `travelbuddy`
   - Password: (generate strong password)
   - User Privileges: `Read and write to any database`
   - Click "Add User"

5. **Whitelist Your IP:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (or add your current IP)
   - Click "Confirm"

6. **Get Connection String:**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy connection string (looks like: `mongodb+srv://username:<password>@cluster.mongodb.net/...`)
   - Replace `<password>` with your actual password
   - Replace database name with `travelbuddy`

7. **Update `server/.env`:**
   ```env
   MONGODB_URI=mongodb+srv://travelbuddy:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/travelbuddy?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB

1. **Download MongoDB:**
   - Windows: https://www.mongodb.com/try/download/community
   - Install with default settings

2. **Start MongoDB:**
   ```powershell
   # MongoDB should start automatically as a service
   # Check if running:
   net start MongoDB
   ```

3. **Use default connection in `server/.env`:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/travelbuddy
   ```

## 🚀 Installation & Running

### Backend Server

1. **Open PowerShell in `server` folder:**
   ```powershell
   cd server
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Start server:**
   ```powershell
   npm run dev
   ```

   You should see:
   ```
   ✅ Connected to MongoDB
   🚀 Server running on http://localhost:5000
   ```

### Frontend (React)

1. **Open NEW PowerShell in project root:**
   ```powershell
   cd c:\murali\fsd_travel
   ```

2. **Install new dependencies:**
   ```powershell
   npm install axios
   ```

3. **Start React app:**
   ```powershell
   npm run dev
   ```

   Should run on: http://localhost:5174/

## ✅ Testing

1. **Backend Health Check:**
   - Open: http://localhost:5000/api/health
   - Should show: `{"status":"Server is running"}`

2. **Frontend:**
   - Open: http://localhost:5174/
   - You should see Login/Signup page

3. **Create Account:**
   - Click "Sign Up"
   - Enter name, email, password
   - Click "Create Account"
   - You should be logged in!

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `PUT /api/auth/profile` - Update profile (requires auth)
- `GET /api/auth/search?query=name` - Search users

### Trips
- `GET /api/trips` - Get all public trips
- `GET /api/trips/my-trips` - Get my created trips
- `GET /api/trips/user/:userId` - Get trips by user
- `POST /api/trips` - Create new trip
- `POST /api/trips/:tripId/like` - Like/unlike trip
- `DELETE /api/trips/:tripId` - Delete trip

### Requests
- `POST /api/requests` - Send join request
- `GET /api/requests/received` - Get received requests
- `GET /api/requests/sent` - Get sent requests
- `PUT /api/requests/:requestId/accept` - Accept request
- `PUT /api/requests/:requestId/reject` - Reject request

## 🔐 Authentication

- Uses JWT (JSON Web Tokens)
- Token stored in localStorage
- Token sent in `Authorization: Bearer <token>` header
- Token expires in 7 days

## 🐛 Troubleshooting

### MongoDB Connection Error
- **Atlas:** Check username, password, IP whitelist
- **Local:** Ensure MongoDB service is running

### Port Already in Use
- Backend: Change `PORT=5000` in `server/.env`
- Frontend: Vite will auto-select different port

### CORS Error
- Ensure backend is running on port 5000
- Check frontend API calls use correct URL

## 📁 Project Structure

```
fsd_travel/
├── server/                 # Backend
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── server.js          # Express server
│   └── .env              # Environment variables
├── src/                   # Frontend
│   ├── App.jsx           # Main React app
│   ├── apiService.js     # External APIs (Geoapify, etc.)
│   └── api.js            # Backend API calls
└── package.json
```

## 🎯 Next Steps

After setup:
1. Create your account
2. Update your profile
3. Create a travel plan
4. Search for other users' plans
5. Send join requests
6. Accept/reject requests to your plans
