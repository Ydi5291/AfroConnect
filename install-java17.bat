@echo off
echo ====================================
echo     Java 17 Installation Script
echo ====================================
echo.

echo [1/4] Verification des installations existantes...
where java >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ Java est deja installe:
    java -version
    echo.
    echo Voulez-vous continuer avec Java 17? [Y/N]
    set /p continue="Reponse: "
    if /i "%continue%" neq "Y" (
        echo Installation annulee.
        pause
        exit /b 0
    )
) else (
    echo ✅ Aucune installation Java detectee - installation propre possible
)

echo.
echo [2/4] Installation de Java 17 via winget...
winget install Microsoft.OpenJDK.17
if %errorlevel% neq 0 (
    echo ❌ Erreur winget - Essayons une methode alternative...
    echo.
    echo Telechargement manuel requis:
    echo 1. Ouvrir: https://adoptium.net/temurin/releases/?version=17
    echo 2. Telecharger: Windows x64 MSI
    echo 3. Installer avec les options par defaut
    echo 4. Redemarrer VS Code
    echo.
    pause
    exit /b 1
)

echo ✅ Installation Java 17 terminee

echo.
echo [3/4] Configuration des variables d'environnement...

:: Chercher l'installation Java 17
for /d %%i in ("C:\Program Files\Microsoft\jdk-17*") do set JAVA_PATH=%%i
for /d %%i in ("C:\Program Files\Eclipse Adoptium\jdk-17*") do set JAVA_PATH=%%i
for /d %%i in ("C:\Program Files\Java\jdk-17*") do set JAVA_PATH=%%i

if not defined JAVA_PATH (
    echo ❌ Impossible de localiser Java 17
    echo Verifiez l'installation manuellement
    pause
    exit /b 1
)

echo Java 17 trouve dans: %JAVA_PATH%

:: Configurer JAVA_HOME
setx JAVA_HOME "%JAVA_PATH%" >nul
echo ✅ JAVA_HOME configure: %JAVA_PATH%

:: Ajouter au PATH
setx PATH "%PATH%;%JAVA_PATH%\bin" >nul
echo ✅ PATH mis a jour avec Java 17

echo.
echo [4/4] Verification finale...
echo ⚠️ Redemarrage requis pour prendre effet
echo.
echo Fermeture de ce terminal...
echo Ouvrez un nouveau PowerShell et testez:
echo   java -version
echo.
echo ====================================
echo   Installation Java 17 terminee!
echo ====================================
echo.
echo Prochaines etapes:
echo 1. Redemarrer VS Code
echo 2. Ouvrir nouveau terminal PowerShell
echo 3. Tester: java -version
echo 4. Compiler Android: npx cap open android
echo.
pause