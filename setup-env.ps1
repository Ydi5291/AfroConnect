# 🔐 Script de Configuration des Variables d'Environnement
# AfroConnect - Setup Script
# Ce script aide à configurer les variables d'environnement locales

Write-Host "🚀 Configuration AfroConnect - Variables d'Environnement" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si les fichiers existent déjà
$envExists = Test-Path "src/environments/environment.ts"
$envProdExists = Test-Path "src/environments/environment.prod.ts"

if ($envExists -and $envProdExists) {
    Write-Host "✅ Les fichiers d'environnement existent déjà." -ForegroundColor Green
    Write-Host ""
    $overwrite = Read-Host "Voulez-vous les recréer à partir des templates ? (o/n)"
    if ($overwrite -ne "o") {
        Write-Host "❌ Configuration annulée." -ForegroundColor Yellow
        exit
    }
}

# Copier les templates
Write-Host "📋 Copie des templates..." -ForegroundColor Yellow

if (Test-Path "src/environments/environment.template.ts") {
    Copy-Item "src/environments/environment.template.ts" "src/environments/environment.ts" -Force
    Write-Host "✅ environment.ts créé" -ForegroundColor Green
} else {
    Write-Host "❌ Template environment.template.ts introuvable" -ForegroundColor Red
    exit
}

if (Test-Path "src/environments/environment.prod.template.ts") {
    Copy-Item "src/environments/environment.prod.template.ts" "src/environments/environment.prod.ts" -Force
    Write-Host "✅ environment.prod.ts créé" -ForegroundColor Green
} else {
    Write-Host "❌ Template environment.prod.template.ts introuvable" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🔑 Configuration des clés API" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Demander les clés API
Write-Host "Entrez vos clés API (ou appuyez sur Entrée pour utiliser les valeurs par défaut):" -ForegroundColor Yellow
Write-Host ""

# OpenAI
$openaiKey = Read-Host "🤖 Clé OpenAI (sk-proj-...)"
if ($openaiKey) {
    (Get-Content "src/environments/environment.ts") -replace 'VOTRE_CLE_OPENAI_ICI', $openaiKey | Set-Content "src/environments/environment.ts"
    (Get-Content "src/environments/environment.prod.ts") -replace 'VOTRE_CLE_OPENAI_ICI', $openaiKey | Set-Content "src/environments/environment.prod.ts"
    Write-Host "✅ Clé OpenAI configurée" -ForegroundColor Green
}

# Stripe Publishable Key
Write-Host ""
$stripeKey = Read-Host "💳 Clé Stripe Publishable (pk_test_... ou pk_live_...)"
if ($stripeKey) {
    (Get-Content "src/environments/environment.ts") -replace 'pk_test_51SU07zPjHtMKxyfurxcRZwN8gbj8lWtd8FiMnffI5uJjmSXC0OD4MVwshgdl4Qf6C8a8UfC4mXlL5QCel1DcKAGP00wPRWQW5S', $stripeKey | Set-Content "src/environments/environment.ts"
    Write-Host "✅ Clé Stripe configurée" -ForegroundColor Green
}

# Stripe Price ID
Write-Host ""
$stripePriceId = Read-Host "💰 Stripe Price ID (price_...)"
if ($stripePriceId) {
    (Get-Content "src/environments/environment.ts") -replace 'price_1SU5uZPjHtMKxyfuz3bFSeUf', $stripePriceId | Set-Content "src/environments/environment.ts"
    Write-Host "✅ Stripe Price ID configuré" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Configuration terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "   1. Vérifiez src/environments/environment.ts" -ForegroundColor White
Write-Host "   2. Lancez 'ng serve' pour tester" -ForegroundColor White
Write-Host "   3. Configurez les mêmes variables sur Netlify" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT : Ne commitez JAMAIS ces fichiers sur GitHub !" -ForegroundColor Yellow
Write-Host ""
