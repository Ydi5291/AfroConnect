@echo off
echo ====================================
echo    Ouverture Android Studio
echo ====================================
echo.

echo [1/3] Recherche Android Studio...

:: Chercher Android Studio dans les emplacements courants
set STUDIO_PATH=""

if exist "C:\Program Files\Android\Android Studio\bin\studio64.exe" (
    set STUDIO_PATH="C:\Program Files\Android\Android Studio\bin\studio64.exe"
    echo ✅ Android Studio trouve: %STUDIO_PATH%
) else if exist "C:\Users\%USERNAME%\AppData\Local\Android\Studio\bin\studio64.exe" (
    set STUDIO_PATH="C:\Users\%USERNAME%\AppData\Local\Android\Studio\bin\studio64.exe"
    echo ✅ Android Studio trouve: %STUDIO_PATH%
) else (
    echo ❌ Android Studio non trouve automatiquement
    echo.
    echo Solutions:
    echo 1. Demarrer Android Studio depuis le menu Windows
    echo 2. File ^> Open ^> Naviguer vers ce dossier\android
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] Ouverture du projet...
echo Projet: %CD%\android
echo.

%STUDIO_PATH% "%CD%\android"

echo.
echo [3/3] Android Studio lance...
echo ✅ Le projet devrait s'ouvrir automatiquement
echo.
echo PROCHAINES ETAPES dans Android Studio:
echo 1. Attendre sync Gradle (1-3 min)
echo 2. Build ^> Generate Signed Bundle/APK
echo 3. Choisir APK ^> Create keystore
echo 4. Configuration Release ^> Create
echo.
echo ====================================
echo     Android Studio ouvert!
echo ====================================
pause