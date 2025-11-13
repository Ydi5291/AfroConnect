@echo off
echo 🚀 AfroConnect - Déploiement Netlify
echo.

echo 📦 Build de production pour Netlify...
call npm run build:vercel

if %ERRORLEVEL% neq 0 (
    echo ❌ Erreur lors du build
    pause
    exit /b %ERRORLEVEL%
)

echo 🌐 Déploiement sur Netlify...
call netlify deploy --prod --dir=dist/first-angular-project/browser

if %ERRORLEVEL% neq 0 (
    echo ❌ Erreur lors du déploiement
    echo 💡 Assurez-vous d'être connecté avec: netlify login
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ✅ Déploiement réussi!
echo 🌍 Site disponible sur: https://afroconnect.shop
echo.
pause
