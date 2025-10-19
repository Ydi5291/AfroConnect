import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseAfroshopService } from '../services/firebase-afroshop.service';
import { AuthService } from '../services/auth.service';
import { AfroshopData } from '../services/image.service';

@Component({
  selector: 'app-add-afroshop',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-afroshop.component.html',
  styleUrl: './add-afroshop.component.css'
})
export class AddAfroshopComponent implements OnInit {
  
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
    priceLevel: 0, // Commencer vide pour forcer la sélection
    hours: '',
    website: ''
  };

  // Structure pour les heures d'ouverture
  openingHours = {
    monday: { isOpen: false, open: '09:00', close: '18:00' },
    tuesday: { isOpen: false, open: '09:00', close: '18:00' },
    wednesday: { isOpen: false, open: '09:00', close: '18:00' },
    thursday: { isOpen: false, open: '09:00', close: '18:00' },
    friday: { isOpen: false, open: '09:00', close: '18:00' },
    saturday: { isOpen: false, open: '10:00', close: '16:00' },
    sunday: { isOpen: false, open: '12:00', close: '16:00' }
  };

  // Mode édition
  isEditMode = false;
  editingId: string | null = null;

  // Upload d'image
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploadingImage = false;

  // Import automatique
  importUrl = '';
  isImporting = false;

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private firebaseService: FirebaseAfroshopService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Vérifier si on est en mode édition
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.editingId = id;
      this.loadAfroshopForEdit(id);
    }
  }

  // Charger l'Afroshop pour édition
  async loadAfroshopForEdit(id: string): Promise<void> {
    try {
      const afroshop = await this.firebaseService.getAfroshopById(id);
      if (afroshop) {
        // Assurer que toutes les propriétés sont présentes
        this.afroshop = {
          name: afroshop.name || '',
          type: afroshop.type || 'restaurant',
          address: afroshop.address || '',
          coordinates: afroshop.coordinates || { lat: 0, lng: 0 },
          phone: afroshop.phone || '',
          description: afroshop.description || '',
          rating: afroshop.rating || 4.0,
          image: afroshop.image || '',
          cuisine: afroshop.cuisine || '',
          priceLevel: afroshop.priceLevel || 2,
          hours: afroshop.hours || '',
          website: afroshop.website || ''
        };
        this.imagePreview = afroshop.image || null;
        
        // Parser les heures d'ouverture pour l'interface
        this.parseOpeningHoursFromString(afroshop.hours || '');
      } else {
        this.errorMessage = 'Afroshop nicht gefunden';
        setTimeout(() => this.router.navigate(['/']), 2000);
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error);
      this.errorMessage = 'Fehler beim Laden des Afroshops';
    }
  }

  // Gestion de la sélection d'image
  async onFileSelected(event: any): Promise<void> {
    const file = event.target.files[0];
    this.errorMessage = ''; // Clear previous errors
    
    if (file) {
      console.log('📁 Datei ausgewählt:', file.name, `${(file.size / 1024).toFixed(0)}KB`);
      
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Bitte wählen Sie eine Bilddatei (JPG, PNG, GIF)';
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Bild ist zu groß (max 5MB)';
        return;
      }

      try {
        this.isUploadingImage = true;
        console.log('🗜️ Komprimierung startet...');
        
        // Compresser l'image automatiquement
        const compressedFile = await this.compressImage(file);
        this.selectedFile = compressedFile;
        
        console.log('✅ Komprimierung abgeschlossen');
        
        // Créer une preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreview = e.target.result;
          console.log('👁️ Vorschau erstellt');
        };
        reader.readAsDataURL(compressedFile);
        
      } catch (error) {
        console.error('❌ Komprimierungsfehler:', error);
        this.errorMessage = 'Fehler bei der Bildkomprimierung';
      } finally {
        this.isUploadingImage = false;
      }
    }
  }

  // Test de connexion Firebase Storage
  async testFirebaseConnection(): Promise<void> {
    console.log('🔥 Test Firebase Storage...');
    try {
      console.log('🔍 Storage service:', this.firebaseService);
      console.log('🔍 Storage instance:', (this.firebaseService as any).storage);
      
      // Test avec une vraie image pour éviter problèmes CORS
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText('Test', 30, 55);
      }
      
      // Convertir en blob image
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
      });
      
      const testFile = new File([blob], 'test-image.jpg', { type: 'image/jpeg' });
      console.log('🧪 Test upload avec image générée...', testFile.size, 'bytes');
      
      const url = await this.firebaseService.uploadImage(testFile);
      console.log('✅ Test réussi! URL:', url);
      this.successMessage = 'Firebase Storage fonctionne correctement! Image uploadée.';
    } catch (error) {
      console.error('❌ Test échoué:', error);
      
      // Messages d'erreur plus spécifiques
      if (error instanceof Error) {
        if (error.message.includes('CORS')) {
          this.errorMessage = 'Erreur CORS: Vérifiez les règles Firebase Storage et l\'authentification.';
        } else if (error.message.includes('permission-denied')) {
          this.errorMessage = 'Permission refusée: Connectez-vous et vérifiez les règles Firebase.';
        } else if (error.message.includes('network')) {
          this.errorMessage = 'Erreur réseau: Vérifiez votre connexion internet.';
        } else {
          this.errorMessage = `Erreur Firebase: ${error.message}`;
        }
      } else {
        this.errorMessage = 'Erreur inconnue lors du test Firebase Storage.';
      }
    }
  }

  // Compresser l'image avant upload
  private compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Définir la taille maximale (1200px de largeur)
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          // Calculer les nouvelles dimensions en gardant le ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          // Convertir en Blob avec compression (qualité 0.8)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                console.log(`✅ Image compressée: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB`);
                resolve(compressedFile);
              } else {
                reject(new Error('Compression échouée'));
              }
            },
            'image/jpeg',
            0.8
          );
        };
        img.onerror = () => reject(new Error('Erreur de chargement de l\'image'));
      };
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    });
  }

  // Upload de l'image vers Firebase Storage
  async uploadImage(): Promise<string> {
    if (!this.selectedFile) {
      console.log('📝 Kein neues Bild, behalte das vorhandene');
      return this.afroshop.image; // Garder l'image existante
    }

    this.isUploadingImage = true;
    console.log(`📤 Upload läuft... Größe: ${(this.selectedFile.size / 1024).toFixed(0)}KB`);
    console.log('📁 Datei:', this.selectedFile.name, this.selectedFile.type);
    
    try {
      // Vérifier que Firebase est bien configuré
      console.log('🔥 Service Firebase:', this.firebaseService);
      
      const imageUrl = await this.firebaseService.uploadImage(this.selectedFile);
      console.log('✅ Upload erfolgreich! URL:', imageUrl);
      
      // Mettre à jour l'aperçu avec l'URL Firebase
      this.afroshop.image = imageUrl;
      
      return imageUrl;
    } catch (error) {
      console.error('❌ Detaillierter Upload-Fehler:', error);
      console.error('❌ Fehlertyp:', typeof error);
      console.error('❌ Nachricht:', error instanceof Error ? error.message : 'Unbekannter Fehler');
      
      // Afficher une erreur plus spécifique
      if (error instanceof Error) {
        this.errorMessage = `Upload-Fehler: ${error.message}`;
      } else {
        this.errorMessage = 'Unbekannter Upload-Fehler';
      }
      
      throw error;
    } finally {
      this.isUploadingImage = false;
    }
  }

  // Soumettre le formulaire
  async onSubmit(): Promise<void> {
    if (!this.validateForm()) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.errorMessage = 'Sie müssen angemeldet sein';
        return;
      }

      // Upload de l'image si une nouvelle image est sélectionnée
      if (this.selectedFile) {
        this.afroshop.image = await this.uploadImage();
      }

      // Valeurs par défaut
      if (!this.afroshop.priceLevel || this.afroshop.priceLevel === 0) {
        this.afroshop.priceLevel = 2; // Par défaut modéré
      }
      
      // Nettoyer les champs optionnels
      this.afroshop.website = this.afroshop.website?.trim() || '';
      this.afroshop.cuisine = this.afroshop.cuisine?.trim() || '';
      
      // Convertir les heures d'ouverture en string
      this.afroshop.hours = this.convertOpeningHoursToString();

      const city = this.extractCityFromAddress(this.afroshop.address);
      
      if (this.isEditMode && this.editingId) {
        // Mode édition : mettre à jour l'Afroshop existant
        const updateData = {
          ...this.afroshop,
          city: city,
          updatedBy: currentUser.uid,
          updatedByName: currentUser.displayName || currentUser.email,
          updatedAt: new Date()
        };

        await this.firebaseService.updateAfroshop(this.editingId, updateData);
        this.successMessage = '✅ Afroshop erfolgreich aktualisiert!';
      } else {
        // Mode ajout : créer un nouvel Afroshop
        const newAfroshop = {
          ...this.afroshop,
          verified: false,
          city: city,
          createdBy: currentUser.uid,
          createdByName: currentUser.displayName || currentUser.email,
          createdAt: new Date()
        };

        const docId = await this.firebaseService.addAfroshop(newAfroshop);
        this.successMessage = '✅ Afroshop erfolgreich hinzugefügt! ID: ' + docId;
      }
      
      this.resetForm();
      
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);
      
    } catch (error) {
      console.error('Fehler:', error);
      this.errorMessage = this.isEditMode ? 
        'Fehler beim Aktualisieren des Afroshops' : 
        'Fehler beim Hinzufügen des Afroshops';
    } finally {
      this.isSubmitting = false;
    }
  }

  private validateForm(): boolean {
    if (!this.afroshop.name.trim()) {
      this.errorMessage = 'Name ist erforderlich';
      return false;
    }
    
    if (!this.afroshop.address.trim()) {
      this.errorMessage = 'Adresse ist erforderlich';
      return false;
    }
    
    if (!this.afroshop.phone.trim()) {
      this.errorMessage = 'Telefonnummer ist erforderlich';
      return false;
    }
    
    if (!this.afroshop.description.trim()) {
      this.errorMessage = 'Beschreibung ist erforderlich';
      return false;
    }
    
    // Validation du website si fourni
    if (this.afroshop.website && this.afroshop.website.trim()) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(this.afroshop.website)) {
        this.errorMessage = 'Website URL muss mit http:// oder https:// beginnen';
        return false;
      }
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

  // Convertir les heures d'ouverture en string pour sauvegarde
  private convertOpeningHoursToString(): string {
    const days = [
      { key: 'monday' as const, name: 'Mo' },
      { key: 'tuesday' as const, name: 'Di' },
      { key: 'wednesday' as const, name: 'Mi' },
      { key: 'thursday' as const, name: 'Do' },
      { key: 'friday' as const, name: 'Fr' },
      { key: 'saturday' as const, name: 'Sa' },
      { key: 'sunday' as const, name: 'So' }
    ];

    const openDays: string[] = [];
    
    days.forEach(day => {
      const dayData = this.openingHours[day.key];
      if (dayData.isOpen) {
        openDays.push(`${day.name}: ${dayData.open}-${dayData.close}`);
      }
    });

    return openDays.length > 0 ? openDays.join(', ') : 'Öffnungszeiten nicht angegeben';
  }

  // Convertir string en structure d'heures pour édition
  private parseOpeningHoursFromString(hoursString: string): void {
    if (!hoursString || hoursString === 'Öffnungszeiten nicht angegeben') {
      return;
    }

    // Reset all days
    this.openingHours.monday.isOpen = false;
    this.openingHours.tuesday.isOpen = false;
    this.openingHours.wednesday.isOpen = false;
    this.openingHours.thursday.isOpen = false;
    this.openingHours.friday.isOpen = false;
    this.openingHours.saturday.isOpen = false;
    this.openingHours.sunday.isOpen = false;

    const dayEntries = hoursString.split(',');
    
    dayEntries.forEach(entry => {
      const trimmed = entry.trim();
      const match = trimmed.match(/^(\w+):\s*(\d{2}:\d{2})-(\d{2}:\d{2})$/);
      
      if (match) {
        const [, dayAbbr, openTime, closeTime] = match;
        
        switch(dayAbbr.toLowerCase()) {
          case 'mo':
            this.openingHours.monday = { isOpen: true, open: openTime, close: closeTime };
            break;
          case 'di':
            this.openingHours.tuesday = { isOpen: true, open: openTime, close: closeTime };
            break;
          case 'mi':
            this.openingHours.wednesday = { isOpen: true, open: openTime, close: closeTime };
            break;
          case 'do':
            this.openingHours.thursday = { isOpen: true, open: openTime, close: closeTime };
            break;
          case 'fr':
            this.openingHours.friday = { isOpen: true, open: openTime, close: closeTime };
            break;
          case 'sa':
            this.openingHours.saturday = { isOpen: true, open: openTime, close: closeTime };
            break;
          case 'so':
            this.openingHours.sunday = { isOpen: true, open: openTime, close: closeTime };
            break;
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
