/**
 * Script pour définir un utilisateur comme administrateur
 * 
 * Usage:
 * 1. Installer firebase-admin si nécessaire: npm install firebase-admin
 * 2. Télécharger votre service account key depuis Firebase Console:
 *    Project Settings > Service Accounts > Generate New Private Key
 * 3. Sauvegarder le fichier JSON dans ce dossier (NE PAS COMMIT)
 * 4. Modifier la variable SERVICE_ACCOUNT_PATH ci-dessous
 * 5. Modifier l'email de l'admin ci-dessous
 * 6. Exécuter: node set-admin-claim.js
 */

const admin = require('firebase-admin');

// ⚠️ IMPORTANT: Télécharger votre service account key depuis Firebase Console
// et mettre le chemin ici (ou utiliser une variable d'environnement)
const SERVICE_ACCOUNT_PATH = './afroconnect-service-account.json';

// 📧 L'email de l'utilisateur à définir comme admin
const ADMIN_EMAIL = 'yourdacosta@gmail.com'; // ⚠️ MODIFIER AVEC VOTRE EMAIL

// Initialiser Firebase Admin
try {
  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('✅ Firebase Admin initialisé');
} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation de Firebase Admin:');
  console.error('Assurez-vous d\'avoir téléchargé votre service account key depuis:');
  console.error('Firebase Console > Project Settings > Service Accounts > Generate New Private Key');
  console.error('\nErreur:', error.message);
  process.exit(1);
}

/**
 * Définir un utilisateur comme admin
 */
async function setAdminClaim(email) {
  try {
    // Récupérer l'utilisateur par email
    const user = await admin.auth().getUserByEmail(email);
    console.log(`\n📝 Utilisateur trouvé:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   UID: ${user.uid}`);
    
    // Définir le custom claim admin
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true
    });
    
    console.log(`\n✅ SUCCÈS: ${user.email} est maintenant administrateur!`);
    console.log(`\n⚠️ IMPORTANT: L'utilisateur doit se déconnecter et se reconnecter`);
    console.log(`   pour que les nouveaux droits prennent effet.`);
    
    // Vérifier le claim
    const updatedUser = await admin.auth().getUser(user.uid);
    console.log(`\n🔍 Vérification du claim:`);
    console.log(`   admin: ${updatedUser.customClaims?.admin === true ? 'true ✓' : 'false ✗'}`);
    
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.error(`\n💡 L'utilisateur avec l'email "${email}" n'existe pas.`);
      console.error('   Créez d\'abord un compte dans votre application.');
    }
  }
}

// Exécuter le script
console.log('\n🚀 Définition de l\'administrateur AfroConnect...');
console.log(`📧 Email: ${ADMIN_EMAIL}\n`);

setAdminClaim(ADMIN_EMAIL)
  .then(() => {
    console.log('\n✨ Script terminé avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
  });
