# 🗺️ Configuration de l'API Google Maps pour l'Europe

## 📍 Objectif
Configurer la clé API Google Maps pour couvrir **9 pays européens** :
- 🇩🇪 Allemagne
- 🇨🇭 Suisse  
- 🇱🇺 Luxembourg
- 🇧🇪 Belgique
- 🇫🇷 France
- 🇳🇱 Pays-Bas (Hollande)
- 🇮🇹 Italie
- 🇪🇸 Espagne
- 🇦🇹 Autriche (bonus)

---

## 🔑 Étape 1 : Accéder à Google Cloud Console

1. Va sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionne ton projet **AfroConnect**
3. Va dans **APIs & Services** → **Credentials**

---

## 🌍 Étape 2 : Configurer la clé API

### A. Trouver ta clé API actuelle

Dans ton fichier `src/environments/environment.ts` :
```typescript
googleMapsApiKey: "AIzaSyAVTCyd8uLieVgnMHEygb5mm1xQKcjiOVk"
```

### B. Modifier les restrictions de la clé

1. Dans Google Cloud Console, clique sur ta clé API
2. Dans **API restrictions**, assure-toi que ces APIs sont activées :
   - ✅ **Maps JavaScript API**
   - ✅ **Geocoding API**
   - ✅ **Places API**
   - ✅ **Directions API**
   - ✅ **Geolocation API**

3. Dans **Application restrictions**, choisis une option :
   - **Option recommandée** : "HTTP referrers (web sites)"
     - Ajoute : `https://afroconnect.netlify.app/*`
     - Ajoute : `http://localhost:*` (pour développement)
   - **Option temporaire** : "None" (attention, moins sécurisé)

---

## 🌐 Étape 3 : Restrictions géographiques (optionnel)

⚠️ **Attention** : Les restrictions géographiques peuvent limiter l'accès aux APIs.

### Option A : Pas de restriction (recommandé pour AfroConnect)
- Ne pas activer de restrictions de pays
- Permet à tous les utilisateurs d'accéder aux APIs
- Les APIs fonctionneront partout en Europe

### Option B : Restriction par pays (si tu veux vraiment)
Dans **API key restrictions** → **Geographic restrictions** :
- Allemagne (DE)
- Suisse (CH)
- Luxembourg (LU)
- Belgique (BE)
- France (FR)
- Pays-Bas (NL)
- Italie (IT)
- Espagne (ES)
- Autriche (AT)

**⚠️ Inconvénient** : Les APIs ne fonctionneront que depuis ces pays. Si un utilisateur visite ton site depuis un autre pays, les cartes ne s'afficheront pas.

---

## 🔧 Étape 4 : Vérifier les quotas

1. Va dans **APIs & Services** → **Dashboard**
2. Vérifie que tu as des quotas suffisants pour :
   - **Maps JavaScript API** : 28,000 chargements/mois gratuits
   - **Geocoding API** : 40,000 requêtes/mois gratuites
   - **Places API** : Usage limité, vérifier les tarifs
   - **Directions API** : Usage limité, vérifier les tarifs

---

## 📝 Étape 5 : Tester la configuration

### Test 1 : Autocomplete d'adresse
1. Va sur `/add-afroshop`
2. Commence à taper une adresse dans le champ "Straße"
3. Vérifie que l'autocomplete propose des adresses

### Test 2 : Géolocalisation
1. Va sur `/gallery`
2. Clique sur "GPS aktivieren"
3. Autorise la géolocalisation
4. Vérifie que ta position s'affiche sur la carte

### Test 3 : Recherche de ville
1. Sélectionne une ville dans le dropdown (ex: Paris, Milan, Madrid)
2. Clique sur "Confirmer"
3. Vérifie que la carte se centre sur cette ville

### Test 4 : Geocoding d'adresse
1. Tape manuellement une ville européenne (ex: "Barcelona", "Roma", "Zurich")
2. Clique sur "Suchen"
3. Vérifie que la position est trouvée

---

## 🚨 Résolution de problèmes

### Problème 1 : "This API project is not authorized to use this API"
**Solution** : Active l'API dans Google Cloud Console
- Va dans **APIs & Services** → **Library**
- Recherche l'API manquante
- Clique sur "Enable"

### Problème 2 : "RefererNotAllowedMapError"
**Solution** : Ajoute ton domaine dans les HTTP referrers
- Va dans les restrictions de la clé
- Ajoute : `https://ton-domaine.com/*`

### Problème 3 : L'autocomplete ne fonctionne pas
**Solution** : Vérifie que **Places API** est activée
- Vérifie aussi que tu as du crédit/quota disponible

### Problème 4 : Les directions ne fonctionnent pas
**Solution** : Active **Directions API**
- Vérifie les quotas (requêtes/jour)

### Problème 5 : Géocodage échoue pour certains pays
**Solution** : 
1. Vérifie qu'il n'y a pas de restriction géographique
2. Teste avec des adresses complètes (rue, code postal, ville, pays)
3. Exemple : "Rue de Rivoli, 75001 Paris, France"

---

## 💰 Coûts estimés

### Usage gratuit mensuel
- **Maps JavaScript API** : 28,000 chargements gratuits
- **Geocoding API** : 40,000 requêtes gratuites
- **Directions API** : Payant après les premiers usages

### Estimation pour AfroConnect
- **100 visiteurs/jour** : ~3,000 chargements/mois → **Gratuit** ✅
- **1,000 visiteurs/jour** : ~30,000 chargements/mois → ~2$ de dépassement
- **Geocoding** : Si tu ajoutes 100 shops/mois → **Gratuit** ✅

### Recommandation
Configure une **limite de budget** dans Google Cloud :
1. Va dans **Billing** → **Budgets & alerts**
2. Crée une alerte à 10€/mois
3. Tu seras prévenu si tu dépasses

---

## ✅ Checklist finale

- [ ] Clé API créée et copiée dans `environment.ts` et `environment.prod.ts`
- [ ] **Maps JavaScript API** activée
- [ ] **Geocoding API** activée
- [ ] **Places API** activée
- [ ] **Directions API** activée (optionnel)
- [ ] Restrictions HTTP configurées avec ton domaine
- [ ] Pas de restriction géographique (ou tous les pays EU ajoutés)
- [ ] Quotas vérifiés
- [ ] Test autocomplete réussi
- [ ] Test géolocalisation réussi
- [ ] Test recherche de ville dans tous les pays réussi
- [ ] Budget alert configuré

---

## 🌍 Villes couvertes dans AfroConnect

### Total : **69 villes** dans 9 pays

- 🇩🇪 **Allemagne** : 14 villes (Berlin, Hamburg, München, etc.)
- 🇫🇷 **France** : 10 villes (Paris, Marseille, Lyon, etc.)
- 🇧🇪 **Belgique** : 5 villes (Bruxelles, Anvers, Gand, etc.)
- 🇳🇱 **Pays-Bas** : 5 villes (Amsterdam, Rotterdam, La Haye, etc.)
- 🇨🇭 **Suisse** : 5 villes (Zurich, Genève, Bâle, etc.)
- 🇱🇺 **Luxembourg** : 1 ville (Luxembourg)
- 🇮🇹 **Italie** : 7 villes (Rome, Milan, Naples, etc.)
- 🇪🇸 **Espagne** : 7 villes (Madrid, Barcelone, Valence, etc.)

**+ Recherche manuelle possible pour TOUTES les villes d'Europe !**

---

## 📞 Support

Si tu as des questions sur la configuration de l'API Google Maps :
- [Documentation officielle Google Maps](https://developers.google.com/maps/documentation)
- [Centre d'aide Google Cloud](https://support.google.com/cloud)
- [Tarification Google Maps Platform](https://mapsplatform.google.com/pricing/)

---

**Créé pour AfroConnect** 🌍💚❤️💛
*Connecter la diaspora africaine en Europe*
