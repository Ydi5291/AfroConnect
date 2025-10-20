@echo off
echo ====================================
echo     Java 17 - Installation rapide
echo ====================================
echo.

echo [1/3] Installation Java 17 via Chocolatey...
echo ⏳ Cela peut prendre quelques minutes...
echo.

choco install openjdk17 -y
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'installation
    echo.
    echo Alternative manuelle:
    echo 1. Aller sur: https://adoptium.net/temurin/releases/?version=17
    echo 2. Telecharger: Windows x64 MSI  
    echo 3. Installer avec options par defaut
    echo.
    pause
    exit /b 1
)

echo ✅ Java 17 installe avec succes!

echo.
echo [2/3] Actualisation des variables d'environnement...
:: Actualiser l'environnement sans redemarrer
call refreshenv >nul 2>&1

echo.
echo [3/3] Verification de l'installation...
echo.
echo ====== Version Java installee ======
java -version
echo ====================================

if %errorlevel% equ 0 (
    echo.
    echo 🎉 SUCCESS! Java 17 est pret!
    echo.
    echo ✅ Vous pouvez maintenant:
    echo   1. Compiler l'APK Android
    echo   2. Ouvrir Android Studio: npx cap open android
    echo   3. Generer APK pour Google Play Store
    echo.
) else (
    echo.
    echo ⚠️ Java installe mais PATH non actualise
    echo Solution: Redemarrer VS Code et PowerShell
    echo Puis tester: java -version
    echo.
)

echo ====================================
echo     Configuration Android prete!
echo ====================================
pause