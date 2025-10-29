import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
// ...existing code...
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

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  /**
   * Récupère la durée du trajet (voiture et à pied) entre deux points via Google Maps Directions API
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
          if (res.routes && res.routes.length > 0 && res.routes[0].legs && res.routes[0].legs.length > 0) {
            return { mode, duration: res.routes[0].legs[0].duration.text };
          }
          return { mode, duration: undefined };
        }),
        catchError(() => of({ mode, duration: undefined }))
      );
    });
    return new Observable(observer => {
      let results: { [key: string]: string } = {};
      let completed = 0;
      requests.forEach((req, idx) => {
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
   * Géocode une adresse avec OpenStreetMap/Nominatim
   */
  private geocodeWithNominatim(address: string): Observable<GeocodeResult | null> {
    const params = {
      q: address,
      format: 'json',
      addressdetails: '1',
      limit: '1',
      countrycodes: 'de'
    };
    return this.http.get<any[]>(NOMINATIM_URL, { params }).pipe(
      map(results => {
        console.log('🗺️ Réponse brute Nominatim:', results);
        if (results && results.length > 0) {
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
      catchError(error => {
        console.error('❌ Erreur Nominatim:', error);
        return of(null);
      })
    );
  }

  // Clé API Google Maps - À configurer avec une vraie clé
  private readonly GOOGLE_MAPS_API_KEY = environment.firebase.apiKey;
  private readonly GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

  // Fallback : coordonnées des principales villes allemandes
  private readonly CITY_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
    'berlin': { lat: 52.5200, lng: 13.4050 },
    'hamburg': { lat: 53.5511, lng: 9.9937 },
    'münchen': { lat: 48.1351, lng: 11.5820 },
    'munich': { lat: 48.1351, lng: 11.5820 },
    'köln': { lat: 50.9375, lng: 6.9603 },
    'cologne': { lat: 50.9375, lng: 6.9603 },
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
    'nuremberg': { lat: 49.4521, lng: 11.0767 },
    'mannheim': { lat: 49.4875, lng: 8.4660 },
    'karlsruhe': { lat: 49.0069, lng: 8.4037 },
    'wiesbaden': { lat: 50.0782, lng: 8.2398 },
    'münster': { lat: 51.9607, lng: 7.6261 },
    'augsburg': { lat: 48.3705, lng: 10.8978 },
    'mönchengladbach': { lat: 51.1805, lng: 6.4428 },
    'braunschweig': { lat: 52.2689, lng: 10.5268 },
    'kiel': { lat: 54.3233, lng: 10.1228 },
    'aachen': { lat: 50.7753, lng: 6.0839 },
    'halle': { lat: 51.4969, lng: 11.9695 },
    'magdeburg': { lat: 52.1205, lng: 11.6276 },
    'freiburg': { lat: 47.9990, lng: 7.8421 },
    'krefeld': { lat: 51.3388, lng: 6.5853 },
    'mainz': { lat: 49.9929, lng: 8.2473 },
    'lübeck': { lat: 53.8655, lng: 10.6866 },
    'erfurt': { lat: 50.9848, lng: 11.0299 },
    'rostock': { lat: 54.0887, lng: 12.1446 },
    'kassel': { lat: 51.3127, lng: 9.4797 },
    'hagen': { lat: 51.3670, lng: 7.4637 },
    'potsdam': { lat: 52.3906, lng: 13.0645 },
    'saarbrücken': { lat: 49.2401, lng: 6.9969 },
    'hamm': { lat: 51.6800, lng: 7.8137 },
    'soest': { lat: 51.5671, lng: 8.1065 },
    'lippstadt': { lat: 51.6738, lng: 8.3435 },
    'paderborn': { lat: 51.7189, lng: 8.7545 },
    'gütersloh': { lat: 51.9067, lng: 8.3858 },
    'bielefeld': { lat: 52.0302, lng: 8.5325 },
    'detmold': { lat: 51.9386, lng: 8.8795 },
    'minden': { lat: 52.2897, lng: 8.9157 },
    'herford': { lat: 52.1166, lng: 8.6710 }
  };

  constructor(private http: HttpClient) { }

  /**
   * Géocode une adresse en coordonnées GPS
   * Utilise d'abord l'API Google Maps, puis fallback sur les coordonnées prédéfinies
   */
  geocodeAddress(address: string): Observable<GeocodeResult | null> {
    if (!address || address.trim().length === 0) {
      return of(null);
    }

    const cleanAddress = address.trim();
    console.log(`🗺️ Géocodage de l'adresse: "${cleanAddress}"`);

    // 1. Essayer Google Maps si la clé est présente
    if (this.GOOGLE_MAPS_API_KEY && this.GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY') {
      return this.geocodeWithGoogleMaps(cleanAddress).pipe(
        catchError(error => {
          console.warn('❌ Échec du géocodage Google Maps, tentative avec Nominatim:', error);
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

  /**
   * Géocodage avec l'API Google Maps
   */
  private geocodeWithGoogleMaps(address: string): Observable<GeocodeResult | null> {
    const params = {
      address: address,
      key: this.GOOGLE_MAPS_API_KEY,
      language: 'de',
      region: 'de'
    };

    return this.http.get<any>(this.GEOCODING_URL, { params }).pipe(
      map(response => {
        if (response.status === 'OK' && response.results && response.results.length > 0) {
          const result = response.results[0];
          const location = result.geometry.location;
          
          console.log('✅ Géocodage Google Maps réussi:', {
            address: result.formatted_address,
            coordinates: location
          });

          return {
            lat: location.lat,
            lng: location.lng,
            formatted_address: result.formatted_address,
            place_id: result.place_id,
            accuracy: result.geometry.location_type
          };
        } else {
          console.warn('❌ Aucun résultat trouvé pour:', address);
          return null;
        }
      }),
      catchError(error => {
        console.error('❌ Erreur API Google Maps:', error);
        throw error;
      })
    );
  }

  /**
   * Géocodage de fallback avec coordonnées prédéfinies
   * Recherche dans les noms de villes allemandes connues
   */
  private geocodeWithFallback(address: string): GeocodeResult | null {
    const addressLower = address.toLowerCase();
    
    // Rechercher dans les villes connues (tri par longueur décroissante pour éviter les faux positifs)
    const cities = Object.entries(this.CITY_COORDINATES).sort((a, b) => b[0].length - a[0].length);
    
    for (const [city, coords] of cities) {
      // Recherche plus précise avec délimiteurs de mots
      const cityPattern = new RegExp(`\\b${city}\\b`, 'i');
      if (cityPattern.test(addressLower)) {
        console.log(`✅ Coordonnées trouvées pour ${city}:`, coords);
        return {
          lat: coords.lat,
          lng: coords.lng,
          formatted_address: `${city.charAt(0).toUpperCase() + city.slice(1)}, Deutschland`,
          accuracy: 'APPROXIMATE'
        };
      }
    }

    // Recherche par code postal allemand (pattern: 5 chiffres)
    const postalCodeMatch = address.match(/\b(\d{5})\b/);
    if (postalCodeMatch) {
      const postalCode = postalCodeMatch[1];
      const coordinates = this.getCoordinatesFromPostalCode(postalCode);
      if (coordinates) {
        console.log(`✅ Coordonnées trouvées pour code postal ${postalCode}:`, coordinates);
        return {
          lat: coordinates.lat,
          lng: coordinates.lng,
          formatted_address: `${postalCode}, Deutschland`,
          accuracy: 'APPROXIMATE'
        };
      }
    }

    console.warn('❌ Impossible de géocoder l\'adresse:', address);
    return null;
  }

  /**
   * Estimation des coordonnées basée sur les codes postaux allemands
   * Approximation basée sur les régions
   */
  private getCoordinatesFromPostalCode(postalCode: string): { lat: number; lng: number } | null {
    const code = parseInt(postalCode);
    
    // Approximations basées sur les régions des codes postaux allemands
    if (code >= 10000 && code <= 19999) {
      // Berlin et Brandenburg
      return { lat: 52.5200, lng: 13.4050 };
    } else if (code >= 20000 && code <= 29999) {
      // Hamburg, Bremen, Schleswig-Holstein, Niedersachsen
      return { lat: 53.5511, lng: 9.9937 };
    } else if (code >= 30000 && code <= 39999) {
      // Niedersachsen
      return { lat: 52.3759, lng: 9.7320 }; // Hannover
    } else if (code >= 40000 && code <= 49999) {
      // Nordrhein-Westfalen
      return { lat: 51.2277, lng: 6.7735 }; // Düsseldorf
    } else if (code >= 50000 && code <= 59999) {
      // Nordrhein-Westfalen
      return { lat: 50.9375, lng: 6.9603 }; // Köln
    } else if (code >= 60000 && code <= 69999) {
      // Hessen
      return { lat: 50.1109, lng: 8.6821 }; // Frankfurt
    } else if (code >= 70000 && code <= 79999) {
      // Baden-Württemberg
      return { lat: 48.7758, lng: 9.1829 }; // Stuttgart
    } else if (code >= 80000 && code <= 89999) {
      // Bayern
      return { lat: 48.1351, lng: 11.5820 }; // München
    } else if (code >= 90000 && code <= 99999) {
      // Bayern
      return { lat: 49.4521, lng: 11.0767 }; // Nürnberg
    }

    return null;
  }

  /**
   * Géocodage inverse : coordonnées vers adresse
   */
  reverseGeocode(lat: number, lng: number): Observable<ReverseGeocodeResult | null> {
    if (this.GOOGLE_MAPS_API_KEY && this.GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY') {
      const params = {
        latlng: `${lat},${lng}`,
        key: this.GOOGLE_MAPS_API_KEY,
        language: 'de',
        region: 'de'
      };

      return this.http.get<any>(this.GEOCODING_URL, { params }).pipe(
        map(response => {
          if (response.status === 'OK' && response.results && response.results.length > 0) {
            const result = response.results[0];
            return {
              address: result.formatted_address,
              components: this.parseAddressComponents(result.address_components)
            };
          }
          return null;
        }),
        catchError(error => {
          console.error('❌ Erreur géocodage inverse:', error);
          return of(null);
        })
      );
    } else {
      return of({
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        components: {}
      });
    }
  }

  /**
   * Parse les composants d'adresse de l'API Google Maps
   */
  private parseAddressComponents(components: any[]): any {
    const parsed: any = {};
    
    components.forEach(component => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        parsed.street_number = component.long_name;
      } else if (types.includes('route')) {
        parsed.route = component.long_name;
      } else if (types.includes('locality')) {
        parsed.locality = component.long_name;
      } else if (types.includes('postal_code')) {
        parsed.postal_code = component.long_name;
      } else if (types.includes('country')) {
        parsed.country = component.long_name;
      }
    });

    return parsed;
  }

  /**
   * Valider si des coordonnées sont valides (pas 0,0)
   */
  isValidCoordinates(lat: number, lng: number): boolean {
    return lat !== 0 && lng !== 0 && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
  }

  /**
   * Calculer la distance entre deux points (formule de Haversine)
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance en km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}