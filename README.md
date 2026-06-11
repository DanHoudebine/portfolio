# Dan Houdebine — Portfolio

Site vitrine de **Dan Houdebine**, Artiste d'Environnement 3D (jeu vidéo) — [danhoudebine.com](https://danhoudebine.com).

Direction artistique « cinématique AAA » : noir charbon, accent braise, typographie monumentale (Bebas Neue) relevée d'un italique éditorial (Fraunces).

## Sections

- **Hero** — reel UE5/Blender en fond, barres letterbox, intro animée
- **Mondes choisis** — 6 environnements en mise en page éditoriale (parallax) + grille props & études, lightbox plein écran (clavier : `←` `→` `Esc`)
- **À propos** — bio, stats, parcours, téléchargement des CV (FR/EN)
- **Réglages graphiques** — les compétences présentées comme un menu de paramètres de jeu (ULTRA / ÉLEVÉ / MOYEN / EN COURS)
- **Contact** — email, réseaux, horloge de Paris en direct

Bilingue **FR/EN** (détection navigateur + bascule manuelle), smooth scroll (Lenis), animations GSAP ScrollTrigger, curseur custom, grain cinématique.

## Stack

React 19 · TypeScript · Vite 7 · Tailwind CSS 3 · GSAP · Lenis · i18next

## Développement

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # typecheck + build de production
```

### QA visuelle (optionnel)

Avec le serveur dev lancé, capture des screenshots de toutes les sections (desktop + mobile) via le Chrome installé :

```bash
node scripts/shoot.mjs      # → .shots/
node scripts/interact.mjs   # lightbox, onglets, menu mobile
node scripts/og.mjs         # régénère public/og-image.jpg
```

## Déploiement

GitHub Pages via `.github/workflows/deploy.yml` — domaine custom `danhoudebine.com` (CNAME).
