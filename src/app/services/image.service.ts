import { Injectable } from '@angular/core';

export interface AfroshopData {
  id: number | string; // Support pour Firebase (string) et données locales (number)
  name: string;
  type: 'restaurant' | 'epicerie' | 'coiffeur' | 'vetement' | 'services';
  address: string;
  street?: string;
  city?: string;
  plz?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  description: string;
  rating: number;
  image: string;
  cuisine?: string; // Pour les restaurants
  priceLevel: number; // 1-4 (€ à €€€€)
  hours: string;
  website?: string; // Site web optionnel
  distance?: number; // Sera calculée dynamiquement
}

@Injectable({
  providedIn: 'root'
})
export class AfroshopService {

  private afroshops: AfroshopData[] = [
    {
      id: 1,
      name: 'Mama Afrika Restaurant',
      type: 'restaurant',
      address: 'Müllerstraße 123, 13349 Berlin',
      coordinates: { lat: 52.5200, lng: 13.4050 },
      phone: '+49 30 12345678',
      description: 'Authentisches Restaurant mit westafrikanischen Spezialitäten. Warme Atmosphäre und traditionelle Gerichte mit Liebe zubereitet. Spezialitäten: Jollof Rice, Poulet Yassa, Attiéké.',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
      cuisine: 'Westafrikanische',
      priceLevel: 2,
      hours: 'Mo-So: 12:00-22:00'
    },

    // DORTMUND - Afroshops
    {
      id: 7,
      name: 'Afro Palace Dortmund',
      type: 'restaurant',
      address: 'Kampstraße 45, 44137 Dortmund',
      coordinates: { lat: 51.5136, lng: 7.4653 },
      phone: '+49 231 567890',
      description: 'Das beste afrikanische Restaurant im Herzen von Dortmund. Bekannt für authentische nigerianische und ghanaische Küche.',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
      cuisine: 'Westafrikanische',
      priceLevel: 2,
      hours: 'Di-So: 17:00-23:00'
    },
    {
      id: 8,
      name: 'Sahara Markt Dortmund',
      type: 'epicerie',
      address: 'Steinstraße 33, 44147 Dortmund',
      coordinates: { lat: 51.5200, lng: 7.4600 },
      phone: '+49 231 445566',
      description: 'Größter afrikanischer Supermarkt in Dortmund. Frische Produkte, Gewürze und Spezialitäten aus ganz Afrika.',
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      priceLevel: 1,
      hours: 'Mo-Sa: 09:00-20:00'
    },
    {
      id: 9,
      name: 'Style Africain Dortmund',
      type: 'coiffeur',
      address: 'Rheinische Straße 89, 44137 Dortmund',
      coordinates: { lat: 51.5100, lng: 7.4700 },
      phone: '+49 231 778899',
      description: 'Spezialisiert auf afrikanische Frisuren, Braiding und Extensions. Erfahrene Stylisten aus ganz Afrika.',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1562322140-8198e5d5067e?w=800&h=600&fit=crop',
      priceLevel: 2,
      hours: 'Mo-Sa: 10:00-19:00'
    },

    // HAMBURG - Afroshops
    {
      id: 10,
      name: 'Kilimanjaro Hamburg',
      type: 'restaurant', 
      address: 'Große Bergstraße 123, 22767 Hamburg',
      coordinates: { lat: 53.5511, lng: 9.9937 },
      phone: '+49 40 334455',
      description: 'Ostafriikanisches Restaurant mit Swahili-Küche. Authentische Gerichte aus Tansania und Kenia.',
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
      cuisine: 'Ostafrikanische',
      priceLevel: 3,
      hours: 'Mi-So: 18:00-23:00'
    },
    {
      id: 11,
      name: 'Baobab Markt Hamburg',
      type: 'epicerie',
      address: 'Steindamm 55, 20099 Hamburg',
      coordinates: { lat: 53.5550, lng: 10.0050 },
      phone: '+49 40 667788',
      description: 'Afrikanische Lebensmittel und Produkte im Zentrum von Hamburg. Von Kochbananen bis Shea-Butter.',
      rating: 4.2,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop',
      priceLevel: 2,
      hours: 'Mo-Sa: 08:00-20:00'
    },

    // KÖLN - Afroshops  
    {
      id: 12,
      name: 'Senegal Eck Köln',
      type: 'restaurant',
      address: 'Venloer Straße 234, 50823 Köln',
      coordinates: { lat: 50.9375, lng: 6.9603 },
      phone: '+49 221 889900',
      description: 'Traditionelles senegalesisches Restaurant. Thieboudienne und Yassa-Spezialitäten in gemütlicher Atmosphäre.',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&h=600&fit=crop',
      cuisine: 'Senegalesische',
      priceLevel: 2,
      hours: 'Do-Mo: 17:00-22:00'
    },
    {
      id: 13,
      name: 'Afrika Center Köln',
      type: 'services',
      address: 'Wilhelmsplatz 12, 50674 Köln',
      coordinates: { lat: 50.9400, lng: 6.9500 },
      phone: '+49 221 445566',
      description: 'Beratungszentrum für afrikanische Community. Geldtransfer, Visa-Service und kulturelle Veranstaltungen.',
      rating: 4.1,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      priceLevel: 1,
      hours: 'Mo-Fr: 09:00-18:00'
    },

    // FRANKFURT - Afroshops
    {
      id: 14,
      name: 'Addis Abeba Frankfurt',
      type: 'restaurant',
      address: 'Leipziger Straße 78, 60487 Frankfurt am Main',
      coordinates: { lat: 50.1109, lng: 8.6821 },
      phone: '+49 69 778899',
      description: 'Äthiopisches Restaurant mit traditioneller Injera und Wat. Authentische Gewürze direkt aus Äthiopien.',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
      cuisine: 'Äthiopische',
      priceLevel: 2,
      hours: 'Di-So: 17:30-23:00'
    },
    {
      id: 15,
      name: 'Wax Print Fashion Frankfurt',
      type: 'vetement',
      address: 'Kaiserstraße 199, 60311 Frankfurt am Main',
      coordinates: { lat: 50.1150, lng: 8.6850 },
      phone: '+49 69 556677',
      description: 'Traditionelle afrikanische Mode und moderne Designs. Wax-Print Stoffe und maßgeschneiderte Kleidung.',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop',
      priceLevel: 3,
      hours: 'Mo-Sa: 11:00-19:00'
    },

    // Ajouter plus de villes...
    {
      id: 2,
      name: 'Afro Market Hamburg',
      type: 'epicerie',
      address: 'Steindamm 78, 20099 Hamburg',
      coordinates: { lat: 53.5511, lng: 10.0067 },
      phone: '+49 40 87654321',
      description: 'Vollständiger afrikanischer Supermarkt mit frischen Produkten, authentischen Gewürzen, Kosmetik und traditionellen Artikeln. Große Auswahl an tropischen Gemüsen und direkt aus Afrika importierten Produkten.',
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop',
      priceLevel: 2,
      hours: 'Mo-Sa: 09:00-20:00'
    },
    {
      id: 3,
      name: 'Salon Nappy Queen',
      type: 'coiffeur',
      address: 'Königstraße 45, 70173 Stuttgart',
      coordinates: { lat: 48.7758, lng: 9.1829 },
      phone: '+49 711 98765432',
      description: 'Friseursalon spezialisiert auf afro und krauses Haar. Flechtwerk, Glättung, natürliche Pflege und schützende Frisuren. Erfahrenes Team und hochwertige Produkte.',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop',
      priceLevel: 3,
      hours: 'Di-Sa: 10:00-19:00'
    },
    {
      id: 4,
      name: 'Le Baobab München',
      type: 'restaurant',
      address: 'Landwehrstraße 32, 80336 München',
      coordinates: { lat: 48.1351, lng: 11.5820 },
      phone: '+49 89 11223344',
      description: 'Elegantes senegalesisches Restaurant mit raffinierter Küche. Modernes Ambiente mit traditionellen Akzenten. Spezialitäten: Thieboudienne, Mafé, hausgemachter Bissap.',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
      cuisine: 'Senegalesische',
      priceLevel: 3,
      hours: 'Mi-So: 18:00-23:00'
    },
    {
      id: 5,
      name: 'Afrika Mode Köln',
      type: 'vetement',
      address: 'Ehrenstraße 67, 50672 Köln',
      coordinates: { lat: 50.9375, lng: 6.9603 },
      phone: '+49 221 55667788',
      description: 'Afrikanische Modeboutique mit traditioneller und zeitgenössischer Kleidung. Wax, Bogolan, Dashiki, authentischer Schmuck und Accessoires. Maßanfertigung verfügbar.',
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop',
      priceLevel: 3,
      hours: 'Mo-Sa: 10:00-19:00'
    },
    {
      id: 6,
      name: 'Transfert Afrika Services',
      type: 'services',
      address: 'Warschauer Str. 34, 10243 Berlin',
      coordinates: { lat: 52.5058, lng: 13.4498 },
      phone: '+49 30 99887766',
      description: 'Geldtransfer nach Afrika, Währungswechsel und Finanzberatung. Offizieller Partner von Western Union und Money Gram. Schneller und sicherer Service.',
      rating: 4.2,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
      priceLevel: 1,
      hours: 'Mo-Fr: 09:00-18:00, Sa: 10:00-16:00'
    }
  ];

  constructor() { }

  // Alle Afroshops abrufen
  getAllAfroshops(): AfroshopData[] {
    return this.afroshops;
  }

  // Afroshop nach ID abrufen
  getAfroshopById(id: number | string): AfroshopData | undefined {
    return this.afroshops.find(shop => shop.id == id); // Utiliser == pour comparer number et string
  }

  // Nach Geschäftstyp filtern
  getAfroshopsByType(type: AfroshopData['type']): AfroshopData[] {
    return this.afroshops.filter(shop => shop.type === type);
  }

  // Nach Name oder Küche suchen
  searchAfroshops(searchTerm: string): AfroshopData[] {
    const term = searchTerm.toLowerCase();
    return this.afroshops.filter(shop => 
      shop.name.toLowerCase().includes(term) ||
      shop.cuisine?.toLowerCase().includes(term) ||
      shop.description.toLowerCase().includes(term)
    );
  }

  // Nach Stadt filtern
  getAfroshopsByCity(city: string): AfroshopData[] {
    if (!city) return this.afroshops;
    
    const cityNames: { [key: string]: string[] } = {
      'berlin': ['Berlin'],
      'hamburg': ['Hamburg'],
      'münchen': ['München', 'Munich'],
      'köln': ['Köln', 'Cologne'],
      'frankfurt': ['Frankfurt am Main', 'Frankfurt'],
      'stuttgart': ['Stuttgart'],
      'düsseldorf': ['Düsseldorf'],
      'dortmund': ['Dortmund'],
      'essen': ['Essen'],
      'leipzig': ['Leipzig'],
      'bremen': ['Bremen'],
      'dresden': ['Dresden'],
      'hannover': ['Hannover'],
      'nürnberg': ['Nürnberg', 'Nuremberg']
    };

    const searchNames = cityNames[city.toLowerCase()] || [city];
    
    return this.afroshops.filter(shop => {
      return searchNames.some(name => 
        shop.address.toLowerCase().includes(name.toLowerCase())
      );
    });
  }
}
