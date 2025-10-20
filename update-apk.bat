@echo off
echo ====================================
echo   AfroConnect - Mise a jour APK
echo ====================================
echo.
echo ⚠️ SCRIPT POUR FUTURES MISES A JOUR
echo Utilise automatiquement vos informations sauvegardees
echo.

echo [1/4] Verification environnement...
if not exist "afroconnect-keystore.jks" (
    echo ❌ Keystore introuvable!
    echo Verifier que afroconnect-keystore.jks est dans ce dossier
    pause
    exit /b 1
)

echo [2/4] Build nouvelle version...
cd android
call gradlew clean assembleRelease
if %errorlevel% neq 0 (
    echo ❌ Erreur compilation
    cd ..
    pause
    exit /b 1
)
cd ..

echo [3/4] Signature automatique...
set KEYSTORE_PASSWORD=Diamal5291
set KEYSTORE_PATH=afroconnect-keystore.jks
set KEY_ALIAS=afroconnect
set APK_UNSIGNED=android\app\build\outputs\apk\release\app-release-unsigned.apk
set APK_SIGNED=android\app\build\outputs\apk\release\app-release-signed-v%date:~6,4%%date:~3,2%%date:~0,2%.apk

echo Configuration Java...
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%

echo Signature en cours...
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 ^
    -keystore "%KEYSTORE_PATH%" ^
    -storepass "%KEYSTORE_PASSWORD%" ^
    "%APK_UNSIGNED%" %KEY_ALIAS%

if %errorlevel% neq 0 (
    echo ❌ Erreur signature
    pause
    exit /b 1
)

copy "%APK_UNSIGNED%" "%APK_SIGNED%" >nul

echo.
echo [4/4] Mise a jour terminee!
echo ====================================
echo ✅ Nouvel APK: %APK_SIGNED%
echo ✅ Pret pour upload Google Play Store
echo ✅ Meme certificat = Mise a jour OK
echo.
dir "%APK_SIGNED%" | findstr /C:"app-release"
echo.
echo 🚀 Upload sur Google Play Console:
echo 1. Production > Create new release
echo 2. Upload: %APK_SIGNED%
echo 3. Update release notes
echo 4. Review > Start rollout to production
echo.
echo ====================================
pause