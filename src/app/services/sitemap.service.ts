import { Injectable } from '@angular/core';
import { AfroshopService } from './image.service';
import { AfroshopData } from './image.service';

@Injectable({
  providedIn: 'root'
})
export class SitemapService {
  constructor(private afroshopService: AfroshopService) {}

  /**
   * Génère un slug SEO-friendly à partir du nom du shop
   */
  generateShopSlug(shop: AfroshopData): string {
    const name = shop.name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Retirer accents
      .replace(/[^a-z0-9]+/g, '-') // Remplacer caractères spéciaux par -
      .replace(/^-+|-+$/g, ''); // Retirer - au début/fin
    
    const city = shop.city
      ?.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Format: nom-ville ou juste nom si pas de ville
    return city ? `${name}-${city}` : name;
  }

  /**
   * Génère l'URL complète du shop
   */
  getShopUrl(shop: AfroshopData): string {
    const slug = this.generateShopSlug(shop);
    return `https://afroconnect.shop/shops/${slug}`;
  }

  /**
   * Génère le XML du sitemap complet
   */
  async generateSitemapXML(): Promise<string> {
    const shops = this.afroshopService.getAllAfroshops();
    const baseUrl = 'https://afroconnect.shop';
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Page d'accueil -->
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>

  <!-- Pages principales -->
  <url>
    <loc>${baseUrl}/gallery</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>

  <url>
    <loc>${baseUrl}/shops</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>

  <url>
    <loc>${baseUrl}/landing</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${baseUrl}/add-afroshop</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Pages secondaires -->
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>${baseUrl}/kontakt</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>${baseUrl}/impressum</loc>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>${baseUrl}/privacy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>${baseUrl}/terms</loc>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>${baseUrl}/hilfe</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Pages individuelles des commerces -->
`;

    // Ajouter chaque shop avec son image
    shops.forEach(shop => {
      const shopUrl = this.getShopUrl(shop);
      const slug = this.generateShopSlug(shop);
      
      xml += `  <url>
    <loc>${shopUrl}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <image:image>
      <image:loc>${shop.image}</image:loc>
      <image:title>${this.escapeXml(shop.name)}</image:title>
      <image:caption>${this.escapeXml(shop.description)}</image:caption>
    </image:image>
  </url>
`;
    });

    xml += `</urlset>`;
    return xml;
  }

  /**
   * Échappe les caractères spéciaux XML
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Génère un index de sitemap pour les grandes quantités de shops
   */
  generateSitemapIndex(): string {
    const baseUrl = 'https://afroconnect.shop';
    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-pages.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-shops.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;
  }
}
