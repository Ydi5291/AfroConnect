import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataSeedingService } from '../services/data-seeding.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  isSeeding = false;
  isCleaning = false;
  seedingMessage = '';
  cleaningMessage = '';
  isAuthenticated = false;

  constructor(
    private dataSeedingService: DataSeedingService,
    private authService: AuthService,
    private router: Router
  ) {
    // Vérifier si l'utilisateur est connecté ET s'il est admin
    this.authService.user$.subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      
      // 🔐 Vérification des droits admin
      this.checkAdminAccess(user);
    });
  }

  private checkAdminAccess(user: any) {
    // 🔐 Seuls ces emails peuvent accéder à l'admin
    const adminEmails = [
      'youssoufdiamaldiallo@gmail.com', 
      'admin@afroconnect.de'  // Email admin si besoin
    ];
    
    this.isAuthenticated = user && user.email && adminEmails.includes(user.email);
    
    if (!this.isAuthenticated) {
      console.warn('🚫 Accès admin refusé pour:', user.email);
      this.router.navigate(['/gallery']);
    }
  }

  async seedDatabase(): Promise<void> {
    if (!this.isAuthenticated) {
      this.seedingMessage = '❌ Vous devez être connecté pour effectuer cette action';
      return;
    }

    if (this.isSeeding) return;

    const confirmed = confirm(
      '🚨 ACHTUNG!\n\n' +
      'Diese Aktion wird etwa 50+ neue Afroshops in die Datenbank hinzufügen.\n\n' +
      '🔍 Bereits vorhandene Geschäfte werden automatisch übersprungen.\n\n' +
      'Möchten Sie fortfahren?'
    );

    if (!confirmed) return;

    this.isSeeding = true;
    this.seedingMessage = '🌱 Import läuft... Dies kann einige Minuten dauern.';

    try {
      await this.dataSeedingService.seedDatabase();
            this.seedingMessage = '✅ Datenbank erfolgreich mit neuen Afroshops gefüllt!';
    } catch (error) {
      console.error('Fehler beim Seeding:', error);
      this.seedingMessage = '❌ Fehler beim Import. Konsole für Details überprüfen.';
    } finally {
      this.isSeeding = false;
    }
  }

  goToGallery(): void {
    this.router.navigate(['/gallery']);
  }

  // 🧹 Nettoyer les doublons
  async cleanDuplicates(): Promise<void> {
    if (!this.isAuthenticated) {
      this.cleaningMessage = '❌ Sie müssen angemeldet sein, um diese Aktion durchzuführen';
      return;
    }

    if (this.isCleaning) return;

    const confirmed = confirm(
      '🧹 DOUBLONS NETTOYAGE\n\n' +
      'Diese Aktion wird alle doppelten Afroshops löschen.\n\n' +
      '⚠️ Nur das erste Exemplar jedes Geschäfts wird beibehalten.\n\n' +
      'Möchten Sie fortfahren?'
    );

    if (!confirmed) return;

    this.isCleaning = true;
    this.cleaningMessage = '🧹 Doublons werden entfernt... Bitte warten.';

    try {
      const result = await this.dataSeedingService.cleanDuplicates();
      this.cleaningMessage = `✅ Nettoyage abgeschlossen! ${result.removed} Doublons entfernt, ${result.kept} Afroshops beibehalten.`;
    } catch (error) {
      console.error('Fehler beim Nettoyage:', error);
      this.cleaningMessage = '❌ Fehler beim Nettoyage. Konsole für Details überprüfen.';
    } finally {
      this.isCleaning = false;
    }
  }
}
