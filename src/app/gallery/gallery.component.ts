import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AfroshopService, AfroshopData } from '../services/image.service';
import { FirebaseAfroshopService } from '../services/firebase-afroshop.service';
import { AuthService } from '../services/auth.service';
import { MapComponent } from '../map/map.component';
import { GeolocationService } from '../services/geolocation.service';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule, MapComponent],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})
export class GalleryComponent implements OnInit {
  allAfroshops: AfroshopData[] = [];
  filteredAfroshops: AfroshopData[] = [];
  searchTerm: string = '';
  selectedType: AfroshopData['type'] | '' = '';
  selectedCity: string = '';
  customCityName: string = '';
  showMap: boolean = false;
  userLocation: { lat: number; lng: number } | null = null;
  user$: Observable<User | null>;

  private cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
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

  constructor(
    private afroshopService: AfroshopService,
    private firebaseService: FirebaseAfroshopService,
    private authService: AuthService,
    private router: Router,
    private geolocationService: GeolocationService
  ) {
    this.user$ = this.authService.user$;
  }

  ngOnInit(): void {
    this.firebaseService.getAllAfroshops().subscribe({
      next: (afroshops) => {
        this.allAfroshops = this.fixInvalidCoordinates(afroshops);
        this.filteredAfroshops = this.allAfroshops;
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
    this.userLocation = null;
    this.filteredAfroshops = this.allAfroshops;
    this.applyFilters();
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
          } else {
            this.fallbackToDefaultLocation('Position non disponible');
          }
        },
        error: (error) => {
          this.handleGeolocationError(error);
        }
      });
  }

  private handleGeolocationError(error: any): void {
    let message = '';
    
    if (error.code) {
      switch (error.code) {
        case 1:
          message = 'Standort-Berechtigung verweigert. Bitte aktivieren Sie die Standortfreigabe in Ihren Browser-Einstellungen.';
          break;
        case 2:
          message = 'Standort nicht verfügbar. Überprüfen Sie Ihre GPS-Einstellungen.';
          break;
        case 3:
          message = 'Standort-Anfrage zeitüberschreitung. Versuchen Sie es erneut.';
          break;
        default:
          message = 'Unbekannter Standort-Fehler.';
      }
    } else {
      message = 'Standort-Service nicht verfügbar. HTTPS erforderlich für mobile Geräte.';
    }
    
    this.fallbackToDefaultLocation(message);
  }

  private fallbackToDefaultLocation(reason: string): void {
    this.userLocation = this.cityCoordinates['berlin'];
    this.selectedCity = 'berlin';
    
    alert(`🗺️ Standort-Problem: ${reason}\n\n📍 Berlin wurde als Standard-Standort gewählt.\n\n💡 Tipp: Für die Standort-Funktion aktivieren Sie GPS und verwenden Sie HTTPS.`);
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

  goToAddAfroshop(): void {
    this.addNewAfroshop();
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
}