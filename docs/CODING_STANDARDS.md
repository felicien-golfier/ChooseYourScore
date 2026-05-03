# Standards de code — HTML, CSS & JS

> Documentation de référence pour organiser, structurer et écrire du code lisible sur ce projet.  
> À appliquer lors du prochain refactoring de `index.html`.

---

## Sommaire

1. [Structure de fichiers recommandée](#1-structure-de-fichiers-recommandée)
2. [HTML — bonnes pratiques](#2-html--bonnes-pratiques)
3. [CSS — bonnes pratiques](#3-css--bonnes-pratiques)
4. [JavaScript — bonnes pratiques](#4-javascript--bonnes-pratiques)
5. [Découpage en fichiers multiples](#5-découpage-en-fichiers-multiples)
6. [Conventions de nommage](#6-conventions-de-nommage)
7. [Ordre et organisation dans chaque fichier](#7-ordre-et-organisation-dans-chaque-fichier)
8. [Checklist avant de committer](#8-checklist-avant-de-committer)

---

## 1. Structure de fichiers recommandée

Pour ChooseYourScore, le découpage cible est le suivant :

```
ChooseYourScore/
├── index.html              ← squelette HTML uniquement (pas de <style> ni <script> inline)
├── chart.umd.min.js        ← librairie tierce (ne pas modifier)
│
├── css/
│   ├── reset.css           ← reset global (*, box-sizing, margin, padding)
│   ├── variables.css       ← custom properties CSS (couleurs, espacements, rayons…)
│   ├── base.css            ← typographie, body, titres, liens
│   ├── layout.css          ← topbar, views, grilles globales
│   ├── components.css      ← boutons, champs, cartes, badges réutilisables
│   ├── editor.css          ← styles spécifiques à la vue éditeur
│   ├── session.css         ← styles spécifiques à la vue session
│   └── results.css         ← styles spécifiques à la vue résultats
│
├── js/
│   ├── data.js             ← lecture/écriture localStorage, modèles de données
│   ├── utils.js            ← fonctions pures partagées (formatDuration, escapeHtml…)
│   ├── ui.js               ← helpers DOM partagés (makeReorderBtns, syncReorderBtns…)
│   ├── editor.js           ← logique de la vue éditeur
│   ├── session.js          ← logique de la vue session / exercice
│   └── results.js          ← logique de la vue résultats
│
└── docs/
    └── CODING_STANDARDS.md ← ce fichier
```

**Règle :** chaque fichier a une responsabilité unique. Si un fichier dépasse ~300 lignes, c'est un signal qu'il fait trop de choses.

---

## 2. HTML — bonnes pratiques

### 2.1 Squelette de base

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ChooseYourScore</title>

  <!-- CSS externe — dans cet ordre -->
  <link rel="stylesheet" href="css/reset.css">
  <link rel="stylesheet" href="css/variables.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/editor.css">
  <link rel="stylesheet" href="css/session.css">
  <link rel="stylesheet" href="css/results.css">
</head>
<body>

  <!-- contenu -->

  <!-- JS externe — toujours en bas du body, après le contenu -->
  <script src="chart.umd.min.js"></script>
  <script src="js/data.js"></script>
  <script src="js/utils.js"></script>
  <script src="js/ui.js"></script>
  <script src="js/editor.js"></script>
  <script src="js/session.js"></script>
  <script src="js/results.js"></script>
</body>
</html>
```

### 2.2 Indentation

- **2 espaces** (pas de tabulations, pas de 4 espaces).
- Chaque niveau d'imbrication = +2 espaces.

```html
<!-- Bien -->
<div class="screen">
  <h2>Titre</h2>
  <div class="form-group">
    <label for="name">Nom</label>
    <input id="name" type="text">
  </div>
</div>

<!-- Mal : tout sur une ligne -->
<div class="screen"><h2>Titre</h2><div class="form-group"><label for="name">Nom</label><input id="name" type="text"></div></div>
```

### 2.3 Sémantique

Utiliser les balises qui décrivent ce qu'elles contiennent, pas juste des `<div>`.

| Élément | Usage |
|---|---|
| `<header>` | En-tête de page ou de section |
| `<nav>` | Barre de navigation (topbar) |
| `<main>` | Contenu principal unique de la page |
| `<section>` | Groupe de contenu avec un titre |
| `<article>` | Contenu autonome (une carte de résultat…) |
| `<footer>` | Pied de page |
| `<button>` | Toujours pour les actions, jamais `<div onclick>` |
| `<label>` | Toujours associé à un champ via `for` + `id` |

### 2.4 Attributs

Ordre recommandé des attributs sur un élément :

```
id → class → type → name → href/src → value → data-* → aria-* → disabled/checked/…
```

```html
<input id="patient-name" class="form-input" type="text" name="patient" placeholder="Nom du patient">
```

### 2.5 Commentaires HTML

Délimiter les grandes sections avec des commentaires courts :

```html
<!-- ── Topbar ── -->
<nav id="topbar">…</nav>

<!-- ── Views ── -->
<main id="views">
  <!-- Vue : Éditeur -->
  <section id="view-editor" class="view">…</section>

  <!-- Vue : Session -->
  <section id="view-session" class="view">…</section>
</main>
```

Ne pas commenter ce qui est évident — commenter uniquement ce qui serait surprenant à la lecture.

### 2.6 Accessibilité minimale

- Chaque `<img>` a un `alt`.
- Les boutons icône-seulement ont un `aria-label`.
- Les champs de formulaire ont toujours un `<label>` associé.
- Ne jamais supprimer `outline` sans le remplacer par un style focus visible.

---

## 3. CSS — bonnes pratiques

### 3.1 Variables CSS (custom properties)

Toutes les valeurs répétées (couleurs, espacements, rayons) sont des variables dans `variables.css` :

```css
/* css/variables.css */
:root {
  /* Couleurs */
  --color-bg:        #f0f4f8;
  --color-surface:   #ffffff;
  --color-border:    #e2e8f0;
  --color-text:      #0f172a;
  --color-muted:     #64748b;
  --color-primary:   #1d4ed8;
  --color-primary-bg:#eff6ff;
  --color-danger:    #dc2626;
  --color-success:   #16a34a;

  /* Espacements */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  40px;
  --space-2xl: 48px;

  /* Rayons */
  --radius-sm: 7px;
  --radius-md: 10px;
  --radius-lg: 20px;

  /* Ombres */
  --shadow-card: 0 2px 20px rgba(0,0,0,0.09);

  /* Transitions */
  --transition-fast: 0.1s;
  --transition-base: 0.15s;
}
```

Utilisation dans les autres fichiers :

```css
.screen {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  box-shadow: var(--shadow-card);
}
```

**Règle :** si une valeur brute (`#1d4ed8`, `20px`…) apparaît plus d'une fois, elle devient une variable.

### 3.2 Reset

Un seul reset dans `reset.css`, jamais dispersé :

```css
/* css/reset.css */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```

### 3.3 Organisation dans un fichier CSS

Structure interne d'un fichier CSS :

```css
/* ── Nom de la section ──────────────────────────────────────────────── */

.composant { … }
.composant__element { … }
.composant--modificateur { … }

.composant:hover { … }
.composant:focus { … }
.composant.is-active { … }

/* ── Autre section ──────────────────────────────────────────────────── */
```

- Un blanc entre chaque règle.
- Les états (`:hover`, `:focus`, `.is-active`) juste en dessous de la règle de base.
- Les media queries à la fin du fichier.

### 3.4 Une propriété par ligne

```css
/* Bien */
.nav-btn {
  padding: 7px 14px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-muted);
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition-fast);
}

/* Mal */
.nav-btn { padding:7px 14px; border:none; border-radius:7px; background:transparent; color:#475569; }
```

Exception acceptable : les resets ultra-courts en une ligne (`* { box-sizing: border-box; }`).

### 3.5 Pas de styles inline

```html
<!-- Mal -->
<td style="max-width:220px;min-width:100px;outline:none;color:#475569;">…</td>

<!-- Bien : une classe dans le CSS -->
<td class="notes-cell">…</td>
```

```css
.notes-cell {
  max-width: 220px;
  min-width: 100px;
  outline: none;
  color: var(--color-muted);
}
```

Exception : styles générés dynamiquement en JS qui dépendent de valeurs calculées au runtime.

### 3.6 Spécificité — rester bas

- Préférer les classes aux IDs pour le style.
- Éviter `!important` sauf pour les utilitaires.
- Éviter de chaîner plus de 2 sélecteurs : `.parent .child` oui, `.a .b .c .d` non.

### 3.7 Ordre des propriétés dans une règle

Groupe logique recommandé :

```
1. display, position (layout)
2. width, height, margin, padding (box)
3. border, border-radius, outline (bordures)
4. background, color, opacity (visuel)
5. font-*, text-* (typographie)
6. cursor, pointer-events (interaction)
7. transition, animation (mouvement)
```

---

## 4. JavaScript — bonnes pratiques

### 4.1 Une responsabilité par fichier

| Fichier | Contient |
|---|---|
| `data.js` | `loadExercises()`, `saveExercises()`, `loadSessions()`, `saveSessions()` |
| `utils.js` | `formatDuration()`, `escapeHtml()`, `avgReactionMs()`, `scoreClass()` |
| `ui.js` | `makeReorderBtns()`, `syncReorderBtns()`, `setReorderDisabled()` |
| `editor.js` | Tout ce qui concerne la vue éditeur |
| `session.js` | Tout ce qui concerne la session d'exercice |
| `results.js` | Tout ce qui concerne la vue résultats |

### 4.2 Fonctions nommées, pas de blocs anonymes géants

```js
// Mal — un addEventListener avec 50 lignes de logique inline
document.getElementById('btn-start').addEventListener('click', () => {
  // ... 50 lignes ...
});

// Bien — la logique est nommée et testable
document.getElementById('btn-start').addEventListener('click', startSession);

function startSession() {
  // ... 50 lignes ...
}
```

### 4.3 Constantes en haut de fichier

```js
// En haut de data.js
const STORAGE_KEY_EXERCISES = 'cys_exercises';
const STORAGE_KEY_SESSIONS  = 'cys_sessions';
```

### 4.4 Pas de variable globale non intentionnelle

Chaque fichier déclare ses variables avec `const` / `let`. Les données partagées entre fichiers passent par `data.js` (lecture/écriture localStorage).

### 4.5 innerHTML avec données utilisateur — toujours `escapeHtml`

```js
// Mal — XSS possible
td.innerHTML = session.patientName;

// Bien
td.innerHTML = escapeHtml(session.patientName);
```

### 4.6 Commentaires de section en JS

Mêmes séparateurs visuels qu'en CSS pour délimiter les sections d'un fichier :

```js
// ── Initialisation ──────────────────────────────────────────────────────────

function init() { … }

// ── Rendu ────────────────────────────────────────────────────────────────────

function render() { … }
```

---

## 5. Découpage en fichiers multiples

### 5.1 Pourquoi découper

| Problème dans un fichier unique | Solution |
|---|---|
| Difficile de retrouver une règle CSS | Un fichier par couche/composant |
| Un bug JS impacte tout | Un fichier par fonctionnalité |
| Impossible de travailler à plusieurs | Chaque personne modifie son fichier |
| Le fichier fait 3000+ lignes | Seuil de découpage : ~300 lignes |

### 5.2 Comment lier les fichiers CSS

Dans `<head>`, les `<link>` dans l'ordre de dépendance :

```html
<link rel="stylesheet" href="css/reset.css">       <!-- 1. reset -->
<link rel="stylesheet" href="css/variables.css">   <!-- 2. variables -->
<link rel="stylesheet" href="css/base.css">        <!-- 3. base (utilise les variables) -->
<link rel="stylesheet" href="css/layout.css">      <!-- 4. layout -->
<link rel="stylesheet" href="css/components.css">  <!-- 5. composants partagés -->
<link rel="stylesheet" href="css/editor.css">      <!-- 6. vues spécifiques -->
<link rel="stylesheet" href="css/session.css">
<link rel="stylesheet" href="css/results.css">
```

### 5.3 Comment lier les fichiers JS

En bas du `<body>`, dans l'ordre de dépendance :

```html
<!-- 1. Librairies tierces -->
<script src="chart.umd.min.js"></script>

<!-- 2. Couche données — pas de dépendance vers les autres -->
<script src="js/data.js"></script>

<!-- 3. Utilitaires — peut utiliser data.js -->
<script src="js/utils.js"></script>

<!-- 4. UI helpers — peut utiliser utils.js -->
<script src="js/ui.js"></script>

<!-- 5. Modules de vues — peuvent utiliser tout ce qui précède -->
<script src="js/editor.js"></script>
<script src="js/session.js"></script>
<script src="js/results.js"></script>
```

**Règle :** un fichier ne peut appeler que des fonctions définies dans les fichiers chargés avant lui.

### 5.4 Partager des fonctions entre fichiers (sans module bundler)

Sans outil de build, la façon simple est de déclarer les fonctions dans le scope global du fichier qui les définit. Les fichiers chargés après peuvent les appeler directement.

```js
// js/utils.js
function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatDuration(ms) { … }
```

```js
// js/results.js  ← chargé après utils.js
td.innerHTML = escapeHtml(session.patientName); // fonctionne
```

### 5.5 Seuil de découpage

| Lignes | Action |
|---|---|
| < 150 | OK dans le fichier parent |
| 150 – 300 | Envisager un fichier dédié |
| > 300 | Découper obligatoirement |

---

## 6. Conventions de nommage

### 6.1 CSS — classes

Format : **kebab-case** (`mon-composant`, `btn-delete`, `form-group`).

Structure suggérée (inspirée BEM simplifiée) :

```
.composant            ← bloc principal
.composant-element    ← partie du bloc
.composant--variant   ← variante du bloc
.is-state             ← état dynamique (ajouté/retiré par JS)
```

Exemples concrets du projet :

```
.nav-btn              ← bouton de navigation
.nav-btn.active       ← état actif (class JS)
.form-group           ← groupe label + input
.pair-action-btn      ← bouton d'action dans une paire
.score-good           ← variante score vert
.score-bad            ← variante score rouge
```

### 6.2 IDs HTML

IDs en **kebab-case**, préfixés par `view-` pour les vues et `btn-` pour les boutons principaux :

```
#view-editor
#view-session
#view-results
#btn-start-session
#btn-back-setup
```

### 6.3 JavaScript — variables et fonctions

- Variables et fonctions : **camelCase** (`patientName`, `makeReorderBtns`)
- Constantes : **UPPER_SNAKE_CASE** (`STORAGE_KEY_EXERCISES`)
- Classes JS (si utilisées) : **PascalCase**

### 6.4 Fichiers

Tous les fichiers en **kebab-case** : `coding-standards.md`, `session.js`, `results.css`.

---

## 7. Ordre et organisation dans chaque fichier

### 7.1 Fichier HTML complet

```
1. DOCTYPE + <html>
2. <head>
   a. meta charset
   b. meta viewport
   c. <title>
   d. <link> CSS (reset → variables → base → layout → composants → vues)
3. <body>
   a. <nav> topbar
   b. <main> avec toutes les vues
   c. <script> JS (libs tierces → data → utils → ui → vues)
```

### 7.2 Fichier CSS

```
1. Commentaire de section
2. Règle de base du composant
3. Éléments enfants
4. États (:hover, :focus, .is-active, .disabled)
5. Modificateurs (--variant)
6. (En bas du fichier) Media queries
```

### 7.3 Fichier JS (module de vue)

```
1. Constantes locales
2. Variables d'état locales
3. Fonctions de rendu (render*)
4. Handlers d'événements (on* ou handle*)
5. Fonctions d'initialisation (init*)
6. Appel init au bas du fichier
```

---

## 8. Checklist avant de committer

- [ ] Pas de style inline (attribut `style=`) sauf valeurs dynamiques JS
- [ ] Pas de logique dans le HTML (pas de `onclick=` inline)
- [ ] Toutes les couleurs/espacements récurrents utilisent des variables CSS
- [ ] Indentation 2 espaces homogène
- [ ] Aucune valeur magique sans variable ou commentaire explicatif
- [ ] Les données utilisateur affichées via `innerHTML` passent par `escapeHtml`
- [ ] Chaque liste réordonnable utilise `makeReorderBtns` / `syncReorderBtns`
- [ ] Aucun fichier ne dépasse 300 lignes
- [ ] Les fonctions partagées sont dans `utils.js` ou `ui.js`, pas dupliquées
- [ ] Les `<label>` ont un `for` correspondant à l'`id` du champ
