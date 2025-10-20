@echo off
echo ====================================
echo     AfroConnect - Signature APK
echo ====================================
echo.

echo [1/5] Verification APK non signe...
set APK_UNSIGNED="android\app\build\outputs\apk\release\app-release-unsigned.apk"
if not exist %APK_UNSIGNED% (
    echo ❌ APK non signe introuvable!
    echo Compilez d'abord: cd android && .\gradlew assembleRelease
    pause
    exit /b 1
)
echo ✅ APK non signe trouve: %APK_UNSIGNED%

echo.
echo [2/5] Configuration du keystore...
set KEYSTORE_PATH="afroconnect-keystore.jks"
set KEY_ALIAS=afroconnect
set APK_SIGNED="android\app\build\outputs\apk\release\app-release-signed.apk"

:: Vérifier si le keystore existe
if exist %KEYSTORE_PATH% (
    echo ✅ Keystore existant trouve: %KEYSTORE_PATH%
    goto :sign_apk
)

echo.
echo 🔑 Creation du keystore pour AfroConnect...
echo.
echo Informations requises pour le certificat:
echo - Mot de passe keystore (minimum 6 caracteres)
echo - Nom/Organisation: AfroConnect / Votre nom
echo - Pays: DE (Allemagne)
echo.

set /p KEYSTORE_PASSWORD="Mot de passe keystore: "
if "%KEYSTORE_PASSWORD%"=="" (
    echo ❌ Mot de passe requis!
    pause
    exit /b 1
)

set /p DEV_NAME="Votre nom (developpeur): "
if "%DEV_NAME%"=="" set DEV_NAME=AfroConnect Developer

echo.
echo [3/5] Generation du keystore...
keytool -genkeypair -v ^
    -keystore %KEYSTORE_PATH% ^
    -alias %KEY_ALIAS% ^
    -keyalg RSA ^
    -keysize 2048 ^
    -validity 10000 ^
    -storepass "%KEYSTORE_PASSWORD%" ^
    -keypass "%KEYSTORE_PASSWORD%" ^
    -dname "CN=%DEV_NAME%, OU=AfroConnect, O=AfroConnect App, L=Deutschland, ST=Deutschland, C=DE"

if %errorlevel% neq 0 (
    echo ❌ Erreur lors de la creation du keystore
    pause
    exit /b 1
)
echo ✅ Keystore cree avec succes!

:sign_apk
echo.
echo [4/5] Signature de l'APK...
if not defined KEYSTORE_PASSWORD (
    set /p KEYSTORE_PASSWORD="Mot de passe keystore: "
)

jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 ^
    -keystore %KEYSTORE_PATH% ^
    -storepass "%KEYSTORE_PASSWORD%" ^
    %APK_UNSIGNED% %KEY_ALIAS%

if %errorlevel% neq 0 (
    echo ❌ Erreur lors de la signature
    pause
    exit /b 1
)

echo.
echo [5/5] Optimisation de l'APK...
:: Zipalign pour optimiser l'APK
zipalign -v 4 %APK_UNSIGNED% %APK_SIGNED%

if %errorlevel% neq 0 (
    echo ⚠️ Zipalign non disponible - APK signe mais non optimise
    copy %APK_UNSIGNED% %APK_SIGNED%
)

echo.
echo ====================================
echo        SIGNATURE COMPLETEE!
echo ====================================
echo.
echo ✅ APK signe: %APK_SIGNED%
echo ✅ Keystore: %KEYSTORE_PATH%
echo.
echo 📱 PRET POUR GOOGLE PLAY STORE:
echo   1. Taille APK: 
dir /B %APK_SIGNED%
echo   2. API cible: Android 14 (API 34)
echo   3. API minimum: Android 6.0 (API 23)
echo.
echo 🚀 PROCHAINES ETAPES:
echo   1. Aller sur: https://play.google.com/console
echo   2. Creer nouvelle application
echo   3. Upload: %APK_SIGNED%
echo   4. Remplir informations app
echo   5. Publier en test interne puis production
echo.
echo ⚠️ IMPORTANT: Sauvegarder %KEYSTORE_PATH% !
echo    Ce fichier est requis pour toutes les mises a jour!
echo.
echo ====================================
pause