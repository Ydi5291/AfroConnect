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
  showMap: boolean = false;
  userLocation: { lat: number; lng: number } | null = null;
  user$: Observable<User | null>;

  // Coordonnées des principales villes allemandes
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
    // Charger depuis Firebase au lieu des données locales
    this.firebaseService.getAllAfroshops().subscribe({
      next: (afroshops) => {
        this.allAfroshops = afroshops;
        this.filteredAfroshops = afroshops;
        console.log(`🔥 TOTAL AFROSHOPS: ${afroshops.length}`);
        console.log('🔥 NOMS:', afroshops.map(shop => shop.name));
        
        // Recherche spécifique de Fouta
        const fouta = afroshops.find(shop => shop.name.toLowerCase().includes('fouta'));
        if (fouta) {
          console.log('✅ FOUTA TROUVÉ:', fouta);
        } else {
          console.log('❌ FOUTA PAS TROUVÉ');
        }
        
        // Temporairement désactivé pour voir tous les Afroshops
        // this.useCurrentLocation();
      },
      error: (error) => {
        console.error('Erreur lors du chargement Firebase:', error);
        // Fallback vers les données locales en cas d'erreur
        this.allAfroshops = this.afroshopService.getAllAfroshops();
        this.filteredAfroshops = this.allAfroshops;
        
        // Même en cas d'erreur, essayer la géolocalisation
        // this.useCurrentLocation();
      }
    });
  }

  // Filtrer les Afroshops en fonction du terme de recherche
  onSearchChange(): void {
    this.applyFilters();
    if (this.userLocation) {
      this.sortAfroshopsByDistance();
    }
  }

  // Filtrer par type de commerce
  onTypeFilterChange(): void {
    this.applyFilters();
    if (this.userLocation) {
      this.sortAfroshopsByDistance();
    }
  }

  // Appliquer tous les filtres (version simplifiée)
  private applyFilters(): void {
    let result = this.filteredAfroshops.length > 0 ? this.filteredAfroshops : this.allAfroshops;

    // Filtrer par type si sélectionné
    if (this.selectedType) {
      result = result.filter(shop => shop.type === this.selectedType);
    }

    // Filtrer par terme de recherche
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

  // Effacer la recherche
  clearSearch(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedCity = '';
    this.userLocation = null;
    this.filteredAfroshops = this.allAfroshops;
    this.applyFilters();
  }

  // Navigation vers la page de détail
  viewAfroshopDetail(shopId: number | string): void {
    this.router.navigate(['/afroshop', shopId]);
  }

  // Obtenir l'icône selon le type
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

  // Convertir le niveau de prix en symboles
  getPriceLevel(level: number): string {
    return '€'.repeat(level);
  }

  // Basculer entre vue liste et vue carte
  toggleMapView(): void {
    this.showMap = !this.showMap;
  }

  // Gestion du changement de ville
  onCityChange(): void {
    if (this.selectedCity) {
      const coordinates = this.cityCoordinates[this.selectedCity];
      if (coordinates) {
        this.userLocation = coordinates;
        // Filtrer les Afroshops dans un rayon de 50km autour de la ville
        this.filterAfroshopsByRadius(50);
        this.sortAfroshopsByDistance();
      }
    } else {
      // Retour à tous les Afroshops
      this.filteredAfroshops = this.allAfroshops;
      this.applyFilters();
      this.useCurrentLocation();
    }
  }

  // Utiliser la géolocalisation automatique
  useCurrentLocation(): void {
    console.log('🗺️ Demande de géolocalisation...');
    
    this.geolocationService.getCurrentPosition()
      .subscribe({
        next: (position) => {
          if (position) {
            this.userLocation = {
              lat: position.lat,
              lng: position.lng
            };
            this.selectedCity = ''; // Reset du sélecteur
            // Filtrer par rayon de 50km autour de la position actuelle
            this.filterAfroshopsByRadius(50);
            this.sortAfroshopsByDistance();
            console.log('✅ Position détectée:', this.userLocation);
          } else {
            this.fallbackToDefaultLocation('Position non disponible');
          }
        },
        error: (error) => {
          console.error('❌ Erreur de géolocalisation:', error);
          this.handleGeolocationError(error);
        }
      });
  }

  // Gestion spécifique des erreurs de géolocalisation
  private handleGeolocationError(error: any): void {
    let message = '';
    
    if (error.code) {
      switch (error.code) {
        case 1: // PERMISSION_DENIED
          message = 'Standort-Berechtigung verweigert. Bitte aktivieren Sie die Standortfreigabe in Ihren Browser-Einstellungen.';
          break;
        case 2: // POSITION_UNAVAILABLE
          message = 'Standort nicht verfügbar. Überprüfen Sie Ihre GPS-Einstellungen.';
          break;
        case 3: // TIMEOUT
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

  // Fallback vers une localisation par défaut
  private fallbackToDefaultLocation(reason: string): void {
    this.userLocation = this.cityCoordinates['berlin'];
    this.selectedCity = 'berlin';
    
    // Message plus informatif
    alert(`🗺️ Standort-Problem: ${reason}\n\n📍 Berlin wurde als Standard-Standort gewählt.\n\n💡 Tipp: Für die Standort-Funktion aktivieren Sie GPS und verwenden Sie HTTPS.`);
  }

  // Trier les Afroshops par distance
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

  // Obtenir la distance depuis la position utilisateur
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

  // Naviguer vers le formulaire d'ajout d'Afroshop
  addNewAfroshop(): void {
    const currentUser = this.authService.getCurrentUser();
    
    // Vérifier si l'utilisateur est connecté
    if (!currentUser) {
      alert('Bitte melden Sie sich an, um einen Afroshop hinzuzufügen.');
      this.router.navigate(['/login']);
      return;
    }
    
    this.router.navigate(['/add-afroshop']);
  }

  // Vérifier si l'utilisateur peut éditer cet Afroshop
  canEditAfroshop(shop: any): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    // L'utilisateur doit être connecté
    if (!currentUser) {
      return false;
    }
    
    // L'utilisateur doit être le créateur de cet Afroshop
    return shop.createdBy === currentUser.uid;
  }

  // Éditer un Afroshop
  editAfroshop(event: Event, shopId: number | string): void {
    event.stopPropagation(); // Empêcher la navigation vers les détails
    
    // Double vérification : l'utilisateur doit être connecté
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      // Rediriger vers la page de connexion
      alert('Bitte melden Sie sich an, um fortzufahren.');
      this.router.navigate(['/login']);
      return;
    }
    
    // Naviguer vers la page d'édition
    this.router.navigate(['/edit-afroshop', shopId]);
  }

  // Filtrer les Afroshops dans un rayon donné (en km)
  filterAfroshopsByRadius(radiusKm: number): void {
    if (!this.userLocation) {
      console.log('Aucune position de référence définie');
      return;
    }

    const afroshopsInRadius = this.allAfroshops.filter(shop => {
      // Inclure les Afroshops avec des coordonnées invalides (0,0) 
      // pour qu'ils restent visibles en attendant la correction
      if (shop.coordinates.lat === 0 && shop.coordinates.lng === 0) {
        console.log(`Afroshop avec coordonnées invalides inclus: ${shop.name}`);
        return true;
      }
      
      const distance = this.calculateDistance(
        this.userLocation!.lat, this.userLocation!.lng,
        shop.coordinates.lat, shop.coordinates.lng
      );
      return distance <= radiusKm;
    });

    this.filteredAfroshops = afroshopsInRadius;
    this.applyFilters(); // Appliquer les autres filtres (recherche, type)
    
    console.log(`${afroshopsInRadius.length} Afroshops trouvés dans un rayon de ${radiusKm}km`);
  }

  // Calculer la distance entre deux coordonnées (formule de Haversine)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  }

  // Convertir les degrés en radians
  private toRad(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  // Appliquer tous les filtres (recherche + type)
  applyAllFilters(): void {
    this.filteredAfroshops = this.allAfroshops;
    
    // Appliquer le filtre de recherche
    if (this.searchTerm) {
      const searchResults = this.afroshopService.searchAfroshops(this.searchTerm);
      this.filteredAfroshops = this.filteredAfroshops.filter(shop => 
        searchResults.some(result => result.id === shop.id)
      );
    }
    
    // Appliquer le filtre de type
    if (this.selectedType) {
      this.filteredAfroshops = this.filteredAfroshops.filter(shop => 
        shop.type === this.selectedType
      );
    }
  }

  // Navigation vers ajout d'Afroshop
  goToAddAfroshop(): void {
    // Utilise la même logique que addNewAfroshop
    this.addNewAfroshop();
  }

  // Obtenir le nom formaté de la ville sélectionnée
  getSelectedCityName(): string {
    if (!this.selectedCity) return '';
    // Capitaliser la première lettre
    return this.selectedCity.charAt(0).toUpperCase() + this.selectedCity.slice(1);
  }

  // Obtenir une image par défaut selon le type
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

  // Gérer les erreurs d'image
  onImageError(event: any, type: AfroshopData['type']): void {
    event.target.src = this.getDefaultImage(type);
  }

  // Afficher la localisation de manière sécurisée
  getLocationDisplay(address: string): string {
    if (!address || address.trim() === '') {
      return 'Adresse à confirmer';
    }
    const parts = address.split(',');
    return parts.length > 1 ? parts[1].trim() : address;
  }

  // Test direct Firebase
  testFirebase(): void {
    console.log('🔥🔥🔥 TEST FIREBASE DIRECT 🔥🔥🔥');
    this.firebaseService.getAllAfroshops().subscribe({
      next: (afroshops) => {
        console.log('✅ Firebase fonctionne! Nombre:', afroshops.length);
        console.log('✅ Noms reçus:', afroshops.map(a => a.name));
        alert(`Firebase OK: ${afroshops.length} Afroshops trouvés\nNoms: ${afroshops.map(a => a.name).join(', ')}`);
      },
      error: (error) => {
        console.error('❌ Erreur Firebase:', error);
        alert('❌ Erreur Firebase: ' + error.message);
      }
    });
  }
}
