import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor() { }

  // Obtenir la position actuelle de l'utilisateur
  getCurrentPosition(): Observable<UserLocation | null> {
    return new Observable(observer => {
      if (!navigator.geolocation) {
        console.error('Geolocation ist in diesem Browser nicht verfügbar');
        observer.next(null);
        observer.complete();
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const userLocation: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          observer.next(userLocation);
          observer.complete();
        },
        (error: GeolocationPositionError) => {
          console.error('Fehler beim Abrufen der Position:', error);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.error("Standortzugriff wurde verweigert");
              break;
            case error.POSITION_UNAVAILABLE:
              console.error("Standortinformationen nicht verfügbar");
              break;
            case error.TIMEOUT:
              console.error("Zeitüberschreitung beim Abrufen des Standorts");
              break;
          }
          observer.next(null);
          observer.complete();
        },
        options
      );
    });
  }

  // Surveiller la position (pour les déplacements)
  watchPosition(): Observable<UserLocation | null> {
    return new Observable(observer => {
      if (!navigator.geolocation) {
        observer.next(null);
        observer.complete();
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // 1 minute cache
      };

      const watchId = navigator.geolocation.watchPosition(
        (position: GeolocationPosition) => {
          const userLocation: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          observer.next(userLocation);
        },
        (error: GeolocationPositionError) => {
          console.error('Fehler beim Überwachen der Position:', error);
          observer.next(null);
        },
        options
      );

      // Cleanup function
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    });
  }

  // Calculer la distance entre deux points (en km)
  calculateDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
  ): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 100) / 100; // Arrondir à 2 décimales
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Vérifier si la géolocalisation est supportée
  isGeolocationSupported(): boolean {
    return 'geolocation' in navigator;
  }
}
