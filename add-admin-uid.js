/**
 * Script pour ajouter un UID admin dans Firestore
 * 
 * Usage:
 * node add-admin-uid.js
 */

const admin = require('firebase-admin');

// Votre UID admin
const ADMIN_UID = 'DY7I15aMxSgGth2cjj6TkxHAtzj2';

// Chemin vers votre service account key
// Téléchargez-le depuis: https://console.firebase.google.com/project/afroconnect-a53a5/settings/serviceaccounts/adminsdk
const SERVICE_ACCOUNT_PATH = './afroconnect-service-account.json';

console.log('🚀 Ajout de l\'UID admin dans Firestore...\n');

// Initialiser Firebase Admin
try {
  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('✅ Firebase Admin initialisé');
} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation de Firebase Admin:');
  console.error('📥 Téléchargez votre service account key depuis:');
  console.error('   https://console.firebase.google.com/project/afroconnect-a53a5/settings/serviceaccounts/adminsdk');
  console.error('   Cliquez sur "Generate New Private Key"');
  console.error('   Sauvegardez le fichier JSON comme "afroconnect-service-account.json"');
  console.error('   dans le dossier: C:\\Users\\youss\\AfroConnect\\');
  console.error('\n❌ Erreur:', error.message);
  process.exit(1);
}

/**
 * Ajouter l'UID admin dans Firestore
 */
async function addAdminUID() {
  try {
    const db = admin.firestore();
    
    // Référence au document roles/admins
    const adminDocRef = db.collection('roles').doc('admins');
    
    // Vérifier si le document existe
    const adminDoc = await adminDocRef.get();
    
    if (adminDoc.exists) {
      console.log('📄 Document roles/admins existe déjà');
      const data = adminDoc.data();
      const currentUIDs = data.uids || [];
      
      if (currentUIDs.includes(ADMIN_UID)) {
        console.log(`✅ UID ${ADMIN_UID} est déjà dans la liste des admins`);
      } else {
        // Ajouter l'UID
        await adminDocRef.update({
          uids: admin.firestore.FieldValue.arrayUnion(ADMIN_UID)
        });
        console.log(`✅ UID ${ADMIN_UID} ajouté à la liste des admins`);
      }
    } else {
      // Créer le document avec l'UID
      await adminDocRef.set({
        uids: [ADMIN_UID],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        description: 'Liste des UIDs autorisés à accéder à la zone admin'
      });
      console.log('✅ Document roles/admins créé avec succès');
      console.log(`✅ UID ${ADMIN_UID} ajouté comme premier admin`);
    }
    
    // Vérifier le résultat
    const updatedDoc = await adminDocRef.get();
    const updatedData = updatedDoc.data();
    
    console.log('\n📋 Liste des admins dans Firestore:');
    console.log('   UIDs:', updatedData.uids);
    console.log('\n✨ Configuration terminée avec succès!');
    console.log('\n🎯 Prochaines étapes:');
    console.log('   1. Rafraîchissez votre application (Ctrl+F5)');
    console.log('   2. Allez sur http://localhost:4200/admin');
    console.log('   3. Vous devriez maintenant avoir accès! 🎉');
    
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error('\n💡 Vérifiez que:');
    console.error('   - Votre service account key est valide');
    console.error('   - Vous avez les permissions Firestore dans Firebase');
    throw error;
  }
}

// Exécuter le script
addAdminUID()
  .then(() => {
    console.log('\n✅ Script terminé avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
  });
