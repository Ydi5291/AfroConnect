import { Injectable } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signOut, 
  User,
  authState,
  updateProfile
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { TranslationService } from './translation.service';

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
  private recaptchaVerifier: RecaptchaVerifier | null = null;

  constructor(private auth: Auth, private translationService: TranslationService) {
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
      console.log('🚀 Initialisation du provider Google...');
      
      const provider = new GoogleAuthProvider();
      // Forcer la sélection du compte à chaque fois
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('🔍 Vérification du support des popups...');
      // Vérifier si les popups sont autorisées avant d'essayer
      this.checkPopupSupport();
      
      console.log('🔐 Tentative de connexion avec popup...');
      const credential = await signInWithPopup(this.auth, provider);
      
      console.log('✅ Connexion réussie, utilisateur:', credential.user.email);
      
      return {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: credential.user.displayName,
        photoURL: credential.user.photoURL
      };
    } catch (error: any) {
      console.error('❌ Erreur détaillée:', {
        name: error.name,
        code: error.code,
        message: error.message,
        customData: error.customData
      });
      
      // Diagnostics spécifiques Firebase
      if (error.code === 'auth/popup-blocked') {
        console.log('🚫 Popup bloquée détectée');
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log('👋 Popup fermée par l\'utilisateur');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('🔄 Requête popup annulée');
      }
      
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

  // Initialiser le vérificateur reCAPTCHA
  initRecaptchaVerifier(containerId: string): void {
    try {
      if (!this.recaptchaVerifier) {
        this.recaptchaVerifier = new RecaptchaVerifier(this.auth, containerId, {
          size: 'normal',
          callback: () => {
            console.log('✅ reCAPTCHA vérifié avec succès');
          },
          'expired-callback': () => {
            console.log('⏰ reCAPTCHA expiré');
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du reCAPTCHA:', error);
      throw new Error('Fehler beim Initialisieren der Sicherheitsüberprüfung');
    }
  }

  // Envoyer le code de vérification par SMS
  async sendPhoneVerificationCode(phoneNumber: string): Promise<ConfirmationResult> {
    try {
      if (!this.recaptchaVerifier) {
        throw new Error('reCAPTCHA muss zuerst initialisiert werden');
      }

      console.log('📱 Envoi du code de vérification au:', phoneNumber);
      const confirmationResult = await signInWithPhoneNumber(
        this.auth, 
        phoneNumber, 
        this.recaptchaVerifier
      );
      
      console.log('✅ Code de vérification envoyé avec succès');
      return confirmationResult;
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi du code:', error);
      
      // Réinitialiser le reCAPTCHA en cas d'erreur
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
        this.recaptchaVerifier = null;
      }
      
      throw this.handleAuthError(error);
    }
  }

  // Vérifier le code et se connecter
  async verifyPhoneCode(confirmationResult: ConfirmationResult, code: string): Promise<UserProfile> {
    try {
      console.log('🔐 Vérification du code:', code);
      const credential = await confirmationResult.confirm(code);
      
      console.log('✅ Connexion par téléphone réussie');
      return {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: credential.user.displayName,
        photoURL: credential.user.photoURL
      };
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du code:', error);
      throw this.handleAuthError(error);
    }
  }

  // Nettoyer le reCAPTCHA
  clearRecaptcha(): void {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
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

  // Gestion des erreurs d'authentification en allemand
  private handleAuthError(error: any): Error {
    let message = 'Ein Fehler ist aufgetreten';

    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = this.translationService.getErrorMessage('auth/email-already-in-use');
          break;
        case 'auth/weak-password':
          message = this.translationService.getErrorMessage('auth/weak-password');
          break;
        case 'auth/invalid-email':
          message = this.translationService.getErrorMessage('auth/invalid-email');
          break;
        case 'auth/user-not-found':
          message = this.translationService.getErrorMessage('auth/user-not-found');
          break;
        case 'auth/wrong-password':
          message = this.translationService.getErrorMessage('auth/wrong-password');
          break;
        case 'auth/too-many-requests':
          message = 'Zu viele Versuche. Bitte versuchen Sie es später erneut';
          break;
        case 'auth/user-disabled':
          message = 'Dieses Konto wurde deaktiviert';
          break;
        case 'auth/operation-not-allowed':
          message = 'Diese Operation ist nicht erlaubt';
          break;
        case 'auth/popup-closed-by-user':
          message = this.translationService.getErrorMessage('auth/popup-closed-by-user');
          break;
        case 'auth/popup-blocked':
          message = this.translationService.getErrorMessage('auth/popup-blocked');
          break;
        case 'popup-blocked':
          message = this.translationService.getErrorMessage('popup-blocked');
          break;
        case 'auth/cancelled-popup-request':
          message = this.translationService.getErrorMessage('auth/cancelled-popup-request');
          break;
        case 'auth/invalid-phone-number':
          message = 'Ungültige Telefonnummer. Bitte verwenden Sie das Format +49...';
          break;
        case 'auth/invalid-verification-code':
          message = 'Ungültiger Bestätigungscode. Bitte überprüfen Sie den Code';
          break;
        case 'auth/code-expired':
          message = 'Der Bestätigungscode ist abgelaufen. Bitte fordern Sie einen neuen an';
          break;
        case 'auth/missing-phone-number':
          message = 'Bitte geben Sie eine Telefonnummer ein';
          break;
        case 'auth/quota-exceeded':
          message = 'SMS-Limit erreicht. Bitte versuchen Sie es später erneut';
          break;
        default:
          message = this.translationService.getErrorMessage('general-error');
      }
    }

    return new Error(message);
  }
}