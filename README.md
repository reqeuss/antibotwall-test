# AntiBotWall Test Lab

Site de démonstration pour tester le CAPTCHA et l’authentification visiteur AntiBotWall.

## Fonctionnalités
- `index.html` : accueil et test du challenge CAPTCHA.
- `profile.html` : profil après connexion (nom, e-mail, fournisseur, identifiant et expiration de session).
- `functions/auth/antibotwall/callback.js` : callback POST, vérification HMAC-SHA-256 et création d’une session sécurisée.
- `functions/auth/antibotwall/me.js` : lecture de la session côté serveur.
- `functions/auth/antibotwall/logout.js` : déconnexion.
- `profile.js` : interface du profil et liens de connexion.
- `styles.css` : styles de l’accueil.

## Configuration requise

Le projet doit être déployé sur **Cloudflare Pages avec Pages Functions**. GitHub Pages ou un hébergement statique seul ne peut pas traiter le POST du callback ni garder un secret côté serveur.

Dans les paramètres Cloudflare Pages, ajoutez ces variables d’environnement (Production et Preview si nécessaire) :
- `ABW_SITE_KEY` : clé publique de l’intégration créée dans le Studio AntiBotWall.
- `ABW_SITE_SECRET` : secret de cette intégration, affiché une seule fois. Ne le mettez jamais dans le code, dans GitHub ou dans le navigateur.

Dans le Studio AntiBotWall, configurez :
1. Le domaine de cette démo et validez-le.
2. Le service d’authentification (pas le service CAPTCHA).
3. Les fournisseurs de connexion souhaités.
4. L’URL de callback exacte : `https://VOTRE-DOMAINE/auth/antibotwall/callback`.

Le bouton **Connexion** de l’accueil ouvre `profile.html`, qui propose Discord, GitHub, Google et Epsilon Social. Chaque fournisseur doit être activé pour l’intégration. La clé publique doit être enregistrée sur l’accueil.

## Sécurité
- Le callback attend un POST avec un champ `token` (formulaire ou JSON).
- Le serveur vérifie la signature HMAC-SHA-256 avec `ABW_SITE_SECRET`, ainsi que l’émetteur, l’audience et l’expiration.
- Le navigateur reçoit un cookie de session signé `HttpOnly; Secure; SameSite=Lax`. Le jeton d’authentification brut n’est pas exposé dans l’URL ni dans le JavaScript.
- Le profil est récupéré via une route serveur et le secret reste dans les variables d’environnement.
