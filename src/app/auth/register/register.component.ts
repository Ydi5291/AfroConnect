import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  email = '';
  password = '';
  confirmPassword = '';
  displayName = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password || !this.confirmPassword || !this.displayName) {
      this.errorMessage = 'Bitte füllen Sie alle Felder aus';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Die Passwörter stimmen nicht überein';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Das Passwort muss mindestens 6 Zeichen enthalten';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.register(this.email, this.password, this.displayName);
      this.router.navigate(['/gallery']);
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
      await this.authService.loginWithGoogle();
      this.router.navigate(['/gallery']);
    } catch (error) {
      const errorMsg = (error as Error).message;
      
      // Gestion spéciale pour popup fermée ou bloquée
      if (errorMsg.includes('annulée') || errorMsg.includes('Connexion annulée')) {
        this.showGoogleLoginDialog();
      } else if (errorMsg.includes('bloquée') || errorMsg.includes('popup')) {
        this.showPopupBlockedDialog();
      } else {
        this.errorMessage = errorMsg;
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
