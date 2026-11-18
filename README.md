# Cuisine Création Traiteur — proposition de refonte

Maquette front-end (HTML, CSS, JavaScript) du nouveau site de Cuisine Création Traiteur, traiteur organisateur de réception depuis 2006 (Cosnes-et-Romain · Grand Est, Luxembourg, Belgique).

## Contenu

- `index.html` : page unique, styles et scripts intégrés
- `img/` : photos issues du site actuel, converties en WebP
- `img/logos/` : logos des références clients

## Lancer en local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Bibliothèques (CDN)

- GSAP 3.12 + ScrollTrigger (animations au défilement)
- Lenis (défilement fluide)
- Google Fonts : Cormorant Garamond, Manrope

Le site reste lisible sans JavaScript et respecte le réglage « réduire les animations ».

## À faire (back-end)

- Brancher le formulaire de devis (envoi e-mail / base de données)
- Rédiger mentions légales, politique de confidentialité et gestion des cookies
