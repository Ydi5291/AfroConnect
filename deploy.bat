@echo off
echo 🚀 AfroConnect - Script de déploiement automatique
echo.

echo 📦 Build de production...
call ng build --configuration production --base-href "https://ydi5291.github.io/AfroConnect/"

if %ERRORLEVEL% neq 0 (
    echo ❌ Erreur lors du build
    pause
    exit /b %ERRORLEVEL%
)

echo 📄 Création du fichier 404.html pour GitHub Pages SPA...
copy "dist\first-angular-project\browser\index.html" "dist\first-angular-project\browser\404.html" >nul

echo 🌐 Déploiement sur GitHub Pages...
call npx angular-cli-ghpages --dir=dist/first-angular-project/browser

if %ERRORLEVEL% neq 0 (
    echo ❌ Erreur lors du déploiement
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ✅ Déploiement réussi!
echo 🌍 Site disponible sur: https://ydi5291.github.io/AfroConnect/
echo.
echo ⏰ Attendez 2-3 minutes pour la propagation GitHub Pages
pause