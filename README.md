# AntiBotWall Test Lab

Site de démonstration pour tester le service [AntiBotWall](https://github.com/reqeuss/antibotwall-service).

## Pages
- index.html : accueil et test réel du challenge CAPTCHA.
- login.html : page de connexion OAuth pour Epsilon Social, Discord, GitHub et Google.
- styles.css : interface responsive et thème clair/sombre.
- app.js : appels à l'API AntiBotWall.

## Configuration
1. Déployez ce dépôt comme site statique, par exemple avec GitHub Pages ou Cloudflare Pages.
2. Dans le Studio AntiBotWall, créez une intégration et vérifiez son domaine.
3. Copiez la clé publique du site et collez-la sur la page d'accueil ou de connexion.
4. Configurez les fournisseurs OAuth et leurs secrets dans Cloudflare, jamais dans ce dépôt.
5. Vérifiez que le Worker autorise le domaine du site dans sa configuration CORS.

L'API appelée par défaut est https://antibotwall.reqeuss.com. Pour changer l'URL, modifiez la constante API dans app.js.

## Sécurité
- N'entrez jamais de secret de site, de clé Supabase secrète ou de secret OAuth dans le navigateur.
- Les boutons OAuth fonctionnent seulement si le fournisseur est configuré côté service et si le domaine/site est vérifié.
- La page de test n'établit pas une session utilisateur pour votre propre site. En production, le serveur de votre application doit vérifier le jeton OAuth signé et établir sa propre session.
- Un challenge CAPTCHA simple ne garantit pas de bloquer tous les bots.

Aucun build n'est requis : ouvrez index.html ou servez les fichiers avec un serveur statique local.