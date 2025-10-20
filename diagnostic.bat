@echo off
echo ====================================
echo       AfroConnect - Diagnostic
echo ====================================
echo.

echo [1/5] Verification Java...
where java >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Java trouve:
    java -version 2>&1 | findstr "version"
) else (
    echo ❌ Java non installe
)

echo.
echo [2/5] Verification Android Studio...
if exist "C:\Program Files\Android\Android Studio" (
    echo ✅ Android Studio installe
) else if exist "C:\Users\%USERNAME%\AppData\Local\Android\Sdk" (
    echo ✅ Android SDK trouve
) else (
    echo ❌ Android Studio non detecte
)

echo.
echo [3/5] Verification Capacitor...
where npx >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js/NPX disponible
    npx cap --version 2>nul | findstr "version" >nul
    if !errorlevel! equ 0 (
        echo ✅ Capacitor installe
    ) else (
        echo ⚠️ Capacitor pas detecte
    )
) else (
    echo ❌ Node.js non trouve
)

echo.
echo [4/5] Verification projet Android...
if exist "android\app\build.gradle" (
    echo ✅ Projet Android configure
) else (
    echo ❌ Projet Android manquant
)

echo.
echo [5/5] Verification build web...
if exist "dist\first-angular-project\browser\index.html" (
    echo ✅ Build web pret
) else (
    echo ⚠️ Build web requis
)

echo.
echo ====================================
echo          DIAGNOSTIC COMPLET
echo ====================================
echo.

:: Résumé des actions nécessaires
echo 📋 ACTIONS REQUISES:
echo.

where java >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔧 1. Installer Java 17
    echo    - Android Studio (recommande^)
    echo    - Ou installation manuelle
    echo.
)

if not exist "C:\Program Files\Android\Android Studio" (
    if not exist "C:\Users\%USERNAME%\AppData\Local\Android\Sdk" (
        echo 🔧 2. Installer Android Studio
        echo    - Inclut Java 17 + Android SDK
        echo.
    )
)

if not exist "dist\first-angular-project\browser\index.html" (
    echo 🔧 3. Build projet:
    echo    npm run build:vercel
    echo    npx cap sync android
    echo.
)

echo 🚀 ÉTAPES FINALES:
echo    1. npx cap open android
echo    2. Build ^> Generate Signed Bundle/APK
echo    3. Upload sur Google Play Store
echo.

echo ====================================
pause