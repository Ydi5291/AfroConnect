# 🔐 Configuration de l'Environnement

## Installation Initiale

Après avoir cloné le projet, vous devez créer vos fichiers d'environnement locaux :

### 1. Créer environment.ts (Développement)

```bash
cp src/environments/environment.template.ts src/environments/environment.ts
```

Puis éditer `environment.ts` avec vos clés de **TEST** :

- **Firebase** : Console Firebase → Project Settings → Your apps
- **Google Maps** : Google Cloud Console → APIs & Services → Credentials
- **Stripe** : Stripe Dashboard → Developers → API Keys (Test Mode)

### 2. Créer environment.prod.ts (Production)

```bash
cp src/environments/environment.prod.template.ts src/environments/environment.prod.ts
```

Puis éditer `environment.prod.ts` avec vos clés de **PRODUCTION**.

⚠️ **IMPORTANT** : Ne JAMAIS commiter ces fichiers sur Git !

## Variables d'Environnement Netlify

Pour le déploiement sur Netlify, configurer les variables suivantes :

- `FIREBASE_API_KEY`
- `GOOGLE_MAPS_API_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PREMIUM_PRICE_ID`

## Firebase Functions

Les clés secrètes sont stockées dans Firebase Functions config :

```bash
firebase functions:config:set stripe.secret_key="sk_test_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."
```

## Sécurité

✅ `environment.ts` et `environment.prod.ts` sont dans `.gitignore`  
✅ Les clés secrètes ne sont JAMAIS dans le code frontend  
✅ Toutes les clés API publiques doivent être restreintes par domaine  
