import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SEOService } from '../services/seo.service';
import { JsonLdService } from '../services/json-ld.service';
import { FirebaseAfroshopService } from '../services/firebase-afroshop.service';
import { AfroshopData } from '../services/image.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-city',
  imports: [CommonModule],
  templateUrl: './city.component.html',
  styleUrl: './city.component.css'
})
export class CityComponent implements OnInit, OnDestroy {
  citySlug: string = '';
  cityName: string = '';
  shops: AfroshopData[] = [];
  loading: boolean = true;
  private subscription?: Subscription;
  
  private seoService = inject(SEOService);
  private jsonLdService = inject(JsonLdService);
  private afroshopService = inject(FirebaseAfroshopService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Mapping des slugs vers noms complets de villes
  cityNames: Record<string, string> = {
    // 🇩🇪 Allemagne
    'berlin': 'Berlin',
    'hamburg': 'Hamburg',
    'munchen': 'München',
    'koln': 'Köln',
    'frankfurt': 'Frankfurt am Main',
    'stuttgart': 'Stuttgart',
    'dusseldorf': 'Düsseldorf',
    'dortmund': 'Dortmund',
    'essen': 'Essen',
    'leipzig': 'Leipzig',
    'bremen': 'Bremen',
    'dresden': 'Dresden',
    'hannover': 'Hannover',
    'nurnberg': 'Nürnberg',
    'duisburg': 'Duisburg',
    'bochum': 'Bochum',
    'wuppertal': 'Wuppertal',
    'bielefeld': 'Bielefeld',
    'bonn': 'Bonn',
    'mannheim': 'Mannheim',
    
    // 🇫🇷 France
    'paris': 'Paris',
    'lyon': 'Lyon',
    'marseille': 'Marseille',
    'toulouse': 'Toulouse',
    'strasbourg': 'Strasbourg',
    'bordeaux': 'Bordeaux',
    'lille': 'Lille',
    'nice': 'Nice',
    'nantes': 'Nantes',
    
    // 🇧🇪 Belgique
    'bruxelles': 'Bruxelles',
    'antwerpen': 'Antwerpen',
    'gent': 'Gent',
    'charleroi': 'Charleroi',
    'liege': 'Liège',
    
    // 🇳🇱 Pays-Bas
    'amsterdam': 'Amsterdam',
    'rotterdam': 'Rotterdam',
    'den-haag': 'Den Haag',
    'utrecht': 'Utrecht',
    'eindhoven': 'Eindhoven',
    
    // 🇨🇭 Suisse
    'zurich': 'Zürich',
    'genf': 'Genève',
    'basel': 'Basel',
    'bern': 'Bern',
    'lausanne': 'Lausanne',
    
    // 🇱🇺 Luxembourg
    'luxembourg': 'Luxembourg',
    
    // 🇦🇹 Autriche
    'wien': 'Wien',
    'graz': 'Graz',
    'linz': 'Linz',
    'salzburg': 'Salzburg',
    'innsbruck': 'Innsbruck'
  };

  ngOnInit() {
    this.citySlug = this.route.snapshot.paramMap.get('citySlug') || '';
    this.cityName = this.cityNames[this.citySlug] || this.citySlug;

    // Charger les shops de cette ville
    this.subscription = this.afroshopService.getAllAfroshops().subscribe(allShops => {
      // Filtrer par ville (case-insensitive)
      this.shops = allShops.filter(shop => 
        shop.city?.toLowerCase() === this.cityName.toLowerCase()
      );
      
      this.loading = false;

      // SEO meta tags
      this.seoService.setCityPage(this.cityName, this.shops.length);

      // JSON-LD structured data
      if (this.shops.length > 0) {
        const schema = this.jsonLdService.getCombinedSchema(
          this.jsonLdService.getItemListSchema(this.shops, `Afroshops in ${this.cityName}`),
          this.jsonLdService.getBreadcrumbSchema([
            { name: 'Home', url: 'https://afroconnect.shop' },
            { name: 'Städte', url: 'https://afroconnect.shop/gallery' },
            { name: this.cityName, url: `https://afroconnect.shop/city/${this.citySlug}` }
          ])
        );
        this.jsonLdService.insertSchema(schema);
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  // Obtenir tous les types de shops uniques
  getShopTypes(): string[] {
    const types = new Set(this.shops.map(shop => shop.type));
    return Array.from(types);
  }

  // Filtrer les shops par type
  getShopsByType(type: string): AfroshopData[] {
    return this.shops.filter(shop => shop.type === type);
  }

  // Obtenir le nom traduit du type
  getTypeName(type: string): string {
    const typeNames: Record<string, string> = {
      'restaurant': 'Restaurants',
      'epicerie': 'Lebensmittelgeschäfte',
      'coiffeur': 'Friseursalons',
      'boutique': 'Boutiquen',
      'service': 'Dienstleistungen',
      'autre': 'Andere'
    };
    return typeNames[type] || type;
  }

  // Naviguer vers un shop
  goToShop(shop: AfroshopData): void {
    this.router.navigate(['/shop', shop.id]);
  }

  // Obtenir l'icône pour chaque type
  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'restaurant': '🍲',
      'epicerie': '🛒',
      'coiffeur': '💇',
      'boutique': '👗',
      'service': '🎵',
      'autre': '📍'
    };
    return icons[type] || '📍';
  }
}
