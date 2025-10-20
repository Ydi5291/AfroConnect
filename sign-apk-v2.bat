@echo off
echo ====================================
echo     AfroConnect - Signature APK v2
echo ====================================
echo.

echo [1/6] Configuration environnement Java...
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%

echo Testing Java tools...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Java non trouve dans Android Studio JBR
    echo Solutions:
    echo 1. Installer Java 17 manuellement
    echo 2. Utiliser Android Studio pour signer l'APK
    pause
    exit /b 1
)
echo ✅ Java trouve: %JAVA_HOME%

echo.
echo [2/6] Verification APK non signe...
set APK_UNSIGNED=android\app\build\outputs\apk\release\app-release-unsigned.apk
if not exist "%APK_UNSIGNED%" (
    echo ❌ APK non signe introuvable!
    echo Compilez d'abord: cd android && .\gradlew assembleRelease
    pause
    exit /b 1
)
echo ✅ APK non signe trouve: %APK_UNSIGNED%

echo.
echo [3/6] Configuration du keystore...
set KEYSTORE_PATH=afroconnect-keystore.jks
set KEY_ALIAS=afroconnect
set APK_SIGNED=android\app\build\outputs\apk\release\app-release-signed.apk

if exist "%KEYSTORE_PATH%" (
    echo ✅ Keystore existant trouve
    goto :sign_apk
)

echo.
echo 🔑 Creation du keystore AfroConnect...
echo.
set /p KEYSTORE_PASSWORD="Mot de passe keystore (min 6 caracteres): "
if "%KEYSTORE_PASSWORD%"=="" (
    echo ❌ Mot de passe requis!
    pause
    exit /b 1
)

set /p DEV_NAME="Nom developpeur: "
if "%DEV_NAME%"=="" set DEV_NAME=AfroConnect Developer

echo.
echo [4/6] Generation keystore avec keytool...
keytool -genkeypair -v ^
    -keystore "%KEYSTORE_PATH%" ^
    -alias %KEY_ALIAS% ^
    -keyalg RSA ^
    -keysize 2048 ^
    -validity 10000 ^
    -storepass "%KEYSTORE_PASSWORD%" ^
    -keypass "%KEYSTORE_PASSWORD%" ^
    -dname "CN=%DEV_NAME%, OU=AfroConnect, O=AfroConnect GmbH, L=Berlin, ST=Berlin, C=DE"

if %errorlevel% neq 0 (
    echo ❌ Erreur keytool - Essayons Android Studio
    echo.
    echo SOLUTION ALTERNATIVE:
    echo 1. Ouvrir Android Studio
    echo 2. Build ^> Generate Signed Bundle/APK
    echo 3. Choisir APK ^> Create new keystore
    echo 4. Configuration Release ^> Create
    pause
    exit /b 1
)
echo ✅ Keystore cree: %KEYSTORE_PATH%

:sign_apk
echo.
echo [5/6] Signature APK...
if not defined KEYSTORE_PASSWORD (
    set /p KEYSTORE_PASSWORD="Mot de passe keystore: "
)

jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 ^
    -keystore "%KEYSTORE_PATH%" ^
    -storepass "%KEYSTORE_PASSWORD%" ^
    "%APK_UNSIGNED%" %KEY_ALIAS%

if %errorlevel% neq 0 (
    echo ❌ Erreur signature
    pause
    exit /b 1
)

echo.
echo [6/6] Creation APK final...
copy "%APK_UNSIGNED%" "%APK_SIGNED%" >nul

echo.
echo ====================================
echo      APK PRET POUR GOOGLE PLAY!
echo ====================================
echo.
echo ✅ Fichier final: %APK_SIGNED%
echo ✅ Keystore: %KEYSTORE_PATH%
echo.
dir "%APK_SIGNED%" | findstr /C:"app-release"
echo.
echo 🚀 UPLOAD GOOGLE PLAY:
echo 1. https://play.google.com/console
echo 2. Create app ^> Upload APK
echo 3. Fill app info ^> Publish
echo.
echo ⚠️ SAUVEGARDE IMPORTANTE:
echo Garder %KEYSTORE_PATH% pour futures mises a jour!
echo.
pause