const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret_key);
const cors = require('cors')({ origin: true });

admin.initializeApp();

/**
 * Cloud Function: Créer une session de paiement Stripe Checkout
 * Appelée depuis le frontend pour initier un abonnement Premium
 */
exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  console.log('createCheckoutSession called', { method: req.method, body: req.body });
  
  return cors(req, res, async () => {
    console.log('CORS handled, processing request');
    
    // Vérifier la méthode HTTP
    if (req.method !== 'POST') {
      console.log('Method not allowed:', req.method);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { priceId, userId, successUrl, cancelUrl } = req.body;
      console.log('Received params:', { priceId, userId, successUrl, cancelUrl });

      // Validation des paramètres
      if (!priceId || !userId || !successUrl || !cancelUrl) {
        console.log('Missing parameters');
        return res.status(400).json({ 
          error: 'Missing required parameters: priceId, userId, successUrl, cancelUrl' 
        });
      }

      // Récupérer l'utilisateur depuis Firestore
      console.log('Fetching user:', userId);
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      
      let userData;
      let userEmail;
      
      if (!userDoc.exists) {
        console.log('User not found in Firestore, fetching from Auth');
        // Récupérer l'utilisateur depuis Firebase Auth
        try {
          const authUser = await admin.auth().getUser(userId);
          userEmail = authUser.email;
          console.log('User email from Auth:', userEmail);
          
          // Créer le document utilisateur dans Firestore
          userData = {
            email: userEmail,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          };
          await admin.firestore().collection('users').doc(userId).set(userData);
          console.log('User document created in Firestore');
        } catch (authError) {
          console.error('User not found in Auth either:', authError);
          return res.status(404).json({ error: 'User not found in Auth or Firestore' });
        }
      } else {
        userData = userDoc.data();
        userEmail = userData.email;
      }

      let customerId = userData.stripeCustomerId;
      console.log('User data:', { email: userEmail, customerId });

      // Créer un customer Stripe si nécessaire
      if (!customerId) {
        console.log('Creating new Stripe customer');
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            firebaseUID: userId
          }
        });
        customerId = customer.id;
        console.log('Stripe customer created:', customerId);

        // Enregistrer le customer ID dans Firestore
        await admin.firestore().collection('users').doc(userId).update({
          stripeCustomerId: customerId
        });
      }

      // Créer la session Stripe Checkout
      console.log('Creating Stripe checkout session');
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: userId
        },
        subscription_data: {
          metadata: {
            userId: userId
          }
        }
      });

      console.log('Session created:', { sessionId: session.id, url: session.url });
      return res.status(200).json({ 
        sessionId: session.id,
        url: session.url 
      });

    } catch (error) {
      console.error('Error creating checkout session:', error);
      return res.status(500).json({ 
        error: 'Failed to create checkout session',
        message: error.message 
      });
    }
  });
});

/**
 * Cloud Function: Webhook Stripe
 * Gère les événements Stripe (paiement réussi, abonnement annulé, etc.)
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = functions.config().stripe.webhook_secret;

  let event;

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Traiter les différents types d'événements
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * Gérer la session de paiement complétée
 */
async function handleCheckoutSessionCompleted(session) {
  const userId = session.metadata.userId;
  const subscriptionId = session.subscription;

  // Récupérer les détails de l'abonnement
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Mettre à jour Firestore
  await admin.firestore()
    .collection('users')
    .doc(userId)
    .collection('subscription')
    .doc('current')
    .set({
      plan: 'premium',
      stripeCustomerId: session.customer,
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

  console.log(`Premium subscription activated for user: ${userId}`);
}

/**
 * Gérer la mise à jour de l'abonnement
 */
async function handleSubscriptionUpdated(subscription) {
  const userId = subscription.metadata.userId;

  await admin.firestore()
    .collection('users')
    .doc(userId)
    .collection('subscription')
    .doc('current')
    .update({
      subscriptionStatus: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

  console.log(`Subscription updated for user: ${userId}`);
}

/**
 * Gérer la suppression de l'abonnement
 */
async function handleSubscriptionDeleted(subscription) {
  const userId = subscription.metadata.userId;

  await admin.firestore()
    .collection('users')
    .doc(userId)
    .collection('subscription')
    .doc('current')
    .update({
      plan: 'free',
      subscriptionStatus: 'canceled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

  console.log(`Subscription canceled for user: ${userId}`);
}

/**
 * Gérer le paiement réussi d'une facture
 */
async function handleInvoicePaymentSucceeded(invoice) {
  const customerId = invoice.customer;
  
  // Récupérer l'utilisateur via le customer ID
  const usersSnapshot = await admin.firestore()
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (!usersSnapshot.empty) {
    const userId = usersSnapshot.docs[0].id;
    
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('subscription')
      .doc('current')
      .update({
        subscriptionStatus: 'active',
        lastPaymentAt: admin.firestore.FieldValue.serverTimestamp()
      });

    console.log(`Payment succeeded for user: ${userId}`);
  }
}

/**
 * Gérer l'échec du paiement d'une facture
 */
async function handleInvoicePaymentFailed(invoice) {
  const customerId = invoice.customer;
  
  const usersSnapshot = await admin.firestore()
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (!usersSnapshot.empty) {
    const userId = usersSnapshot.docs[0].id;
    
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('subscription')
      .doc('current')
      .update({
        subscriptionStatus: 'past_due',
        lastPaymentFailedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    console.log(`Payment failed for user: ${userId}`);
  }
}

/**
 * Cloud Function: Obtenir le portail client Stripe
 * Permet à l'utilisateur de gérer son abonnement
 */
exports.createPortalLink = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { customerId, returnUrl } = req.body;

      if (!customerId || !returnUrl) {
        return res.status(400).json({ 
          error: 'Missing required parameters: customerId, returnUrl' 
        });
      }

      // Créer le lien vers le portail client
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return res.status(200).json({ url: session.url });

    } catch (error) {
      console.error('Error creating portal link:', error);
      return res.status(500).json({ 
        error: 'Failed to create portal link',
        message: error.message 
      });
    }
  });
});

/**
 * Cloud Function: Définir un utilisateur comme administrateur
 * SÉCURITÉ: Cette fonction doit être appelée manuellement depuis la console Firebase
 * ou via Firebase CLI avec les bonnes permissions
 * 
 * Usage depuis Firebase CLI:
 * firebase functions:call setAdminClaim --data='{"email":"your-email@example.com"}'
 */
exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  // Vérifier que l'appelant est un admin (pour les appels suivants)
  if (context.auth && context.auth.token.admin !== true) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Seuls les administrateurs peuvent définir des droits admin'
    );
  }

  const { email, uid } = data;
  
  if (!email && !uid) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email ou UID requis'
    );
  }

  try {
    // Récupérer l'utilisateur par email ou UID
    let user;
    if (uid) {
      user = await admin.auth().getUser(uid);
    } else {
      user = await admin.auth().getUserByEmail(email);
    }

    // Définir le custom claim admin
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true
    });

    console.log(`✅ Admin claim défini pour: ${user.email} (${user.uid})`);

    return {
      success: true,
      message: `Admin claim défini pour ${user.email}`,
      uid: user.uid
    };
  } catch (error) {
    console.error('❌ Erreur lors de la définition du claim admin:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Erreur: ${error.message}`
    );
  }
});

/**
 * Cloud Function: Retirer les droits admin d'un utilisateur
 */
exports.removeAdminClaim = functions.https.onCall(async (data, context) => {
  // Vérifier que l'appelant est un admin
  if (!context.auth || context.auth.token.admin !== true) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Seuls les administrateurs peuvent retirer des droits admin'
    );
  }

  const { email, uid } = data;
  
  if (!email && !uid) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email ou UID requis'
    );
  }

  try {
    // Récupérer l'utilisateur
    let user;
    if (uid) {
      user = await admin.auth().getUser(uid);
    } else {
      user = await admin.auth().getUserByEmail(email);
    }

    // Retirer le custom claim admin
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: false
    });

    console.log(`✅ Admin claim retiré pour: ${user.email} (${user.uid})`);

    return {
      success: true,
      message: `Admin claim retiré pour ${user.email}`,
      uid: user.uid
    };
  } catch (error) {
    console.error('❌ Erreur lors du retrait du claim admin:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Erreur: ${error.message}`
    );
  }
});

/**
 * Cloud Function: Génère un sitemap.xml dynamique
 * Inclut toutes les pages statiques + les URLs individuelles des shops
 */
exports.generateSitemap = functions.https.onRequest(async (req, res) => {
  // Configuration CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Content-Type', 'application/xml');
  
  try {
    const db = admin.firestore();
    const shopsSnapshot = await db.collection('afroshops').get();
    
    const baseUrl = 'https://afroconnect.shop';
    const today = new Date().toISOString().split('T')[0];
    
    // Fonction pour générer un slug SEO-friendly
    const generateSlug = (shop) => {
      const name = shop.name
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const city = shop.city
        ?.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      return city ? `${name}-${city}` : name;
    };
    
    // Fonction pour échapper les caractères XML
    const escapeXml = (text) => {
      if (!text) return '';
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };
    
    // Début du XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Page d'accueil -->
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${today}</lastmod>
  </url>

  <!-- Pages principales -->
  <url>
    <loc>${baseUrl}/gallery</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <lastmod>${today}</lastmod>
  </url>

  <url>
    <loc>${baseUrl}/shops</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <lastmod>${today}</lastmod>
  </url>

  <url>
    <loc>${baseUrl}/landing</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${baseUrl}/add-afroshop</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Pages secondaires -->
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>${baseUrl}/kontakt</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>${baseUrl}/impressum</loc>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>${baseUrl}/privacy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>${baseUrl}/terms</loc>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>${baseUrl}/hilfe</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Pages individuelles des commerces -->
`;

    // Ajouter chaque shop
    shopsSnapshot.forEach(doc => {
      const shop = doc.data();
      const slug = generateSlug(shop);
      const shopUrl = `${baseUrl}/shops/${slug}`;
      
      xml += `  <url>
    <loc>${shopUrl}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${today}</lastmod>`;
      
      // Ajouter l'image si disponible
      if (shop.image) {
        xml += `
    <image:image>
      <image:loc>${escapeXml(shop.image)}</image:loc>
      <image:title>${escapeXml(shop.name)}</image:title>
      <image:caption>${escapeXml(shop.description || '')}</image:caption>
    </image:image>`;
      }
      
      xml += `
  </url>
`;
    });

    xml += `</urlset>`;
    
    res.status(200).send(xml);
  } catch (error) {
    console.error('❌ Erreur génération sitemap:', error);
    res.status(500).send('Erreur lors de la génération du sitemap');
  }
});
