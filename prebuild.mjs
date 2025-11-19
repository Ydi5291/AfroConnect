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
  console.error('❌ Die Umgebungsvariablen FIREBASE_API_KEY oder GOOGLE_MAPS_API_KEY fehlen.');
  process.exit(1);
}

if (!stripePublishableKey || !stripePremiumPriceId) {
  console.error('❌ Die Umgebungsvariablen STRIPE_PUBLISHABLE_KEY oder STRIPE_PREMIUM_PRICE_ID fehlen.');
  process.exit(1);
}

const envContent = `export const environment = {
  production: false,
  firebase: {
    apiKey: "${firebaseApiKey}",
    authDomain: "afroconnect-a53a5.firebaseapp.com",
    projectId: "afroconnect-a53a5",
  storageBucket: "afroconnect-a53a5.firebasestorage.app",
    messagingSenderId: "341889512681",
    appId: "1:341889512681:web:e4073a27dded8eae9e2c78"
  },
  googleMapsApiKey: "${googleMapsApiKey}",
  stripePublishableKey: "${stripePublishableKey}",
  stripePremiumPriceId: "${stripePremiumPriceId}",
  cloudFunctionsUrl: "https://us-central1-afroconnect-a53a5.cloudfunctions.net",
  openaiApiKey: "${openaiApiKey}"
};
`;

fs.writeFileSync('./src/environments/environment.ts', envContent);
console.log('✅ environment.ts généré depuis .env');
