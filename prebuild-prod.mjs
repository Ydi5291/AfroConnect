import fs from 'fs';
import dotenv from 'dotenv';

if (fs.existsSync('.env')) {
  dotenv.config();
  console.log('.env loaded');
} else {
  console.log('No .env file found — continuing using process.env (Netlify env vars).');
}

const firebaseApiKey = process.env.FIREBASE_API_KEY || process.env.NG_APP_FIREBASE_API_KEY;
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NG_APP_GOOGLE_MAPS_API_KEY;
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
const stripePremiumPriceId = process.env.STRIPE_PREMIUM_PRICE_ID;
const openaiApiKey = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY || '';

if (!firebaseApiKey || !googleMapsApiKey) {
  console.error('❌ Les variables FIREBASE_API_KEY ou GOOGLE_MAPS_API_KEY sont manquantes.');
  process.exit(1);
}

if (!stripePublishableKey || !stripePremiumPriceId) {
  console.error('❌ Les variables STRIPE_PUBLISHABLE_KEY ou STRIPE_PREMIUM_PRICE_ID sont manquantes.');
  process.exit(1);
}

const envContent = `export const environment = {
  production: true,
  firebase: {
    apiKey: "${firebaseApiKey}",
    authDomain: "afroconnect-a53a5.firebaseapp.com",
    projectId: "afroconnect-a53a5",
  storageBucket: "afroconnect-a53a5.firebasestorage.app",
    messagingSenderId: "341889512681",
    appId: "1:341889512681:web:e4073a27dded8eae9e2c78"
  },
  // 🔐 Configuration admin sécurisée
  adminConfig: {
    adminEmails: [] // Vide en production - géré côté serveur
  },
  googleMapsApiKey: "${googleMapsApiKey}",
  stripePublishableKey: "${stripePublishableKey}",
  stripePremiumPriceId: "${stripePremiumPriceId}",
  cloudFunctionsUrl: "https://us-central1-afroconnect-a53a5.cloudfunctions.net",
  openaiApiKey: "${openaiApiKey}"
};
`;

fs.writeFileSync('./src/environments/environment.prod.ts', envContent);
console.log('✅ environment.prod.ts généré depuis .env');
