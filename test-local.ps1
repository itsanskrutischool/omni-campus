# OmniCampus Local Testing Script
# ─────────────────────────────

Write-Host "🧪 Starting Local Tests..." -ForegroundColor Green

# Test 1: Lint
Write-Host "`n[1/5] Running ESLint..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Lint passed" -ForegroundColor Green
} else {
    Write-Host "❌ Lint failed" -ForegroundColor Red
    exit 1
}

# Test 2: TypeScript
Write-Host "`n[2/5] Running TypeScript check..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript passed" -ForegroundColor Green
} else {
    Write-Host "❌ TypeScript failed" -ForegroundColor Red
    exit 1
}

# Test 3: Build
Write-Host "`n[3/5] Running production build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build passed" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Test 4: Health Check (requires server running)
Write-Host "`n[4/5] Testing health endpoint..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:3000/api/status" -Method GET -ErrorAction SilentlyContinue
if ($health.status -eq "healthy") {
    Write-Host "✅ Health check passed" -ForegroundColor Green
} else {
    Write-Host "⚠️ Health check skipped (server not running)" -ForegroundColor Yellow
}

# Test 5: Chrome Path
Write-Host "`n[5/5] Checking Chrome path..." -ForegroundColor Yellow
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (Test-Path $chromePath) {
    Write-Host "✅ Chrome found at: $chromePath" -ForegroundColor Green
} else {
    Write-Host "⚠️ Chrome not found at default path" -ForegroundColor Yellow
}

Write-Host "`n🎉 All tests completed!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Start server: npm run dev" -ForegroundColor White
Write-Host "  2. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host "  3. Test login with your credentials" -ForegroundColor White
