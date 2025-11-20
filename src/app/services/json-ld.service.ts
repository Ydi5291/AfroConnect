import { Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JsonLdService {
  private scriptId = 'structured-data';

  constructor(@Inject(DOCUMENT) private document: Document) {}

  /**
   * Insère un script JSON-LD dans le head
   */
  insertSchema(schema: any): void {
    // Supprimer l'ancien script s'il existe
    this.removeSchema();

    // Créer le nouveau script
    const script = this.document.createElement('script');
    script.setAttribute('id', this.scriptId);
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(schema, null, 2);
    
    this.document.head.appendChild(script);
    console.log('✅ JSON-LD schema inserted:', schema['@type']);
  }

  /**
   * Supprime le script JSON-LD existant
   */
  removeSchema(): void {
    const existingScript = this.document.getElementById(this.scriptId);
    if (existingScript) {
      existingScript.remove();
    }
  }

  /**
   * Génère le schema Organization pour AfroConnect
   */
  getOrganizationSchema(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'AfroConnect',
      'url': 'https://afroconnect.shop',
      'logo': 'https://afroconnect.shop/assets/AfroConnect-logo.JPG',
      'description': 'Die größte Plattform für afrikanische Geschäfte, Restaurants und Dienstleistungen in Europa',
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+49-178-4123151',
        'contactType': 'Customer Service',
        'areaServed': ['DE', 'AT', 'CH', 'FR', 'BE', 'NL', 'LU'],
        'availableLanguage': ['de', 'en', 'fr']
      },
      'sameAs': [
        'https://www.facebook.com/afroconnect',
        'https://www.instagram.com/afroconnect',
        'https://twitter.com/afroconnect'
      ]
    };
  }

  /**
   * Génère le schema WebSite avec SearchAction
   */
  getWebSiteSchema(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'AfroConnect',
      'url': 'https://afroconnect.shop',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': 'https://afroconnect.shop/shops?search={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    };
  }

  /**
   * Génère le schema LocalBusiness pour un shop
   */
  getLocalBusinessSchema(shop: any): any {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      'name': shop.name,
      'description': shop.description || `${shop.name} in ${shop.city}`,
      'telephone': shop.phone,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': shop.address,
        'addressLocality': shop.city,
        'postalCode': shop.plz,
        'addressCountry': 'DE'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': shop.coordinates?.lat,
        'longitude': shop.coordinates?.lng
      },
      'url': `https://afroconnect.shop/shops/${this.generateSlug(shop)}`,
      'priceRange': this.getPriceRange(shop.priceLevel)
    };

    // Ajouter l'image si disponible
    if (shop.image) {
      schema.image = shop.image;
    }

    // Ajouter le site web si disponible
    if (shop.website) {
      schema.url = shop.website;
    }

    // Ajouter les horaires si disponibles
    if (shop.hours) {
      schema.openingHours = shop.hours;
    }

    // Ajouter la note si disponible
    if (shop.rating) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        'ratingValue': shop.rating,
        'bestRating': '5',
        'worstRating': '1'
      };
    }

    // Ajouter le type spécifique
    if (shop.type === 'restaurant') {
      schema['@type'] = 'Restaurant';
      if (shop.cuisine) {
        schema.servesCuisine = shop.cuisine;
      }
    } else if (shop.type === 'coiffeur') {
      schema['@type'] = 'HairSalon';
    } else if (shop.type === 'epicerie') {
      schema['@type'] = 'Store';
    }

    return schema;
  }

  /**
   * Génère le schema Breadcrumb pour la navigation
   */
  getBreadcrumbSchema(items: Array<{name: string, url: string}>): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.url
      }))
    };
  }

  /**
   * Génère le schema ItemList pour une liste de shops
   */
  getItemListSchema(shops: any[], listName: string): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': listName,
      'numberOfItems': shops.length,
      'itemListElement': shops.map((shop, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'LocalBusiness',
          'name': shop.name,
          'url': `https://afroconnect.shop/shops/${this.generateSlug(shop)}`,
          'image': shop.image,
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': shop.city,
            'addressCountry': 'DE'
          }
        }
      }))
    };
  }

  /**
   * Génère le schema CollectionPage pour la galerie
   */
  getCollectionPageSchema(shops: any[]): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'name': 'Afrikanische Geschäfte Galerie',
      'description': 'Entdecken Sie afrikanische Restaurants, Afroshops und Dienstleistungen in ganz Europa',
      'url': 'https://afroconnect.shop/gallery',
      'mainEntity': {
        '@type': 'ItemList',
        'numberOfItems': shops.length,
        'itemListElement': shops.slice(0, 20).map((shop, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'url': `https://afroconnect.shop/shops/${this.generateSlug(shop)}`
        }))
      }
    };
  }

  /**
   * Génère le schema FAQ pour la page d'aide
   */
  getFAQSchema(faqs: Array<{question: string, answer: string}>): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer
        }
      }))
    };
  }

  /**
   * Combine plusieurs schemas avec @graph
   */
  getCombinedSchema(...schemas: any[]): any {
    return {
      '@context': 'https://schema.org',
      '@graph': schemas
    };
  }

  /**
   * Génère un slug SEO-friendly
   */
  private generateSlug(shop: any): string {
    const name = shop.name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const city = shop.city
      ?.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return city ? `${name}-${city}` : name;
  }

  /**
   * Convertit priceLevel en priceRange
   */
  private getPriceRange(priceLevel: number): string {
    const ranges: Record<number, string> = {
      1: '€',
      2: '€€',
      3: '€€€',
      4: '€€€€'
    };
    return ranges[priceLevel] || '€€';
  }
}
