# 🚀 Quick Start Guide

## Step 1: Install Backend Dependencies

```powershell
cd server
npm install
```

## Step 2: Set Up MongoDB

### Easy Way - MongoDB Atlas (Cloud):

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create FREE account
3. Create a FREE cluster (M0)
4. Create database user & get connection string
5. Update `server/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/travelbuddy
   ```

**OR**

### Local MongoDB:
- Install MongoDB from https://www.mongodb.com/try/download/community
- Keep default connection in `server/.env`

## Step 3: Start Backend Server

```powershell
cd server
npm run dev
```

Should show:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

## Step 4: Start Frontend (New Terminal)

```powershell
cd c:\murali\fsd_travel
npm run dev
```

## Step 5: Open App

- Open: http://localhost:5174/
- Click "Sign Up"
- Create account
- Start using the app!

## 📝 What Changed:

✅ **Real MongoDB database** - All data persisted
✅ **User authentication** - Login/Signup with JWT
✅ **Real-time updates** - Data from database
✅ **User search** - Find users by name/location
✅ **Trip search** - Search trips by destination/creator
✅ **Secure** - Password hashing with bcrypt

## 🎯 Features:

- **Home**: See all public trips from database
- **Search**: Find routes & transport (still uses Geoapify API)
- **Create**: Create trips saved to MongoDB
- **Requests**: Real request management with database
- **Profile**: Update your profile in database
- **User Search**: Find other users' trips

Enjoy your full-stack travel app! 🌍✈️
