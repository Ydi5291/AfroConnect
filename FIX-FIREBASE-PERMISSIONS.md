# 🔧 Fix Firebase Permissions Error

## ❌ Erreur
```
ERROR FirebaseError: Missing or insufficient permissions.
```

## 🔍 Cause
Votre token Firebase n'est pas à jour. Même si votre UID est dans `roles/admins`, Firebase utilise encore l'ancien token qui ne connaît pas cette permission.

---

## ✅ Solution 1: Déconnexion/Reconnexion (RECOMMANDÉ)

### Étapes:

1. **Trouvez le bouton de déconnexion dans votre app**
   - Généralement dans le header ou le menu utilisateur
   - Ou allez sur la page de login

2. **Cliquez sur "Déconnexion" / "Logout"**

3. **Reconnectez-vous avec vos identifiants:**
   - Email: `yourdacosta@gmail.com`
   - Mot de passe: [votre mot de passe]

4. **Allez sur /admin**
   - http://localhost:4200/admin
   - ✅ Ça devrait marcher!

---

## ✅ Solution 2: Vider le Local Storage (Alternative)

Si vous ne trouvez pas le bouton de déconnexion:

1. **Ouvrir la Console du navigateur (F12)**

2. **Aller dans l'onglet "Application"** (Chrome) ou "Stockage" (Firefox)

3. **Cliquer sur "Local Storage" → "http://localhost:4200"**

4. **Supprimer toutes les clés Firebase:**
   - Cherchez les clés commençant par:
     - `firebase:`
     - `firebaseui::`
     - `_cap_`
   - Clic droit → "Delete" sur chacune

5. **Rafraîchir la page (Ctrl+F5)**

6. **Se reconnecter**

7. **Tester /admin**

---

## ✅ Solution 3: Vider tout le cache (Nuclear Option)

Si rien d'autre ne marche:

1. **Ctrl+Shift+Delete** (ou Cmd+Shift+Delete sur Mac)

2. **Cocher:**
   - ✅ Cookies et autres données de site
   - ✅ Images et fichiers en cache

3. **Période: "Toutes les périodes"**

4. **Cliquer sur "Effacer les données"**

5. **Fermer et rouvrir le navigateur**

6. **Aller sur http://localhost:4200**

7. **Se connecter**

8. **Tester /admin**

---

## 🧪 Vérifier que ça marche

### Dans la console du navigateur (F12):

```javascript
import { getAuth } from 'firebase/auth';
const auth = getAuth();

// Vérifier l'utilisateur connecté
console.log('User:', auth.currentUser);

// Forcer le rafraîchissement du token
auth.currentUser?.getIdToken(true).then(token => {
  console.log('Token rafraîchi!');
});

// Vérifier l'UID
console.log('Mon UID:', auth.currentUser?.uid);
// Devrait afficher: DY7I15aMxSgGth2cjj6TkxHAtzj2
```

---

## 📋 Checklist de vérification

Avant de tester `/admin`, vérifiez:

- ✅ **Firestore rules déployées:** `firebase deploy --only firestore:rules`
- ✅ **Document `roles/admins` existe dans Firestore**
- ✅ **Votre UID dans l'array `uids`:** `DY7I15aMxSgGth2cjj6TkxHAtzj2`
- ✅ **Déconnecté et reconnecté** (pour rafraîchir le token)
- ✅ **Page rafraîchie** (Ctrl+F5)

---

## 🆘 Si ça ne marche toujours pas

### Vérifier les règles Firestore:

1. **Console Firebase:**
   - https://console.firebase.google.com/project/afroconnect-a53a5/firestore/rules

2. **Vérifier que les règles sont:**
```javascript
match /shop-leads/{leadId} {
  allow create: if true;
  allow read: if request.auth != null;  // ← Tous les utilisateurs authentifiés
  allow update, delete: if request.auth != null && 
                           request.auth.token.admin == true;
}
```

3. **Si les règles sont différentes, redéployer:**
```powershell
firebase deploy --only firestore:rules
```

---

## 💡 Pourquoi ça arrive?

Firebase Auth utilise des **JWT tokens** qui contiennent les permissions de l'utilisateur. Ces tokens sont:
- ✅ Créés à la connexion
- ✅ Mis en cache par le navigateur
- ✅ Valides pendant 1 heure
- ❌ **Ne se mettent pas à jour automatiquement**

Donc quand vous ajoutez votre UID dans `roles/admins`, Firebase ne le sait pas tant que vous n'avez pas rafraîchi votre token (en vous reconnectant).

---

## 🎯 Action Immédiate

**Faites ceci maintenant:**

1. Déconnectez-vous de l'application
2. Reconnectez-vous
3. Allez sur http://localhost:4200/admin
4. Cliquez sur "📋 Leads anzeigen"
5. ✅ Ça devrait marcher!

---

**Besoin d'aide?** Partagez l'erreur complète de la console (F12) si le problème persiste.
