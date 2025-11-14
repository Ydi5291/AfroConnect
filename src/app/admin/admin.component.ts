import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataSeedingService } from '../services/data-seeding.service';
import { AuthService } from '../services/auth.service';
import { FirebaseAfroshopService } from '../services/firebase-afroshop.service';
import { AfroshopData } from '../services/image.service';
import { TranslationService } from '../services/translation.service';
import { AdminSecurityService } from '../services/admin-security.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  isSeeding = false;
  isCleaning = false;
  seedingMessage = '';
  cleaningMessage = '';
  isAuthenticated = false;
  
  // Nouvelles propriétés pour la gestion des Afroshops
  afroshops: AfroshopData[] = [];
  isLoading = false;
  isDeleting = false;
  deleteMessage = '';

  constructor(
    private dataSeedingService: DataSeedingService,
    private authService: AuthService,
    private firebaseAfroshopService: FirebaseAfroshopService,
    private translationService: TranslationService,
    private adminSecurity: AdminSecurityService,
    private router: Router
  ) {
    // Vérifier si l'utilisateur est connecté ET s'il est admin (par UID Firestore)
    this.authService.user$.subscribe(async user => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      // Vérification admin par UID Firestore (comme le guard)
      const { doc, getDoc } = await import('@angular/fire/firestore');
      const firestore = (this.firebaseAfroshopService as any).firestore || (window as any).firestore;
      const adminDocRef = doc(firestore, 'roles/admins');
      const adminDocSnap = await getDoc(adminDocRef);
      const adminDoc = adminDocSnap.data() as { uids: string[] } | undefined;
      this.isAuthenticated = adminDoc?.uids?.includes(user.uid) ?? false;
      if (!this.isAuthenticated) {
        console.warn('🚫 Accès admin refusé: UID non autorisé');
        this.router.navigate(['/gallery']);
      }
    });
  }

  // Suppression de checkAdminAccess : la vérification se fait désormais par UID Firestore

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

  // Navigation vers l'édition d'un Afroshop
  editAfroshop(afroshop: any): void {
    this.router.navigate(['/edit-afroshop', afroshop.id]);
  }

  goToGallery(): void {
    this.router.navigate(['/gallery']);
  }

  goToSuperDashboard(): void {
    this.router.navigate(['/super-dashboard']);
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

  // 📋 Charger la liste des Afroshops
  async loadAfroshops(): Promise<void> {
    this.isLoading = true;
    this.deleteMessage = '';
    
    try {
      this.firebaseAfroshopService.getAllAfroshops().subscribe({
        next: (afroshops) => {
          this.afroshops = afroshops.sort((a, b) => {
            // Trier par nom alphabétiquement
            return a.name.localeCompare(b.name);
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement:', error);
          this.deleteMessage = '❌ Fehler beim Laden der Afroshops.';
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      this.deleteMessage = '❌ Fehler beim Laden der Afroshops.';
      this.isLoading = false;
    }
  }

  // 🗑️ Confirmation de suppression
  async confirmDelete(afroshop: AfroshopData): Promise<void> {
    const confirmed = confirm(
      `🗑️ Afroshop löschen\n\n` +
      `Name: ${afroshop.name}\n` +
      `Typ: ${this.getGermanBusinessType(afroshop.type)}\n` +
      `Adresse: ${afroshop.address}\n\n` +
      `⚠️ Diese Aktion kann nicht rückgängig gemacht werden!\n\n` +
      `Möchten Sie "${afroshop.name}" wirklich löschen?`
    );

    if (!confirmed) return;

    await this.deleteAfroshop(afroshop);
  }

  // 🗑️ Supprimer un Afroshop
  private async deleteAfroshop(afroshop: AfroshopData): Promise<void> {
    this.isDeleting = true;
    this.deleteMessage = `🗑️ "${afroshop.name}" wird gelöscht...`;

    try {
      await this.firebaseAfroshopService.deleteAfroshop(afroshop.id.toString());
      
      // Retirer de la liste locale
      this.afroshops = this.afroshops.filter(a => a.id !== afroshop.id);
      
      this.deleteMessage = `✅ "${afroshop.name}" wurde erfolgreich gelöscht.`;
      
      // Effacer le message après 3 secondes
      setTimeout(() => {
        this.deleteMessage = '';
      }, 3000);
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      this.deleteMessage = `❌ Fehler beim Löschen von "${afroshop.name}". Details in der Konsole.`;
    } finally {
      this.isDeleting = false;
    }
  }

  // 🌍 Traduire le type de business en allemand
  getGermanBusinessType(type: string): string {
    return this.translationService.getBusinessTypeName(type as any);
  }

  // 📅 Formatter la date
  formatDate(timestamp: any): string {
    if (!timestamp) return 'Datum unbekannt';
    
    try {
      let date: Date;
      
      // Gérer les différents formats de timestamp Firebase
      if (timestamp.toDate) {
        date = timestamp.toDate(); // Firestore Timestamp
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000); // Timestamp object
      } else {
        date = new Date(timestamp); // String ou number
      }
      
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur formatage date:', error);
      return 'Datum fehler';
    }
  }

  // 🔄 TrackBy function pour optimiser ngFor
  trackByAfroshop(index: number, afroshop: AfroshopData): any {
    return afroshop.id;
  }
}
