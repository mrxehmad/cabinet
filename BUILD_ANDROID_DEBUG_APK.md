# Medicine Cabinet - Android Debug APK Build Workflow

This guide walks you through building a debug APK for the Medicine Cabinet app on Windows.

## Prerequisites

Ensure you have the following installed:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **Java JDK 17**
   - Download from: https://www.oracle.com/java/technologies/downloads/#jdk17-windows
   - Set `JAVA_HOME` environment variable
   - Verify: `java --version`

3. **Android Studio**
   - Download from: https://developer.android.com/studio
   - Install Android Studio with:
     - Android SDK
     - Android SDK Platform-tools
     - Android SDK Build-tools
     - Android Emulator (optional, for testing)

4. **Android SDK Setup**
   - Set `ANDROID_HOME` environment variable to your SDK path (e.g., `C:\Users\YourName\AppData\Local\Android\Sdk`)
   - Add to PATH:
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\tools\bin`
     - `%ANDROID_HOME%\build-tools\<latest-version>`

5. **Capacitor CLI**
   ```powershell
   npm install -g @capacitor/cli @capacitor/core
   ```

## Step-by-Step Debug Build Workflow

### Step 1: Clone and Install Dependencies

```powershell
cd C:\path\to\your\project
npm install
```

### Step 2: Configure Firebase

1. Copy `.env.example` to `.env.local`:
   ```powershell
   copy .env.example .env.local
   ```

2. Edit `.env.local` with your Firebase configuration from the Firebase Console.

### Step 3: Build the Web Application

```powershell
npm run build
```

This creates the production web build in the `dist/` folder.

### Step 4: Sync with Capacitor

```powershell
npx cap sync android
```

This copies the web build to the Android project and updates dependencies.

### Step 5: Open Android Project in Android Studio

```powershell
npx cap open android
```

This opens the Android project in Android Studio.

### Step 6: Build Debug APK in Android Studio

**Option A: Using Android Studio GUI**

1. In Android Studio, select **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for the build to complete
3. Click **locate** in the popup to find the generated APK

**Option B: Using Command Line (from project root)**

```powershell
cd android
.\gradlew assembleDebug
```

The debug APK will be generated at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Step 7: Install Debug APK on Device/Emulator

**Connect a device via USB** (enable USB debugging in Developer Options) or **start an emulator**.

Then install the APK:

```powershell
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

Or use Android Studio's **Run** button to deploy directly to a connected device/emulator.

## Quick Build Script

Create a PowerShell script `build-debug-apk.ps1`:

```powershell
# build-debug-apk.ps1

Write-Host "🚀 Building Medicine Cabinet Debug APK..." -ForegroundColor Cyan

# Step 1: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Step 2: Build web app
Write-Host "🔨 Building web application..." -ForegroundColor Yellow
npm run build

# Step 3: Sync Capacitor
Write-Host "🔄 Syncing Capacitor..." -ForegroundColor Yellow
npx cap sync android

# Step 4: Build debug APK
Write-Host "📱 Building debug APK..." -ForegroundColor Yellow
Set-Location android
.\gradlew assembleDebug
Set-Location ..

# Step 5: Show output location
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
Write-Host "✅ Debug APK built successfully!" -ForegroundColor Green
Write-Host "📍 APK location: $PWD\$apkPath" -ForegroundColor Cyan

# Optional: Install on connected device
$install = Read-Host "Install on connected device? (y/n)"
if ($install -eq 'y') {
    Write-Host "📲 Installing APK..." -ForegroundColor Yellow
    adb install $apkPath
    Write-Host "✅ Installation complete!" -ForegroundColor Green
}
```

Run the script:

```powershell
.\build-debug-apk.ps1
```

## Troubleshooting

### Issue: `gradlew` not recognized

**Solution:** Make sure you're running from the `android/` directory:
```powershell
cd android
.\gradlew assembleDebug
```

### Issue: Android SDK not found

**Solution:** Set the `ANDROID_HOME` environment variable:
```powershell
$env:ANDROID_HOME = "C:\Users\YourName\AppData\Local\Android\Sdk"
```

Add it permanently via System Properties → Environment Variables.

### Issue: Build fails with Java version error

**Solution:** Ensure JDK 17 is installed and set as default:
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
```

### Issue: Capacitor sync fails

**Solution:** Clean and resync:
```powershell
npx cap clean android
npx cap sync android
```

### Issue: APK installation fails on device

**Solution:** 
- Enable **USB Debugging** in Developer Options
- Allow installation from unknown sources if prompted
- Check device is connected: `adb devices`

## Development Workflow

For rapid iteration during development:

1. **Live Reload in Browser:**
   ```powershell
   npm run dev
   ```

2. **Live Reload on Device (Capacitor):**
   ```powershell
   npx cap run android --livereload
   ```

3. **Quick Rebuild After Changes:**
   ```powershell
   npm run build
   npx cap sync android
   cd android
   .\gradlew assembleDebug
   ```

## Next Steps

Once the debug APK is working:

- Test all core features on a real device
- Verify offline functionality
- Test authentication flow
- Validate medicine CRUD operations
- Check search and filters
- Test shopping list functionality

When ready for distribution, you'll need to create a **release build** with proper signing credentials (covered in a separate guide).
