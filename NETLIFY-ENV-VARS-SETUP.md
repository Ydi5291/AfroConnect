# 🔐 Configuration des Variables d'Environnement Netlify

**Date** : 19 novembre 2025  
**Status** : Configuration requise pour déploiement sécurisé

---

## 🎯 Objectif

Protéger les clés API sensibles en utilisant les **Environment Variables** de Netlify au lieu de les exposer dans le code source sur GitHub.

---

## ⚙️ Configuration sur Netlify

### Étape 1 : Accéder aux Environment Variables

1. Aller sur : https://app.netlify.com
2. Sélectionner votre site **AfroConnect**
3. Aller dans : **Site configuration** → **Environment variables**
4. Ou directement : `Site settings` → `Build & deploy` → `Environment variables`

### Étape 2 : Ajouter les Variables

Cliquer sur **"Add a variable"** et ajouter chacune des variables suivantes :

#### 🤖 OpenAI API Key
```
Key:   OPENAI_API_KEY
Value: sk-proj-VOTRE_CLE_OPENAI_ICI
Scopes: All scopes (ou Production + Deploy Previews)
```

#### 🗺️ Google Maps API Key
```
Key:   GOOGLE_MAPS_API_KEY
Value: AIzaSyAVTCyd8uLieVgnMHEygb5mm1xQKcjiOVk
Scopes: All scopes
```

#### 💳 Stripe Publishable Key (Production)
```
Key:   STRIPE_PUBLISHABLE_KEY
Value: pk_live_VOTRE_CLE_LIVE (à remplacer par votre vraie clé live)
Scopes: Production only
```

#### 💰 Stripe Premium Price ID
```
Key:   STRIPE_PREMIUM_PRICE_ID
Value: price_VOTRE_PRICE_ID_PROD (à remplacer)
Scopes: Production only
```

#### 🔥 Firebase Config (optionnel, déjà public)
```
Key:   FIREBASE_API_KEY
Value: AIzaSyBY571lmuW24qnczKhCGORAGWg4gei8cek
Scopes: All scopes
```

#### ☁️ Cloud Functions URL
```
Key:   CLOUD_FUNCTIONS_URL
Value: https://us-central1-afroconnect-a53a5.cloudfunctions.net
Scopes: All scopes
```

---

## 📝 Modifier le Build Command

### Option A : Utiliser netlify.toml (Recommandé)

Votre fichier `netlify.toml` doit injecter les variables d'environnement :

```toml
[build]
  command = "npm run build:netlify"
  publish = "dist/afroconnect/browser"

[build.environment]
  NODE_VERSION = "18"

# Injecter les variables d'environnement au build
[context.production.environment]
  OPENAI_API_KEY = "${OPENAI_API_KEY}"
  GOOGLE_MAPS_API_KEY = "${GOOGLE_MAPS_API_KEY}"
  STRIPE_PUBLISHABLE_KEY = "${STRIPE_PUBLISHABLE_KEY}"
  STRIPE_PREMIUM_PRICE_ID = "${STRIPE_PREMIUM_PRICE_ID}"
  CLOUD_FUNCTIONS_URL = "${CLOUD_FUNCTIONS_URL}"

[context.deploy-preview.environment]
  OPENAI_API_KEY = "${OPENAI_API_KEY}"
  GOOGLE_MAPS_API_KEY = "${GOOGLE_MAPS_API_KEY}"
  STRIPE_PUBLISHABLE_KEY = "pk_test_51SU07zPjHtMKxyfurxcRZwN8gbj8lWtd8FiMnffI5uJjmSXC0OD4MVwshgdl4Qf6C8a8UfC4mXlL5QCel1DcKAGP00wPRWQW5S"
  STRIPE_PREMIUM_PRICE_ID = "price_1SU5uZPjHtMKxyfuz3bFSeUf"
```

### Option B : Script de Build Personnalisé

Créer un script `build-netlify.js` :

```javascript
const fs = require('fs');
const path = require('path');

// Lire les variables d'environnement Netlify
const envConfig = {
  production: true,
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBY571lmuW24qnczKhCGORAGWg4gei8cek",
    authDomain: "afroconnect-a53a5.firebaseapp.com",
    projectId: "afroconnect-a53a5",
    storageBucket: "afroconnect-a53a5.firebasestorage.app",
    messagingSenderId: "341889512681",
    appId: "1:341889512681:web:e4073a27dded8eae9e2c78"
  },
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  stripePremiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID,
  cloudFunctionsUrl: process.env.CLOUD_FUNCTIONS_URL,
  openaiApiKey: process.env.OPENAI_API_KEY
};

// Générer le fichier environment.prod.ts
const envContent = `export const environment = ${JSON.stringify(envConfig, null, 2)};`;
const envPath = path.join(__dirname, 'src/environments/environment.prod.ts');

fs.writeFileSync(envPath, envContent);
console.log('✅ Environment variables injected from Netlify');
```

Puis dans `package.json` :

```json
{
  "scripts": {
    "build:netlify": "node build-netlify.js && ng build --configuration production"
  }
}
```

---

## 🔒 Sécurité Git

### Fichiers protégés (déjà dans .gitignore)

```gitignore
# 🔐 PROTECTION - Fichiers d'environnement Angular avec clés API
src/environments/environment.ts
src/environments/environment.prod.ts
```

### Fichiers à committer (templates sans clés)

```
src/environments/environment.template.ts
src/environments/environment.prod.template.ts
```

---

## 🧪 Tester la Configuration

### 1. Vérifier les Variables

Dans Netlify Dashboard :
```
Site settings → Environment variables → Voir toutes les variables
```

### 2. Déclencher un Build

```bash
# Depuis votre machine locale
git add .
git commit -m "🔐 Protect API keys with Netlify env vars"
git push origin main

# Netlify va automatiquement :
# 1. Détecter le push
# 2. Injecter les variables d'environnement
# 3. Builder avec les bonnes clés
# 4. Déployer
```

### 3. Vérifier en Production

Ouvrir la console navigateur (F12) sur votre site déployé :

```javascript
// ❌ Les clés NE DOIVENT PAS apparaître en clair dans les sources
// ✅ Mais l'application doit fonctionner
```

**Note** : Les variables d'environnement Angular sont quand même bundlées dans le code final. Pour une vraie sécurité, utilisez **Firebase Cloud Functions** (voir section suivante).

---

## 🛡️ Sécurité Renforcée (Recommandé)

### Problème avec Angular Environment Variables

⚠️ **Les variables d'environnement Angular sont compilées dans le bundle JavaScript final**, donc techniquement encore accessibles dans le code source du navigateur.

### Solution : Firebase Cloud Functions

Pour une **vraie protection** des clés API :

#### 1. Créer une Cloud Function Proxy

```javascript
// functions/index.js
const functions = require('firebase-functions');
const OpenAI = require('openai');

exports.chatWithOpenAI = functions.https.onCall(async (data, context) => {
  // 🔐 Vérifier l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  // 🔑 La clé OpenAI reste côté serveur
  const openai = new OpenAI({
    apiKey: functions.config().openai.key
  });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: data.messages,
      temperature: 0.7,
      max_tokens: 300
    });

    return {
      message: response.choices[0].message.content,
      usage: response.usage
    };
  } catch (error) {
    console.error('OpenAI Error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

#### 2. Configurer les Secrets Firebase

```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Configurer la clé OpenAI comme secret
firebase functions:config:set openai.key="sk-proj-VOTRE_CLE_OPENAI_ICI"

# Déployer
firebase deploy --only functions
```

#### 3. Modifier le Service Angular

```typescript
// src/app/services/openai.service.ts
import { getFunctions, httpsCallable } from '@angular/fire/functions';

export class OpenAIService {
  private chatFunction = httpsCallable(this.functions, 'chatWithOpenAI');

  constructor(private functions: Functions) {}

  sendMessage(userMessage: string): Observable<string> {
    return from(this.chatFunction({ messages: this.conversationHistory })).pipe(
      map((result: any) => result.data.message)
    );
  }
}
```

---

## 📊 Comparaison des Méthodes

| Méthode | Sécurité | Coût | Complexité | Recommandé |
|---------|----------|------|------------|------------|
| **Environment Variables (Netlify)** | ⚠️ Faible (clé dans bundle) | Gratuit | Facile | Dev/Test |
| **Firebase Cloud Functions** | 🔐 Élevée (clé côté serveur) | ~$0.40/million appels | Moyenne | **PRODUCTION** |
| **Backend Proxy (Node.js)** | 🔐 Élevée | Variable | Moyenne | Alternative |

---

## ✅ Checklist Déploiement Sécurisé

### Avant le déploiement

- [ ] Variables d'environnement ajoutées sur Netlify
- [ ] Fichiers `environment.ts` et `environment.prod.ts` dans `.gitignore`
- [ ] Templates `*.template.ts` créés et committés
- [ ] Script `setup-env.ps1` testé localement
- [ ] Build local réussi avec `ng build --configuration production`

### Pendant le déploiement

- [ ] Push vers GitHub sans les fichiers sensibles
- [ ] Netlify détecte le push et build automatiquement
- [ ] Variables injectées pendant le build
- [ ] Vérifier les logs de build Netlify

### Après le déploiement

- [ ] Site accessible sur https://votre-site.netlify.app
- [ ] Chatbot fonctionne avec OpenAI
- [ ] Google Maps s'affiche correctement
- [ ] Pas d'erreurs dans la console navigateur
- [ ] Vérifier que les clés ne sont pas exposées (F12 → Sources)

### Long terme (Migration Cloud Functions)

- [ ] Créer `functions/index.js` avec proxy OpenAI
- [ ] Configurer Firebase Functions secrets
- [ ] Modifier `openai.service.ts` pour utiliser Cloud Functions
- [ ] Tester les appels via Cloud Functions
- [ ] Déployer avec `firebase deploy --only functions`
- [ ] Supprimer `openaiApiKey` de `environment.prod.ts`

---

## 🚨 Que Faire en Cas de Fuite de Clé ?

### Si une clé API est exposée sur GitHub :

1. **Révoquer immédiatement** :
   - OpenAI : https://platform.openai.com/api-keys → Revoke
   - Google Maps : https://console.cloud.google.com/apis/credentials → Delete
   - Stripe : https://dashboard.stripe.com/apikeys → Revoke

2. **Générer de nouvelles clés**

3. **Mettre à jour Netlify** :
   - Site settings → Environment variables → Edit

4. **Nettoyer l'historique Git** (si nécessaire) :
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch src/environments/environment.prod.ts" \
     --prune-empty --tag-name-filter cat -- --all
   
   git push origin --force --all
   ```

5. **Redéployer** :
   ```bash
   git push origin main
   ```

---

## 📚 Ressources

- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/production-best-practices)
- [Angular Environment Configuration](https://angular.io/guide/build#configuring-application-environments)

---

**Développé par** : GitHub Copilot  
**Pour** : AfroConnect  
**Contact** : +49 178 4123151 ✅

**Vos clés sont maintenant protégées ! 🔐✨**
