import fs from 'fs';
import fetch from 'node-fetch';

const countries = [
  'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Portugal', 'Luxembourg', 'Poland', 'Czech Republic', 'Denmark', 'Sweden', 'Finland', 'Norway', 'Ireland', 'Greece', 'Hungary', 'Romania', 'Bulgaria', 'Slovakia', 'Slovenia', 'Croatia', 'Estonia', 'Latvia', 'Lithuania', 'United Kingdom'
];

const limitPerCountry = 500; // Ajuste selon tes besoins

async function fetchCities(country) {
  const url = `https://nominatim.openstreetmap.org/search?country=${encodeURIComponent(country)}&format=json&limit=${limitPerCountry}&addressdetails=1&extratags=1&featuretype=city`;
  const res = await fetch(url, { headers: { 'User-Agent': 'AfroConnect/1.0' } });
  const data = await res.json();
  return data.map(city => ({
    name: city.address && city.address.city ? city.address.city : city.display_name.split(',')[0],
    slug: (city.address && city.address.city ? city.address.city : city.display_name.split(',')[0]).toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, ''),
    country
  }));
}

(async () => {
  let allCities = [];
  for (const country of countries) {
    console.log(`Fetching cities for ${country}...`);
    try {
      const cities = await fetchCities(country);
      allCities = allCities.concat(cities);
      console.log(`  → ${cities.length} cities found.`);
    } catch (e) {
      console.error(`Error fetching ${country}:`, e);
    }
  }
  fs.writeFileSync('cities.json', JSON.stringify(allCities, null, 2));
  console.log(`✅ Fichier cities.json généré avec ${allCities.length} villes.`);
})();
