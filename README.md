# Configuration Firebase Authentication et Firestore

## 📋 Résumé des modifications

Le code a été adapté pour utiliser **Firebase Authentication** au lieu de l'authentification par mot de passe hashé. Les règles Firestore ont été configurées pour être très strictes selon vos besoins.

## 🔐 Configuration Firebase Authentication

### 1. Créer les comptes utilisateurs

Dans la console Firebase (https://console.firebase.google.com), créez deux comptes utilisateurs :

1. **Compte Admin** :
   - Email : `admin@votredomaine.com` (ou l'email de votre choix)
   - Mot de passe : (celui que vous souhaitez)
   - Rôle : `admin`

2. **Compte Invité** :
   - Email : `invite@votredomaine.com` (ou l'email de votre choix)
   - Mot de passe : (celui que vous souhaitez)
   - Rôle : `invite`

### 2. Créer la collection `users` dans Firestore

Pour chaque utilisateur créé, créez un document dans la collection `users` avec l'ID correspondant à l'UID de l'utilisateur Firebase :

**Document pour l'admin** :
- Collection : `users`
- Document ID : `[UID_DE_L_ADMIN]`
- Champs :
  ```json
  {
    "role": "admin",
    "email": "admin@votredomaine.com"
  }
  ```

**Document pour l'invité** :
- Collection : `users`
- Document ID : `[UID_DE_L_INVITE]`
- Champs :
  ```json
  {
    "role": "invite",
    "email": "invite@votredomaine.com"
  }
  ```

> **Note** : Pour obtenir l'UID d'un utilisateur, allez dans Firebase Console > Authentication > Users, et copiez l'UID de chaque utilisateur.

## 📜 Règles Firestore

Les règles Firestore sont dans le fichier `firestore.rules`. Voici ce qu'elles font :

### Collection `races`
- **Lecture publique** : Tous les utilisateurs (même non connectés) peuvent lire les courses
  - ⚠️ **Note importante** : Firestore ne peut pas filtrer les champs individuels dans les règles de lecture. Le masquage du prix pour les non-authentifiés se fait côté client dans le code JavaScript.
- **Écriture** : Seuls les admins peuvent créer, modifier ou supprimer des courses

### Collection `wishlist`
- **Lecture** : Seuls les utilisateurs authentifiés (admin ou invite) peuvent lire
- **Écriture** : Seuls les admins peuvent créer, modifier ou supprimer

### Collection `users`
- **Lecture** : Chaque utilisateur peut lire ses propres données
- **Écriture** : Seuls les admins peuvent modifier

### Toutes les autres collections
- **Bloquées** : Aucune lecture ni écriture n'est autorisée

## 🚀 Déploiement des règles

1. Copiez le contenu du fichier `firestore.rules`
2. Allez dans Firebase Console > Firestore Database > Rules
3. Collez les règles et cliquez sur "Publish"

## 🔑 Permissions selon le rôle

### Utilisateur non connecté (Public)
- ✅ Peut voir les cards de courses sur la page d'accueil (sans le prix)
- ✅ Peut rechercher par nom uniquement
- ❌ Ne peut pas voir les détails complets (prix, notes, etc.)
- ❌ Ne peut pas modifier, supprimer ou ajouter des courses
- ❌ Ne peut pas accéder à la wishlist

### Utilisateur Invité (`invite`)
- ✅ Peut voir toutes les courses avec tous les détails (sauf le prix exact)
- ✅ Peut rechercher dans tous les champs
- ✅ Peut utiliser les filtres avancés
- ✅ Peut voir les fourchettes de prix (ex: "0-20 €")
- ❌ Ne peut pas voir le prix exact
- ❌ Ne peut pas modifier, supprimer ou ajouter des courses
- ❌ Ne peut pas éditer la wishlist

### Utilisateur Admin (`admin`)
- ✅ Accès complet à toutes les fonctionnalités
- ✅ Peut voir tous les prix exacts
- ✅ Peut créer, modifier et supprimer des courses
- ✅ Peut éditer la wishlist
- ✅ Peut voir toutes les statistiques (y compris le prix total)

## 📝 Notes importantes

1. **Masquage du prix** : Le prix est masqué côté client pour les non-authentifiés et les invités. Les règles Firestore autorisent la lecture complète, mais le code JavaScript filtre l'affichage.

2. **Custom Claims** : Le code supporte aussi les custom claims Firebase si vous préférez les utiliser. Pour cela, vous devrez configurer une Cloud Function qui définit les custom claims lors de la création d'un utilisateur.

3. **Sécurité** : Les règles Firestore sont la première ligne de défense. Même si quelqu'un modifie le code JavaScript, il ne pourra pas contourner les règles Firestore.

## 🛠️ Dépannage

### L'utilisateur ne peut pas se connecter
- Vérifiez que l'utilisateur existe dans Firebase Authentication
- Vérifiez que le document correspondant existe dans la collection `users` avec le bon UID
- Vérifiez que le champ `role` est bien défini (`admin` ou `invite`)

### Les règles ne fonctionnent pas
- Vérifiez que les règles ont été publiées dans Firebase Console
- Vérifiez la syntaxe des règles (pas d'erreurs dans la console Firebase)
- Vérifiez que l'utilisateur est bien authentifié (regardez dans la console du navigateur)

### Le prix s'affiche pour les invités
- Vérifiez que le code JavaScript filtre bien le prix pour les invités
- Vérifiez que `isInvite()` retourne bien `true` pour l'utilisateur invité

