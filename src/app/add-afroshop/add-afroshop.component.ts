import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseAfroshopService } from '../services/firebase-afroshop.service';
import { AuthService } from '../services/auth.service';
import { AfroshopData } from '../services/image.service';

@Component({
  selector: 'app-add-afroshop',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-afroshop.component.html',
  styleUrl: './add-afroshop.component.css'
})
export class AddAfroshopComponent {
  
  afroshop = {
    name: '',
    type: 'restaurant' as AfroshopData['type'],
    address: '',
    coordinates: { lat: 0, lng: 0 },
    phone: '',
    description: '',
    rating: 4.0,
    image: '',
    cuisine: '',
    priceLevel: 2,
    hours: '',
    website: ''
  };

  // Import automatique
  importUrl = '';
  isImporting = false;

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private firebaseService: FirebaseAfroshopService,
    private authService: AuthService,
    private router: Router
  ) { }

  // Soumettre le formulaire
  async onSubmit(): Promise<void> {
    if (!this.validateForm()) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.errorMessage = 'Sie müssen angemeldet sein, um einen Afroshop hinzuzufügen';
        return;
      }

      const city = this.extractCityFromAddress(this.afroshop.address);
      
      const newAfroshop = {
        ...this.afroshop,
        verified: false,
        city: city,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email,
        createdAt: new Date()
      };

      const docId = await this.firebaseService.addAfroshop(newAfroshop);
      
      this.successMessage = 'Afroshop erfolgreich hinzugefügt! ID: ' + docId;
      this.resetForm();
      
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      this.errorMessage = 'Fehler beim Hinzufügen des Afroshops.';
    } finally {
      this.isSubmitting = false;
    }
  }

  private validateForm(): boolean {
    if (!this.afroshop.name.trim()) {
      this.errorMessage = 'Name ist erforderlich';
      return false;
    }
    
    // Auto-définir les coordonnées si l'adresse contient une ville connue
    this.setCoordinatesFromAddress();
    
    return true;
  }

  private setCoordinatesFromAddress(): void {
    if (this.afroshop.coordinates.lat === 0 && this.afroshop.coordinates.lng === 0) {
      const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
        'berlin': { lat: 52.5200, lng: 13.4050 },
        'hamburg': { lat: 53.5511, lng: 9.9937 },
        'münchen': { lat: 48.1351, lng: 11.5820 },
        'köln': { lat: 50.9375, lng: 6.9603 },
        'frankfurt': { lat: 50.1109, lng: 8.6821 },
        'stuttgart': { lat: 48.7758, lng: 9.1829 },
        'düsseldorf': { lat: 51.2277, lng: 6.7735 },
        'dortmund': { lat: 51.5136, lng: 7.4653 },
        'essen': { lat: 51.4556, lng: 7.0116 },
        'leipzig': { lat: 51.3397, lng: 12.3731 },
        'bremen': { lat: 53.0793, lng: 8.8017 },
        'dresden': { lat: 51.0504, lng: 13.7373 },
        'hannover': { lat: 52.3759, lng: 9.7320 },
        'nürnberg': { lat: 49.4521, lng: 11.0767 }
      };

      const addressLower = this.afroshop.address.toLowerCase();
      for (const [city, coords] of Object.entries(cityCoordinates)) {
        if (addressLower.includes(city)) {
          this.afroshop.coordinates = coords;
          console.log(`Coordonnées définies automatiquement pour ${city}:`, coords);
          break;
        }
      }
    }
  }

  private resetForm(): void {
    this.afroshop = {
      name: '', type: 'restaurant', address: '', coordinates: { lat: 0, lng: 0 },
      phone: '', description: '', rating: 4.0, image: '', cuisine: '', priceLevel: 2, hours: '', website: ''
    };
  }

  private extractCityFromAddress(address: string): string {
    const cities = ['berlin', 'hamburg', 'münchen', 'köln', 'frankfurt', 'dortmund'];
    const addressLower = address.toLowerCase();
    for (const city of cities) {
      if (addressLower.includes(city)) return city;
    }
    return 'unknown';
  }

  async importFromUrl(): Promise<void> {
    if (!this.importUrl.trim()) {
      this.errorMessage = 'Bitte geben Sie eine gültige URL ein';
      return;
    }

    this.isImporting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // Détection du type d'URL
      if (this.importUrl.includes('google.com/maps') || this.importUrl.includes('goo.gl/maps')) {
        await this.importFromGoogleMaps();
      } else if (this.importUrl.includes('nextdoor.')) {
        await this.importFromNextdoor();
      } else if (this.importUrl.includes('facebook.com') || this.importUrl.includes('fb.com')) {
        await this.importFromFacebook();
      } else {
        await this.importFromGenericWebsite();
      }
      
      this.successMessage = 'Informationen erfolgreich importiert! Überprüfen Sie die Felder und ergänzen Sie bei Bedarf.';
    } catch (error) {
      console.error('Import error:', error);
      this.errorMessage = 'Fehler beim Importieren der Daten. Bitte versuchen Sie es manuell.';
    } finally {
      this.isImporting = false;
    }
  }

  private async importFromGoogleMaps(): Promise<void> {
    // Extraction des informations depuis Google Maps
    const placeName = this.extractPlaceNameFromGoogleMapsUrl(this.importUrl);
    if (placeName) {
      this.afroshop.name = placeName;
      this.afroshop.description = `Afrikanisches Geschäft/Restaurant gefunden auf Google Maps`;
    }
  }

  private async importFromNextdoor(): Promise<void> {
    // Extraction des informations depuis Nextdoor
    const urlParts = this.importUrl.split('/');
    const pageName = urlParts.find(part => part.includes('-'))?.replace(/-/g, ' ') || '';
    
    if (pageName) {
      this.afroshop.name = this.capitalizeWords(pageName);
      this.afroshop.description = `Afrikanisches Geschäft gefunden auf Nextdoor`;
      
      // Extraction de la ville depuis l'URL
      const cityMatch = pageName.match(/(berlin|hamburg|münchen|köln|frankfurt|dortmund|essen|düsseldorf)/i);
      if (cityMatch) {
        this.afroshop.address = cityMatch[1];
      }
    }
  }

  private async importFromFacebook(): Promise<void> {
    // Extraction des informations depuis Facebook
    try {
      // Exemple: https://www.facebook.com/p/Afro-Center-N-1-100069192167484/
      const urlParts = this.importUrl.split('/');
      let businessName = '';
      
      // Recherche du nom dans l'URL
      const nameIndex = urlParts.findIndex(part => part === 'p');
      if (nameIndex !== -1 && urlParts[nameIndex + 1]) {
        // Format: /p/Business-Name-123456/
        businessName = urlParts[nameIndex + 1].split('-').slice(0, -1).join(' ');
      } else {
        // Format classique: /BusinessName/
        const possibleName = urlParts.find(part => 
          part && 
          part !== 'www.facebook.com' && 
          part !== 'facebook.com' && 
          part !== 'p' && 
          !part.match(/^\d+$/) && 
          part.length > 2
        );
        if (possibleName) {
          businessName = possibleName.replace(/-/g, ' ');
        }
      }
      
      if (businessName) {
        this.afroshop.name = this.capitalizeWords(businessName);
        this.afroshop.description = `Afrikanisches Geschäft gefunden auf Facebook`;
        this.afroshop.website = this.importUrl;
        this.afroshop.type = 'services'; // Par défaut
        
        // Essayer de détecter le type depuis le nom
        const nameLower = businessName.toLowerCase();
        if (nameLower.includes('restaurant') || nameLower.includes('food') || nameLower.includes('cuisine')) {
          this.afroshop.type = 'restaurant';
        } else if (nameLower.includes('shop') || nameLower.includes('store') || nameLower.includes('market')) {
          this.afroshop.type = 'epicerie';
        } else if (nameLower.includes('hair') || nameLower.includes('coiffeur') || nameLower.includes('salon')) {
          this.afroshop.type = 'coiffeur';
        } else if (nameLower.includes('mode') || nameLower.includes('fashion') || nameLower.includes('clothing')) {
          this.afroshop.type = 'vetement';
        }
        
        console.log('Facebook import successful:', businessName);
      } else {
        throw new Error('Impossible d\'extraire le nom depuis l\'URL Facebook');
      }
    } catch (error) {
      console.error('Erreur lors de l\'import Facebook:', error);
      // Fallback
      this.afroshop.website = this.importUrl;
      this.afroshop.description = 'Afrikanisches Geschäft gefunden auf Facebook';
      this.afroshop.name = 'Facebook Business';
    }
  }

  private async importFromGenericWebsite(): Promise<void> {
    // Import basique pour d'autres sites web
    try {
      const url = new URL(this.importUrl);
      const domain = url.hostname.replace('www.', '');
      
      // Extraction du nom basé sur le domaine
      let businessName = domain.split('.')[0];
      businessName = this.capitalizeWords(businessName.replace(/[-_]/g, ' '));
      
      this.afroshop.name = businessName;
      this.afroshop.website = this.importUrl;
      this.afroshop.description = `Afrikanisches Geschäft gefunden auf ${domain}`;
      this.afroshop.type = 'services'; // Par défaut
      
      // Essayer de détecter le type depuis le nom de domaine
      const domainLower = domain.toLowerCase();
      if (domainLower.includes('restaurant') || domainLower.includes('food') || domainLower.includes('cuisine')) {
        this.afroshop.type = 'restaurant';
      } else if (domainLower.includes('shop') || domainLower.includes('store') || domainLower.includes('market')) {
        this.afroshop.type = 'epicerie';
      } else if (domainLower.includes('hair') || domainLower.includes('coiffeur') || domainLower.includes('salon')) {
        this.afroshop.type = 'coiffeur';
      } else if (domainLower.includes('mode') || domainLower.includes('fashion') || domainLower.includes('clothing')) {
        this.afroshop.type = 'vetement';
      }
      
      console.log(`Site web générique importé: ${businessName} (${domain})`);
      
    } catch (error) {
      console.error('Erreur lors de l\'import du site web:', error);
      // Fallback simple
      this.afroshop.website = this.importUrl;
      this.afroshop.description = 'Site web afrikanisches Geschäft';
      this.afroshop.name = 'Nouveau Afroshop';
    }
  }

  private extractPlaceNameFromGoogleMapsUrl(url: string): string {
    // Extraction du nom depuis l'URL Google Maps
    const match = url.match(/place\/([^\/]+)/);
    if (match) {
      return decodeURIComponent(match[1]).replace(/\+/g, ' ');
    }
    return '';
  }

  private capitalizeWords(str: string): string {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
