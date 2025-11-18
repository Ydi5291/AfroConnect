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
import { ShopLeadService, ShopLead } from '../services/shop-lead.service';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

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

  // Nouvelles propriétés pour la gestion des leads
  leads: ShopLead[] = [];
  leadsLoaded = false;
  isLoadingLeads = false;
  isCreatingAccount = false;
  leadMessage = '';
  leadsStats = {
    total: 0,
    new: 0,
    contacted: 0,
    interested: 0,
    registered: 0
  };

  constructor(
    private dataSeedingService: DataSeedingService,
    private authService: AuthService,
    private firebaseAfroshopService: FirebaseAfroshopService,
    private translationService: TranslationService,
    private adminSecurity: AdminSecurityService,
    private router: Router,
    private shopLeadService: ShopLeadService,
    private auth: Auth
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

  // ===== GESTION DES LEADS =====

  async loadLeads() {
    try {
      this.isLoadingLeads = true;
      this.leadMessage = '';
      const allLeads = await this.shopLeadService.getAllLeads();
      this.leads = allLeads.sort((a, b) => {
        // Trier par date (plus récent en premier)
        const dateA = (a.createdAt as any)?.seconds || 0;
        const dateB = (b.createdAt as any)?.seconds || 0;
        return dateB - dateA;
      });
      this.calculateLeadsStats();
      this.leadsLoaded = true;
    } catch (error) {
      console.error('Error loading leads:', error);
      this.leadMessage = '❌ Fehler beim Laden der Leads';
    } finally {
      this.isLoadingLeads = false;
    }
  }

  calculateLeadsStats() {
    this.leadsStats.total = this.leads.length;
    this.leadsStats.new = this.leads.filter(l => l.status === 'new').length;
    this.leadsStats.contacted = this.leads.filter(l => l.status === 'contacted').length;
    this.leadsStats.interested = this.leads.filter(l => l.status === 'interested').length;
    this.leadsStats.registered = this.leads.filter(l => l.status === 'registered').length;
  }

  async createFirebaseAccount(lead: ShopLead) {
    if (!lead.email) {
      this.leadMessage = '❌ Lead hat keine E-Mail-Adresse!';
      return;
    }

    const confirmed = confirm(
      `Firebase-Konto erstellen für:\n\n` +
      `Name: ${lead.name}\n` +
      `E-Mail: ${lead.email}\n\n` +
      `Ein temporäres Passwort wird generiert und angezeigt.`
    );

    if (!confirmed) return;

    try {
      this.isCreatingAccount = true;
      this.leadMessage = '';

      // Generate temporary password
      const tempPassword = this.generatePassword();

      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        lead.email,
        tempPassword
      );

      // Update lead status to 'registered'
      if (lead.id) {
        await this.shopLeadService.updateLeadStatus(
          lead.id,
          'registered',
          `Firebase account created. UID: ${userCredential.user.uid}`
        );
      }

      // Show credentials to admin
      this.leadMessage = `✅ Konto erfolgreich erstellt!\n\nE-Mail: ${lead.email}\nPasswort: ${tempPassword}\n\n⚠️ WICHTIG: Notiere das Passwort und sende es dem Eigentümer!`;
      
      alert(
        `✅ Konto erfolgreich erstellt!\n\n` +
        `E-Mail: ${lead.email}\n` +
        `Passwort: ${tempPassword}\n\n` +
        `⚠️ WICHTIG: Notiere das Passwort und sende es dem Eigentümer per WhatsApp/E-Mail!`
      );

      // Reload leads
      await this.loadLeads();

    } catch (error: any) {
      console.error('Error creating Firebase account:', error);
      if (error.code === 'auth/email-already-in-use') {
        this.leadMessage = '⚠️ E-Mail-Adresse wird bereits verwendet!';
      } else {
        this.leadMessage = `❌ Fehler beim Erstellen des Kontos: ${error.message}`;
      }
    } finally {
      this.isCreatingAccount = false;
    }
  }

  generatePassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let password = 'AfroConnect';
    for (let i = 0; i < 6; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  openLeadWhatsApp(lead: ShopLead) {
    const message = encodeURIComponent(
      `Hallo ${lead.ownerName || 'dort'},\n\n` +
      `Vielen Dank für Ihr Interesse an AfroConnect!\n\n` +
      `Ich habe Ihre Registrierung für "${lead.name}" in ${lead.city} erhalten.\n\n` +
      `Können wir kurz über die nächsten Schritte sprechen?\n\n` +
      `Viele Grüße,\nAfroConnect Team`
    );
    const phoneNumber = lead.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  }

  async updateLeadStatus(lead: ShopLead, newStatus: string) {
    if (!lead.id) return;

    try {
      await this.shopLeadService.updateLeadStatus(lead.id, newStatus as any);
      this.leadMessage = `✅ Status aktualisiert: ${newStatus}`;
      await this.loadLeads();
    } catch (error) {
      console.error('Error updating lead status:', error);
      this.leadMessage = '❌ Fehler beim Aktualisieren des Status';
    }
  }

  getLeadCategoryIcon(category: string): string {
    switch (category) {
      case 'shop': return '🏪';
      case 'restaurant': return '🍽️';
      case 'salon': return '💇';
      case 'other': return '🏢';
      default: return '📦';
    }
  }

  getLeadStatusText(status: string): string {
    switch (status) {
      case 'new': return 'Neu';
      case 'contacted': return 'Kontaktiert';
      case 'interested': return 'Interessiert';
      case 'registered': return 'Registriert';
      default: return status;
    }
  }
}
