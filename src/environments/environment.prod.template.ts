// 🔐 Template pour environment.prod.ts
// Copier ce fichier en environment.prod.ts et remplir avec vos vraies clés de PRODUCTION

export const environment = {
  production: true,
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  },
  // 🔐 Configuration admin sécurisée
  adminConfig: {
    adminEmails: [] // Ajouter les emails admin ici
  },
  googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
  // Stripe Configuration (PRODUCTION - Live Mode)
  stripePublishableKey: "pk_live_YOUR_PUBLISHABLE_KEY",
  stripePremiumPriceId: "price_YOUR_PREMIUM_PRICE_ID",
  cloudFunctionsUrl: "https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net"
};
