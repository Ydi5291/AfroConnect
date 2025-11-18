# Set Admin Custom Claim - Guide Rapide

## 🎯 Objectif
Définir votre compte utilisateur comme administrateur pour accéder à la section Lead-Verwaltung dans `/admin`.

---

## ✅ MÉTHODE 1: Via Firebase Console (Plus Simple)

### Étapes:

1. **Aller dans Firebase Console:**
   - https://console.firebase.google.com/project/afroconnect-a53a5/authentication/users

2. **Trouver votre utilisateur:**
   - Chercher votre email dans la liste des utilisateurs
   - Copier votre **User UID** (commence par quelque chose comme `AbC123...`)

3. **Ouvrir Cloud Functions dans Firebase Console:**
   - https://console.firebase.google.com/project/afroconnect-a53a5/functions

4. **Exécuter la fonction depuis la console:**
   - Déployer d'abord la fonction: `firebase deploy --only functions:setAdminClaim`
   - Ou utiliser la méthode 2 ci-dessous (plus rapide)

---

## ⚡ MÉTHODE 2: Via Firebase CLI (Recommandé)

### Option A: Utiliser Node.js directement

```powershell
# 1. Télécharger votre Service Account Key
# Aller sur: https://console.firebase.google.com/project/afroconnect-a53a5/settings/serviceaccounts/adminsdk
# Cliquer sur "Generate New Private Key" et sauvegarder le fichier JSON

# 2. Renommer le fichier téléchargé
Rename-Item "Downloads\afroconnect-a53a5-*.json" "afroconnect-service-account.json"
Move-Item "afroconnect-service-account.json" "C:\Users\youss\AfroConnect\"

# 3. Modifier set-admin-claim.js avec votre email (ligne 16)
code set-admin-claim.js

# 4. Installer firebase-admin
npm install firebase-admin

# 5. Exécuter le script
node set-admin-claim.js
```

### Option B: Via Firestore directement (Plus Rapide)

```powershell
# Créer un document temporaire dans Firestore avec votre UID
# Aller sur: https://console.firebase.google.com/project/afroconnect-a53a5/firestore

# Créer une collection "admins"
# Ajouter un document avec votre email comme ID
# Ajouter un champ: admin = true
# Ajouter un champ: createdAt = [Timestamp now]

# Ensuite modifier le AdminGuard pour vérifier cette collection
```

---

## 🔧 MÉTHODE 3: Modification Temporaire du Code (Pour Test)

Si vous voulez juste tester rapidement, vous pouvez temporairement désactiver la vérification admin:

### Dans `src/app/guards/admin.guard.ts`:

```typescript
// TEMPORAIRE: Commenter la vérification admin
async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
  // return await this.adminSecurityService.checkAdminAccess();
  return true; // ⚠️ TEMPORAIRE: Permettre l'accès à tout le monde
}
```

⚠️ **IMPORTANT**: Cette modification est UNIQUEMENT pour tester localement. Ne JAMAIS déployer avec cette modification!

---

## 🔐 MÉTHODE 4: Modifier les Firestore Rules (Temporaire)

Pour tester localement, vous pouvez temporairement permettre l'accès en lecture à tous les utilisateurs authentifiés:

### Dans `firestore.rules`:

```javascript
match /shop-leads/{leadId} {
  allow create: if true;
  
  // TEMPORAIRE: Permettre à tous les utilisateurs authentifiés
  allow read: if request.auth != null;
  // allow read: if request.auth != null && request.auth.token.admin == true;
  
  allow update, delete: if request.auth != null && request.auth.token.admin == true;
}
```

Puis redéployer:
```powershell
firebase deploy --only firestore:rules
```

⚠️ **IMPORTANT**: Remettre la règle stricte avant de déployer en production!

---

## ✅ Vérification

Après avoir défini le custom claim admin:

1. **Déconnexion/Reconnexion obligatoire:**
   - Se déconnecter de l'application
   - Se reconnecter
   - Les nouveaux custom claims ne sont chargés qu'à la connexion

2. **Vérifier dans la console:**
   ```javascript
   // Dans la console du navigateur (F12)
   import { getAuth } from 'firebase/auth';
   const auth = getAuth();
   auth.currentUser?.getIdTokenResult().then(token => {
     console.log('Admin claim:', token.claims.admin);
   });
   ```

3. **Accéder à /admin:**
   - Aller sur http://localhost:4200/admin
   - Cliquer sur "📋 Leads anzeigen"
   - Vous devriez voir la liste des leads

---

## 🚀 Recommandation

**Pour un test rapide (5 minutes):**
- Utiliser MÉTHODE 4 (modifier les Firestore rules temporairement)
- Déployer les rules: `firebase deploy --only firestore:rules`
- Tester dans /admin
- Remettre les rules strictes après

**Pour la production:**
- Utiliser MÉTHODE 2 Option A (script Node.js avec service account)
- C'est la méthode la plus sécurisée et permanente

---

## 📞 Support

Si vous avez des questions, vérifiez:
1. Que vous êtes bien connecté dans l'application
2. Que votre email existe dans Firebase Authentication
3. Que vous vous êtes déconnecté/reconnecté après avoir défini le claim
4. Les erreurs dans la console du navigateur (F12)
