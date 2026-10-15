# AntiBotWall Test Lab

Site de démonstration statique pour tester le CAPTCHA du service [AntiBotWall](https://github.com/reqeuss/antibotwall-service).

## Fichiers
- `index.html` : accueil et test du challenge CAPTCHA.
- `styles.css` : interface responsive avec thèmes clair et sombre.
- `app.js` : appels à l'API CAPTCHA AntiBotWall.
  
Aucune page de connexion, aucun bouton OAuth et aucune logique d'authentification ne sont inclus : vous intégrerez vous-même l'authentification de votre application.

## Configuration
1. Déployez ce dépôt comme site statique, par exemple avec GitHub Pages ou Cloudflare Pages.
2. Dans le Studio AntiBotWall, créez une intégration et vérifiez son domaine.
3. Copiez la clé publique du site dans la zone de test de la page d'accueil.
4. Vérifiez que le Worker autorise le domaine du site dans sa configuration CORS.

L'API appelée par défaut est https://antibotwall.reqeuss.com. Pour changer l'URL, modifiez la constante `API` dans `app.js`.

## Sécurité
- Saisissez uniquement la clé publique dans le navigateur. N'y mettez jamais de secret de site, de clé Supabase secrète ou de secret OAuth.
- Après vérification CAPTCHA, le jeton temporaire doit être consommé côté serveur via `/captcha/consume` avant de faire confiance au résultat.
- Ce site de test ne crée aucune session utilisateur et ne met en place aucune authentification pour votre application.
- Un challenge CAPTCHA simple ne garantit pas de bloquer tous les bots.

Aucun build n'est requis : servez les fichiers avec un serveur statique.
