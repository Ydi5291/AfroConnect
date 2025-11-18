import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopLeadService, ShopLead } from '../../services/shop-lead.service';
import { LanguageService } from '../../services/language.service';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.css']
})
export class LeadsComponent implements OnInit {
  leads: ShopLead[] = [];
  filteredLeads: ShopLead[] = [];
  isLoading = true;
  
  // Filters
  filterStatus: string = 'all';
  filterCity: string = '';
  filterCategory: string = 'all';
  searchTerm: string = '';
  
  // Stats
  stats = {
    total: 0,
    new: 0,
    contacted: 0,
    interested: 0,
    registered: 0
  };

  // Texts for translations
  texts: any = {};

  constructor(
    private shopLeadService: ShopLeadService,
    private languageService: LanguageService,
    private auth: Auth,
    private router: Router
  ) {}

  async ngOnInit() {
    this.loadTranslations();
    await this.loadLeads();
  }

  loadTranslations() {
    const lang = this.languageService.getCurrentLanguage();
    this.texts = {
      title: lang === 'de' ? 'Lead-Verwaltung' : lang === 'en' ? 'Lead Management' : lang === 'fr' ? 'Gestion des leads' : 'Gestión de leads',
      stats: lang === 'de' ? 'Statistiken' : lang === 'en' ? 'Statistics' : lang === 'fr' ? 'Statistiques' : 'Estadísticas',
      filters: lang === 'de' ? 'Filter' : lang === 'en' ? 'Filters' : lang === 'fr' ? 'Filtres' : 'Filtros',
      search: lang === 'de' ? 'Suchen...' : lang === 'en' ? 'Search...' : lang === 'fr' ? 'Rechercher...' : 'Buscar...',
      allStatus: lang === 'de' ? 'Alle Status' : lang === 'en' ? 'All Status' : lang === 'fr' ? 'Tous les statuts' : 'Todos los estados',
      allCategories: lang === 'de' ? 'Alle Kategorien' : lang === 'en' ? 'All Categories' : lang === 'fr' ? 'Toutes catégories' : 'Todas categorías',
      city: lang === 'de' ? 'Stadt' : lang === 'en' ? 'City' : lang === 'fr' ? 'Ville' : 'Ciudad',
      newLeads: lang === 'de' ? 'Neu' : lang === 'en' ? 'New' : lang === 'fr' ? 'Nouveau' : 'Nuevo',
      contacted: lang === 'de' ? 'Kontaktiert' : lang === 'en' ? 'Contacted' : lang === 'fr' ? 'Contacté' : 'Contactado',
      interested: lang === 'de' ? 'Interessiert' : lang === 'en' ? 'Interested' : lang === 'fr' ? 'Intéressé' : 'Interesado',
      registered: lang === 'de' ? 'Registriert' : lang === 'en' ? 'Registered' : lang === 'fr' ? 'Enregistré' : 'Registrado',
      createAccount: lang === 'de' ? 'Konto erstellen' : lang === 'en' ? 'Create Account' : lang === 'fr' ? 'Créer compte' : 'Crear cuenta',
      contactWhatsApp: lang === 'de' ? 'WhatsApp' : lang === 'en' ? 'WhatsApp' : lang === 'fr' ? 'WhatsApp' : 'WhatsApp',
      changeStatus: lang === 'de' ? 'Status ändern' : lang === 'en' ? 'Change Status' : lang === 'fr' ? 'Changer statut' : 'Cambiar estado',
      exportCSV: lang === 'de' ? 'CSV exportieren' : lang === 'en' ? 'Export CSV' : lang === 'fr' ? 'Exporter CSV' : 'Exportar CSV',
      noLeads: lang === 'de' ? 'Keine Leads gefunden' : lang === 'en' ? 'No leads found' : lang === 'fr' ? 'Aucun lead trouvé' : 'No se encontraron leads',
      phone: lang === 'de' ? 'Telefon' : lang === 'en' ? 'Phone' : lang === 'fr' ? 'Téléphone' : 'Teléfono',
      email: lang === 'de' ? 'E-Mail' : lang === 'en' ? 'Email' : lang === 'fr' ? 'Email' : 'Email',
      category: lang === 'de' ? 'Kategorie' : lang === 'en' ? 'Category' : lang === 'fr' ? 'Catégorie' : 'Categoría',
      created: lang === 'de' ? 'Erstellt' : lang === 'en' ? 'Created' : lang === 'fr' ? 'Créé' : 'Creado',
      actions: lang === 'de' ? 'Aktionen' : lang === 'en' ? 'Actions' : lang === 'fr' ? 'Actions' : 'Acciones',
    };
  }

  async loadLeads() {
    try {
      this.isLoading = true;
      const allLeads = await this.shopLeadService.getAllLeads();
      this.leads = allLeads;
      this.calculateStats();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading leads:', error);
      alert('Fehler beim Laden der Leads');
    } finally {
      this.isLoading = false;
    }
  }

  calculateStats() {
    this.stats.total = this.leads.length;
    this.stats.new = this.leads.filter(l => l.status === 'new').length;
    this.stats.contacted = this.leads.filter(l => l.status === 'contacted').length;
    this.stats.interested = this.leads.filter(l => l.status === 'interested').length;
    this.stats.registered = this.leads.filter(l => l.status === 'registered').length;
  }

  applyFilters() {
    let filtered = [...this.leads];

    // Filter by status
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(lead => lead.status === this.filterStatus);
    }

    // Filter by category
    if (this.filterCategory !== 'all') {
      filtered = filtered.filter(lead => lead.category === this.filterCategory);
    }

    // Filter by city
    if (this.filterCity) {
      filtered = filtered.filter(lead => 
        lead.city.toLowerCase().includes(this.filterCity.toLowerCase())
      );
    }

    // Search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(term) ||
        (lead.ownerName && lead.ownerName.toLowerCase().includes(term)) ||
        lead.phone.toLowerCase().includes(term) ||
        (lead.email && lead.email.toLowerCase().includes(term))
      );
    }

    this.filteredLeads = filtered;
  }

  async createFirebaseAccount(lead: ShopLead) {
    if (!lead.email) {
      alert('Lead hat keine E-Mail-Adresse!');
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
        alert('⚠️ E-Mail-Adresse wird bereits verwendet!');
      } else {
        alert(`Fehler beim Erstellen des Kontos: ${error.message}`);
      }
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

  openWhatsApp(lead: ShopLead) {
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

  async updateStatus(lead: ShopLead, newStatus: string) {
    if (!lead.id) return;

    try {
      await this.shopLeadService.updateLeadStatus(lead.id, newStatus as any);
      await this.loadLeads();
      alert(`Status aktualisiert: ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Fehler beim Aktualisieren des Status');
    }
  }

  exportToCSV() {
    const csv = this.convertToCSV(this.filteredLeads);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `afroconnect-leads-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  convertToCSV(leads: ShopLead[]): string {
    const headers = ['Name', 'Owner', 'Phone', 'Email', 'City', 'Address', 'Category', 'Status', 'Created', 'Notes'];
    const rows = leads.map(lead => [
      lead.name,
      lead.ownerName || '',
      lead.phone,
      lead.email || '',
      lead.city,
      lead.address,
      lead.category,
      lead.status,
      this.formatDate(lead.createdAt),
      lead.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return '-';
    return timestamp.toDate().toLocaleDateString('de-DE');
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'new': return '#fbbf24'; // yellow
      case 'contacted': return '#3b82f6'; // blue
      case 'interested': return '#8b5cf6'; // purple
      case 'registered': return '#10b981'; // green
      default: return '#6b7280'; // gray
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'shop': return '🏪';
      case 'restaurant': return '🍽️';
      case 'salon': return '💇';
      case 'other': return '🏢';
      default: return '📦';
    }
  }
}
