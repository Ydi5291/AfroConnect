export const environment = {
  production: true,
  firebase: {
  apiKey: "NG_APP_FIREBASE_API_KEY",
    authDomain: "afroconnect-a53a5.firebaseapp.com",
    projectId: "afroconnect-a53a5",
  storageBucket: "afroconnect-a53a5.appspot.com",
    messagingSenderId: "341889512681",
    appId: "1:341889512681:web:e4073a27dded8eae9e2c78"  
  },
  // 🔐 Configuration admin sécurisée
  adminConfig: {
 
    adminEmails: [] // Vide en production - géré côté serveur
  },
  googleMapsApiKey: "NG_APP_GOOGLE_MAPS_API_KEY"
};