import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorMessage = 'Bitte füllen Sie alle Felder aus';
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
      // Petit délai pour laisser le temps d\'autoriser
      setTimeout(() => {
        this.loginWithGoogle();
      }, 1000);
    } else {
      this.errorMessage = 'Utilisez la connexion par email/mot de passe en attendant';
    }
  }
}
