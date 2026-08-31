# Medicine Cabinet Debug APK Build Script for Windows PowerShell

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  Medicine Cabinet - Debug APK Builder" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Check if running in correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Run this script from the project root." -ForegroundColor Red
    exit 1
}

# Step 1: Install dependencies
Write-Host "📦 Step 1/5: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Check Firebase configuration
Write-Host "🔍 Step 2/5: Checking Firebase configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.example") {
        Write-Host "⚠️  .env.local not found. Copying from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env.local"
        Write-Host "⚠️  Please edit .env.local with your Firebase credentials before building." -ForegroundColor Yellow
        $continue = Read-Host "Continue anyway? (y/n)"
        if ($continue -ne 'y') {
            exit 0
        }
    } else {
        Write-Host "⚠️  No Firebase configuration found. Create .env.local with your Firebase config." -ForegroundColor Yellow
        $continue = Read-Host "Continue anyway? (y/n)"
        if ($continue -ne 'y') {
            exit 0
        }
    }
} else {
    Write-Host "✅ Firebase configuration found" -ForegroundColor Green
}
Write-Host ""

# Step 3: Build web application
Write-Host "🔨 Step 3/5: Building web application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build web application" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Web application built successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Sync Capacitor
Write-Host "🔄 Step 4/5: Syncing Capacitor Android project..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to sync Capacitor" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Capacitor synced" -ForegroundColor Green
Write-Host ""

# Step 5: Build debug APK
Write-Host "📱 Step 5/5: Building debug APK..." -ForegroundColor Yellow
Set-Location android

# Check if gradlew exists
if (-not (Test-Path ".\gradlew")) {
    Write-Host "❌ gradlew not found. Trying with gradle..." -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Build the debug APK
.\gradlew assembleDebug
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build debug APK" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Get the APK path
$apkPath = Resolve-Path "android\app\build\outputs\apk\debug\app-debug.apk"

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  ✅ Debug APK Built Successfully!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📍 APK Location:" -ForegroundColor Cyan
Write-Host "   $apkPath" -ForegroundColor White
Write-Host ""
Write-Host "📊 APK Size:" -ForegroundColor Cyan
$apkSize = (Get-Item $apkPath).Length / 1MB
Write-Host "   {0:N2} MB" -f $apkSize -ForegroundColor White
Write-Host ""

# Optional: Install on device
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  Installation Options" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

$install = Read-Host "📲 Install on connected device/emulator? (y/n)"
if ($install -eq 'y') {
    # Check if adb is available
    $adbAvailable = $false
    try {
        $null = adb devices 2>$null
        $adbAvailable = $true
    } catch {
        $adbAvailable = $false
    }
    
    if (-not $adbAvailable) {
        Write-Host "❌ adb not found. Make sure Android SDK platform-tools is in your PATH." -ForegroundColor Red
        Write-Host "   Or set ANDROID_HOME environment variable." -ForegroundColor Yellow
    } else {
        # Check for connected devices
        $devices = adb devices | Select-String "device$" | Select-Object -First 1
        if (-not $devices) {
            Write-Host "⚠️  No devices found. Connect a device or start an emulator." -ForegroundColor Yellow
            Write-Host "   Enable USB debugging on your device." -ForegroundColor Yellow
            $stillInstall = Read-Host "Try to install anyway? (y/n)"
            if ($stillInstall -eq 'y') {
                adb install $apkPath
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ Installation attempted" -ForegroundColor Green
                } else {
                    Write-Host "❌ Installation failed" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "📲 Installing APK on device..." -ForegroundColor Yellow
            adb install $apkPath
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Installation successful!" -ForegroundColor Green
            } else {
                Write-Host "❌ Installation failed" -ForegroundColor Red
            }
        }
    }
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Test the app on your device/emulator" -ForegroundColor White
Write-Host "2. Verify all core features work:" -ForegroundColor White
Write-Host "   - Authentication (login/register)" -ForegroundColor Gray
Write-Host "   - Add/Edit/Delete medicines" -ForegroundColor Gray
Write-Host "   - Search and filters" -ForegroundColor Gray
Write-Host "   - Shopping list" -ForegroundColor Gray
Write-Host "   - Alerts (low stock, expiring, expired)" -ForegroundColor Gray
Write-Host ""
Write-Host "For more details, see BUILD_ANDROID_DEBUG_APK.md" -ForegroundColor Cyan
Write-Host ""
