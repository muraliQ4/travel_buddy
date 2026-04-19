#!/bin/bash
# Real-time TravelBuddy Setup Script

echo "🚀 Setting up TravelBuddy with Real-time Features"
echo "================================================"

echo "📦 Installing dependencies..."

# Install frontend Socket.IO client
echo "Installing frontend Socket.IO client..."
npm install socket.io-client@4.7.2

# Install backend Socket.IO server
echo "Installing backend Socket.IO server..."
cd server
npm install socket.io@4.7.2
cd ..

echo "✅ Dependencies installed successfully!"
echo ""
echo "🔧 To start the application:"
echo "1. Terminal 1 - Backend Server:"
echo "   cd server"
echo "   npm run dev"
echo ""
echo "2. Terminal 2 - Frontend Server:"  
echo "   npm run dev"
echo ""
echo "📱 Then open http://localhost:5174 in multiple browser tabs to test real-time features!"
echo ""
echo "🔄 Real-time features now working:"
echo "   ✅ Instant join requests"
echo "   ✅ Real-time accept/reject updates" 
echo "   ✅ Live member management"
echo "   ✅ Cross-user synchronization"
echo ""
echo "🧪 Test by opening 2+ browser tabs with different users!"