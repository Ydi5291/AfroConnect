import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export interface GeocodeResult {
  lat: number;
  lng: number;
  formatted_address: string;
  place_id?: string;
  accuracy?: string;
}

export interface ReverseGeocodeResult {
  address: string;
  components?: {
    street_number?: string;
    route?: string;
    locality?: string;
    postal_code?: string;
    country?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {

  private readonly GOOGLE_MAPS_API_KEY = environment.googleMapsApiKey;
  private readonly GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

  constructor(private http: HttpClient) {}

  /**
   * 🚗 Récupère la durée du trajet (voiture et à pied) via Google Maps Directions API
   */
  getTravelDuration(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Observable<{ driving?: string; walking?: string }> {
    const apiKey = this.GOOGLE_MAPS_API_KEY;
    const baseUrl = 'https://maps.googleapis.com/maps/api/directions/json';
    const modes = ['driving', 'walking'];

    const requests = modes.map(mode => {
      const url = `${baseUrl}?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=${mode}&key=${apiKey}`;
      return this.http.get<any>(url).pipe(
        map(res => {
          if (res.routes?.length && res.routes[0].legs?.length) {
            return { mode, duration: res.routes[0].legs[0].duration.text };
          }
          return { mode, duration: undefined };
        }),
        catchError(() => of({ mode, duration: undefined }))
      );
    });

    return new Observable(observer => {
      const results: { [key: string]: string } = {};
      let completed = 0;

      requests.forEach(req => {
        req.subscribe(result => {
          results[result.mode] = result.duration;
          completed++;
          if (completed === requests.length) {
            observer.next({ driving: results['driving'], walking: results['walking'] });
            observer.complete();
          }
        });
      });
    });
  }

  /**
   * 🗺️ Géocodage via Google Maps API
   */
  private geocodeWithGoogleMaps(address: string): Observable<GeocodeResult | null> {
    const params = {
      address,
      key: this.GOOGLE_MAPS_API_KEY,
      language: 'de',
      region: 'de'
    };

    return this.http.get<any>(this.GEOCODING_URL, { params }).pipe(
      map(response => {
        if (response.status === 'OK' && response.results?.length > 0) {
          const result = response.results[0];
          const loc = result.geometry.location;
          return {
            lat: loc.lat,
            lng: loc.lng,
            formatted_address: result.formatted_address,
            place_id: result.place_id,
            accuracy: 'APPROXIMATE'
          };
        }
        return null;
      }),
      catchError(err => {
        console.error('❌ Erreur géocodage Google Maps:', err);
        return of(null);
      })
    );
  }

  /**
   * 🗺️ Géocodage avec Nominatim (OpenStreetMap)
   */
  private geocodeWithNominatim(address: string): Observable<GeocodeResult | null> {
    const params = {
      q: address,
      format: 'json',
      addressdetails: '1',
      limit: '1',
      countrycodes: 'de,be,fr,ch,lu,at,nl'
    };

    return this.http.get<any[]>(NOMINATIM_URL, { params }).pipe(
      map(results => {
        if (results?.length > 0) {
          const result = results[0];
          return {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            formatted_address: result.display_name,
            accuracy: result.type
          };
        }
        return null;
      }),
      catchError(err => {
        console.error('❌ Erreur Nominatim:', err);
        return of(null);
      })
    );
  }

  /**
   * 🏙️ Extrait la ville d’une adresse
   */
  private extractCityFromAddress(address: string): string | null {
    const postalCodeMatch = address.match(/\b(\d{5})\b/);
    if (postalCodeMatch) {
      const parts = address.split(postalCodeMatch[0]);
      if (parts.length > 1) {
        const afterPostal = parts[1].replace(/[^a-zA-ZäöüÄÖÜß\s,]/g, '').trim();
        const city = afterPostal.split(',').map(s => s.trim()).filter(Boolean)[0];
        return city || null;
      }
    }
    const segments = address.split(',').map(s => s.trim()).filter(Boolean);
    return segments.length > 1 ? segments[segments.length - 1] : null;
  }

  /**
   * 📍 Fallback local (si API échoue)
   */
  private geocodeWithFallback(address: string): GeocodeResult | null {
    const addressLower = address.toLowerCase();

    const cities = Object.entries(this.CITY_COORDINATES).sort(
      (a, b) => b[0].length - a[0].length
    );

    for (const [city, coords] of cities) {
      const pattern = new RegExp(`\\b${city}\\b`, 'i');
      if (pattern.test(addressLower)) {
        return {
          lat: coords.lat,
          lng: coords.lng,
          formatted_address: `${city}, Deutschland`,
          accuracy: 'APPROXIMATE'
        };
      }
    }

    console.warn('⚠️ Fallback — aucune correspondance trouvée:', address);
    return null;
  }

  // === Données statiques des villes allemandes ===
  private readonly CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
    berlin: { lat: 52.5200, lng: 13.4050 },
    hamburg: { lat: 53.5511, lng: 9.9937 },
    münchen: { lat: 48.1351, lng: 11.5820 },
    köln: { lat: 50.9375, lng: 6.9603 },
    frankfurt: { lat: 50.1109, lng: 8.6821 },
    stuttgart: { lat: 48.7758, lng: 9.1829 },
    dortmund: { lat: 51.5136, lng: 7.4653 },
    leipzig: { lat: 51.3397, lng: 12.3731 }
  };

  /**
   * 🔁 Géocodage inverse (coord → adresse)
   */
  reverseGeocode(lat: number, lng: number): Observable<ReverseGeocodeResult | null> {
    if (!this.GOOGLE_MAPS_API_KEY) {
      return of({ address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
    }

    const params = {
      latlng: `${lat},${lng}`,
      key: this.GOOGLE_MAPS_API_KEY,
      language: 'de',
      region: 'de'
    };

    return this.http.get<any>(this.GEOCODING_URL, { params }).pipe(
      map(res => {
        if (res.status === 'OK' && res.results?.length) {
          const result = res.results[0];
          return {
            address: result.formatted_address,
            components: this.parseAddressComponents(result.address_components)
          };
        }
        return null;
      }),
      catchError(err => {
        console.error('❌ Erreur géocodage inverse:', err);
        return of(null);
      })
    );
  }

  private parseAddressComponents(components: any[]): any {
    const parsed: any = {};
    components.forEach(c => {
      if (c.types.includes('street_number')) parsed.street_number = c.long_name;
      if (c.types.includes('route')) parsed.route = c.long_name;
      if (c.types.includes('locality')) parsed.locality = c.long_name;
      if (c.types.includes('postal_code')) parsed.postal_code = c.long_name;
      if (c.types.includes('country')) parsed.country = c.long_name;
    });
    return parsed;
  }

  /**
   * 🔢 Validation de coordonnées
   */
  isValidCoordinates(lat: number, lng: number): boolean {
    return lat !== 0 && lng !== 0 && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  /**
   * 📏 Distance (Haversine)
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Géocode une adresse en coordonnées GPS
   * Utilise Google Maps, puis Nominatim, puis fallback ville
   */
  geocodeAddress(address: string): Observable<GeocodeResult | null> {
    if (!address || address.trim().length === 0) {
      return of(null);
    }
    const cleanAddress = address.trim();
    // 1. Essayer Google Maps si la clé est présente
    if (this.GOOGLE_MAPS_API_KEY && this.GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY') {
      return this.geocodeWithGoogleMaps(cleanAddress).pipe(
        catchError(error => {
          // 2. Si Google échoue, essayer Nominatim
          return this.geocodeWithNominatim(cleanAddress).pipe(
            catchError(() => {
              // 3. Si Nominatim échoue, fallback ville
              return of(this.geocodeWithFallback(cleanAddress));
            })
          );
        })
      );
    } else {
      // Si pas de clé Google, essayer Nominatim d'abord
      return this.geocodeWithNominatim(cleanAddress).pipe(
        catchError(() => {
          return of(this.geocodeWithFallback(cleanAddress));
        })
      );
    }
  }
}
