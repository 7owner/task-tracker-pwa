# TaskMaster • Suivi & Défis (PWA)

- 100% statique : `index.html` + `manifest` + `sw.js` → fonctionne **offline**.
- Données locales (LocalStorage) + **Import/Export JSON**.
- Onglets : **Mes tâches**, **Compétition**, **Amis**.

## Utilisation locale
1. Ouvrir `index.html` dans un navigateur récent (Chrome/Edge/Brave).
2. Menu → **Ajouter à l’écran d’accueil** (mobile) pour installer en PWA.
3. Boutons **Importer/Exporter** pour sauvegarder/restaurer vos données.

## Déploiement GitHub Pages
1. Créer un repo, copier les fichiers à la racine.
2. `Settings → Pages → Source: Deploy from a branch`, **Branch: main**.
3. L’URL Pages devient votre app installable (PWA).

## Fichiers
- `index.html` : app React (CDN) + Tailwind (CDN)
- `manifest.json` et `manifest.webmanifest`
- `sw.js` : cache offline + fallback SPA
- `404.html` : fallback pour GitHub Pages
- `icons/` : icônes PWA 192/512

## Données d’exemple
`sample-data.json` donne une structure de base. Importez ce fichier depuis l’app.
