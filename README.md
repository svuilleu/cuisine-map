# 🍽️ Cuisine Map — README

**But du projet**  
Créer une petite application web **sans base de données** qui affiche des **plats traditionnels par pays** à partir d’une **carte du monde cliquable (SVG)**.  
Un élève peut **ajouter/modifier** les plats et les images **simplement** en éditant des **fichiers** (`data/dishes.json`, dossier `images/`).

- 📦 Dépôt source : **https://github.com/svuilleu/cuisine-map**  
- 🌐 Démo en ligne : **https://svuilleu.github.io/cuisine-map/**

---

## 🔎 Comment ça marche (vue d’ensemble)

- **Carte** : `public/world-simple.svg` — chaque pays expose un code **ISO-2** via `id="FR"` (ou `data-id="FR"`).  
- **Données** : `data/dishes.json` joue le rôle d’une **“base de données” de fichiers**.  
- **Noms pays** : `data/countries.json` (mapping `ISO2 → Nom`).  
- **Logique** : `assets/app.js` charge le SVG + JSON, rend les pays **cliquables**, et affiche les plats.  
- **Styles** : `assets/style.css` gère couleurs et contours (les pays avec des plats ont un **contour** discret).

```
/assets
  app.js
  style.css
/data
  dishes.json       # “stockage” des plats par pays
  countries.json    # noms des pays (ISO2 → nom)
/images
  (vos images ici)
/public
  world-simple.svg  # carte du monde (SVG cliquable)
index.html
```

---

## 🧩 `dishes.json` = “base de données” (fichiers)

Exemple minimal :

```jsonc
{
  "FR": [
    {
      "name": "Crêpes",
      "description": "Fine pâte dorée, sucrée/salée.",
      "images": ["fr-crepes.jpg"],  // ⬅️ le code préfixe automatiquement 'images/'
      "tags": ["sucré", "salé"]
    }
  ],
  "BR": [
    {
      "name": "Feijoada",
      "description": "Ragoût de haricots noirs et de viande, servi avec du riz.",
      "images": ["br-feijoada.jpg"],
      "tags": ["haricots", "viande"]
    }
  ]
}
```

Rappels :
- Clé de pays = **ISO-2** (ex. `FR`, `JP`), identique au code de la carte.
- Dans `images`, **le nom de fichier seul** suffit (`"fr-crepes.jpg"`).  
  Les chemins `images/...`, `/images/...`, URL `http(s)`, `data:` sont aussi acceptées.
- JSON **valide** requis (virgules, crochets).

---

## ⚡️ Quickstart (local) — 30 secondes

```bash
# 1) Cloner (ou télécharger le ZIP) puis ouvrir un petit serveur
git clone https://github.com/svuilleu/cuisine-map.git
cd cuisine-map
python3 -m http.server 8000   # ou: npx serve .
# Ouvrir http://localhost:8000
```

- Ajouter un plat : éditez `data/dishes.json` et déposez l’image dans `/images`.
- Tester : rafraîchissez la page, cliquez le pays → le plat apparaît.

> 🧭 Pour un **pas-à-pas détaillé** (création de compte GitHub, GitHub Pages, Git/GitHub Desktop…), voir **[GUIDE_Installation_&_Deploiement.md](./GUIDE_Installation_&_Deploiement.md)**.

---

## 🚀 Déployer (résumé)

1. Pousser tous les fichiers à la **racine** du dépôt (`index.html`, `assets/`, `data/`, `public/`, `images/`).  
2. **Settings → Pages** → *Deploy from a branch* → `main` + `/ (root)` → **Save**.  
3. Votre site sera accessible (ex.) : `https://svuilleu.github.io/cuisine-map/`.

> Détails complets dans **[GUIDE_Installation_&_Deploiement.md](./GUIDE_Installation_&_Deploiement.md)**.

---

## 🌱 Apprendre Git & GitHub (très bref)

```bash
git clone https://github.com/svuilleu/cuisine-map.git
cd cuisine-map
git checkout -b feature/mon-changement
# ... modifs ...
git add .
git commit -m "Mon amélioration"
git push -u origin feature/mon-changement
```
- Ouvrir ensuite une **Pull Request** sur GitHub.  
- Pour **Forker** : bouton **Fork** sur le dépôt → clonez votre propre copie.  
- Voir le mémo complet dans le **GUIDE**.

---

## 🛣️ Roadmap & améliorations possibles

- **Validation automatique** : script & GitHub Action pour vérifier `dishes.json` (JSON valide, clés ISO-2 connues) et contrôler l’SVG (présence d’IDs ISO-2).  
- **Recherche & filtres** : par plat, tag, pays.  
- **Accessibilité** : focus clavier, aria-live sur le panneau de résultats.  
- **Mobile** : gestuelle (tap/zoom), hitbox plus généreuses.  
- **Thèmes** : variables CSS (clair/sombre), palette daltonisme-friendly.  
- **i18n** : noms de pays multilingues, UI en FR/EN.  
- **PWA** (offline) : cache des fichiers statiques pour usage sans connexion.  
- **CMS “sans back-end”** : intégration **Decap CMS** pour éditer `dishes.json` et images dans GitHub (interface web).  
- **Contrib** : fichiers `LICENSE`, `CONTRIBUTING.md`, modèles d’issues/PR, Code of Conduct.

---

## 🧪 Dépannage rapide
- **Un pays ne clique pas** : la carte doit exposer `id="FR"` ou `data-id="FR"` / `data-iso2="FR"`.  
- **Couleur** : le CSS fixe la couleur de base ; les pays avec plats ont un **contour**.  
- **Erreur JSON** : validez la syntaxe (virgules, crochets).

Bon apprentissage & bon appétit ! 😋
