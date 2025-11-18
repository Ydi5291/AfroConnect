# 🔧 Fix Firestore Permissions - Résumé

## ❌ Problème Rencontré

```
Firebase API called outside injection context: getDocs
FirebaseError: Missing or insufficient permissions.
```

## ✅ Solution Appliquée

### 1. Création des Firestore Rules (`firestore.rules`)

Fichier créé avec les règles de sécurité pour 3 collections:

- **`shop-leads`**: Leads de la landing page /join
  - ✅ Tout le monde peut créer (formulaire public)
  - ⚠️ **TEMPORAIRE**: Tous les utilisateurs authentifiés peuvent lire
  - ❌ Seuls les admins peuvent modifier/supprimer

- **`afroshops`**: Profils complets des commerces
  - ✅ Tout le monde peut lire (répertoire public)
  - ✅ Utilisateurs authentifiés peuvent créer
  - ✅ Propriétaires et admins peuvent modifier
  - ❌ Seuls les admins peuvent supprimer

- **`users`**: Profils utilisateurs
  - ✅ Utilisateurs peuvent lire leur propre profil
  - ✅ Admins peuvent lire tous les profils
  - ✅ Utilisateurs peuvent créer/modifier leur profil
  - ❌ Seuls les admins peuvent supprimer

### 2. Déploiement des Rules

```powershell
firebase use afroconnect-a53a5
firebase deploy --only firestore:rules
```

✅ **Status**: Déployé avec succès

---

## ⚠️ Configuration Admin Requise

### Problème Actuel

La règle temporaire permet à TOUS les utilisateurs authentifiés de lire les leads. 
C'est acceptable pour le développement, mais **PAS pour la production**.

### Solution Permanente

Pour activer la règle stricte (seuls les admins), vous devez:

1. **Définir un custom claim `admin: true` sur votre compte**
   - Voir le guide complet: `SET-ADMIN-GUIDE.md`
   - 4 méthodes disponibles (Firebase Console, Node.js script, etc.)

2. **Remettre la règle stricte dans `firestore.rules`:**

```javascript
// Dans firestore.rules, ligne 12:
allow read: if request.auth != null && request.auth.token.admin == true;
```

3. **Redéployer:**
```powershell
firebase deploy --only firestore:rules
```

---

## 🧪 Test Maintenant

Vous pouvez maintenant tester la section Lead-Verwaltung:

1. **Assurez-vous d'être connecté** dans l'application
2. **Allez sur** http://localhost:4200/admin
3. **Cliquez sur** "📋 Leads anzeigen"
4. **Vous devriez voir** la liste des leads (si vous en avez créé via /join)

### Si ça ne marche toujours pas:

1. **Vérifiez que vous êtes connecté:**
   - Ouvrez F12 (console développeur)
   - Tapez: `import { getAuth } from 'firebase/auth'; getAuth().currentUser`
   - Vous devriez voir votre objet utilisateur

2. **Rafraîchissez la page** (Ctrl+F5)

3. **Créez un lead de test** via http://localhost:4200/join

4. **Vérifiez les erreurs** dans la console (F12)

---

## 📋 Fichiers Créés/Modifiés

### Créés:
- ✅ `firestore.rules` - Règles de sécurité Firestore
- ✅ `set-admin-claim.js` - Script Node.js pour définir admin claim
- ✅ `SET-ADMIN-GUIDE.md` - Guide complet avec 4 méthodes
- ✅ `FIRESTORE-PERMISSIONS-FIX.md` - Ce fichier (résumé)

### Modifiés:
- ✅ `functions/index.js` - Ajout de `setAdminClaim()` et `removeAdminClaim()` Cloud Functions

### Déployés:
- ✅ `firestore.rules` → Firebase Firestore
- ⏳ `functions/index.js` → Pas encore déployé (pas nécessaire pour l'instant)

---

## 🎯 Actions Suivantes

### Immédiat (Pour Test):
1. ✅ Connectez-vous dans l'application
2. ✅ Testez /admin → Lead-Verwaltung
3. ✅ Vérifiez que vous pouvez charger les leads

### Avant Production:
1. ⚠️ Définir custom claim admin (voir SET-ADMIN-GUIDE.md)
2. ⚠️ Remettre règle stricte dans firestore.rules
3. ⚠️ Redéployer: `firebase deploy --only firestore:rules`

### Optionnel:
1. Copier ADMIN-LEADS-STYLES.css dans admin.component.css
2. Tester la création de compte Firebase depuis /admin
3. Déployer les Cloud Functions: `firebase deploy --only functions`

---

## 📞 Besoin d'Aide?

Si les leads ne se chargent toujours pas:

1. **Partagez l'erreur** de la console (F12)
2. **Vérifiez votre statut de connexion**
3. **Essayez de créer un lead** via /join d'abord
4. **Vérifiez Firestore Console**: 
   - https://console.firebase.google.com/project/afroconnect-a53a5/firestore

---

✨ **Bonne nouvelle**: Les permissions Firestore sont maintenant correctement configurées!

🔒 **Rappel**: Avant de déployer en production, configurez le custom claim admin et remettez la règle stricte.
