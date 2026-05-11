# Suivi du refactoring — ChooseYourScore

Objectif : passer du fichier monolithique `index.html` (3774 lignes, CSS + JS embarqués)
à une architecture multi-fichiers conforme à `docs/CODING_STANDARDS.md`.

Chaque étape est un commit indépendant. On peut s'arrêter n'importe quand et reprendre.

---

## État des étapes

| # | Étape | Statut |
|---|---|---|
| 0 | Créer `docs/CODING_STANDARDS.md` et `docs/REFACTORING.md` | ✅ fait |
| 1 | Extraire le CSS → `css/` (8 fichiers) | ✅ fait |
| 2 | Extraire le JS → `js/` (8 fichiers) | ✅ fait |
| 3 | Nettoyer les `style=` inline statiques dans le HTML | ✅ fait |
| 4 | Nettoyer les `onclick=` inline → event listeners | ✅ fait |
| 5 | Reformater le CSS (une propriété par ligne) | ⬜ à faire |
| 6 | Remplacer les valeurs brutes par les variables CSS | ⬜ à faire |

---

## Étape 1 — Extraction CSS

### Fichiers à créer

| Fichier | Lignes source (index.html actuel) | Sections CSS |
|---|---|---|
| `css/variables.css` | 12–45 | DESIGN TOKENS |
| `css/reset.css` | 46–59 | RESET |
| `css/layout.css` | 60–118 | TOPBAR, VIEWS |
| `css/base.css` | 119–206 | SCREEN CARDS, FORM ELEMENTS |
| `css/components.css` | 182–220 | BUTTONS, INSTRUCTION |
| `css/session.css` | 221–277, 623–665, 826–947 | EXERCISE, SESSION RESULT, FULLSCREEN, SESSION NOTES, SEQUENCE, DIR BUTTONS |
| `css/editor.css` | 278–622, 782–825, 911–957 | SIDEBAR, EDITOR MAIN, PAIRS, MODAL, FOLDERS, SEQ ITEMS, SEQ BUILDER |
| `css/results.css` | 666–781 | RESULTS PAGE |
| `css/responsive.css` | 958–1020 | MOBILE |

### Dans index.html
Remplacer le bloc `<style>…</style>` par :
```html
<link rel="stylesheet" href="css/variables.css">
<link rel="stylesheet" href="css/reset.css">
<link rel="stylesheet" href="css/layout.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/session.css">
<link rel="stylesheet" href="css/editor.css">
<link rel="stylesheet" href="css/results.css">
<link rel="stylesheet" href="css/responsive.css">
```

---

## Étape 2 — Extraction JS

### Fichiers à créer

| Fichier | Lignes source | Sections JS |
|---|---|---|
| `js/data.js` | 1428–1440 | STORAGE |
| `js/utils.js` | 1441–1563 + 3604–3618 | AUDIO UTILS, CONSTANTS & UTILS, helpers export/import |
| `js/nav.js` | 1564–1588 | NAVIGATION |
| `js/setup.js` | 1589–1666 | SETUP VIEW |
| `js/session.js` | 1667–2145 | EXERCISE – STATE & RUNTIME |
| `js/editor.js` | 2146–2859 + 3552–3603 | EDITOR (tout) + export/import exercices |
| `js/patients.js` | 3362–3549 | PATIENTS VIEW |
| `js/results.js` | 3619–3772 + listeners résultats | RESULTS VIEW + export/import résultats |

### Dans index.html
Remplacer `<script>…</script>` par (en bas du body, après le HTML) :
```html
<script src="js/data.js"></script>
<script src="js/utils.js"></script>
<script src="js/nav.js"></script>
<script src="js/setup.js"></script>
<script src="js/session.js"></script>
<script src="js/editor.js"></script>
<script src="js/patients.js"></script>
<script src="js/results.js"></script>
```

---

## Étape 3 — Inline styles statiques

Les attributs `style=` qui ne dépendent pas de valeurs calculées en JS
doivent devenir des classes CSS.

Exemples identifiés :
- `style="display:none"` → géré par JS, acceptable en HTML initial
- `style="flex:1"` sur des boutons inline → classe à créer
- `style="display:flex;gap:4px"` dans la sidebar → classe à créer

---

## Étape 4 — Inline onclick

Les `onclick="showView('...')"` dans le topbar doivent devenir des
`addEventListener` dans `js/nav.js`.

---

## Étapes 5 & 6 — Format CSS et variables

- Une propriété par ligne dans tous les fichiers CSS
- Toutes les couleurs/tailles brutes remplacées par `var(--...)`
  (les tokens sont déjà définis dans `css/variables.css`)
