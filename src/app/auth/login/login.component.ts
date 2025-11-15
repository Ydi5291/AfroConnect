import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  private langSub?: Subscription;
  
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  
  texts = {
    title: 'Anmeldung',
    subtitle: 'Melden Sie sich bei Ihrem AfroConnect-Konto an',
    email: 'E-Mail-Adresse',
    password: 'Passwort',
    submit: 'Anmelden',
    loading: 'Anmeldung...',
    googleBtn: 'Mit Google fortfahren',
    googleLoading: 'Google-Anmeldung...',
    noAccount: 'Noch kein Konto?',
    register: 'Registrieren',
    or: 'oder',
    fillFields: 'Bitte füllen Sie alle Felder aus'
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
  }
  
  updateTranslations() {
    this.texts = {
      title: this.languageService.translate('login.title'),
      subtitle: this.languageService.translate('login.subtitle'),
      email: this.languageService.translate('login.email'),
      password: this.languageService.translate('login.password'),
      submit: this.languageService.translate('login.submit'),
      loading: this.languageService.translate('login.loading'),
      googleBtn: this.languageService.translate('login.googleBtn'),
      googleLoading: this.languageService.translate('login.googleLoading'),
      noAccount: this.languageService.translate('login.noAccount'),
      register: this.languageService.translate('login.register'),
      or: this.languageService.translate('login.or'),
      fillFields: this.languageService.translate('login.fillFields')
    };
  }

  async onSubmit(): Promise<void> {
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
  }
}
