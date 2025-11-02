// Initialisation manuelle de Firebase avec la vraie clé
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "NG_APP_FIREBASE_API_KEY",
  authDomain: "afroconnect-a53a5.firebaseapp.com",
  projectId: "afroconnect-a53a5",
  storageBucket: "afroconnect-a53a5.firebasestorage.app",
  messagingSenderId: "341889512681",
  appId: "1:341889512681:web:e4073a27dded8eae9e2c78",
  measurementId: "G-4VZ4WFYE9M"
};

// Initialisation Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
