# GUIDE_Installation_&_Deploiement

> Ce guide **complète** le README (il évite les redites) avec des pas-à-pas détaillés pour **installer**, **tester** et **déployer** le projet.

- Dépôt : https://github.com/svuilleu/cuisine-map
- Démo : https://svuilleu.github.io/cuisine-map/

---

## 1) Créer un compte GitHub
1. Ouvrez https://github.com/
2. Cliquez **Sign up** et suivez les étapes.
3. Confirmez votre e-mail.

---

## 2) Créer votre dépôt (ou Fork)
### A. Partir de zéro
1. **+ → New repository** → nommez `cuisine-map` → **Public** → **Create**.
2. Uploadez les fichiers du projet à la **racine** → **Commit changes**.

### B. Utiliser **le dépôt existant**
- **Cloner** le dépôt :  
  ```bash
  git clone https://github.com/svuilleu/cuisine-map.git
  cd cuisine-map
  ```
- Ou **Forker** (pour avoir votre copie) → puis cloner **votre** fork.

---

## 3) Travailler en local

### Ligne de commande (Git)
```bash
git status
git add data/dishes.json images/mon-image.jpg
git commit -m "Ajout d'un plat"
git push origin main
git pull origin main
```

### GitHub Desktop (option sans terminal)
- https://desktop.github.com/  
- **File → Clone repository** → choisissez le dépôt.
- Modifiez localement → **Commit to main** → **Push origin**.

---

## 4) Tester en local (serveur statique requis)
**Python 3**
```bash
python3 -m http.server 8000
# http://localhost:8000
```

**Node.js**
```bash
npm i -g http-server
http-server -p 8000
# ou: npx serve .
```

> Ouvrir `index.html` via un serveur pour que `fetch()` puisse charger les JSON.

---

## 5) Carte & données

- **Carte** : `public/world-simple.svg` — pays cliquables via `id="FR"` ou `data-id="FR"` / `data-iso2="FR"`.  
- **Données** : `data/dishes.json` (clé ISO-2 → liste de plats).  
  - Dans `images`, vous pouvez mettre **seulement le nom de fichier** (`"fr-crepes.jpg"`).  
  - Placez les fichiers dans `/images`.

Exemple :
```json
{
  "FR": [
    {
      "name": "Crêpes",
      "description": "Fine pâte dorée, sucrée/salée.",
      "images": ["fr-crepes.jpg"],
      "tags": ["sucré", "salé"]
    }
  ]
}
```

---

## 6) Déployer sur GitHub Pages

1. Dépôt → **Settings → Pages**.
2. **Source** : *Deploy from a branch*.
3. **Branch** : `main` — **/ (root)**.
4. **Save** → votre site est en ligne (ex.) : `https://svuilleu.github.io/cuisine-map/`.

---

## 7) (Optionnel) Branches & Pull Requests

```bash
git checkout -b feature/ajout-italie
# ... modifs ...
git add .
git commit -m "Ajout de plats italiens"
git push -u origin feature/ajout-italie
```
- Ouvrez une **Pull Request** pour fusionner sur `main`.

---

## 8) Mémo de commandes Git

```bash
git status
git add <fichier>   # ou: git add .
git commit -m "Message"
git push origin main
git pull origin main

git checkout -b feature/xxx
git switch main
git log --oneline --graph --decorate --all
```

Docs :  
- Git : https://git-scm.com/docs  
- GitHub : https://docs.github.com/

---

## 9) Dépannage
- **Un pays ne clique pas** : vérifiez `id="FR"` ou `data-id="FR"` / `data-iso2="FR"` dans le SVG.  
- **Images** : mettez juste le nom du fichier, placé dans `/images`.  
- **JSON** : syntaxe valide requise (virgules, crochets).

Bonne mise en ligne ! 🚀
