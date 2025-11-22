
import fs from 'fs';

// Lecture de la liste complète des villes depuis cities.json
const cities = JSON.parse(fs.readFileSync('cities.json', 'utf-8'));

let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

cities.forEach(city => {
  // Génération du fichier HTML statique
  const html = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <title>Commerces africains à ${city.name} | AfroConnect</title>
      <meta name="description" content="Découvrez les commerces africains à ${city.name}, Allemagne et Europe.">
      <!-- autres meta tags SEO -->
    </head>
    <body>
      <app-root></app-root>
    </body>
    </html>
  `;
  fs.mkdirSync(`public/city`, { recursive: true });
  fs.writeFileSync(`public/city/${city.slug}.html`, html);

  // Ajout au sitemap
  sitemap += `
    <url>
      <loc>https://afroconnect.shop/city/${city.slug}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `;
});

sitemap += '</urlset>';
fs.writeFileSync('public/sitemap.xml', sitemap);

console.log('✅ Génération des pages villes et du sitemap terminée !');
