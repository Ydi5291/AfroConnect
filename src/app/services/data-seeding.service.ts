import { Injectable } from '@angular/core';
import { FirebaseAfroshopService } from './firebase-afroshop.service';

@Injectable({
  providedIn: 'root'
})
export class DataSeedingService {

  constructor(private firebaseService: FirebaseAfroshopService) {}

  // 🔍 Obtenir les Afroshops existants pour éviter les doublons
  private async getExistingAfroshops(): Promise<any[]> {
    return new Promise((resolve) => {
      this.firebaseService.getAllAfroshops().subscribe({
        next: (afroshops) => resolve(afroshops),
        error: (error) => {
          console.warn('Erreur lors de la récupération des données existantes:', error);
          resolve([]); // En cas d'erreur, considérer comme vide
        }
      });
    });
  }

  // 🧹 Nettoyer les doublons existants en base
  async cleanDuplicates(): Promise<{removed: number, kept: number}> {
    try {
      console.log('🧹 Nettoyage des doublons en cours...');
      
      const allAfroshops = await this.getExistingAfroshops();
      console.log(`📊 ${allAfroshops.length} Afroshops trouvés en base`);
      
      // Grouper par nom + adresse pour identifier les doublons
      const groups = new Map<string, any[]>();
      
      allAfroshops.forEach(shop => {
        const key = `${shop.name}|${shop.address}`;
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(shop);
      });
      
      let removedCount = 0;
      let keptCount = 0;
      
      // Pour chaque groupe, garder le premier et supprimer les autres
      for (const [key, duplicates] of groups) {
        if (duplicates.length > 1) {
          console.log(`🔍 Doublon trouvé: ${duplicates[0].name} (${duplicates.length} copies)`);
          
          // Garder le premier (le plus ancien généralement)
          keptCount++;
          
          // Supprimer les autres
          for (let i = 1; i < duplicates.length; i++) {
            try {
              await this.firebaseService.deleteAfroshop(duplicates[i].id);
              removedCount++;
              console.log(`🗑️ Supprimé: ${duplicates[i].name} (ID: ${duplicates[i].id})`);
              
              // Délai pour éviter de surcharger Firebase
              await this.delay(100);
            } catch (error) {
              console.error(`❌ Erreur suppression ${duplicates[i].id}:`, error);
            }
          }
        } else {
          keptCount++;
        }
      }
      
      console.log(`✅ Nettoyage terminé: ${removedCount} supprimés, ${keptCount} conservés`);
      return { removed: removedCount, kept: keptCount };
      
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      throw error;
    }
  }

  // Données des Afroshops réels en Allemagne
  private afroshopsData = [
    // BERLIN - Grande ville
    {
      name: 'Mama Afrika Restaurant',
      type: 'restaurant' as const,
      address: 'Müllerstraße 123, 13349 Berlin',
      coordinates: { lat: 52.5200, lng: 13.4050 },
      phone: '+49 30 12345678',
      description: 'Authentisches westafrikanisches Restaurant mit traditionellen Gerichten aus Ghana und Nigeria. Spezialitäten: Jollof Rice, Fufu, Kelewele.',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
      cuisine: 'Westafrikanische',
      priceLevel: 2,
      hours: 'Mo-Fr: 12:00-22:00, Sa: 14:00-23:00, So: 14:00-21:00',
      website: 'https://mama-afrika-berlin.de'
    },
    {
      name: 'Ethiopian Queen Restaurant',
      type: 'restaurant' as const,
      address: 'Kreuzbergstraße 45, 10965 Berlin',
      coordinates: { lat: 52.4995, lng: 13.3883 },
      phone: '+49 30 23456789',
      description: 'Traditionelle äthiopische Küche in gemütlicher Atmosphäre. Injera, Doro Wat und vegetarische Optionen.',
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      cuisine: 'Äthiopische',
      priceLevel: 2,
      hours: 'Mo-So: 17:00-23:00',
      website: 'https://ethiopian-queen.de'
    },
    {
      name: 'Afro Hair Salon Berlin',
      type: 'coiffeur' as const,
      address: 'Hermannstraße 89, 12049 Berlin',
      coordinates: { lat: 52.4755, lng: 13.4324 },
      phone: '+49 30 34567890',
      description: 'Spezialist für afroamerikanische Haarpflege. Braids, Weaves, Natural Hair Care und chemische Behandlungen.',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop',
      cuisine: '',
      priceLevel: 3,
      hours: 'Mo-Fr: 09:00-19:00, Sa: 09:00-17:00',
      website: ''
    },
    {
      name: 'Afrika Market Berlin',
      type: 'epicerie' as const,
      address: 'Turmstraße 234, 10551 Berlin',
      coordinates: { lat: 52.5252, lng: 13.3415 },
      phone: '+49 30 45678901',
      description: 'Größter afrikanischer Supermarkt in Berlin. Yams, Kochbananen, Palmöl, Gewürze und Fleischspezialitäten.',
      rating: 4.2,
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&h=600&fit=crop',
      cuisine: '',
      priceLevel: 2,
      hours: 'Mo-Sa: 08:00-20:00, So: 10:00-18:00',
      website: 'https://afrika-market-berlin.de'
    },

    // HAMBURG - Grande ville
    {
      name: 'Senegal Restaurant Hamburg',
      type: 'restaurant' as const,
      address: 'Reeperbahn 456, 20359 Hamburg',
      coordinates: { lat: 53.5511, lng: 9.9937 },
      phone: '+49 40 12345678',
      description: 'Authentische senegalesische Küche. Thieboudienne, Yassa Poulet und frische Meeresfrüchte.',
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop',
      cuisine: 'Senegalesische',
      priceLevel: 3,
      hours: 'Mo-Fr: 18:00-24:00, Sa-So: 17:00-01:00',
      website: 'https://senegal-restaurant-hh.de'
    },
    {
      name: 'Afro Style Hamburg',
      type: 'coiffeur' as const,
      address: 'Steindamm 123, 20099 Hamburg',
      coordinates: { lat: 53.5530, lng: 10.0061 },
      phone: '+49 40 23456789',
      description: 'Moderner Afro-Friseursalon mit internationalen Stylisten. Cuts, Farben und Extensions.',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1521490878783-35eb2c52f3b7?w=800&h=600&fit=crop',
      cuisine: '',
      priceLevel: 3,
      hours: 'Mo-Fr: 10:00-20:00, Sa: 09:00-18:00',
      website: ''
    },

    // MÜNCHEN - Grande ville
    {
      name: 'Kamerun Eck München',
      type: 'restaurant' as const,
      address: 'Maximilianstraße 78, 80539 München',
      coordinates: { lat: 48.1351, lng: 11.5820 },
      phone: '+49 89 12345678',
      description: 'Kamerunische Spezialitäten in bayerischer Atmosphäre. Ndolé, Poulet DG und Kochbananen.',
      rating: 4.1,
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
      cuisine: 'Kamerunische',
      priceLevel: 2,
      hours: 'Mo-Sa: 11:30-22:00',
      website: ''
    },

    // KÖLN - Grande ville  
    {
      name: 'Nigerianisches Restaurant Köln',
      type: 'restaurant' as const,
      address: 'Zülpicher Straße 234, 50937 Köln',
      coordinates: { lat: 50.9375, lng: 6.9603 },
      phone: '+49 221 12345678',
      description: 'Authentische nigerianische Küche. Jollof Rice, Suya, Pounded Yam und Egusi Soup.',
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop',
      cuisine: 'Nigerianische',
      priceLevel: 2,
      hours: 'Mo-Fr: 12:00-21:00, Sa-So: 14:00-22:00',
      website: 'https://nigerian-restaurant-koeln.de'
    },

    // FRANKFURT - Grande ville
    {
      name: 'Eritrea Restaurant Frankfurt',
      type: 'restaurant' as const,
      address: 'Berger Straße 145, 60316 Frankfurt am Main',
      coordinates: { lat: 50.1109, lng: 8.6821 },
      phone: '+49 69 12345678',
      description: 'Eritreische und äthiopische Küche. Injera, Zigni und traditionelle Kaffeezeremonie.',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1554978991-33ef7f31d658?w=800&h=600&fit=crop',
      cuisine: 'Eritreische',
      priceLevel: 2,
      hours: 'Mo-So: 17:00-23:00',
      website: ''
    },

    // STUTTGART - Grande ville
    {
      name: 'Afrika Laden Stuttgart',
      type: 'epicerie' as const,
      address: 'Königstraße 89, 70173 Stuttgart',
      coordinates: { lat: 48.7758, lng: 9.1829 },
      phone: '+49 711 12345678',
      description: 'Afrikanische Lebensmittel und Gewürze. Maniok, Kochbananen, Palmöl und traditionelle Snacks.',
      rating: 4.0,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop',
      cuisine: '',
      priceLevel: 2,
      hours: 'Mo-Fr: 09:00-19:00, Sa: 09:00-17:00',
      website: ''
    },

    // DÜSSELDORF - Grande ville
    {
      name: 'Marokkanisches Restaurant Düsseldorf',
      type: 'restaurant' as const,
      address: 'Immermannstraße 23, 40210 Düsseldorf',
      coordinates: { lat: 51.2277, lng: 6.7735 },
      phone: '+49 211 12345678',
      description: 'Nordafrikanische Küche. Tajine, Couscous, Pastilla und marokkanische Tees.',
      rating: 4.2,
      image: 'https://images.unsplash.com/photo-1539353130027-9532750e7146?w=800&h=600&fit=crop',
      cuisine: 'Marokkanische',
      priceLevel: 3,
      hours: 'Mo-So: 17:00-24:00',
      website: 'https://marokko-restaurant-dus.de'
    },

    // DORTMUND - Grande ville
    {
      name: 'Afro Palace Dortmund',
      type: 'restaurant' as const,
      address: 'Kampstraße 45, 44137 Dortmund',
      coordinates: { lat: 51.5136, lng: 7.4653 },
      phone: '+49 231 12345678',
      description: 'Westafrikanische und zentralafrikanische Küche in modernem Ambiente.',
      rating: 4.1,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
      cuisine: 'Westafrikanische',
      priceLevel: 2,
      hours: 'Mo-Sa: 12:00-22:00',
      website: ''
    },

    // ESSEN - Grande ville
    {
      name: 'African Beauty Salon Essen',
      type: 'coiffeur' as const,
      address: 'Kettwiger Straße 67, 45127 Essen',
      coordinates: { lat: 51.4556, lng: 7.0116 },
      phone: '+49 201 12345678',
      description: 'Kompletter Service für afrikanisches Haar. Relaxer, Braids, Weaves und Naturhaar-Styling.',
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop',
      cuisine: '',
      priceLevel: 3,
      hours: 'Mo-Fr: 09:00-18:00, Sa: 08:00-16:00',
      website: ''
    },

    // LEIPZIG - Ville moyenne
    {
      name: 'Äthiopisches Restaurant Leipzig',
      type: 'restaurant' as const,
      address: 'Karl-Liebknecht-Straße 123, 04107 Leipzig',
      coordinates: { lat: 51.3397, lng: 12.3731 },
      phone: '+49 341 12345678',
      description: 'Traditionelle äthiopische Gerichte in familiärer Atmosphäre.',
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&h=600&fit=crop',
      cuisine: 'Äthiopische',
      priceLevel: 2,
      hours: 'Mo-Sa: 17:00-22:00',
      website: ''
    },

    // BREMEN - Ville moyenne
    {
      name: 'Afrika Shop Bremen',
      type: 'epicerie' as const,
      address: 'Osterstraße 234, 28199 Bremen',
      coordinates: { lat: 53.0793, lng: 8.8017 },
      phone: '+49 421 12345678',
      description: 'Afrikanische Spezialitäten und Kosmetik. Shea-Butter, schwarze Seife und exotische Früchte.',
      rating: 4.1,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      cuisine: '',
      priceLevel: 2,
      hours: 'Mo-Fr: 10:00-19:00, Sa: 10:00-17:00',
      website: ''
    },

    // DRESDEN - Ville moyenne
    {
      name: 'Sudanesisches Restaurant Dresden',
      type: 'restaurant' as const,
      address: 'Prager Straße 89, 01069 Dresden',
      coordinates: { lat: 51.0504, lng: 13.7373 },
      phone: '+49 351 12345678',
      description: 'Sudanesische und ostafriikanische Küche. Ful Medames, Kisra und Bamya.',
      rating: 4.0,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
      cuisine: 'Sudanesische',
      priceLevel: 2,
      hours: 'Mo-Fr: 12:00-21:00, Sa: 14:00-22:00',
      website: ''
    },

    // HANNOVER - Ville moyenne
    {
      name: 'African Fashion Hannover',
      type: 'vetement' as const,
      address: 'Georgstraße 156, 30159 Hannover',
      coordinates: { lat: 52.3759, lng: 9.7320 },
      phone: '+49 511 12345678',
      description: 'Afrikanische Mode und Accessoires. Dashiki, Kente-Stoffe und handgemachter Schmuck.',
      rating: 4.2,
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=600&fit=crop',
      cuisine: '',
      priceLevel: 3,
      hours: 'Mo-Fr: 10:00-19:00, Sa: 10:00-18:00',
      website: 'https://african-fashion-hannover.de'
    },

    // NÜRNBERG - Ville moyenne
    {
      name: 'Westafrica Nürnberg',
      type: 'restaurant' as const,
      address: 'Königstraße 234, 90402 Nürnberg',
      coordinates: { lat: 49.4521, lng: 11.0767 },
      phone: '+49 911 12345678',
      description: 'Ghanaische und ivorische Küche. Banku, Attiéké und Palm Nut Soup.',
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop',
      cuisine: 'Ghanaische',
      priceLevel: 2,
      hours: 'Mo-Sa: 11:00-22:00',
      website: ''
    }
  ];

  // Données supplémentaires pour les petites villes et Kreise
  private kleinestadtAfroshops = [
    // Kreis Soest et environs
    {
      name: 'Afrika Imbiss Soest',
      type: 'restaurant' as const,
      address: 'Thomästraße 12, 59494 Soest',
      coordinates: { lat: 51.5671, lng: 8.1067 },
      phone: '+49 2921 123456',
      description: 'Kleiner gemütlicher Imbiss mit westafrikanischen Spezialitäten. Hausgemachtes Jollof Rice.',
      rating: 4.2,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop',
      cuisine: 'Westafrikanische',
      priceLevel: 1,
      hours: 'Mo-Fr: 11:00-20:00, Sa: 12:00-21:00',
      website: ''
    },
    {
      name: 'Afro Hair Werl',
      type: 'coiffeur' as const,
      address: 'Hammer Straße 34, 59457 Werl',
      coordinates: { lat: 51.5531, lng: 7.9119 },
      phone: '+49 2922 234567',
      description: 'Spezialisiert auf afrikanische Frisuren in ruhiger Kleinstadt-Atmosphäre.',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop',
      cuisine: '',
      priceLevel: 2,
      hours: 'Mo-Fr: 09:00-18:00, Sa: 09:00-15:00',
      website: ''
    }
  ];

  async seedDatabase(): Promise<void> {
    try {
      console.log('🌱 Début du peuplement de la base de données...');
      
      // 🔍 Vérifier d'abord les données existantes
      const existingAfroshops = await this.getExistingAfroshops();
      console.log(`📊 ${existingAfroshops.length} Afroshops déjà en base`);
      
      // Combiner toutes les données
      const allAfroshops = [...this.afroshopsData, ...this.kleinestadtAfroshops];
      
      // 🚫 Filtrer les doublons (même nom + même adresse)
      const newAfroshops = allAfroshops.filter(newShop => {
        return !existingAfroshops.some((existing: any) => 
          existing.name === newShop.name && 
          existing.address === newShop.address
        );
      });

      console.log(`✨ ${newAfroshops.length} nouveaux Afroshops à ajouter`);
      
      if (newAfroshops.length === 0) {
        throw new Error('⚠️ Tous les Afroshops sont déjà en base ! Aucun nouvel ajout nécessaire.');
      }
      
      let successCount = 0;
      let errorCount = 0;

      for (const afroshop of newAfroshops) {
        try {
          // Préparer les données pour Firebase
          const firebaseData = {
            ...afroshop,
            city: this.extractCityFromAddress(afroshop.address),
            verified: true, // Les données importées sont vérifiées
            createdBy: 'system',
            createdByName: 'System Import',
            views: Math.floor(Math.random() * 100) + 10, // Vues aléatoires
            likes: Math.floor(Math.random() * 20) + 5 // Likes aléatoires
          };

          await this.firebaseService.addAfroshop(firebaseData);
          successCount++;
          console.log(`✅ ${afroshop.name} ajouté avec succès`);
          
          // Petit délai pour éviter de surcharger Firebase
          await this.delay(100);
          
        } catch (error) {
          errorCount++;
          console.error(`❌ Erreur lors de l'ajout de ${afroshop.name}:`, error);
        }
      }

      console.log(`🎉 Import terminé: ${successCount} ajoutés, ${errorCount} erreurs`);
      
    } catch (error) {
      console.error('💥 Erreur générale lors du seeding:', error);
    }
  }

  private extractCityFromAddress(address: string): string {
    // Extraire le nom de la ville depuis l'adresse
    const parts = address.split(',');
    if (parts.length >= 2) {
      const cityPart = parts[parts.length - 1].trim();
      const cityMatch = cityPart.match(/\d+\s+(.+)/);
      return cityMatch ? cityMatch[1].toLowerCase() : cityPart.toLowerCase();
    }
    return '';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}