import { GeocodingService } from '../app/services/geocoding.service';
import { HttpClient } from '@angular/common/http';

// Test des fonctionnalités de géocodage
class GeocodingTest {
  private geocodingService: GeocodingService;

  constructor() {
    // Simulation d'un HttpClient pour les tests
    const mockHttpClient = {} as HttpClient;
    this.geocodingService = new GeocodingService(mockHttpClient);
  }

  // Test avec différentes adresses allemandes
  testAddresses() {
    const testAddresses = [
      'Potsdamer Platz 1, 10785 Berlin',
      'Reeperbahn 1, 20359 Hamburg', 
      'Marienplatz 1, 80331 München',
      'Königsallee 1, 40212 Düsseldorf',
      'Römerberg 1, 60311 Frankfurt am Main',
      'Schlossplatz 1, 70173 Stuttgart',
      'Augustusplatz 1, 04109 Leipzig',
      'Hauptstraße 123, 69117 Heidelberg'
    ];

    console.log('🧪 Test du service de géocodage');
    console.log('================================');

    testAddresses.forEach((address, index) => {
      setTimeout(() => {
        console.log(`\n📍 Test ${index + 1}: ${address}`);
        
        this.geocodingService.geocodeAddress(address).subscribe({
          next: (result) => {
            if (result) {
              console.log('✅ Résultat:', {
                coordinates: `${result.lat}, ${result.lng}`,
                formatted_address: result.formatted_address,
                accuracy: result.accuracy
              });
            } else {
              console.log('❌ Aucun résultat trouvé');
            }
          },
          error: (error) => {
            console.error('💥 Erreur:', error);
          }
        });
      }, index * 1000); // Espacer les tests de 1 seconde
    });
  }

  // Test de validation des coordonnées
  testCoordinateValidation() {
    console.log('\n🔍 Test de validation des coordonnées');
    console.log('=====================================');

    const testCoordinates = [
      { lat: 0, lng: 0, expected: false },
      { lat: 52.5200, lng: 13.4050, expected: true }, // Berlin
      { lat: 91, lng: 13.4050, expected: false }, // Latitude invalide
      { lat: 52.5200, lng: 181, expected: false }, // Longitude invalide
      { lat: -90, lng: -180, expected: true }, // Limites valides
      { lat: 90, lng: 180, expected: true } // Limites valides
    ];

    testCoordinates.forEach(test => {
      const result = this.geocodingService.isValidCoordinates(test.lat, test.lng);
      const status = result === test.expected ? '✅' : '❌';
      console.log(`${status} (${test.lat}, ${test.lng}) = ${result} (attendu: ${test.expected})`);
    });
  }

  // Test de calcul de distance
  testDistanceCalculation() {
    console.log('\n📏 Test de calcul de distance');
    console.log('=============================');

    const berlin = { lat: 52.5200, lng: 13.4050 };
    const hamburg = { lat: 53.5511, lng: 9.9937 };
    const munich = { lat: 48.1351, lng: 11.5820 };

    const berlinHamburg = this.geocodingService.calculateDistance(
      berlin.lat, berlin.lng, hamburg.lat, hamburg.lng
    );

    const berlinMunich = this.geocodingService.calculateDistance(
      berlin.lat, berlin.lng, munich.lat, munich.lng
    );

    console.log(`📍 Berlin ↔ Hamburg: ${berlinHamburg.toFixed(1)} km`);
    console.log(`📍 Berlin ↔ Munich: ${berlinMunich.toFixed(1)} km`);
  }

  // Lancer tous les tests
  runAllTests() {
    this.testCoordinateValidation();
    this.testDistanceCalculation();
    this.testAddresses();
  }
}

// Instructions pour utiliser les tests
console.log(`
🧪 TESTS DU SERVICE DE GÉOCODAGE
================================

Pour tester le service de géocodage:

1. Ouvrez la console du navigateur (F12)
2. Allez sur la page "Afroshop hinzufügen"
3. Copiez/collez ce code dans la console:

const tester = new GeocodingTest();
tester.runAllTests();

4. Testez également manuellement:
   - Saisissez une adresse dans le formulaire
   - Observez les indicateurs de géocodage
   - Vérifiez que les coordonnées sont mises à jour

📝 Adresses de test recommandées:
- Potsdamer Platz 1, 10785 Berlin
- Reeperbahn 1, 20359 Hamburg
- Marienplatz 1, 80331 München
- Hauptstraße 123, 69117 Heidelberg
- Une adresse complètement invalide pour tester la gestion d'erreur
`);

export { GeocodingTest };