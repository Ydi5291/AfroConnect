# AfroConnect - Guide de déploiement

## 🌐 Déploiement Web (Vercel)

### Prérequis
- Compte GitHub connecté à Vercel
- Projet poussé sur GitHub

### Étapes de déploiement

1. **Connecter le projet à Vercel**
   ```bash
   # Via Vercel CLI (optionnel)
   npm i -g vercel
   vercel --prod
   ```

2. **Configuration automatique**
   - Le fichier `vercel.json` configure automatiquement le déploiement
   - Script `build:vercel` optimisé pour la production
   - Routing SPA configuré pour Angular

3. **Variables d'environnement à configurer sur Vercel**
   ```
   FIREBASE_API_KEY=votre_clé_api
   FIREBASE_AUTH_DOMAIN=votre_domaine_auth  
   FIREBASE_PROJECT_ID=votre_project_id
   FIREBASE_STORAGE_BUCKET=votre_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
   FIREBASE_APP_ID=votre_app_id
   ```

## 📱 Déploiement Android (Google Play Store)

### Prérequis
- Android Studio installé
- Java 17 configuré
- Compte Google Play Developer

### Compilation APK

1. **Synchroniser le projet**
   ```bash
   npm run build:vercel
   npx cap sync android
   ```

2. **Ouvrir dans Android Studio**
   ```bash
   npx cap open android
   ```

3. **Générer l'APK signé**
   - Build > Generate Signed Bundle/APK
   - Choisir APK 
   - Créer un nouveau keystore si nécessaire
   - Build en mode Release

### Upload sur Google Play

1. **Google Play Console**
   - Créer une nouvelle application
   - Remplir les informations de base
   - Upload de l'APK en mode "Internal testing" d'abord

2. **Informations requises**
   - Icônes d'application (512x512, 192x192, etc.)
   - Captures d'écran (Phone, Tablet)
   - Description de l'app en allemand
   - Politique de confidentialité
   - Catégorie : "Lifestyle" ou "Shopping"

## 🚀 Optimisations de production

### Performance
- Lazy loading des modules
- Tree-shaking automatique
- Compression des assets
- Service Worker pour la mise en cache

### SEO
- Meta tags optimisées
- Structure OpenGraph
- Sitemap automatique

### Sécurité
- Headers de sécurité configurés
- Validation des entrées utilisateur
- Authentification Firebase sécurisée

## 🔧 Scripts disponibles

```bash
npm run build:vercel    # Build optimisé pour Vercel
npm run build:prod      # Build pour GitHub Pages  
npm run deploy          # Déploiement GitHub Pages
npm start              # Serveur de développement
```

## 📊 Monitoring

### Vercel Analytics
- Activer Vercel Analytics pour le suivi des performances
- Monitoring des Core Web Vitals

### Firebase Analytics
- Événements personnalisés configurés
- Suivi de l'engagement utilisateur

---

**Domaines de déploiement prévus :**
- 🌐 **Web** : https://afroconnect.vercel.app
- 📱 **Android** : Google Play Store
- 🍎 **iOS** : App Store (Phase 2)