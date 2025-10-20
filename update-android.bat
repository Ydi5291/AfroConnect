@echo off
echo 🔨 Building Angular app...
call npx ng build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo 📱 Syncing with Android...
call npx cap sync android

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Sync failed!
    pause
    exit /b 1
)

echo ✅ Android app updated successfully!
echo 💡 Now refresh/rebuild in Android Studio
pause