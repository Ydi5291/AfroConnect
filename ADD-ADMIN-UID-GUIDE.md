# 🔐 Ajouter votre UID Admin - Guide Rapide

## 📋 Votre UID
```
DY7I15aMxSgGth2cjj6TkxHAtzj2
```

---

## ⚡ Méthode Rapide (2 minutes)

### Option 1: Via Firebase Console (Plus Simple)

1. **Ouvrir Firestore Console:**
   - https://console.firebase.google.com/project/afroconnect-a53a5/firestore

2. **Créer la collection `roles`:**
   - Cliquez sur **"Start collection"** ou **"Add collection"**
   - Collection ID: `roles`
   - Cliquez sur **"Next"**

3. **Créer le document `admins`:**
   - Document ID: `admins`
   - Cliquez sur **"Add field"**
   
4. **Ajouter le champ `uids`:**
   - Type: **Array**
   - Nom: `uids`
   - Ajouter un élément au array:
     - Type: **string**
     - Valeur: `DY7I15aMxSgGth2cjj6TkxHAtzj2`
   
5. **Sauvegarder:**
   - Cliquez sur **"Save"**

6. **Tester:**
   - Rafraîchissez votre app (Ctrl+F5)
   - Allez sur http://localhost:4200/admin
   - ✅ Vous devriez avoir accès!

---

## 🤖 Méthode Automatique (Script Node.js)

### Étape 1: Télécharger le Service Account Key

1. Allez sur: https://console.firebase.google.com/project/afroconnect-a53a5/settings/serviceaccounts/adminsdk
2. Cliquez sur **"Generate New Private Key"**
3. Sauvegardez le fichier JSON téléchargé
4. Renommez-le en: `afroconnect-service-account.json`
5. Déplacez-le dans: `C:\Users\youss\AfroConnect\`

### Étape 2: Installer firebase-admin

```powershell
npm install firebase-admin
```

### Étape 3: Exécuter le script

```powershell
node add-admin-uid.js
```

Le script va:
- ✅ Créer le document `roles/admins` dans Firestore
- ✅ Ajouter votre UID dans le array `uids`
- ✅ Vérifier que tout est OK

### Étape 4: Tester

- Rafraîchissez votre app (Ctrl+F5)
- Allez sur http://localhost:4200/admin
- ✅ Vous devriez avoir accès!

---

## 📸 Capture d'écran - Structure Firestore

Après création, votre Firestore devrait ressembler à:

```
📁 roles
  └── 📄 admins
       └── uids: ["DY7I15aMxSgGth2cjj6TkxHAtzj2"]
```

---

## ✅ Vérification

Pour vérifier que tout fonctionne:

1. **Dans la console du navigateur (F12):**
```javascript
import { getAuth } from 'firebase/auth';
const auth = getAuth();
console.log('Mon UID:', auth.currentUser?.uid);
// Devrait afficher: DY7I15aMxSgGth2cjj6TkxHAtzj2
```

2. **Accéder à /admin:**
   - Si vous voyez le tableau de bord → ✅ Succès!
   - Si vous voyez "Authentification requise" → ❌ L'UID n'est pas dans Firestore

---

## 🔒 Sécurité

- ⚠️ **NE JAMAIS** committer `afroconnect-service-account.json` sur Git
- ⚠️ Ce fichier contient les clés privées de votre projet
- ✅ Il est déjà dans `.gitignore`
- ✅ Seul VOTRE UID peut accéder à /admin

---

## 🆘 En cas de problème

Si ça ne marche toujours pas:

1. **Vérifier que vous êtes connecté:**
   - F12 → Console
   - `getAuth().currentUser` doit retourner votre user

2. **Vérifier Firestore:**
   - Ouvrir Firestore Console
   - Vérifier que `roles/admins` existe
   - Vérifier que votre UID est dans l'array `uids`

3. **Vider le cache:**
   - Ctrl+Shift+Delete
   - Cocher "Cached images and files"
   - Clear data
   - Rafraîchir (Ctrl+F5)

4. **Se déconnecter/reconnecter:**
   - Parfois les tokens Firebase doivent être rafraîchis

---

## 🎯 Recommandation

**Pour aller vite:** Utilisez **Option 1 (Firebase Console)**
- Pas besoin de télécharger le service account key
- Pas besoin d'installer firebase-admin
- Prend 2 minutes max
- Fonctionne à coup sûr

Je vous recommande d'y aller maintenant! 🚀
