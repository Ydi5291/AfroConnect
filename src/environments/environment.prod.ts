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
    // En production, utilisez Firebase Admin SDK ou votre backend
    adminEmails: [] // Vide en production - géré côté serveur
  },
  googleMapsApiKey: "AIzaSyBY571lmuW24qnczKhCGORAGWg4gei8cek"
};