# AntiBotWall Test Lab

Site de démonstration pour tester l’interface du profil et le CAPTCHA AntiBotWall.

## Tester sans configuration Cloudflare

- `index.html` : accueil et test du challenge CAPTCHA.
- `profile.html` : espace compte avec bouton **Prévisualiser un profil démo**.
- Le mode démo affiche un profil fictif uniquement côté navigateur : il ne crée pas de compte, ne simule pas une authentification réussie et ne nécessite aucune variable Cloudflare.
- Les boutons OAuth restent désactivés tant que la connexion réelle n’est pas configurée.

## Connexion réelle (à configurer plus tard)

Pour activer l’authentification réelle, déployer sur **Cloudflare Pages avec Pages Functions**, puis configurer les variables serveur `ABW_SITE_KEY` et `ABW_SITE_SECRET` avec les identifiants réels de l’intégration AntiBotWall. Ne jamais mettre le secret dans le navigateur ou dans GitHub.

Configurer également le domaine, le fournisseur OAuth et l’URL de callback dans AntiBotWall Studio. La clé publique seule ne suffit pas pour valider une session côté serveur.

## Sécurité

- L’aperçu est explicitement étiqueté comme démo.
- La connexion réelle vérifie la signature HMAC-SHA-256 côté serveur et utilise un cookie `HttpOnly; Secure; SameSite=Lax`.
- Ne pas utiliser les données fictives comme preuve d’une connexion réelle.
