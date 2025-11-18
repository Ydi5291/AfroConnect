import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';
import { ConfirmationResult } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  private langSub?: Subscription;
  
  // Email/Password
  email = '';
  password = '';
  
  // Phone
  phoneNumber = '';
  verificationCode = '';
  confirmationResult: ConfirmationResult | null = null;
  isPhoneMode = false;
  isCodeSent = false;
  
  // UI State
  isLoading = false;
  errorMessage = '';
  activeMethod: 'email' | 'phone' | 'google' = 'email';
  
  texts = {
    title: 'Anmeldung',
    subtitle: 'Melden Sie sich bei Ihrem AfroConnect-Konto an',
    
    // Méthodes
    methodEmail: 'E-Mail-Adresse',
    methodPhone: 'Telefon',
    methodGoogle: 'Google',
    
    // Email
    email: 'E-Mail-Adresse',
    password: 'Passwort',
    emailPlaceholder: 'ihre@email.com',
    passwordPlaceholder: '••••••••',
    
    // Phone
    phone: 'Telefonnummer',
    phonePlaceholder: '+49 123 456789',
    phoneHint: 'Format: +49 für Deutschland',
    verificationCode: 'Bestätigungscode',
    codePlaceholder: '123456',
    sendCode: 'Code senden',
    resendCode: 'Code erneut senden',
    
    // Boutons
    submit: 'Anmelden',
    verify: 'Code bestätigen',
    loading: 'Anmeldung...',
    googleBtn: 'Mit Google fortfahren',
    googleLoading: 'Google-Anmeldung...',
    
    // Autres
    noAccount: 'Noch kein Konto?',
    register: 'Registrieren',
    or: 'oder',
    fillFields: 'Bitte füllen Sie alle Felder aus',
    chooseMethod: 'Wählen Sie Ihre Anmeldemethode'
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private languageService: LanguageService
  ) {}
  
  ngOnInit() {
    this.langSub = this.languageService.currentLanguage$.subscribe(() => {
      this.updateTranslations();
    });
    this.updateTranslations();
    
    // Initialiser le reCAPTCHA après un court délai pour que le DOM soit prêt
    if (this.activeMethod === 'phone') {
      setTimeout(() => {
        this.initRecaptcha();
      }, 500);
    }
  }
  
  updateTranslations() {
    this.texts = {
      title: this.languageService.translate('login.title'),
      subtitle: this.languageService.translate('login.subtitle'),
      
      // Méthodes
      methodEmail: 'E-Mail-Adresse',
      methodPhone: 'Telefon',
      methodGoogle: 'Google',
      
      // Email
      email: this.languageService.translate('login.email'),
      password: this.languageService.translate('login.password'),
      emailPlaceholder: 'ihre@email.com',
      passwordPlaceholder: '••••••••',
      
      // Phone
      phone: 'Telefonnummer',
      phonePlaceholder: '+49 123 456789',
      phoneHint: 'Format: +49 für Deutschland',
      verificationCode: 'Bestätigungscode',
      codePlaceholder: '123456',
      sendCode: 'Code senden',
      resendCode: 'Code erneut senden',
      
      // Boutons
      submit: this.languageService.translate('login.submit'),
      verify: 'Code bestätigen',
      loading: this.languageService.translate('login.loading'),
      googleBtn: this.languageService.translate('login.googleBtn'),
      googleLoading: this.languageService.translate('login.googleLoading'),
      
      // Autres
      noAccount: this.languageService.translate('login.noAccount'),
      register: this.languageService.translate('login.register'),
      or: this.languageService.translate('login.or'),
      fillFields: this.languageService.translate('login.fillFields'),
      chooseMethod: 'Wählen Sie Ihre Anmeldemethode'
    };
  }

  async onSubmit(): Promise<void> {
    if (this.activeMethod === 'email') {
      await this.loginWithEmail();
    } else if (this.activeMethod === 'phone') {
      if (this.isCodeSent) {
        await this.verifyCode();
      } else {
        await this.sendVerificationCode();
      }
    }
  }

  async loginWithEmail(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorMessage = this.texts.fillFields;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.email, this.password);
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/gallery';
      this.router.navigate([returnUrl]);
    } catch (error) {
      this.errorMessage = (error as Error).message;
    } finally {
      this.isLoading = false;
    }
  }

  switchMethod(method: 'email' | 'phone' | 'google'): void {
    this.activeMethod = method;
    this.errorMessage = '';
    this.isCodeSent = false;
    
    // Initialiser reCAPTCHA si on passe en mode téléphone
    if (method === 'phone') {
      setTimeout(() => {
        this.initRecaptcha();
      }, 100);
    } else {
      // Nettoyer reCAPTCHA si on quitte le mode téléphone
      this.authService.clearRecaptcha();
    }
  }

  initRecaptcha(): void {
    try {
      this.authService.initRecaptchaVerifier('recaptcha-container');
    } catch (error) {
      console.error('Erreur initialisation reCAPTCHA:', error);
      this.errorMessage = 'Fehler beim Laden der Sicherheitsüberprüfung';
    }
  }

  async sendVerificationCode(): Promise<void> {
    if (!this.phoneNumber) {
      this.errorMessage = 'Bitte geben Sie eine Telefonnummer ein';
      return;
    }

    // Valider le format (doit commencer par +)
    if (!this.phoneNumber.startsWith('+')) {
      this.errorMessage = 'Die Telefonnummer muss mit + beginnen (z.B. +49...)';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.confirmationResult = await this.authService.sendPhoneVerificationCode(this.phoneNumber);
      this.isCodeSent = true;
      console.log('✅ Code envoyé avec succès');
    } catch (error) {
      console.error('❌ Erreur envoi code:', error);
      this.errorMessage = (error as Error).message;
      
      // Réinitialiser le reCAPTCHA en cas d'erreur
      setTimeout(() => {
        this.initRecaptcha();
      }, 100);
    } finally {
      this.isLoading = false;
    }
  }

  async verifyCode(): Promise<void> {
    if (!this.verificationCode || !this.confirmationResult) {
      this.errorMessage = 'Bitte geben Sie den Bestätigungscode ein';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.verifyPhoneCode(this.confirmationResult, this.verificationCode);
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/gallery';
      this.router.navigate([returnUrl]);
    } catch (error) {
      this.errorMessage = (error as Error).message;
    } finally {
      this.isLoading = false;
    }
  }

  resendCode(): void {
    this.isCodeSent = false;
    this.verificationCode = '';
    this.confirmationResult = null;
    
    // Réinitialiser le reCAPTCHA
    this.authService.clearRecaptcha();
    setTimeout(() => {
      this.initRecaptcha();
    }, 100);
  }

  async loginWithGoogle(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      console.log('🔐 Tentative de connexion Google...');
      const userProfile = await this.authService.loginWithGoogle();
      console.log('✅ Connexion Google réussie:', userProfile);
      
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/gallery';
      this.router.navigate([returnUrl]);
    } catch (error) {
      console.error('❌ Erreur connexion Google:', error);
      const errorMsg = (error as Error).message;
      
      // Diagnostic détaillé
      if (error instanceof Error) {
        console.log('Type d\'erreur:', error.name);
        console.log('Code d\'erreur:', (error as any).code);
        console.log('Message complet:', error.message);
      }
      
      // Gestion spéciale pour popup fermée ou bloquée
      if (errorMsg.includes('annulée') || errorMsg.includes('Connexion annulée') || 
          errorMsg.includes('popup-closed-by-user') || errorMsg.includes('cancelled')) {
        this.showGoogleLoginDialog();
      } else if (errorMsg.includes('bloquée') || errorMsg.includes('popup') || 
                 errorMsg.includes('popup-blocked')) {
        this.showPopupBlockedDialog();
      } else {
        this.errorMessage = `Erreur de connexion: ${errorMsg}`;
      }
    } finally {
      this.isLoading = false;
    }
  }

  private showGoogleLoginDialog(): void {
    if (confirm(
      '🔐 Connexion Google interrompue\n\n' +
      '• La popup de connexion a été fermée avant la fin\n' +
      '• Souhaitez-vous réessayer?\n\n' +
      'Conseils:\n' +
      '✓ Gardez la popup ouverte pendant la connexion\n' +
      '✓ Vérifiez que les popups ne sont pas bloquées\n' +
      '✓ Utilisez votre compte Google habituel\n\n' +
      'Réessayer maintenant?'
    )) {
      // Petit délai pour éviter les conflits
      setTimeout(() => {
        this.loginWithGoogle();
      }, 500);
    }
  }

  private showPopupBlockedDialog(): void {
    if (confirm(
      '🚫 Popups bloquées par le navigateur\n\n' +
      '• Votre navigateur bloque les popups d\'AfroConnect\n' +
      '• Pour vous connecter avec Google, vous devez:\n\n' +
      'Instructions:\n' +
      '1. Cliquez sur l\'icône 🛡️ dans la barre d\'adresse\n' +
      '2. Autorisez les popups pour ce site\n' +
      '3. Rechargez la page si nécessaire\n\n' +
      'Réessayer maintenant?'
    )) {
      // Petit délai pour laisser le temps d'autoriser
      setTimeout(() => {
        this.loginWithGoogle();
      }, 1000);
    } else {
      this.errorMessage = 'Utilisez la connexion par email/mot de passe en attendant';
    }
  }
  
  ngOnDestroy() {
    this.langSub?.unsubscribe();
    // Nettoyer le reCAPTCHA
    this.authService.clearRecaptcha();
  }
}
