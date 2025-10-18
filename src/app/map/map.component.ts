import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { AfroshopData } from '../services/image.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnChanges {
  @Input() afroshops: AfroshopData[] = [];
  @Input() userLocation: { lat: number; lng: number } | null = null;
  @Output() shopSelected = new EventEmitter<number>();

  // Configuration de la carte
  mapOptions: google.maps.MapOptions = {
    center: { lat: 52.5200, lng: 13.4050 }, // Berlin par défaut
    zoom: 12,
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true
  };

  // Marqueurs des Afroshops
  markers: any[] = [];
  
  constructor() {}

  ngOnInit(): void {
    this.updateMapCenter();
    this.createMarkers();
  }

  ngOnChanges(): void {
    this.updateMapCenter();
    this.createMarkers();
  }

  // Mettre à jour le centre de la carte selon la position de l'utilisateur
  updateMapCenter(): void {
    if (this.userLocation) {
      this.mapOptions = {
        ...this.mapOptions,
        center: this.userLocation,
        zoom: 13
      };
    }
  }

  // Créer les marqueurs pour chaque Afroshop
  createMarkers(): void {
    this.markers = this.afroshops.map(shop => ({
      position: shop.coordinates,
      title: shop.name,
      shop: shop
    }));

    // Ajouter marqueur de l'utilisateur si disponible
    if (this.userLocation) {
      this.markers.push({
        position: this.userLocation,
        title: 'Deine Position',
        isUserLocation: true
      });
    }
  }

  // Obtenir les options du marqueur
  getMarkerOptions(marker: any): google.maps.MarkerOptions {
    if (marker.isUserLocation) {
      return {
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12)
        }
      };
    }
    return {};
  }

  // Gestionnaire de clic sur marqueur
  onMarkerClick(marker: any): void {
    if (marker.shop) {
      console.log('Afroshop ausgewählt:', marker.shop);
      this.shopSelected.emit(marker.shop.id);
    }
  }

  // Obtenir les directions vers un Afroshop
  getDirections(shop: AfroshopData): void {
    if (this.userLocation) {
      const directionsUrl = `https://www.google.com/maps/dir/${this.userLocation.lat},${this.userLocation.lng}/${shop.coordinates.lat},${shop.coordinates.lng}`;
      window.open(directionsUrl, '_blank');
    } else {
      const shopUrl = `https://www.google.com/maps/search/?api=1&query=${shop.coordinates.lat},${shop.coordinates.lng}`;
      window.open(shopUrl, '_blank');
    }
  }
}
