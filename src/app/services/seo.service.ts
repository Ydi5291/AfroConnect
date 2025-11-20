import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  image?: string;
  url?: string;
  type?: string;
  canonical?: string;
  robots?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SEOService {
  private defaultImage = 'https://afroconnect.shop/assets/AfroConnect-logo.JPG';
  private defaultUrl = 'https://afroconnect.shop';
  private siteName = 'AfroConnect';

  constructor(
    private meta: Meta,
    private title: Title,
    private router: Router
  ) {
    // Mettre à jour les meta tags à chaque changement de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateCanonicalUrl();
    });
  }

  /**
   * Configure tous les meta tags SEO pour une page
   */
  updateSEO(config: SEOConfig): void {
    // Title
    this.title.setTitle(config.title);

    // Meta description
    this.meta.updateTag({ name: 'description', content: config.description });

    // Meta keywords
    this.meta.updateTag({ name: 'keywords', content: config.keywords });

    // Robots
    this.meta.updateTag({ 
      name: 'robots', 
      content: config.robots || 'index, follow' 
    });

    // Open Graph tags (Facebook, LinkedIn)
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:type', content: config.type || 'website' });
    this.meta.updateTag({ property: 'og:url', content: config.url || this.getCurrentUrl() });
    this.meta.updateTag({ property: 'og:image', content: config.image || this.defaultImage });
    this.meta.updateTag({ property: 'og:site_name', content: this.siteName });

    // Twitter Card tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image', content: config.image || this.defaultImage });

    // Canonical URL
    this.updateCanonicalUrl(config.canonical);

    console.log('✅ SEO tags updated:', config.title);
  }

  /**
   * Met à jour l'URL canonique
   */
  private updateCanonicalUrl(customUrl?: string): void {
    const url = customUrl || this.getCurrentUrl();
    
    // Supprimer l'ancien canonical s'il existe
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Ajouter le nouveau canonical
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    document.head.appendChild(link);
  }

  /**
   * Obtient l'URL actuelle complète
   */
  private getCurrentUrl(): string {
    return this.defaultUrl + this.router.url;
  }

  /**
   * Génère les meta tags pour la page d'accueil
   */
  setHomePage(): void {
    this.updateSEO({
      title: 'AfroConnect - Afrikanische Geschäfte & Restaurants in Europa finden',
      description: 'Entdecken Sie afrikanische Restaurants, Afroshops, Friseursalons und mehr in Deutschland, Österreich und der Schweiz. Die größte Plattform für afrikanische Unternehmen in Europa.',
      keywords: 'Afroshop, afrikanisches Restaurant, afrikanischer Friseursalon, afrikanische Lebensmittel Deutschland, African Shop Berlin, African Shop Hamburg, African Shop München, African Shop Köln',
      image: this.defaultImage,
      url: this.defaultUrl
    });
  }

  /**
   * Génère les meta tags pour la galerie
   */
  setGalleryPage(): void {
    this.updateSEO({
      title: 'Galerie - Afrikanische Geschäfte entdecken | AfroConnect',
      description: 'Durchsuchen Sie unsere Galerie mit über 100 afrikanischen Geschäften, Restaurants und Dienstleistungen in ganz Europa. Finden Sie Afroshops in Ihrer Nähe.',
      keywords: 'Afroshop Galerie, afrikanische Geschäfte, African Shop Deutschland, Afroshop Liste, afrikanische Restaurants Europa',
      url: `${this.defaultUrl}/gallery`
    });
  }

  /**
   * Génère les meta tags pour la liste des shops
   */
  setShopsPage(): void {
    this.updateSEO({
      title: 'Alle Afrikanischen Geschäfte | AfroConnect',
      description: 'Komplette Liste aller afrikanischen Geschäfte, Restaurants und Dienstleistungen in Europa. Sortiert nach Stadt, Typ und Bewertung.',
      keywords: 'Afroshop verzeichnis, afrikanische Geschäfte Liste, African shops directory, Afroshop Deutschland, Afroshop Österreich, Afroshop Schweiz',
      url: `${this.defaultUrl}/shops`
    });
  }

  /**
   * Génère les meta tags pour une page de shop individuelle
   */
  setShopPage(shop: any): void {
    this.updateSEO({
      title: `${shop.name} - ${shop.type} in ${shop.city} | AfroConnect`,
      description: `${shop.description || `Besuchen Sie ${shop.name}, ${this.getTypeLabel(shop.type)} in ${shop.city}.`} Telefon: ${shop.phone}. ${shop.hours || 'Öffnungszeiten verfügbar.'}`,
      keywords: `${shop.name}, Afroshop ${shop.city}, ${shop.type} ${shop.city}, afrikanisches Geschäft ${shop.city}, African shop ${shop.city}`,
      image: shop.image || this.defaultImage,
      url: `${this.defaultUrl}/shops/${this.generateSlug(shop)}`,
      type: 'local.business'
    });
  }

  /**
   * Génère les meta tags pour la landing page
   */
  setLandingPage(): void {
    this.updateSEO({
      title: 'Geschäft eintragen - Kostenlos bei AfroConnect registrieren',
      description: 'Registrieren Sie Ihr afrikanisches Geschäft kostenlos bei AfroConnect und erreichen Sie tausende Kunden in ganz Europa. Einfach, schnell und effektiv.',
      keywords: 'Afroshop eintragen, Geschäft registrieren, afrikanisches Geschäft anmelden, AfroConnect registrierung, kostenlos Geschäft eintragen',
      url: `${this.defaultUrl}/landing`
    });
  }

  /**
   * Génère les meta tags pour la page de contact
   */
  setContactPage(): void {
    this.updateSEO({
      title: 'Kontakt - AfroConnect Support',
      description: 'Kontaktieren Sie das AfroConnect-Team. Wir helfen Ihnen gerne bei Fragen zu Ihrem Geschäft, der Plattform oder technischen Problemen.',
      keywords: 'AfroConnect Kontakt, Support, Hilfe, Kundenservice',
      url: `${this.defaultUrl}/kontakt`
    });
  }

  /**
   * Génère les meta tags pour la page À propos
   */
  setAboutPage(): void {
    this.updateSEO({
      title: 'Über uns - Die Mission von AfroConnect',
      description: 'AfroConnect verbindet afrikanische Unternehmen mit Kunden in ganz Europa. Erfahren Sie mehr über unsere Mission, Vision und das Team hinter der Plattform.',
      keywords: 'AfroConnect über uns, Mission, Vision, afrikanische Community Europa',
      url: `${this.defaultUrl}/about`
    });
  }

  /**
   * Génère les meta tags pour une page ville spécifique
   */
  setCityPage(city: string, shopsCount: number): void {
    this.updateSEO({
      title: `Afroshop ${city} - ${shopsCount} Afrikanische Geschäfte | AfroConnect`,
      description: `Finden Sie ${shopsCount} afrikanische Geschäfte, Restaurants und Friseursalons in ${city}. Afroshops, African Food, Beauty Salons und mehr.`,
      keywords: `Afroshop ${city}, African Shop ${city}, afrikanisches Restaurant ${city}, afrikanischer Friseur ${city}, afrikanische Lebensmittel ${city}`,
      url: `${this.defaultUrl}/city/${this.generateCitySlug(city)}`
    });
  }

  /**
   * Génère les meta tags pour Impressum
   */
  setImpressumPage(): void {
    this.updateSEO({
      title: 'Impressum | AfroConnect',
      description: 'Rechtliche Informationen und Impressum von AfroConnect - Die Plattform für afrikanische Geschäfte in Europa.',
      keywords: 'Impressum, rechtliche Informationen, AfroConnect',
      url: `${this.defaultUrl}/impressum`,
      robots: 'noindex, follow'
    });
  }

  /**
   * Génère les meta tags pour Datenschutz
   */
  setPrivacyPage(): void {
    this.updateSEO({
      title: 'Datenschutzerklärung | AfroConnect',
      description: 'Datenschutzerklärung von AfroConnect. Erfahren Sie, wie wir Ihre Daten schützen und verarbeiten.',
      keywords: 'Datenschutz, Privacy Policy, DSGVO, AfroConnect',
      url: `${this.defaultUrl}/privacy`,
      robots: 'noindex, follow'
    });
  }

  /**
   * Génère les meta tags pour AGB
   */
  setTermsPage(): void {
    this.updateSEO({
      title: 'AGB - Allgemeine Geschäftsbedingungen | AfroConnect',
      description: 'Allgemeine Geschäftsbedingungen für die Nutzung von AfroConnect.',
      keywords: 'AGB, Terms of Service, Nutzungsbedingungen, AfroConnect',
      url: `${this.defaultUrl}/terms`,
      robots: 'noindex, follow'
    });
  }

  /**
   * Génère les meta tags pour Hilfe
   */
  setHelpPage(): void {
    this.updateSEO({
      title: 'Hilfe & FAQ | AfroConnect',
      description: 'Häufig gestellte Fragen und Hilfe zur Nutzung von AfroConnect. Finden Sie Antworten zu Registrierung, Geschäftsverwaltung und mehr.',
      keywords: 'Hilfe, FAQ, Support, Anleitung, AfroConnect Tutorial',
      url: `${this.defaultUrl}/hilfe`
    });
  }

  /**
   * Génère un slug SEO-friendly à partir du nom du shop
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
   * Génère un slug pour une ville
   */
  private generateCitySlug(city: string): string {
    return city
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Obtient le label d'un type de commerce
   */
  private getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'restaurant': 'Afrikanisches Restaurant',
      'epicerie': 'Afroshop',
      'coiffeur': 'Afrikanischer Friseursalon',
      'vetement': 'Afrikanischer Modegeschäft',
      'services': 'Afrikanische Dienstleistung'
    };
    return labels[type] || 'Afrikanisches Geschäft';
  }
}
