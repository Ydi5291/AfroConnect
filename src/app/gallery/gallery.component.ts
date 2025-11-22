import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AfroshopService, AfroshopData } from '../services/image.service';
import { GeocodingService } from '../services/geocoding.service';
import { FirebaseAfroshopService } from '../services/firebase-afroshop.service';
import { AuthService } from '../services/auth.service';
import { TranslationService } from '../services/translation.service';
import { LanguageService } from '../services/language.service';
import { MapComponent } from '../map/map.component';
import { GeolocationService } from '../services/geolocation.service';
import { Observable, Subscription } from 'rxjs';
import { User } from '@angular/fire/auth';
import { SEOService } from '../services/seo.service';
import { JsonLdService } from '../services/json-ld.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule, MapComponent],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit, OnDestroy {
  private langSub?: Subscription;
  private seoService = inject(SEOService);
  private jsonLdService = inject(JsonLdService);
  
  // Translated texts
  texts = {
    discover: 'Entdecke',
    shopsNearYou: 'afrikanische Geschäfte in deiner Nähe',
    addShopBtn: 'Geschäft hinzufügen',
    filterByType: 'Nach Type filtern:',
    allTypes: 'Alle Typen',
    activateGPS: 'GPS aktivieren',
    searchRadius: 'Suche in 50km Umkreis',
    around: 'um',
    yourLocation: 'deinen Standort',
    resultsCount: 'von',
    shopsDisplayed: 'Afroshops angezeigt',
    yourCity: 'Deine Stadt:',
    anyCityPlaceholder: 'Jede deutsche Stadt...',
    search: 'Suchen',
    popularCities: 'Beliebte Städte...',
    confirm: 'Bestätigen',
    viewDetails: 'Details ansehen',
    showOnMap: 'Karte anzeigen',
    route: 'Route',
    edit: 'Bearbeiten',
    restaurant: 'Restaurant',
    epicerie: 'Lebensmittelgeschäft',
    coiffeur: 'Friseur',
    vetement: 'Bekleidung',
    services: 'Dienstleistungen',
    noResults: 'Kein Geschäft gefunden',
    noResultsMessage: 'Es gibt derzeit keine afrikanischen Geschäfte in dieser Region.',
    noResultsCity: 'Keine Geschäfte in {{city}} gefunden.',
    noResultsGPS: 'Keine Geschäfte in einem Umkreis von 50 km gefunden.',
    backToGallery: 'Zurück zur vollständigen Galerie',
    tryAnother: 'Versuche eine andere Stadt'
  };
  
  getGoogleMapsUrl(address: string): string {
    if (!address) return 'https://maps.google.com';
    const encoded = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  }

  getGoogleMapsRouteUrl(address: string): string {
    if (!address) return 'https://maps.google.com';
    const encoded = encodeURIComponent(address);
    return `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
  }
  directionsService: any = null;
  travelDurations: { [shopId: string]: { driving?: string; walking?: string } } = {};
  allAfroshops: AfroshopData[] = [];
  filteredAfroshops: AfroshopData[] = [];
  searchTerm: string = '';
  selectedType: AfroshopData['type'] | '' = '';
  selectedCity: string = '';
  customCityName: string = '';
  showMap: boolean = false;
  userLocation: { lat: number; lng: number } | null = null;
  user$: Observable<User | null>;
  isAdmin: boolean = false;


  goToAddAfroshop(): void {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.router.navigate(['/add-afroshop']);
      } else {
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/add-afroshop' } });
      }
    });
  }

  openSettings(): void {
    this.router.navigate(['/admin']);
  }

  private cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
    // 🇩🇪 Allemagne
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
    'nürnberg': { lat: 49.4521, lng: 11.0767 },

    // NRW
    'hamm': { lat: 51.6781, lng: 7.8209 },
    'siegen': { lat: 50.8748, lng: 8.0243 },
    
    // 🇫🇷 France
    'paris': { lat: 48.8566, lng: 2.3522 },
    'marseille': { lat: 43.2965, lng: 5.3698 },
    'lyon': { lat: 45.7640, lng: 4.8357 },
    'toulouse': { lat: 43.6047, lng: 1.4442 },
    'nice': { lat: 43.7102, lng: 7.2620 },
    'nantes': { lat: 47.2184, lng: -1.5536 },
    'strasbourg': { lat: 48.5734, lng: 7.7521 },
    'montpellier': { lat: 43.6108, lng: 3.8767 },
    'bordeaux': { lat: 44.8378, lng: -0.5792 },
    'lille': { lat: 50.6292, lng: 3.0573 },
    
    // 🇧🇪 Belgique
    'bruxelles': { lat: 50.8503, lng: 4.3517 },
    'anvers': { lat: 51.2194, lng: 4.4025 },
    'gand': { lat: 51.0543, lng: 3.7174 },
    'charleroi': { lat: 50.4108, lng: 4.4446 },
    'liège': { lat: 50.6326, lng: 5.5797 },
    
    // 🇳🇱 Pays-Bas (Hollande)
    'amsterdam': { lat: 52.3676, lng: 4.9041 },
    'rotterdam': { lat: 51.9225, lng: 4.47917 },
    'la-haye': { lat: 52.0705, lng: 4.3007 },
    'utrecht': { lat: 52.0907, lng: 5.1214 },
    'eindhoven': { lat: 51.4416, lng: 5.4697 },
    
    // 🇨🇭 Suisse
    'zurich': { lat: 47.3769, lng: 8.5417 },
    'genève': { lat: 46.2044, lng: 6.1432 },
    'bâle': { lat: 47.5596, lng: 7.5886 },
    'berne': { lat: 46.9480, lng: 7.4474 },
    'lausanne': { lat: 46.5197, lng: 6.6323 },
    
    // 🇱🇺 Luxembourg
    'luxembourg': { lat: 49.6116, lng: 6.1319 },
    
    // 🇮🇹 Italie
    'rome': { lat: 41.9028, lng: 12.4964 },
    'milan': { lat: 45.4642, lng: 9.1900 },
    'naples': { lat: 40.8518, lng: 14.2681 },
    'turin': { lat: 45.0703, lng: 7.6869 },
    'florence': { lat: 43.7696, lng: 11.2558 },
    'bologne': { lat: 44.4949, lng: 11.3426 },
    'venise': { lat: 45.4408, lng: 12.3155 },
    
    // 🇪🇸 Espagne
    'madrid': { lat: 40.4168, lng: -3.7038 },
    'barcelone': { lat: 41.3851, lng: 2.1734 },
    'valence': { lat: 39.4699, lng: -0.3763 },
    'séville': { lat: 37.3891, lng: -5.9845 },
    'saragosse': { lat: 41.6488, lng: -0.8891 },
    'malaga': { lat: 36.7213, lng: -4.4214 },
    'bilbao': { lat: 43.2630, lng: -2.9350 }
  };

  constructor(
    private afroshopService: AfroshopService,
    private firebaseService: FirebaseAfroshopService,
    private authService: AuthService,
    private translationService: TranslationService,
    private languageService: LanguageService,
    private router: Router,
    private geolocationService: GeolocationService,
    private geocodingService: GeocodingService,
    private firestore: Firestore
  ) {
    this.user$ = this.authService.user$;
  }

  async ngOnInit(): Promise<void> {
    // SEO pour la page Gallery
    this.seoService.setGalleryPage();

    // Subscribe to language changes
    this.langSub = this.languageService.currentLanguage$.subscribe(() => {
      this.updateTranslations();
    });
    this.updateTranslations();
    
    // Vérification admin via Firestore (modular)
    this.authService.user$.subscribe(async user => {
      if (user?.uid) {
        const adminDocRef = doc(this.firestore, 'roles/admins');
        const adminDocSnap = await getDoc(adminDocRef);
        const adminDoc = adminDocSnap.data() as { uids: string[] } | undefined;
        console.log('[DEBUG] Firestore adminDoc:', adminDoc);
        console.log('[DEBUG] User UID:', user.uid);
        this.isAdmin = adminDoc?.uids?.includes(user.uid) ?? false;
        console.log('[DEBUG] isAdmin:', this.isAdmin);
      } else {
        this.isAdmin = false;
        console.log('[DEBUG] Pas d\'utilisateur connecté, isAdmin:', this.isAdmin);
      }
    });
    // Initialiser DirectionsService Google Maps JS
    if ((window as any).google && (window as any).google.maps) {
      this.directionsService = new (window as any).google.maps.DirectionsService();
    }
    // Récupérer la position utilisateur dès le début si possible
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        this.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      });
    }
    this.firebaseService.getAllAfroshops().subscribe({
      next: (afroshops) => {
        this.allAfroshops = this.fixInvalidCoordinates(afroshops);
        this.filteredAfroshops = this.allAfroshops;
        
        // JSON-LD pour la collection de shops
        const schema = this.jsonLdService.getCombinedSchema(
          this.jsonLdService.getCollectionPageSchema(afroshops),
          this.jsonLdService.getBreadcrumbSchema([
            { name: 'Home', url: 'https://afroconnect.shop' },
            { name: 'Gallery', url: 'https://afroconnect.shop/gallery' }
          ])
        );
        this.jsonLdService.insertSchema(schema);
      },
      error: (error) => {
        console.error('Erreur lors du chargement Firebase:', error);
        this.allAfroshops = this.afroshopService.getAllAfroshops();
        this.filteredAfroshops = this.allAfroshops;
      }
    });
  }

  onSearchChange(): void {
    this.applyFilters();
    if (this.userLocation) {
      this.sortAfroshopsByDistance();
    }
  }

  onTypeFilterChange(): void {
    this.applyFilters();
    if (this.userLocation) {
      this.sortAfroshopsByDistance();
    }
  }

  private applyFilters(): void {
    let result = this.allAfroshops;

    // Filtrage par rayon géographique en premier
    if (this.userLocation) {
      result = result.filter(shop => {
        // Garder les shops avec coordonnées invalides (0,0) pour éviter de les perdre
        if (shop.coordinates.lat === 0 && shop.coordinates.lng === 0) {
          return true;
        }
        
        const distance = this.geolocationService.calculateDistance(
          this.userLocation!.lat, this.userLocation!.lng,
          shop.coordinates.lat, shop.coordinates.lng
        );
        return distance <= 50; // Rayon de 50km
      });
    }

    // Filtrage par type
    if (this.selectedType) {
      result = result.filter(shop => shop.type === this.selectedType);
    }

    // Filtrage par terme de recherche
    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(shop =>
        shop.name.toLowerCase().includes(term) ||
        shop.cuisine?.toLowerCase().includes(term) ||
        shop.description.toLowerCase().includes(term)
      );
    }

    this.filteredAfroshops = result;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedCity = '';
    this.customCityName = '';
    this.userLocation = null;
    this.filteredAfroshops = this.allAfroshops;
    this.applyFilters();
  }

  // Récupérer le nom de la ville actuellement recherchée
  getSearchedCityName(): string {
    if (this.selectedCity) {
      return this.formatCityName(this.selectedCity);
    }
    return '';
  }

  // Vérifier si une recherche géographique est active (GPS ou ville)
  hasGeoFilter(): boolean {
    return this.userLocation !== null || this.selectedCity !== '';
  }

  viewAfroshopDetail(shopId: number | string): void {
    this.router.navigate(['/afroshop', shopId]);
  }

  getTypeIcon(type: AfroshopData['type']): string {
    const icons = {
      restaurant: '🍽️',
      epicerie: '🛒',
      coiffeur: '✂️',
      vetement: '👗',
      services: '🏦'
    };
    return icons[type];
  }

  getPriceLevel(level: number): string {
    return '€'.repeat(level);
  }

  toggleMapView(): void {
    this.showMap = !this.showMap;
  }

  onCityChange(): void {
    this.customCityName = '';
    
    if (this.selectedCity) {
      const coordinates = this.cityCoordinates[this.selectedCity];
      if (coordinates) {
        this.userLocation = coordinates;
        this.applyFilters();
        this.sortAfroshopsByDistance();
      }
    } else {
      // Réinitialiser la vue sans localisation spécifique
      this.userLocation = null;
      this.applyFilters();
    }
  }

  useCurrentLocation(): void {
    // Préparation de l'utilisateur avant la demande GPS
    const userWantsGPS = confirm(
      `📍 GPS Standort aktivieren?\n\n` +
      `AfroConnect möchte deinen Standort nutzen um:\n` +
      `🎯 Afroshops in deiner Nähe zu finden\n` +
      `📏 Entfernungen genau zu berechnen\n` +
      `🗺️ Dir die beste Route zu zeigen\n\n` +
      `Dein Standort wird NICHT gespeichert und bleibt privat.\n\n` +
      `GPS jetzt aktivieren?`
    );

    if (!userWantsGPS) {
      // L'utilisateur a refusé
      alert(
        `👍 Kein Problem!\n\n` +
        `Du kannst jederzeit:\n` +
        `• Eine Stadt manuell eingeben\n` +
        `• Aus der Liste wählen\n` +
        `• GPS später aktivieren`
      );
      return;
    }

    // L'utilisateur a accepté, procéder à la géolocalisation
    this.geolocationService.getCurrentPosition()
      .subscribe({
        next: (position) => {
          if (position) {
            this.userLocation = {
              lat: position.lat,
              lng: position.lng
            };
            this.selectedCity = '';
            this.applyFilters();
            this.sortAfroshopsByDistance();
            
            // Message de succès
            alert(
              `✅ Standort erfolgreich ermittelt!\n\n` +
              `🎯 Afroshops werden jetzt nach Entfernung sortiert.\n` +
              `📏 Du siehst die genauen Distanzen zu jedem Geschäft.`
            );
          } else {
            this.fallbackToDefaultLocationWithChoice();
          }
        },
        error: (error) => {
          this.handleGeolocationError(error);
        }
      });
  }

  private handleGeolocationError(error: any): void {
    if (error.code) {
      switch (error.code) {
        case 1: // Permission denied
          this.showGPSActivationDialog();
          break;
        case 2: // Position unavailable
          this.showGPSUnavailableDialog();
          break;
        case 3: // Timeout
          this.showGPSTimeoutDialog();
          break;
        default:
          this.showGenericGPSError();
      }
    } else {
      this.showHTTPSRequiredDialog();
    }
  }

  private showGPSActivationDialog(): void {
    const userConfirmed = confirm(
      `📍 Standort-Zugriff erforderlich\n\n` +
      `Um Afroshops in deiner Nähe zu finden, benötigt AfroConnect Zugriff auf deinen Standort.\n\n` +
      `✅ Schritte:\n` +
      `1. Klicke "OK" um die Berechtigung zu erteilen\n` +
      `2. Wähle "Zulassen" wenn der Browser fragt\n` +
      `3. Bei iOS: Einstellungen > Safari > Standort aktivieren\n\n` +
      `Möchtest du es nochmal versuchen?`
    );

    if (userConfirmed) {
      // Nochmaliger Versuch der Geolocation
      this.useCurrentLocation();
    } else {
      this.fallbackToDefaultLocationWithChoice();
    }
  }

  private showGPSUnavailableDialog(): void {
    const userConfirmed = confirm(
      `🛰️ GPS-Signal nicht verfügbar\n\n` +
      `Dein GPS-Signal ist momentan nicht erreichbar.\n\n` +
      `💡 Lösungen:\n` +
      `• Gehe ins Freie oder näher zum Fenster\n` +
      `• Aktiviere GPS in den Geräte-Einstellungen\n` +
      `• Starte die App neu\n\n` +
      `Nochmal versuchen?`
    );

    if (userConfirmed) {
      this.useCurrentLocation();
    } else {
      this.fallbackToDefaultLocationWithChoice();
    }
  }

  private showGPSTimeoutDialog(): void {
    const userConfirmed = confirm(
      `⏱️ GPS-Anfrage zu langsam\n\n` +
      `Die Standort-Ermittlung dauert zu lange.\n\n` +
      `💡 Tipps:\n` +
      `• Überprüfe deine Internetverbindung\n` +
      `• Gehe ins Freie für besseres GPS-Signal\n` +
      `• Versuche es in ein paar Sekunden nochmal\n\n` +
      `Erneut versuchen?`
    );

    if (userConfirmed) {
      this.useCurrentLocation();
    } else {
      this.fallbackToDefaultLocationWithChoice();
    }
  }

  private showGenericGPSError(): void {
    alert(
      `❌ Standort-Fehler\n\n` +
      `Ein unbekannter Fehler ist aufgetreten.\n\n` +
      `📍 Berlin wird als Standard verwendet.\n` +
      `Du kannst jederzeit eine Stadt manuell auswählen.`
    );
    this.fallbackToDefaultLocationWithChoice();
  }

  private showHTTPSRequiredDialog(): void {
    const isHTTPS = window.location.protocol === 'https:';
    
    if (isHTTPS) {
      // Si déjà HTTPS, problème différent
      alert(
        `🔧 Standort-Service Problem\n\n` +
        `Der Standort-Service ist momentan nicht verfügbar.\n\n` +
        `📍 Berlin wird als Standard verwendet.\n` +
        `Versuche es später nochmal oder wähle eine Stadt manuell.`
      );
    } else {
      // Si HTTP, expliquer HTTPS
      alert(
        `🔒 HTTPS erforderlich\n\n` +
        `Für mobile Geräte ist eine sichere HTTPS-Verbindung nötig.\n\n` +
        `🌐 Verwende: https://ydi5291.github.io/AfroConnect/\n\n` +
        `📍 Berlin wird als Standard verwendet.`
      );
    }
    this.fallbackToDefaultLocationWithChoice();
  }

  private fallbackToDefaultLocationWithChoice(): void {
    // Au lieu de forcer Berlin, proposer à l'utilisateur de choisir sa ville
    const userChoice = prompt(
      `📍 Standort automatisch nicht möglich\n\n` +
      `Bitte gib deine Stadt ein für personalisierte Ergebnisse:\n\n` +
      `🇩🇪 Deutschland: Berlin, Hamburg, München, Köln, Frankfurt...\n` +
      `🇫🇷 France: Paris, Lyon, Marseille, Toulouse...\n` +
      `🇮🇹 Italia: Roma, Milano, Torino, Napoli...\n` +
      `🇪🇸 España: Madrid, Barcelona, Valencia...\n` +
      `🇧🇪 Belgique: Bruxelles, Anvers, Gand...\n` +
      `🇳🇱 Nederland: Amsterdam, Rotterdam, Utrecht...\n` +
      `🇨🇭 Schweiz: Zürich, Genève, Basel...\n\n` +
      `Deine Stadt:`,
      localStorage.getItem('afroconnect-user-city') || 'Berlin'
    );

    if (userChoice && userChoice.trim()) {
      const cityKey = userChoice.toLowerCase().trim();
      
      // Sauvegarder le choix de l'utilisateur
      localStorage.setItem('afroconnect-user-city', cityKey);
      
      // Vérifier si la ville est dans notre liste
      if (this.cityCoordinates[cityKey]) {
        this.userLocation = this.cityCoordinates[cityKey];
        this.selectedCity = cityKey;
        
        alert(
          `✅ Standort auf ${this.formatCityName(cityKey)} gesetzt!\n\n` +
          `🎯 Afroshops werden nach Entfernung zu ${this.formatCityName(cityKey)} sortiert.\n` +
          `📏 Du siehst jetzt relevante Geschäfte in deiner Nähe.`
        );
      } else {
        // Ville non reconnue, utiliser les coordonnées de Dortmund par défaut
        this.userLocation = this.cityCoordinates['dortmund'] || this.cityCoordinates['berlin'];
        this.selectedCity = 'dortmund';
        
        alert(
          `📍 Stadt "${userChoice}" nicht erkannt\n\n` +
          `Dortmund wurde als Standard-Standort gewählt.\n\n` +
          `Du kannst jederzeit:\n` +
          `• Eine andere Stadt aus der Liste wählen\n` +
          `• Eine andere Stadt eingeben\n` +
          `• GPS nochmal versuchen`
        );
      }
    } else {
      // L'utilisateur a annulé - utiliser Dortmund par défaut pour vous
      this.userLocation = this.cityCoordinates['dortmund'] || this.cityCoordinates['berlin'];
      this.selectedCity = 'dortmund';
      
      alert(
        `📍 Standard-Standort: Dortmund\n\n` +
        `Du kannst jederzeit:\n` +
        `• Eine Stadt aus der Liste wählen\n` +
        `• Eine Stadt eingeben\n` +
        `• GPS erneut aktivieren`
      );
    }
    
    this.applyFilters();
    this.sortAfroshopsByDistance();
  }

  // Fonction helper pour formater les noms de ville
  private formatCityName(cityKey: string): string {
    const cityNames: { [key: string]: string } = {
      // 🇩🇪 Allemagne
      'berlin': 'Berlin',
      'hamburg': 'Hamburg', 
      'münchen': 'München',
      'köln': 'Köln',
      'frankfurt': 'Frankfurt am Main',
      'stuttgart': 'Stuttgart',
      'düsseldorf': 'Düsseldorf',
      'dortmund': 'Dortmund',
      'essen': 'Essen',
      'leipzig': 'Leipzig',
      'bremen': 'Bremen',
      'dresden': 'Dresden',
      'hannover': 'Hannover',
      'nürnberg': 'Nürnberg',
      
      // 🇫🇷 France
      'paris': 'Paris',
      'marseille': 'Marseille',
      'lyon': 'Lyon',
      'toulouse': 'Toulouse',
      'nice': 'Nice',
      'nantes': 'Nantes',
      'strasbourg': 'Strasbourg',
      'montpellier': 'Montpellier',
      'bordeaux': 'Bordeaux',
      'lille': 'Lille',
      
      // 🇧🇪 Belgique
      'bruxelles': 'Bruxelles',
      'anvers': 'Anvers',
      'gand': 'Gand',
      'charleroi': 'Charleroi',
      'liège': 'Liège',
      
      // 🇳🇱 Pays-Bas
      'amsterdam': 'Amsterdam',
      'rotterdam': 'Rotterdam',
      'la-haye': 'La Haye',
      'utrecht': 'Utrecht',
      'eindhoven': 'Eindhoven',
      
      // 🇨🇭 Suisse
      'zurich': 'Zurich',
      'genève': 'Genève',
      'bâle': 'Bâle',
      'berne': 'Berne',
      'lausanne': 'Lausanne',
      
      // 🇱🇺 Luxembourg
      'luxembourg': 'Luxembourg',
      
      // 🇮🇹 Italie
      'rome': 'Rome',
      'milan': 'Milan',
      'naples': 'Naples',
      'turin': 'Turin',
      'florence': 'Florence',
      'bologne': 'Bologne',
      'venise': 'Venise',
      
      // 🇪🇸 Espagne
      'madrid': 'Madrid',
      'barcelone': 'Barcelone',
      'valence': 'Valence',
      'séville': 'Séville',
      'saragosse': 'Saragosse',
      'malaga': 'Málaga',
      'bilbao': 'Bilbao'
    };
    return cityNames[cityKey] || cityKey.charAt(0).toUpperCase() + cityKey.slice(1);
  }

  sortAfroshopsByDistance(): void {
    if (!this.userLocation) return;

    this.filteredAfroshops.sort((a, b) => {
      const distanceA = this.geolocationService.calculateDistance(
        this.userLocation!.lat, this.userLocation!.lng,
        a.coordinates.lat, a.coordinates.lng
      );
      const distanceB = this.geolocationService.calculateDistance(
        this.userLocation!.lat, this.userLocation!.lng,
        b.coordinates.lat, b.coordinates.lng
      );
      return distanceA - distanceB;
    });
  }

  getDistanceFromUser(shop: AfroshopData): string {
    // Récupérer la durée du trajet si non déjà chargée
    if (this.userLocation && shop.coordinates.lat && shop.coordinates.lng && !this.travelDurations[shop.id]) {
    }
    if (!this.userLocation) return '';
    const distance = this.geolocationService.calculateDistance(
      this.userLocation.lat, this.userLocation.lng,
      shop.coordinates.lat, shop.coordinates.lng
    );
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m entfernt`;
    } else {
      return `${distance.toFixed(1)}km entfernt`;
    }
  }


  getDirectionsDuration(shop: AfroshopData): void {
    if (!this.directionsService) {
      if ((window as any).google && (window as any).google.maps) {
        this.directionsService = new (window as any).google.maps.DirectionsService();
      } else {
        return;
      }
    }
    const origin = new (window as any).google.maps.LatLng(this.userLocation!.lat, this.userLocation!.lng);
    const destination = new (window as any).google.maps.LatLng(shop.coordinates.lat, shop.coordinates.lng);
    // Voiture
    this.directionsService.route({
      origin, destination, travelMode: 'DRIVING'
    }, (result: any, status: any) => {
      if (status === 'OK' && result.routes.length > 0) {
        const duration = result.routes[0].legs[0].duration.text;
        this.travelDurations[shop.id] = { ...this.travelDurations[shop.id], driving: duration };
      }
    });
    // À pied
    this.directionsService.route({
      origin, destination, travelMode: 'WALKING'
    }, (result: any, status: any) => {
      if (status === 'OK' && result.routes.length > 0) {
        const duration = result.routes[0].legs[0].duration.text;
        this.travelDurations[shop.id] = { ...this.travelDurations[shop.id], walking: duration };
      }
    });
  }

  getTravelDurationDisplay(shop: AfroshopData): string {
    const durations = this.travelDurations[shop.id];
    if (!durations) return '';
    let result = '';
    if (durations.driving) result += `🚗 ${durations.driving}`;
    if (durations.walking) result += (result ? ' | ' : '') + `🚶 ${durations.walking}`;
    return result;
  }

  addNewAfroshop(): void {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      alert('Bitte melden Sie sich an, um einen Afroshop hinzuzufügen.');
      this.router.navigate(['/login']);
      return;
    }
    
    this.router.navigate(['/add-afroshop']);
  }

  canEditAfroshop(shop: any): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      return false;
    }
    
    return shop.createdBy === currentUser.uid;
  }

  editAfroshop(event: Event, shopId: number | string): void {
    event.stopPropagation();
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('Bitte melden Sie sich an, um fortzufahren.');
      this.router.navigate(['/login']);
      return;
    }
    
    this.router.navigate(['/edit-afroshop', shopId]);
  }

  // ...existing code...

  // 🔐 Méthodes pour l'administration
  isAdminUser(user: User): boolean {
    if (!user || !user.email) return false;
    
    const adminEmails = [
      'youssoufdiamaldiallo@gmail.com', // Ton email personnel actuel
      'admin@afroconnect.de',           // Email professionnel futur
      'contact@afroconnect.de'          // Email support futur
    ];
    
    return adminEmails.includes(user.email);
  }

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  // 🇩🇪 Méthodes de traduction pour les templates
  getBusinessTypeName(type: AfroshopData['type']): string {
    return this.translationService.getBusinessTypeName(type);
  }

  getBusinessTypeDisplay(type: AfroshopData['type']): string {
    return this.translationService.getBusinessTypeDisplay(type);
  }

  getBusinessTypeIcon(type: AfroshopData['type']): string {
    return this.translationService.getBusinessTypeIcon(type);
  }

  getAllBusinessTypes() {
    return this.translationService.getAllBusinessTypes();
  }

  getSelectedCityName(): string {
    if (!this.selectedCity) return '';
    return this.selectedCity.charAt(0).toUpperCase() + this.selectedCity.slice(1);
  }

  getDefaultImage(type: AfroshopData['type']): string {
    const defaultImages = {
      restaurant: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
      epicerie: 'https://images.unsplash.com/photo-1586350388589-e263efc1ba5a?w=400&h=300&fit=crop',
      coiffeur: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
      vetement: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
      services: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'
    };
    return defaultImages[type];
  }

  onImageError(event: any, type: AfroshopData['type']): void {
    event.target.src = this.getDefaultImage(type);
  }

  getLocationDisplay(address: string): string {
    if (!address || address.trim() === '') {
      return 'Adresse à confirmer';
    }
    const parts = address.split(',');
    return parts.length > 1 ? parts[1].trim() : address;
  }

  searchCity(): void {
    if (!this.customCityName?.trim()) {
      return;
    }

    const cityName = this.customCityName.trim().toLowerCase();

    // D'abord, chercher dans nos villes prédéfinies
    const knownCity = Object.keys(this.cityCoordinates).find(city => 
      city.toLowerCase().includes(cityName) || 
      cityName.includes(city.toLowerCase())
    );

    if (knownCity) {
      this.selectedCity = knownCity;
      this.userLocation = this.cityCoordinates[knownCity];
      this.onCityChange();
      return;
    }

    // Ensuite, chercher dans les villes supplémentaires
    const foundInAdditionalCities = this.searchInAdditionalCities(cityName);
    if (foundInAdditionalCities) {
      return;
    }

    // Enfin, utiliser l'API de géocodage pour toutes les villes allemandes
    this.geocodeGermanCity(cityName);
  }

  private searchInAdditionalCities(cityName: string): boolean {
    const additionalCities: { [key: string]: { lat: number; lng: number } } = {
      'werl': { lat: 51.5533, lng: 7.9111 },
      'lippstadt': { lat: 51.6755, lng: 8.3439 },
      'soest': { lat: 51.5731, lng: 8.1067 },
      'paderborn': { lat: 51.7189, lng: 8.7575 },
      'bielefeld': { lat: 52.0302, lng: 8.5325 },
      'münster': { lat: 51.9607, lng: 7.6261 },
      'bochum': { lat: 51.4818, lng: 7.2162 },
      'duisburg': { lat: 51.4344, lng: 6.7623 },
      'wuppertal': { lat: 51.2562, lng: 7.1508 }
    };

    const foundCity = Object.keys(additionalCities).find(city => 
      city.toLowerCase().includes(cityName) || 
      cityName.includes(city.toLowerCase())
    );

    if (foundCity) {
      this.userLocation = additionalCities[foundCity];
      this.selectedCity = '';
      this.applyFilters();
      this.sortAfroshopsByDistance();
      alert(`📍 Stadt gefunden: ${this.customCityName}`);
      return true;
    }

    return false;
  }

  private async geocodeGermanCity(cityName: string): Promise<void> {
    try {
      // Utilisation de l'API Nominatim (OpenStreetMap) pour chercher des villes allemandes
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(cityName)}&` +
        `country=Germany&` +
        `addressdetails=1&` +
        `limit=5&` +
        `format=json&` +
        `featuretype=city,town,village`
      );

      if (!response.ok) {
        throw new Error('Problème de réseau');
      }

      const results = await response.json();

      if (results && results.length > 0) {
        // Prendre le premier résultat qui est généralement le plus pertinent
        const result = results[0];
        
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          this.userLocation = { lat, lng };
          this.selectedCity = '';
          this.applyFilters();
          this.sortAfroshopsByDistance();
          
          // Afficher le nom complet trouvé
          const displayName = result.display_name.split(',')[0];
          alert(`📍 Stadt gefunden: ${displayName}\n🗺️ Koordinaten: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } else {
          throw new Error('Coordonnées invalides');
        }
      } else {
        this.showCityNotFoundAlert();
      }
    } catch (error) {
      console.error('Erreur de géocodage:', error);
      this.showCityNotFoundAlert();
    }
  }

  private showCityNotFoundAlert(): void {
    alert(
      `❌ Stadt "${this.customCityName}" nicht gefunden.\n\n` +
      `💡 Tipps:\n` +
      `• Überprüfen Sie die Schreibweise\n` +
      `• Verwenden Sie deutsche Städtenamen\n` +
      `• Versuchen Sie es mit einem Stadtteil oder einer nahegelegenen größeren Stadt\n` +
      `• Wählen Sie aus der vordefinierten Liste`
    );
  }

  private fixInvalidCoordinates(afroshops: AfroshopData[]): AfroshopData[] {
    return afroshops.map(shop => {
      if (shop.coordinates.lat === 0 && shop.coordinates.lng === 0) {
        const correctedCoords = this.guessCoordinatesFromAddress(shop.address);
        if (correctedCoords) {
          return {
            ...shop,
            coordinates: correctedCoords
          };
        }
      }
      return shop;
    });
  }

  private guessCoordinatesFromAddress(address: string): { lat: number; lng: number } | null {
    const addressLower = address.toLowerCase();
    
    const allCityCoordinates = {
      ...this.cityCoordinates,
      'lippstadt': { lat: 51.6755, lng: 8.3439 },
      'werl': { lat: 51.5533, lng: 7.9111 },
      'soest': { lat: 51.5731, lng: 8.1067 },
      'paderborn': { lat: 51.7189, lng: 8.7575 },
      'bielefeld': { lat: 52.0302, lng: 8.5325 },
      'münster': { lat: 51.9607, lng: 7.6261 },
      'bochum': { lat: 51.4818, lng: 7.2162 },
      'duisburg': { lat: 51.4344, lng: 6.7623 },
      'wuppertal': { lat: 51.2562, lng: 7.1508 }
    };
    
    for (const [city, coords] of Object.entries(allCityCoordinates)) {
      if (addressLower.includes(city)) {
        return coords;
      }
    }
    
    const postalCodes: { [key: string]: { lat: number; lng: number } } = {
      '59555': { lat: 51.6755, lng: 8.3439 },
      '59594': { lat: 51.5533, lng: 7.9111 },
      '59494': { lat: 51.5731, lng: 8.1067 },
      '33098': { lat: 51.7189, lng: 8.7575 },
    };
    
    for (const [postal, coords] of Object.entries(postalCodes)) {
      if (address.includes(postal)) {
        return coords;
      }
    }
    
    return null;
  }

  updateTranslations() {
    this.texts = {
      discover: this.languageService.translate('gallery.discover'),
      shopsNearYou: this.languageService.translate('gallery.shopsNearYou'),
      addShopBtn: this.languageService.translate('gallery.addShopBtn'),
      filterByType: this.languageService.translate('gallery.filterByType'),
      allTypes: this.languageService.translate('gallery.allTypes'),
      activateGPS: this.languageService.translate('gallery.activateGPS'),
      searchRadius: this.languageService.translate('gallery.searchRadius'),
      around: this.languageService.translate('gallery.around'),
      yourLocation: this.languageService.translate('gallery.yourLocation'),
      resultsCount: this.languageService.translate('gallery.resultsCount'),
      shopsDisplayed: this.languageService.translate('gallery.shopsDisplayed'),
      yourCity: this.languageService.translate('gallery.yourCity'),
      anyCityPlaceholder: this.languageService.translate('gallery.anyCityPlaceholder'),
      search: this.languageService.translate('gallery.search'),
      popularCities: this.languageService.translate('gallery.popularCities'),
      confirm: this.languageService.translate('gallery.confirm'),
      viewDetails: this.languageService.translate('gallery.viewDetails'),
      showOnMap: this.languageService.translate('gallery.showOnMap'),
      route: this.languageService.translate('gallery.route'),
      edit: this.languageService.translate('gallery.edit'),
      restaurant: this.languageService.translate('type.restaurant'),
      epicerie: this.languageService.translate('type.epicerie'),
      coiffeur: this.languageService.translate('type.coiffeur'),
      vetement: this.languageService.translate('type.vetement'),
      services: this.languageService.translate('type.services'),
      noResults: this.languageService.translate('gallery.noResults'),
      noResultsMessage: this.languageService.translate('gallery.noResultsMessage'),
      noResultsCity: this.languageService.translate('gallery.noResultsCity'),
      noResultsGPS: this.languageService.translate('gallery.noResultsGPS'),
      backToGallery: this.languageService.translate('gallery.backToGallery'),
      tryAnother: this.languageService.translate('gallery.tryAnother')
    };
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }
}