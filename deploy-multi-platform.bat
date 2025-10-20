@echo off
echo ====================================
echo     AfroConnect - Deploy Script
echo ====================================
echo.

echo [1/4] Build pour Vercel...
call npm run build:vercel
if %errorlevel% neq 0 (
    echo ❌ Erreur lors du build Vercel
    pause
    exit /b 1
)
echo ✅ Build Vercel terminé avec succès

echo.
echo [2/4] Synchronisation Capacitor Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de la sync Capacitor
    pause
    exit /b 1
)
echo ✅ Synchronisation Android terminée

echo.
echo [3/4] Vérification des fichiers de production...
if exist "dist\first-angular-project\browser\index.html" (
    echo ✅ Build web prêt pour Vercel
) else (
    echo ❌ Fichiers web manquants
    pause
    exit /b 1
)

if exist "android\app\src\main\assets\public\index.html" (
    echo ✅ Build Android prêt pour compilation
) else (
    echo ❌ Fichiers Android manquants
    pause
    exit /b 1
)

echo.
echo [4/4] Informations de déploiement...
echo.
echo 🌐 VERCEL:
echo   - Connecter le repo GitHub à Vercel
echo   - Variables d'environnement Firebase à configurer
echo   - Domaine: https://afroconnect.vercel.app
echo.
echo 📱 ANDROID:
echo   - Ouvrir: npx cap open android
echo   - Build ^> Generate Signed Bundle/APK
echo   - Upload sur Google Play Console
echo.
echo 📋 FICHIERS PRÊTS:
echo   - Web: dist/first-angular-project/
echo   - Android: android/app/
echo.

echo ====================================
echo    Déploiement préparé avec succès!
echo ====================================
echo.
echo Prochaines étapes:
echo 1. Push sur GitHub si pas encore fait
echo 2. Connecter à Vercel pour le web  
echo 3. Ouvrir Android Studio pour l'APK
echo.
pause