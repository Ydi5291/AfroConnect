import fs from 'fs';
import path from 'path';

// Liste des villes à pré-générer
const cities = [
  // Allemagne
  { slug: 'berlin', name: 'Berlin', country: 'Allemagne' },
  { slug: 'hamburg', name: 'Hambourg', country: 'Allemagne' },
  { slug: 'muenchen', name: 'Munich', country: 'Allemagne' },
  { slug: 'koeln', name: 'Cologne', country: 'Allemagne' },
  { slug: 'frankfurt', name: 'Francfort', country: 'Allemagne' },
  { slug: 'stuttgart', name: 'Stuttgart', country: 'Allemagne' },
  { slug: 'duesseldorf', name: 'Düsseldorf', country: 'Allemagne' },
  { slug: 'dortmund', name: 'Dortmund', country: 'Allemagne' },
  { slug: 'essen', name: 'Essen', country: 'Allemagne' },
  { slug: 'leipzig', name: 'Leipzig', country: 'Allemagne' },
  { slug: 'bremen', name: 'Brême', country: 'Allemagne' },
  { slug: 'dresden', name: 'Dresde', country: 'Allemagne' },
  { slug: 'hannover', name: 'Hanovre', country: 'Allemagne' },
  { slug: 'nuernberg', name: 'Nuremberg', country: 'Allemagne' },
  { slug: 'duisburg', name: 'Duisbourg', country: 'Allemagne' },
  { slug: 'bochum', name: 'Bochum', country: 'Allemagne' },
  { slug: 'wuppertal', name: 'Wuppertal', country: 'Allemagne' },
  { slug: 'bielefeld', name: 'Bielefeld', country: 'Allemagne' },
  { slug: 'bonn', name: 'Bonn', country: 'Allemagne' },
  { slug: 'mannheim', name: 'Mannheim', country: 'Allemagne' },
  
  // France
  { slug: 'paris', name: 'Paris', country: 'France' },
  { slug: 'marseille', name: 'Marseille', country: 'France' },
  { slug: 'lyon', name: 'Lyon', country: 'France' },
  { slug: 'toulouse', name: 'Toulouse', country: 'France' },
  { slug: 'nice', name: 'Nice', country: 'France' },
  { slug: 'nantes', name: 'Nantes', country: 'France' },
  { slug: 'strasbourg', name: 'Strasbourg', country: 'France' },
  { slug: 'montpellier', name: 'Montpellier', country: 'France' },
  { slug: 'bordeaux', name: 'Bordeaux', country: 'France' },
  { slug: 'lille', name: 'Lille', country: 'France' },
  
  // Espagne
  { slug: 'madrid', name: 'Madrid', country: 'Espagne' },
  { slug: 'barcelona', name: 'Barcelone', country: 'Espagne' },
  { slug: 'valencia', name: 'Valence', country: 'Espagne' },
  { slug: 'sevilla', name: 'Séville', country: 'Espagne' },
  { slug: 'zaragoza', name: 'Saragosse', country: 'Espagne' },
  
  // Italie
  { slug: 'rome', name: 'Rome', country: 'Italie' },
  { slug: 'milan', name: 'Milan', country: 'Italie' },
  { slug: 'naples', name: 'Naples', country: 'Italie' },
  { slug: 'turin', name: 'Turin', country: 'Italie' },
  { slug: 'florence', name: 'Florence', country: 'Italie' },
  
  // Autres
  { slug: 'amsterdam', name: 'Amsterdam', country: 'Pays-Bas' },
  { slug: 'rotterdam', name: 'Rotterdam', country: 'Pays-Bas' },
  { slug: 'brussels', name: 'Bruxelles', country: 'Belgique' },
  { slug: 'antwerp', name: 'Anvers', country: 'Belgique' },
  { slug: 'vienna', name: 'Vienne', country: 'Autriche' },
  { slug: 'zurich', name: 'Zurich', country: 'Suisse' },
  { slug: 'geneva', name: 'Genève', country: 'Suisse' },
  { slug: 'lisbon', name: 'Lisbonne', country: 'Portugal' },
  { slug: 'porto', name: 'Porto', country: 'Portugal' }
];

// Template HTML pour chaque ville
function generateCityHTML(city) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Commerces Africains à ${city.name} | AfroConnect</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <!-- SEO Meta Tags -->
  <meta name="description" content="Découvrez les meilleurs commerces africains à ${city.name}, ${city.country}. Restaurants, salons de coiffure, épiceries et boutiques afro. AfroConnect - Votre annuaire des commerces africains en Europe.">
  <meta name="keywords" content="commerces africains ${city.name}, restaurant africain ${city.name}, salon afro ${city.name}, épicerie africaine ${city.name}, produits afro ${city.name}, communauté africaine ${city.name}">
  <meta name="author" content="AfroConnect">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://afroconnect.shop/city/${city.slug}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://afroconnect.shop/city/${city.slug}">
  <meta property="og:title" content="Commerces Africains à ${city.name} | AfroConnect">
  <meta property="og:description" content="Découvrez les meilleurs commerces africains à ${city.name}. Restaurants, salons, épiceries et plus encore.">
  <meta property="og:image" content="https://afroconnect.shop/assets/AfroConnect-logo.JPG">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://afroconnect.shop/city/${city.slug}">
  <meta property="twitter:title" content="Commerces Africains à ${city.name} | AfroConnect">
  <meta property="twitter:description" content="Découvrez les meilleurs commerces africains à ${city.name}">
  <meta property="twitter:image" content="https://afroconnect.shop/assets/AfroConnect-logo.JPG">
  
  <!-- Structured Data (JSON-LD) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Commerces Africains à ${city.name}",
    "description": "Annuaire des commerces africains à ${city.name}, ${city.country}",
    "url": "https://afroconnect.shop/city/${city.slug}",
    "inLanguage": "fr",
    "isPartOf": {
      "@type": "WebSite",
      "name": "AfroConnect",
      "url": "https://afroconnect.shop"
    },
    "about": {
      "@type": "Place",
      "name": "${city.name}",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "${city.name}",
        "addressCountry": "${city.country}"
      }
    }
  }
  </script>
  
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <link rel="manifest" href="site.webmanifest">
</head>
<body>
  <app-root>
    <!-- Contenu visible par Google -->
    <div style="padding: 40px; font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto;">
      <h1>Commerces Africains à ${city.name}</h1>
      <p>Découvrez l'annuaire complet des commerces africains à ${city.name}, ${city.country}. AfroConnect vous aide à trouver les meilleurs restaurants, salons de coiffure, épiceries et boutiques africaines près de chez vous.</p>
      
      <h2>Types de commerces disponibles</h2>
      <ul>
        <li><strong>Restaurants africains</strong> : Cuisine sénégalaise, ivoirienne, camerounaise, éthiopienne et plus</li>
        <li><strong>Salons de coiffure afro</strong> : Tresses, nattes, tissages, défrisage</li>
        <li><strong>Épiceries africaines</strong> : Produits alimentaires, épices, ingrédients typiques</li>
        <li><strong>Boutiques de mode</strong> : Vêtements, tissus, accessoires africains</li>
        <li><strong>Services</strong> : Traiteurs, événementiel, cosmétiques afro</li>
      </ul>
      
      <h2>Pourquoi choisir AfroConnect ?</h2>
      <p>AfroConnect est la plateforme n°1 pour découvrir et soutenir les commerces de la diaspora africaine en Europe. Nous répertorions des centaines d'établissements vérifiés à ${city.name} et dans toute l'Europe.</p>
      
      <p><strong>Chargement de l'application...</strong></p>
    </div>
  </app-root>
  
  <!-- Les scripts Angular seront injectés ici lors du build -->
</body>
</html>`;
}

// Fonction principale
function generateStaticPages() {
  const distPath = path.join(process.cwd(), 'dist', 'first-angular-project', 'browser');
  const cityDir = path.join(distPath, 'city');
  
  // Créer le dossier city/ s'il n'existe pas
  if (!fs.existsSync(cityDir)) {
    fs.mkdirSync(cityDir, { recursive: true });
  }
  
  console.log('🏗️  Génération des pages statiques pour SEO...');
  
  let generatedCount = 0;
  
  // Générer une page HTML pour chaque ville
  cities.forEach(city => {
    const cityPath = path.join(cityDir, city.slug);
    
    // Créer le dossier de la ville
    if (!fs.existsSync(cityPath)) {
      fs.mkdirSync(cityPath, { recursive: true });
    }
    
    // Générer le fichier index.html
    const htmlContent = generateCityHTML(city);
    const htmlPath = path.join(cityPath, 'index.html');
    
    fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
    generatedCount++;
    
    console.log(`✅ ${city.name} (${city.slug})`);
  });
  
  console.log(`\n🎉 ${generatedCount} pages statiques générées avec succès!`);
  console.log(`📁 Emplacement: ${cityDir}`);
  console.log('\n📊 Ces pages sont maintenant optimisées pour Google:');
  console.log('  - Meta tags SEO complets');
  console.log('  - Structured Data (JSON-LD)');
  console.log('  - Open Graph pour réseaux sociaux');
  console.log('  - Contenu H1/H2 visible par Googlebot');
}

// Exécuter
try {
  generateStaticPages();
} catch (error) {
  console.error('❌ Erreur lors de la génération:', error);
  process.exit(1);
}
