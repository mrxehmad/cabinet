# GitHub Actions Workflow - Build Android Debug APK

## Overview

This workflow allows you to trigger an Android debug APK build on-demand from the GitHub web interface. The APK will be available as a downloadable artifact for 7 days.

## How to Use

### Step 1: Navigate to Actions
1. Go to your repository on GitHub
2. Click on the **Actions** tab
3. Select **"Build Android Debug APK"** from the workflows list

### Step 2: Trigger the Workflow
1. Click **"Run workflow"**
2. (Optional) Provide your `.env.local` content encoded in base64 if Firebase config is needed
3. Click **"Run workflow"** button

### Step 3: Download the APK
1. Wait for the workflow to complete (usually 5-10 minutes)
2. Click on the workflow run
3. Scroll down to the **Artifacts** section
4. Click on **app-debug** to download the APK

## Encoding Your .env.local (Optional)

If your build requires Firebase configuration, encode your `.env.local` file:

### On Windows (PowerShell):
```powershell
$content = Get-Content -Path .env.local -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
$encoded = [Convert]::ToBase64String($bytes)
$encoded | clip
Write-Host "Base64 encoded content copied to clipboard"
```

### On macOS/Linux:
```bash
base64 -i .env.local | pbcopy  # macOS
# or
base64 .env.local | xclip -selection clipboard  # Linux with xclip
```

Then paste the encoded content into the workflow input field.

## What the Workflow Does

1. **Checkout** - Clones your repository
2. **Setup Node.js** - Installs Node.js 20
3. **Install Dependencies** - Runs `npm ci`
4. **Configure Firebase** - (Optional) Decodes and sets up `.env.local`
5. **Build Web App** - Runs `npm run build`
6. **Setup Java** - Installs JDK 17
7. **Setup Android SDK** - Configures Android build tools
8. **Sync Capacitor** - Runs `npx cap sync android`
9. **Build APK** - Runs Gradle debug build
10. **Upload Artifact** - Makes APK available for download

## Output

- **File:** `app-debug.apk`
- **Location:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Retention:** 7 days
- **Size:** Typically 20-50 MB depending on dependencies

## Troubleshooting

### Build Fails - No Firebase Config
If the build fails due to missing Firebase configuration:
1. Encode your `.env.local` file as shown above
2. Provide the base64 string when triggering the workflow

### Build Fails - Gradle Error
Check the workflow logs for specific error messages. Common issues:
- Missing Android SDK components (workflow handles this)
- Java version mismatch (workflow uses JDK 17)
- Dependency issues (check `package.json`)

### Artifact Expired
Artifacts are retained for 7 days. If expired:
1. Re-run the workflow
2. Download the new artifact

## Security Notes

- ⚠️ **Never commit `.env.local` to Git**
- ✅ Use workflow inputs for sensitive configuration
- ✅ Base64 encoding is NOT encryption - it's just transport format
- ✅ Artifacts are only accessible to repository collaborators
- ✅ Delete old workflow runs periodically to remove old artifacts

## Alternative: Local Build

For faster iteration during development, build locally on Windows:

```powershell
.\build-debug-apk.ps1
```

See `BUILD_ANDROID_DEBUG_APK.md` for detailed local build instructions.

## Workflow File Location

`.github/workflows/build-debug-apk.yml`
