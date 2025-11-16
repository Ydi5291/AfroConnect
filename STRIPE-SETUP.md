# 💳 Configuration Stripe pour AfroConnect Premium

## 📋 Prérequis

1. Compte Stripe (gratuit) : https://stripe.com
2. Firebase Functions activées
3. Node.js 18+ installé

## 🔧 Étape 1 : Configuration Stripe

### 1.1 Créer un compte Stripe

1. Aller sur https://dashboard.stripe.com/register
2. Créer un compte
3. Activer le mode Test pour commencer

### 1.2 Récupérer les clés API

1. Dans le Dashboard Stripe → **Developers** → **API Keys**
2. Copier :
   - **Publishable key** (commence par `pk_test_...`)
   - **Secret key** (commence par `sk_test_...`) ⚠️ À garder secrète !

### 1.3 Créer le produit Premium

1. Dans Stripe Dashboard → **Products** → **Add product**
2. Nom : `AfroConnect Premium`
3. Description : `Abonnement mensuel Premium avec boutique en ligne`
4. Prix : **15,00 EUR / mois**
5. Type de facturation : **Récurrent (Monthly)**
6. Copier le **Price ID** (commence par `price_...`)

## 🔧 Étape 2 : Configuration Firebase Functions

### 2.1 Installer Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 2.2 Initialiser Functions

```bash
cd functions
npm install stripe --save
npm install cors --save
```

### 2.3 Créer la Cloud Function

Créer le fichier `functions/index.js` :

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret_key);
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Créer une session Stripe Checkout
exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      const { userId, priceId, successUrl, cancelUrl } = req.body;

      // Vérifier si l'utilisateur existe
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      if (!userDoc.exists) {
        await admin.firestore().collection('users').doc(userId).set({
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      // Créer la session Stripe
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: userId,
        metadata: {
          userId: userId
        }
      });

      res.json({ url: session.url, id: session.id });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// Webhook pour gérer les événements Stripe
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = functions.config().stripe.webhook_secret;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer les événements
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutCompleted(session);
      break;
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      await handleSubscriptionChange(subscription);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

async function handleCheckoutCompleted(session) {
  const userId = session.client_reference_id;
  
  await admin.firestore()
    .collection('users')
    .doc(userId)
    .collection('subscription')
    .doc('current')
    .set({
      plan: 'premium',
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      subscriptionStatus: 'active',
      startDate: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  
  console.log(`Premium subscription activated for user ${userId}`);
}

async function handleSubscriptionChange(subscription) {
  const customerId = subscription.customer;
  
  // Trouver l'utilisateur par customer ID
  const usersSnapshot = await admin.firestore()
    .collection('users')
    .where('subscription.stripeCustomerId', '==', customerId)
    .limit(1)
    .get();
  
  if (!usersSnapshot.empty) {
    const userId = usersSnapshot.docs[0].id;
    const status = subscription.status;
    
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('subscription')
      .doc('current')
      .update({
        subscriptionStatus: status,
        plan: status === 'active' ? 'premium' : 'free',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    
    console.log(`Subscription ${status} for user ${userId}`);
  }
}
```

### 2.4 Configurer les variables d'environnement Firebase

```bash
firebase functions:config:set stripe.secret_key="sk_test_VOTRE_CLE_SECRETE"
firebase functions:config:set stripe.webhook_secret="whsec_VOTRE_WEBHOOK_SECRET"
```

### 2.5 Déployer les Functions

```bash
firebase deploy --only functions
```

## 🔧 Étape 3 : Configuration AfroConnect

### 3.1 Mettre à jour environment.ts

```typescript
export const environment = {
  // ... config existante
  stripePublishableKey: "pk_test_VOTRE_CLE_PUBLIQUE",
  stripePremiumPriceId: "price_VOTRE_PRICE_ID",
  cloudFunctionsUrl: "https://europe-west1-afroconnect-a53a5.cloudfunctions.net"
};
```

### 3.2 Mettre à jour environment.prod.ts

Utiliser les clés **LIVE** (pk_live_... et sk_live_...)

## 🔧 Étape 4 : Configuration Webhook Stripe

1. Stripe Dashboard → **Developers** → **Webhooks**
2. **Add endpoint**
3. URL : `https://europe-west1-afroconnect-a53a5.cloudfunctions.net/stripeWebhook`
4. Événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copier le **Signing secret** (whsec_...)
6. Configurer dans Firebase :
   ```bash
   firebase functions:config:set stripe.webhook_secret="whsec_VOTRE_SECRET"
   ```

## ✅ Test

1. Aller sur `/pricing` dans votre app
2. Cliquer sur "Passer Premium"
3. Utiliser une carte de test Stripe : `4242 4242 4242 4242`
4. Vérifier dans Firestore : `users/{uid}/subscription/current`

## 💡 Cartes de test Stripe

- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- **3D Secure** : `4000 0027 6000 3184`
- Date : N'importe quelle date future
- CVC : N'importe quel 3 chiffres

## 📊 Mode Production

1. Activer le compte Stripe (vérification d'identité)
2. Remplacer toutes les clés `test` par `live`
3. Mettre à jour `environment.prod.ts`
4. Redéployer : `npm run build && firebase deploy`

## 🔒 Sécurité

- ⚠️ **Ne jamais commiter les clés Stripe dans Git !**
- Utiliser `.env` ou Firebase Config
- Les clés secrètes restent côté serveur (Cloud Functions)
- Seules les clés publiques sont dans le frontend

## 📞 Support

- Documentation Stripe : https://stripe.com/docs
- Firebase Functions : https://firebase.google.com/docs/functions
- AfroConnect : contact@afroconnect.com
