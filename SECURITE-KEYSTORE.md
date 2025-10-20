# 🔐 GUIDE DE SÉCURITÉ - AfroConnect Keystore

## ⚠️ INFORMATIONS CRITIQUES À SAUVEGARDER

### 🔑 Identifiants de signature :
- **Mot de passe keystore** : `Diamal5291`
- **Nom développeur** : `Ydi5291`
- **Alias clé** : `afroconnect`
- **Fichier keystore** : `afroconnect-keystore.jks`

## 🚨 POURQUOI C'EST SI IMPORTANT ?

Google Play Store **EXIGE** le même certificat de signature pour :
- ✅ Publier la première version
- ✅ Toutes les mises à jour futures
- ✅ Maintenir la continuité de l'app

**Si vous perdez ces informations = GAME OVER ! 💀**
- Impossible de mettre à jour l'app
- Obligation de créer une nouvelle app (perte de tous les utilisateurs)
- Perte de toutes les évaluations et commentaires

## 💾 SAUVEGARDES OBLIGATOIRES

### Fichiers à sauvegarder dans 3 endroits différents :
1. `afroconnect-keystore.jks` (fichier de certificat)
2. `AFROCONNECT-KEYSTORE-INFO-PRIVE.txt` (mots de passe)
3. `app-release-signed.apk` (APK final)

### Lieux de sauvegarde recommandés :
- 🔒 Gestionnaire de mots de passe (1Password, Bitwarden, etc.)
- ☁️ Cloud privé sécurisé (OneDrive privé, Google Drive privé)
- 💾 Clé USB dans un endroit sûr
- 📝 Note physique dans un coffre-fort

## 🔄 POUR LES MISES À JOUR FUTURES

### Script automatique créé :
```bash
.\update-apk.bat
```
Ce script utilise automatiquement vos informations sauvegardées.

### Étapes manuelles si besoin :
1. Modifier le code Angular
2. `cd android && .\gradlew assembleRelease`
3. Signer avec les mêmes informations que la première fois
4. Upload sur Google Play Store

## 📱 STATUT ACTUEL

- ✅ **APK prêt** : `app-release-signed.apk` (3.96 MB)
- ✅ **Certificat valide** : 27 ans de validité
- ✅ **Prêt pour Google Play Store**

## 🚀 PUBLICATION GOOGLE PLAY STORE

1. **Google Play Console** : https://play.google.com/console
2. **Create App** → Nom : "AfroConnect"
3. **Upload APK** : `app-release-signed.apk`
4. **Informations app** :
   - Description : App de découverte d'Afroshops en Allemagne
   - Catégorie : Lifestyle
   - Screenshots de l'app
   - Icône 512x512px
5. **Publish** : Internal Testing → Production

## ⚠️ À NE JAMAIS FAIRE

- ❌ Partager le keystore ou les mots de passe
- ❌ Supprimer le fichier `afroconnect-keystore.jks`
- ❌ Oublier le mot de passe `Diamal5291`
- ❌ Créer un nouveau certificat pour les mises à jour

## 🎯 RÉSUMÉ IMPORTANT

**VOS INFORMATIONS DE SIGNATURE SONT L'IDENTITÉ NUMÉRIQUE PERMANENTE DE VOTRE APP !**

Traitez-les comme :
- 🏦 Les codes de votre compte bancaire
- 🏠 Les clés de votre maison
- 🆔 Votre passeport numérique

**Sauvegardez maintenant, remerciez-vous plus tard ! 🙏**