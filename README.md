# Cuisine Map – Solution 1 (sans base de données)

Projet minimal pour afficher des **plats traditionnels par pays** via une **carte SVG cliquable**.
Tout est **statique** : fichiers HTML/CSS/JS + `data/dishes.json` pour les données + images.

## Lancer en local
- Ouvrir `index.html` dans un navigateur **via un petit serveur** (important pour `fetch()`):
  - Python : `python3 -m http.server` puis ouvre http://localhost:8000
  - Node : `npx serve .`

## Structure
```
/assets
  app.js
  style.css
/data
  dishes.json
/images
  (tes images ici)
/public
  world-simple-demo.svg   # carte de démonstration (quelques pays seulement)
index.html
```

## Édition des données
- Ouvre `data/dishes.json` et ajoute/édite les plats.
- La clé de pays est le **code ISO-2** (ex: `FR`, `JP`, `BR`…).
- Exemple :
```json
{
  "FR": [
    {
      "name": "Bouillabaisse",
      "description": "Soupe de poissons…",
      "images": ["images/fr-bouillabaisse.jpg"],
      "tags": ["poisson"]
    }
  ]
}
```

## Remplacer la carte (optionnel mais recommandé)
- Remplace `public/world-simple-demo.svg` par une **vraie carte du monde simplifiée** où
  chaque pays a un `id` = **code ISO-2** (FR, JP, BR…).
- Garde le même nom de fichier (`world-simple-demo.svg`) ou adapte l’URL dans `assets/app.js`.

**Astuce** : dans le SVG, si chaque `<g id="FR">` contient un `<title>France</title>`, le nom
du pays s’affichera automatiquement dans le panneau latéral.

## Déploiement (GitHub Pages)
1. Crée un dépôt sur GitHub et pousse tous ces fichiers à la racine.
2. Paramètres du repo → **Pages** → Source: **Main / root** → Enregistrer.
3. Ton site sera accessible à une URL du type `https://toncompte.github.io/tonrepo/`.

## Déploiement (Netlify, alternatif)
- Glisse-dépose le dossier dans Netlify → il crée une URL. Aucun build nécessaire.

## Aller plus loin
- Recherche par plat, filtres (tags).
- Segmentation des données par pays (`data/countries/FR.json`, etc.) + script d’agrégation.
- Interface d’édition (Decap CMS) tout en restant “sans base de données” (option 2).
