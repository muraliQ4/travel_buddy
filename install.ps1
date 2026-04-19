# Step 1: Install Backend Dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
Set-Location server
npm install
Set-Location ..

# Step 2: Install Frontend Dependencies (if not already)  
Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Cyan
# No new frontend dependencies needed - we're using native fetch API

Write-Host "`n✅ Installation complete!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Set up MongoDB (see SETUP.md)" -ForegroundColor White
Write-Host "2. Update server/.env with your MongoDB URI" -ForegroundColor White
Write-Host "3. Start backend: cd server && npm run dev" -ForegroundColor White
Write-Host "4. Start frontend (new terminal): npm run dev" -ForegroundColor White
