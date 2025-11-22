# 🚨 ACTION SÉCURITÉ URGENTE - Clés Exposées

## ⚠️ PROBLÈME IDENTIFIÉ

Tes clés API ont été exposées dans l'historique Git GitHub :
- ✅ Fichiers actuels : Protégés par .gitignore
- 🔴 Historique Git : Clés exposées dans anciens commits

## 🔥 ACTIONS IMMÉDIATES (À FAIRE MAINTENANT)

### 1. Révoquer la clé OpenAI
```
1. Va sur https://platform.openai.com/api-keys
2. Trouve la clé : sk-proj-NnOSFvllFNOLMs7...
3. Clique "Revoke" (Révoquer)
4. Crée une NOUVELLE clé
5. Remplace dans .env local (NE PAS COMMITTER)
```

### 2. Régénérer clé Google Maps
```
1. Va sur https://console.cloud.google.com/apis/credentials
2. Trouve : AIzaSyAVTCyd8uLieVgnMHEygb5mm1xQKcjiOVk
3. Clique "Regenerate" ou crée nouvelle clé
4. Ajoute restrictions :
   - HTTP referrers : afroconnect.shop, *.netlify.app
   - APIs : Maps JavaScript API, Geocoding API
5. Remplace dans .env
```

### 3. Clé Firebase (Moins critique)
```
Firebase API Key : AIzaSyBY571lmuW24qnczKhCGORAGWg4gei8cek
- Moins critique (utilisée côté client)
- Mais ajoute restrictions dans Firebase Console :
  1. Authentication > Settings > Authorized domains
  2. Ajoute seulement : afroconnect.shop, localhost
```

### 4. Clé Stripe (Sécurisée)
```
✅ Tu utilises pk_test (test mode) - OK pour développement
✅ Jamais exposer sk_live (live secret key)
```

## 🔒 PRÉVENTION FUTURE

### Option A : Nettoyer l'historique Git (AVANCÉ)
```bash
# ⚠️ ATTENTION : Ceci réécrit l'historique Git
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch src/environments/environment.ts src/environments/environment.prod.ts" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (attention si d'autres contributeurs)
git push origin --force --all
```

### Option B : Nouveau repo propre (RECOMMANDÉ)
```bash
# 1. Créer nouveau repo sur GitHub : AfroConnect-v2
# 2. Clone le repo actuel sans historique
git clone --depth 1 https://github.com/Ydi5291/AfroConnect.git AfroConnect-clean
cd AfroConnect-clean
rm -rf .git
git init
git add .
git commit -m "Initial commit - clean history"
git remote add origin https://github.com/Ydi5291/AfroConnect-v2.git
git push -u origin main
```

### Option C : Continuer avec précautions (SI CLÉS RÉVOQUÉES)
```bash
# Si tu as révoqué TOUTES les clés exposées :
# 1. Les anciennes clés dans Git sont inutilisables ✅
# 2. Continue avec nouvelles clés dans .env
# 3. Vérifie que .gitignore bloque bien les fichiers
git status --ignored
```

## 📋 CHECKLIST SÉCURITÉ

- [ ] Clé OpenAI révoquée et régénérée
- [ ] Clé Google Maps régénérée avec restrictions
- [ ] Restrictions Firebase configurées
- [ ] Nouvelles clés dans .env LOCAL uniquement
- [ ] .gitignore vérifié (ne pas toucher)
- [ ] Git status vérifié (aucun fichier .env tracké)
- [ ] Variables d'environnement Netlify mises à jour
- [ ] Build et redéploiement avec nouvelles clés

## 🛡️ BONNES PRATIQUES

### ✅ À FAIRE
- Utiliser .env pour clés locales
- Variables d'environnement sur Netlify/Firebase
- .gitignore pour tous fichiers sensibles
- Restrictions IP/domaine sur clés API
- Clés différentes dev/prod

### ❌ NE JAMAIS FAIRE
- Committer .env
- Committer environment.ts avec vraies clés
- Hardcoder clés dans le code
- Partager clés par email/chat
- Utiliser mêmes clés dev/prod

## 🔍 VÉRIFICATION FINALE

```bash
# Vérifier qu'aucun fichier sensible n'est tracké
git ls-files | grep -E "(\.env|environment\.ts|environment\.prod\.ts)"
# Résultat attendu : Aucun fichier (sauf templates)

# Vérifier le statut
git status --ignored
# .env doit apparaître dans "Ignored files"
```

## 📞 SI PROBLÈME

- Questions sur révocation : Consulte docs OpenAI/Google Cloud
- Doutes sur sécurité : Demande-moi d'analyser avec tools
- Erreurs après changement clés : Rebuild et redéploie

## ⏱️ TEMPS ESTIMÉ : 15-20 minutes

**COMMENCE PAR RÉVOQUER LA CLÉ OPENAI MAINTENANT** 🔥
