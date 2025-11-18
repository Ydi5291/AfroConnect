# 🎯 Admin Lead Management Dashboard

## ✅ Ce qui a été créé

### **Composant `/admin/leads`** - Gestion complète des leads

**Fichiers créés :**
- `src/app/admin/leads/leads.component.ts` - Logique TypeScript
- `src/app/admin/leads/leads.component.html` - Template HTML
- `src/app/admin/leads/leads.component.css` - Styles CSS

**Route ajoutée :**
```typescript
{ 
  path: 'admin/leads', 
  component: LeadsComponent,
  canActivate: [AdminGuard] // 🔒 Protégé admin
}
```

---

## 🚀 Fonctionnalités

### **1. Tableau de bord avec statistiques** 📊
- **Total des leads**
- **Nouveaux leads** (status: new)
- **Leads contactés** (status: contacted)
- **Leads intéressés** (status: interested)
- **Leads enregistrés** (status: registered)

### **2. Filtres intelligents** 🔍
- **Recherche textuelle** : Nom, propriétaire, téléphone, email
- **Filtre par statut** : new / contacted / interested / registered
- **Filtre par catégorie** : shop / restaurant / salon / other
- **Filtre par ville** : Recherche dynamique

### **3. Gestion des leads** 📋
Pour chaque lead, tu peux :

#### **A. Créer un compte Firebase** 🔐
- Bouton **"Konto erstellen"** (Créer compte)
- Génère automatiquement :
  - Compte Firebase Auth avec email/password
  - Mot de passe temporaire sécurisé (ex: `AfroConnect#Ab12`)
  - UID Firebase
- Met à jour le statut du lead → `"registered"`
- Affiche les identifiants dans une popup pour que tu les notes

#### **B. Contacter via WhatsApp** 💬
- Bouton **"WhatsApp"**
- Ouvre WhatsApp Web avec message pré-rempli en allemand :
```
Hallo [ownerName],

Vielen Dank für Ihr Interesse an AfroConnect!

Ich habe Ihre Registrierung für "[shopName]" in [city] erhalten.

Können wir kurz über die nächsten Schritte sprechen?

Viele Grüße,
AfroConnect Team
```

#### **C. Changer le statut** 🔄
- Dropdown pour changer le statut :
  - **new** → Nouveau lead non contacté
  - **contacted** → Lead contacté par WhatsApp/email
  - **interested** → Lead intéressé, prêt à s'inscrire
  - **registered** → Compte Firebase créé

### **4. Export CSV** 📥
- Bouton **"CSV exportieren"**
- Exporte tous les leads filtrés
- Colonnes : Name, Owner, Phone, Email, City, Address, Category, Status, Created, Notes
- Nom du fichier : `afroconnect-leads-[timestamp].csv`

---

## 🎨 Design

### **Couleurs AfroConnect**
- **Vert** (#009639) : Boutons principaux, accents
- **Jaune** (#fbbf24) : Statut "new"
- **Bleu** (#3b82f6) : Statut "contacted" + bouton créer compte
- **Violet** (#8b5cf6) : Statut "interested"
- **Vert clair** (#10b981) : Statut "registered" + WhatsApp

### **Layout**
- **Responsive** : S'adapte mobile/tablette/desktop
- **Cards** : Chaque lead dans une carte avec hover effect
- **Grid** : Affichage en grille (3 colonnes desktop, 1 colonne mobile)

---

## 📖 Comment utiliser

### **Étape 1 : Accéder au dashboard**
```
1. Connecte-toi en tant qu'admin
2. Va sur : http://localhost:4200/admin/leads
   ou : https://afroconnect.shop/admin/leads
```

### **Étape 2 : Voir les nouveaux leads**
```
1. Les leads avec statut "new" apparaissent en premier
2. Badge jaune "new" bien visible
3. Tu vois toutes les infos : nom, téléphone, email, ville
```

### **Étape 3 : Contacter le propriétaire**
**Option A : WhatsApp (Recommandé)**
```
1. Clique sur le bouton "💬 WhatsApp"
2. WhatsApp Web s'ouvre avec message pré-rempli
3. Personnalise si nécessaire
4. Envoie le message
5. Change le statut → "contacted"
```

**Option B : Email manuel**
```
1. Copie l'email du lead
2. Envoie un email avec template (voir EMAIL-TEMPLATES.md)
3. Change le statut → "contacted"
```

### **Étape 4 : Créer le compte Firebase**
```
1. Après avoir convaincu le propriétaire
2. Vérifie qu'il a une adresse email
3. Clique sur "🔐 Konto erstellen"
4. Confirme la création
5. Note le mot de passe temporaire affiché
6. Envoie les identifiants au propriétaire :
   - Email: [son email]
   - Mot de passe: [mot de passe temporaire]
   - Lien: https://afroconnect.shop/login
```

### **Étape 5 : Le propriétaire complète son profil**
```
1. Il se connecte sur /login
2. Il change son mot de passe
3. Il va sur /add-afroshop
4. Il remplit le formulaire complet (Impressum, photos, etc.)
5. Son commerce est publié ! 🎉
```

---

## 🔒 Sécurité

### **Protection par AdminGuard**
- Seuls les admins peuvent accéder à `/admin/leads`
- Vérifie le claim `admin: true` dans Firebase Auth

### **Vérification Admin dans Firestore**
Assure-toi que ton utilisateur admin a ce claim :
```bash
# Dans Firebase Console → Authentication → Users
# Sélectionne ton utilisateur → Custom claims
{
  "admin": true
}
```

### **Règles Firestore pour `shop-leads`**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /shop-leads/{leadId} {
      // Public peut créer (via /join)
      allow create: if true;
      
      // Seuls les admins peuvent lire/modifier/supprimer
      allow read, update, delete: if request.auth.token.admin == true;
    }
  }
}
```

---

## 🔧 Génération du mot de passe

### **Format**
```
AfroConnect + 6 caractères aléatoires
Exemple: AfroConnect#A3b9
```

### **Caractères utilisés**
- Lettres majuscules : A-Z (sauf O pour éviter confusion avec 0)
- Lettres minuscules : a-z (sauf l pour éviter confusion avec 1)
- Chiffres : 2-9 (pas 0 ou 1)
- Symboles : ! @ # $ %

### **Fonction dans le code**
```typescript
generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let password = 'AfroConnect';
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
```

---

## 📊 Workflow complet

```
┌─────────────────────────────────────────────────────┐
│  1. Propriétaire remplit /join                     │
│     ↓                                               │
│  2. Lead créé dans "shop-leads" (status: new)     │
│     ↓                                               │
│  3. Admin voit le lead sur /admin/leads            │
│     ↓                                               │
│  4. Admin contacte via WhatsApp                    │
│     ↓                                               │
│  5. Admin change statut → "contacted"              │
│     ↓                                               │
│  6. Propriétaire intéressé → statut "interested"  │
│     ↓                                               │
│  7. Admin clique "Créer compte Firebase"           │
│     ↓                                               │
│  8. Compte Firebase créé + mot de passe généré     │
│     ↓                                               │
│  9. Admin envoie identifiants au propriétaire      │
│     ↓                                               │
│ 10. Propriétaire se connecte sur /login            │
│     ↓                                               │
│ 11. Propriétaire va sur /add-afroshop              │
│     ↓                                               │
│ 12. Commerce publié dans "afroshops" ! 🎉          │
└─────────────────────────────────────────────────────┘
```

---

## 🐛 Dépannage

### **Problème : "Email already in use"**
**Cause** : L'email existe déjà dans Firebase Auth
**Solution** :
1. Va sur Firebase Console → Authentication
2. Cherche l'email
3. Si le compte existe, donne les identifiants au propriétaire
4. Ou supprime le compte et recréé-le

### **Problème : "Pas de permission pour créer un compte"**
**Cause** : Tu n'es pas admin
**Solution** :
1. Vérifie ton custom claim `admin: true` dans Firebase Console
2. Déconnecte-toi et reconnecte-toi

### **Problème : "Leads ne s'affichent pas"**
**Cause** : Règles Firestore trop restrictives
**Solution** :
```javascript
match /shop-leads/{leadId} {
  allow read: if request.auth.token.admin == true;
}
```

---

## 🚀 Prochaines améliorations possibles

### **Option 1 : Email automatique après création de compte**
- Envoie automatiquement un email avec identifiants
- Utilise SendGrid ou Firebase Email Extension

### **Option 2 : Historique des actions**
- Log de toutes les actions admin
- Qui a contacté quel lead et quand

### **Option 3 : Notes et commentaires**
- Ajouter des notes sur chaque lead
- Historique des interactions

### **Option 4 : Assignation des leads**
- Si plusieurs admins
- Assigner un lead à un admin spécifique

---

## ✅ Checklist de déploiement

- [ ] ✅ Composant LeadsComponent créé
- [ ] ✅ Route `/admin/leads` ajoutée
- [ ] ⚠️ Configurer custom claim `admin: true` pour ton utilisateur
- [ ] ⚠️ Configurer règles Firestore pour `shop-leads`
- [ ] ⚠️ Tester la création de compte Firebase en local
- [ ] ⚠️ Tester l'envoi WhatsApp
- [ ] ⚠️ Tester l'export CSV
- [ ] ⚠️ Déployer sur Netlify

---

**Créé le 18 novembre 2025 - AfroConnect** 🌍💚❤️💛

**Prêt à gérer tes leads comme un pro !** 🚀
