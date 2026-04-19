# Install Socket.IO dependencies for real-time updates

Write-Host "🔧 Installing Socket.IO dependencies..." -ForegroundColor Blue

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Green
npm install socket.io-client

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Green
cd server
npm install socket.io

Write-Host "✅ Socket.IO dependencies installed!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Yellow
Write-Host "1. Start backend server: cd server && npm run dev"
Write-Host "2. Start frontend: npm run dev" 
Write-Host "3. Open multiple browser tabs to test real-time updates!"
Write-Host ""
Write-Host "🔄 Real-time features now available:" -ForegroundColor Cyan
Write-Host "  • New requests appear instantly"
Write-Host "  • Accept/reject updates in real-time"
Write-Host "  • Member additions/removals sync across users"
Write-Host "  • No more page refreshes needed!"