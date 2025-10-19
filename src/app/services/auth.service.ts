import { Injectable } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  User,
  authState,
  updateProfile
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Observable de l'état d'authentification
  user$: Observable<User | null>;

  constructor(private auth: Auth) {
    this.user$ = authState(this.auth);
  }

  // Inscription avec email et mot de passe
  async register(email: string, password: string, displayName?: string): Promise<UserProfile> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Mettre à jour le profil avec le nom d'affichage si fourni
      if (displayName && credential.user) {
        await updateProfile(credential.user, { displayName });
      }
      
      return {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: displayName || credential.user.displayName,
        photoURL: credential.user.photoURL
      };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw this.handleAuthError(error);
    }
  }

  // Connexion avec email et mot de passe
  async login(email: string, password: string): Promise<UserProfile> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      return {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: credential.user.displayName,
        photoURL: credential.user.photoURL
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw this.handleAuthError(error);
    }
  }

  // Connexion avec Google
  async loginWithGoogle(): Promise<UserProfile> {
    try {
      const provider = new GoogleAuthProvider();
      // Forcer la sélection du compte à chaque fois
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Vérifier si les popups sont autorisées avant d'essayer
      this.checkPopupSupport();
      
      const credential = await signInWithPopup(this.auth, provider);
      return {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: credential.user.displayName,
        photoURL: credential.user.photoURL
      };
    } catch (error) {
      console.error('Erreur lors de la connexion Google:', error);
      throw this.handleAuthError(error);
    }
  }

  // Vérifier le support des popups
  private checkPopupSupport(): void {
    try {
      const testPopup = window.open('', '_blank', 'width=1,height=1');
      if (testPopup) {
        testPopup.close();
      } else {
        throw new Error('popup-blocked');
      }
    } catch (error) {
      throw new Error('popup-blocked');
    }
  }

  // Déconnexion
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw this.handleAuthError(error);
    }
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  // Vérifier si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Gestion des erreurs d'authentification
  private handleAuthError(error: any): Error {
    let message = 'Une erreur est survenue';

    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Cette adresse email est déjà utilisée';
          break;
        case 'auth/weak-password':
          message = 'Le mot de passe doit contenir au moins 6 caractères';
          break;
        case 'auth/invalid-email':
          message = 'Adresse email invalide';
          break;
        case 'auth/user-not-found':
          message = 'Aucun compte associé à cette adresse email';
          break;
        case 'auth/wrong-password':
          message = 'Mot de passe incorrect';
          break;
        case 'auth/too-many-requests':
          message = 'Trop de tentatives. Veuillez réessayer plus tard';
          break;
        case 'auth/user-disabled':
          message = 'Ce compte a été désactivé';
          break;
        case 'auth/operation-not-allowed':
          message = 'Cette opération n\'est pas autorisée';
          break;
        case 'auth/popup-closed-by-user':
          message = 'Connexion annulée par l\'utilisateur';
          break;
        case 'auth/popup-blocked':
          message = 'Popup bloquée par le navigateur. Veuillez autoriser les popups pour AfroConnect';
          break;
        case 'popup-blocked':
          message = 'Popups bloquées. Autorisez les popups pour vous connecter avec Google';
          break;
        case 'auth/cancelled-popup-request':
          message = 'Demande de connexion annulée';
          break;
        default:
          message = error.message || 'Erreur d\'authentification';
      }
    }

    return new Error(message);
  }
}