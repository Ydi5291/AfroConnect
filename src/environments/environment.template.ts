// 🔐 Template pour environment.ts
// Copier ce fichier en environment.ts et remplir avec vos vraies clés

export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  },
  googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
  // Stripe Configuration (Test Mode)
  stripePublishableKey: "pk_test_YOUR_STRIPE_PUBLISHABLE_KEY",
  stripePremiumPriceId: "price_YOUR_PREMIUM_PRICE_ID",
  cloudFunctionsUrl: "https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net"
};
