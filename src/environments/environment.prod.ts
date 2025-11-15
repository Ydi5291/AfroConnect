export const environment = {
  production: true,
  firebase: {
    apiKey: "AIzaSyBY571lmuW24qnczKhCGORAGWg4gei8cek",
    authDomain: "afroconnect-a53a5.firebaseapp.com",
    projectId: "afroconnect-a53a5",
    storageBucket: "afroconnect-a53a5.firebasestorage.app",
    messagingSenderId: "341889512681",
    appId: "1:341889512681:web:e4073a27dded8eae9e2c78"
  },
  // 🔐 Configuration admin sécurisée
  adminConfig: {
    adminEmails: [] 
  },
  googleMapsApiKey: "AIzaSyAVTCyd8uLieVgnMHEygb5mm1xQKcjiOVk",
  // Stripe Configuration (à remplir avec vos vraies clés de production)
  stripePublishableKey: "pk_live_YOUR_PUBLISHABLE_KEY",
  stripePremiumPriceId: "price_YOUR_PREMIUM_PRICE_ID",
  cloudFunctionsUrl: "https://YOUR_REGION-afroconnect-a53a5.cloudfunctions.net"
};
