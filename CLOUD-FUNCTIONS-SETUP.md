# Guide de déploiement des Cloud Functions Stripe

## ✅ Fichiers créés
- `functions/index.js` - Cloud Functions (createCheckoutSession, stripeWebhook, createPortalLink)
- `functions/package.json` - Dépendances
- `firebase.json` - Configuration Firebase

## 🔑 Configuration des clés Stripe

### 1. Configurer les variables d'environnement Firebase

Tu dois ajouter tes clés Stripe secrètes dans Firebase Functions :

```bash
# Clé secrète Stripe (NE PAS partager publiquement !)
firebase functions:config:set stripe.secret_key="sk_test_VOTRE_CLE_SECRETE"

# Webhook secret (à récupérer après configuration du webhook dans Stripe)
firebase functions:config:set stripe.webhook_secret="whsec_VOTRE_WEBHOOK_SECRET"
```

### 2. Récupérer ta clé secrète Stripe

1. Va sur https://dashboard.stripe.com/test/apikeys
2. Copie la **"Secret key"** (commence par `sk_test_...`)
3. ⚠️ **NE JAMAIS partager cette clé publiquement !**

## 🚀 Déploiement

### Étape 1 : Se connecter à Firebase

```bash
firebase login
```

### Étape 2 : Sélectionner le projet

```bash
firebase use afroconnect-a53a5
```

### Étape 3 : Déployer les Cloud Functions

```bash
firebase deploy --only functions
```

Ou déployer une fonction spécifique :

```bash
firebase deploy --only functions:createCheckoutSession
firebase deploy --only functions:stripeWebhook
firebase deploy --only functions:createPortalLink
```

## 🔗 Configurer le Webhook Stripe

Après le déploiement, tu auras une URL comme :
```
https://us-central1-afroconnect-a53a5.cloudfunctions.net/stripeWebhook
```

### Dans Stripe Dashboard :

1. Va dans **Développeurs** → **Webhooks**
2. Clique sur **"Ajouter un endpoint"**
3. Colle l'URL de la fonction `stripeWebhook`
4. Sélectionne les événements :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copie le **"Signing secret"** (commence par `whsec_...`)
6. Configure-le dans Firebase :
   ```bash
   firebase functions:config:set stripe.webhook_secret="whsec_..."
   ```
7. Redéploie les functions :
   ```bash
   firebase deploy --only functions
   ```

## 📋 URLs des Cloud Functions

Après déploiement, tes fonctions seront disponibles à :

- **createCheckoutSession** : 
  `https://us-central1-afroconnect-a53a5.cloudfunctions.net/createCheckoutSession`

- **stripeWebhook** : 
  `https://us-central1-afroconnect-a53a5.cloudfunctions.net/stripeWebhook`

- **createPortalLink** : 
  `https://us-central1-afroconnect-a53a5.cloudfunctions.net/createPortalLink`

## 🧪 Tester localement (optionnel)

```bash
# Démarrer l'émulateur
cd functions
npm run serve

# Les fonctions seront disponibles sur :
# http://localhost:5001/afroconnect-a53a5/us-central1/createCheckoutSession
```

## ✅ Checklist de déploiement

- [ ] Clé publique Stripe ajoutée dans `environment.ts` ✅ (Fait)
- [ ] Price ID ajouté dans `environment.ts` ✅ (Fait)
- [ ] Clé secrète Stripe configurée dans Firebase Functions
- [ ] Cloud Functions déployées
- [ ] Webhook Stripe configuré
- [ ] Webhook secret ajouté dans Firebase Functions
- [ ] Tester un paiement avec une carte test

## 💳 Cartes de test Stripe

Pour tester les paiements :

- **Paiement réussi** : `4242 4242 4242 4242`
- **Paiement refusé** : `4000 0000 0000 0002`
- **Authentification 3D Secure** : `4000 0025 0000 3155`

- Date d'expiration : n'importe quelle date future
- CVC : n'importe quel 3 chiffres
- Code postal : n'importe quel code

## 📊 Structure Firestore

Les données d'abonnement sont stockées dans :

```
users/{userId}/subscription/current
  - plan: "free" | "premium"
  - stripeCustomerId: "cus_..."
  - stripeSubscriptionId: "sub_..."
  - subscriptionStatus: "active" | "canceled" | "past_due"
  - currentPeriodStart: Timestamp
  - currentPeriodEnd: Timestamp
  - cancelAtPeriodEnd: boolean
  - updatedAt: Timestamp
```

## 🔒 Sécurité

- ✅ Clé secrète Stripe stockée dans Firebase Functions config (sécurisé)
- ✅ Vérification de signature webhook
- ✅ CORS activé pour les requêtes frontend
- ✅ Validation des paramètres
- ✅ Metadata Firebase UID dans Stripe

## 📝 Prochaines étapes

1. Configurer la clé secrète Stripe
2. Déployer les Cloud Functions
3. Configurer le webhook Stripe
4. Tester le flux de paiement
5. Ajouter le badge Premium sur les profils
6. Implémenter les restrictions pour les utilisateurs Free
