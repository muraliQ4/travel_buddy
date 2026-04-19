@echo off
echo 🚀 TravelBuddy Real-time Setup
echo ===============================

echo.
echo 📦 Installing Socket.IO dependencies...

echo Installing frontend Socket.IO client...
call npm install socket.io-client@4.7.2

echo Installing backend Socket.IO server...
cd server
call npm install socket.io@4.7.2
cd ..

echo.
echo ✅ Installation complete!
echo.
echo 🔧 To start the application:
echo.
echo Terminal 1 - Backend Server:
echo   cd server
echo   npm run dev
echo.
echo Terminal 2 - Frontend Server:
echo   npm run dev
echo.
echo 📱 Then open http://localhost:5174 in multiple browser tabs
echo.
echo 🔄 Real-time features now working:
echo   ✅ Instant join requests appear without refresh
echo   ✅ Real-time accept/reject notifications  
echo   ✅ Live member add/remove across all users
echo   ✅ Cross-user data synchronization
echo.
echo 🧪 Test with multiple browser tabs as different users!
echo.
pause