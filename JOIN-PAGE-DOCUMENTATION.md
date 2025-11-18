# 🎯 Landing Page `/join` - Documentation

## 📋 Vue d'ensemble

La page **`/join`** est une landing page d'inscription pour les commerçants africains qui souhaitent être référencés sur AfroConnect.

---

## 🌟 Fonctionnalités

### 1. **Formulaire d'inscription multilingue**
- ✅ Allemand (de) - langue par défaut
- ✅ Anglais (en)
- ✅ Français (fr)
- ✅ Espagnol (es)
- ✅ Italien (it)
- ✅ Portugais (pt)

### 2. **Champs du formulaire**
| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| **Nom du commerce** | Texte | ✅ Oui | Nom affiché publiquement |
| **Nom du propriétaire** | Texte | ❌ Non | Contact principal |
| **Téléphone** | Tel | ✅ Oui | WhatsApp/appel direct |
| **Email** | Email | ❌ Non | Rarement disponible |
| **Adresse** | Texte | ✅ Oui | Rue et numéro |
| **Ville** | Texte | ✅ Oui | Pour géocodage |
| **Catégorie** | Select | ✅ Oui | shop/restaurant/salon/other |
| **Notes** | Textarea | ❌ Non | Infos supplémentaires |

### 3. **Actions disponibles**
#### A. Soumission du formulaire (bouton vert)
- Validation des champs obligatoires
- Sauvegarde dans Firestore : collection `shop-leads`
- Message de succès affiché
- Formulaire réinitialisé après 3 secondes

#### B. WhatsApp (bouton vert WhatsApp)
- Ouvre WhatsApp Business avec message pré-rempli
- Message adapté à la langue sélectionnée
- **⚠️ À FAIRE** : Remplacer `4915000000000` par ton vrai numéro WhatsApp dans `join.component.ts` ligne 178

---

## 🗄️ Structure Firestore

### Collection : `shop-leads`

```typescript
{
  id: string (auto-généré),
  name: string,           // Nom du commerce
  ownerName?: string,     // Nom du propriétaire (optionnel)
  phone: string,          // Téléphone (obligatoire)
  email?: string,         // Email (optionnel)
  address: string,        // Adresse complète
  city: string,           // Ville
  category: 'shop' | 'restaurant' | 'salon' | 'other',
  status: 'new' | 'contacted' | 'interested' | 'registered',
  source: 'website' | 'whatsapp' | 'phone' | 'visit',
  notes?: string,         // Notes additionnelles
  createdAt: Timestamp,   // Date de création
  contactedAt?: Timestamp // Date de contact (si déjà contacté)
}
```

---

## 🎨 Design

### Couleurs AfroConnect
- **Vert** : `#009639` (drapeau africain)
- **Jaune** : `#FFCD00`
- **Rouge** : `#EF3340`
- **WhatsApp** : `#25D366`

### Responsive
- ✅ Desktop (> 768px) : Grid 2 colonnes pour les bénéfices
- ✅ Mobile (< 768px) : Formulaire adapté, boutons empilés

---

## 📂 Fichiers créés

```
src/app/join/
├── join.component.ts        # Logique TypeScript
├── join.component.html      # Template HTML
└── join.component.css       # Styles CSS

src/app/services/
└── shop-lead.service.ts     # Service Firestore pour les leads

src/app/services/translation.service.ts  # ✅ Traductions JOIN ajoutées
src/app/app.routes.ts                    # ✅ Route /join ajoutée
```

---

## 🚀 Utilisation

### 1. **Accéder à la page**
```
https://afroconnect.shop/join
```

### 2. **Partager le lien**
Tu peux partager ce lien via :
- **WhatsApp** : `https://afroconnect.shop/join`
- **SMS** : "Kostenlos registrieren: afroconnect.shop/join"
- **Email** : Template d'email (à créer - Étape suivante)
- **QR Code** : Générer un QR vers `/join` pour flyers

### 3. **Tester en local**
```bash
ng serve
```
Puis ouvre : `http://localhost:4200/join`

---

## 🔧 Configuration requise

### 1. **Numéro WhatsApp Business**
Dans `src/app/join/join.component.ts`, ligne 178 :
```typescript
const phoneNumber = '4915000000000'; // ⚠️ REMPLACER PAR TON NUMÉRO
```

### 2. **Règles Firestore**
Ajoute ces règles dans Firebase Console :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Collection shop-leads : écriture publique, lecture admin uniquement
    match /shop-leads/{leadId} {
      allow create: if request.auth != null || true; // Public pour inscription
      allow read, update, delete: if request.auth.token.admin == true; // Admin seulement
    }
  }
}
```

**⚠️ Sécurité** : Pour l'instant, j'ai mis `|| true` pour permettre les inscriptions sans authentification. Tu peux ajouter un CAPTCHA plus tard si besoin.

---

## 📊 Gestion des leads (Admin)

### Récupérer tous les leads
```typescript
import { ShopLeadService } from './services/shop-lead.service';

constructor(private shopLeadService: ShopLeadService) {}

async getAllLeads() {
  const leads = await this.shopLeadService.getAllLeads();
  console.log('Leads:', leads);
}
```

### Récupérer les leads par statut
```typescript
const newLeads = await this.shopLeadService.getLeadsByStatus('new');
const contactedLeads = await this.shopLeadService.getLeadsByStatus('contacted');
```

### Mettre à jour un statut
```typescript
await this.shopLeadService.updateLeadStatus(
  'leadId123', 
  'contacted', 
  'Appelé le 18/11/2025 - intéressé'
);
```

---

## 📧 Prochaines étapes (Option B & C)

### Étape B : Email Templates (15 min)
Créer des templates d'email HTML pour :
1. **Email de bienvenue** (après inscription)
2. **Email de prospection** (pour contacter les commerces)

### Étape C : Cloud Function d'envoi d'email (45 min)
- Configurer SendGrid (gratuit 100 emails/jour)
- Firebase Cloud Function : `sendEmail()`
- Trigger automatique après création d'un lead

### Étape D : CRM Admin (30 min)
- Page admin `/admin/leads` pour voir tous les leads
- Tableau avec filtres (statut, date, catégorie)
- Actions : Appeler, Envoyer email, Marquer comme contacté

---

## 🐛 Dépannage

### Problème 1 : "Cannot find module shop-lead.service"
**Solution** : Redémarre le serveur Angular
```bash
# Ctrl+C pour arrêter
ng serve
```

### Problème 2 : Formulaire ne se soumet pas
**Vérifier** :
1. Firebase est initialisé (voir `firebase-init.ts`)
2. Règles Firestore permettent l'écriture
3. Console du navigateur pour erreurs

### Problème 3 : WhatsApp ne s'ouvre pas
**Vérifier** :
1. Numéro WhatsApp est correct (format international)
2. WhatsApp est installé sur l'appareil
3. Tester sur mobile (WhatsApp Web sur desktop)

---

## ✅ Checklist de déploiement

Avant de déployer en production :

- [ ] ✅ Remplacer le numéro WhatsApp dans `join.component.ts`
- [ ] ✅ Ajouter les règles Firestore pour `shop-leads`
- [ ] ✅ Tester le formulaire en local
- [ ] ✅ Tester le bouton WhatsApp sur mobile
- [ ] ✅ Vérifier les traductions dans les 6 langues
- [ ] ✅ Tester le responsive (mobile + desktop)
- [ ] ✅ Ajouter lien `/join` dans le header/footer
- [ ] ✅ Créer un QR code pour flyers physiques
- [ ] ✅ Configurer SendGrid pour emails automatiques (optionnel)

---

## 📈 Métriques à suivre

Une fois déployé, surveille :
- **Nombre d'inscriptions/jour** (Firestore Analytics)
- **Taux de conversion** : Visites `/join` → Soumissions
- **Source** : website / whatsapp / phone
- **Catégorie** : Quels types de commerces s'inscrivent le plus ?
- **Géolocalisation** : Quelles villes sont les plus actives ?

---

## 🎉 Résumé

Tu as maintenant :
- ✅ Landing page `/join` multilingue (de, en, fr, es, it, pt)
- ✅ Formulaire d'inscription connecté à Firestore
- ✅ Bouton WhatsApp pour contact direct
- ✅ Service `ShopLeadService` pour gérer les leads
- ✅ Design moderne aux couleurs AfroConnect

**URL** : `https://afroconnect.shop/join`

**Prochaine étape** : Teste en local (`ng serve`) puis déploie sur Netlify !

---

**Créé le 18 novembre 2025 pour AfroConnect** 🌍💚❤️💛
