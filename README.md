# Cuisine Création Traiteur — proposition de refonte

Maquette front-end du nouveau site de Cuisine Création Traiteur, traiteur organisateur de réception depuis 2006 (Cosnes-et-Romain · Grand Est, Luxembourg, Belgique).

## Structure des fichiers

```
index.html        Contenu et structure : textes, images, liens, formulaire
css/style.css     Mise en forme : couleurs, polices, mise en page, responsive, animations CSS
js/main.js        Interactions : menu, diaporama, animations au scroll, accordéon, formulaire
img/              Photos du site (WebP, issues du site actuel)
img/logos/        Logos des références clients (PNG)
```

Chaque fichier commence par un sommaire, et chaque section est commentée.

## Où modifier quoi

| Je veux…                                   | Fichier          | Où                                              |
|--------------------------------------------|------------------|-------------------------------------------------|
| Changer un texte                           | `index.html`     | Ctrl+F sur le texte                             |
| Changer une photo                          | `img/` ou `index.html` | Remplacer le fichier (même nom) ou le `src`   |
| Changer les couleurs ou les polices        | `css/style.css`  | Partie 1 « Variables » (`:root`)                |
| Ajuster une section (taille, espacement)   | `css/style.css`  | Partie portant le nom de la section             |
| Vitesse du diaporama / écran de chargement | `js/main.js`     | Partie 0 (`SLIDE_INTERVAL`, `LOADER_DURATION`)  |
| Brancher l'envoi du formulaire             | `js/main.js`     | Partie 11, bloc « ENVOI »                       |
| Ajouter un logo client                     | `index.html` + `img/logos/` | Section « Avis + logos clients »     |

## Si quelque chose casse

1. Ouvrir la console du navigateur (F12 › Console) : une erreur rouge indique le fichier et la ligne.
2. Les animations ne marchent plus mais le site s'affiche : les bibliothèques CDN (GSAP, Lenis) n'ont pas chargé. Vérifier les balises `<script>` en bas de `index.html` (elles doivent être **avant** `js/main.js`).
3. Mise en page cassée : vérifier que `css/style.css` est bien chargé (onglet Réseau, F12).

## Lancer en local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Ouvrir `index.html` directement fonctionne aussi, mais un petit serveur local est plus fiable.

## Bibliothèques (CDN)

- GSAP 3.12 + ScrollTrigger : animations liées au défilement
- Lenis : défilement doux
- Google Fonts : Cormorant Garamond (titres), Manrope (texte)

Sans ces bibliothèques, le site reste lisible et utilisable. Il respecte aussi le réglage système « réduire les animations ».

## À faire (back-end)

- Brancher le formulaire de devis (envoi e-mail ou base de données) : `js/main.js`, partie 11
- Rédiger mentions légales, politique de confidentialité et gestion des cookies
