@echo off
echo ====================================
echo    SOLUTION Android Studio
echo ====================================
echo.

echo [1/4] Verification processus Android Studio...
tasklist | findstr /i "studio" >nul
if %errorlevel% equ 0 (
    echo ⚠️ Android Studio deja en cours...
    echo Fermeture des processus existants...
    taskkill /f /im "studio64.exe" >nul 2>&1
    timeout /t 2 >nul
)

echo.
echo [2/4] Recherche executable Android Studio...
set STUDIO_EXE=""

:: Emplacements possibles
if exist "C:\Program Files\Android\Android Studio\bin\studio64.exe" (
    set STUDIO_EXE="C:\Program Files\Android\Android Studio\bin\studio64.exe"
    echo ✅ Trouve: %STUDIO_EXE%
) else if exist "C:\Users\%USERNAME%\AppData\Local\Android\Studio\bin\studio64.exe" (
    set STUDIO_EXE="C:\Users\%USERNAME%\AppData\Local\Android\Studio\bin\studio64.exe"
    echo ✅ Trouve: %STUDIO_EXE%
) else (
    echo ❌ Android Studio non trouve automatiquement
    echo.
    echo SOLUTION MANUELLE:
    echo 1. Ouvrir Android Studio depuis menu Windows
    echo 2. File ^> Open ^> Choisir: %CD%\android
    echo 3. Attendre sync puis Build ^> Generate Signed Bundle/APK
    echo.
    pause
    exit /b 1
)

echo.
echo [3/4] Lancement Android Studio avec projet...
echo Projet: %CD%\android
echo.

start "" %STUDIO_EXE% "%CD%\android"

echo.
echo [4/4] Verification ouverture...
timeout /t 5 >nul

tasklist | findstr /i "studio" >nul
if %errorlevel% equ 0 (
    echo ✅ Android Studio lance avec succes!
    echo.
    echo 📱 PROCHAINES ETAPES:
    echo 1. Attendre synchronisation Gradle (1-3 min)
    echo 2. Build ^> Generate Signed Bundle/APK...
    echo 3. Choisir APK ^> Next
    echo 4. Create new keystore
    echo 5. Configuration Release ^> Create
    echo.
    echo ✅ L'APK sera dans: android\app\build\outputs\apk\release\
) else (
    echo ❌ Probleme lors du lancement
    echo.
    echo SOLUTION ALTERNATIVE:
    echo 1. Menu Windows ^> Rechercher "Android Studio"
    echo 2. Ouvrir manuellement
    echo 3. File ^> Open ^> %CD%\android
)

echo.
echo ====================================
pause