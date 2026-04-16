# TODO — ChooseYourScore

## Règles générales
- **Zéro legacy** : chaque changement supprime définitivement tout le code dont dépendait l'ancien système (HTML, CSS, JS). Ne pas laisser de code mort, de blocs commentés ou de branches inaccessibles.
- Seul fichier : `index.html` (~3354 lignes à ce jour).

---

## TÂCHE 1 — Fusion des types de paires : Séquence universelle avec items typés

### Objectif
Supprimer les types `choice` et `arrow` du modèle de données et de l'éditeur.
Tout devient une **paire séquence** dont les items sont des objets typés
(texte · image · audio · flèche · couleur).
Chaque item s'édite via un **modal dédié** avec les mêmes onglets de type que
ceux déjà construits pour les items gauche/droite (choice pair).

---

### Nouveau modèle de données

```js
// Item unifié (remplace les strings dans pair.items[])
{
  type: 'text'|'image'|'audio'|'arrow'|'color',
  text: '', color: '#1a1a1a', fontSize: 32,
  fontFamily: 'Arial', textTransform: 'none',
  imageUrl: null, audioUrl: null,
  arrowDirection: 'left',   // type arrow seulement
  bgColor: '#3b82f6',       // types arrow + color
}

// Paire (type toujours 'sequence' désormais)
{
  id: '…', type: 'sequence',
  items: [ itemObj, … ],
  displayDuration: 1000,   // 0 = question immédiate (ex-choice)
  questions: [ questionObj, … ]
}

// Question — types existants + nouveau 'direction'
{
  questionText: '',
  type: 'choice'|'write'|'direction',
  // choice :
  choices: [], correctIndices: [],
  // write :
  writeAnswers: [],
  // direction (ex-arrow pair) :
  rule: 'same'|'inverse',
  numOptions: 2|3|4,
  // commun :
  showOnRetry: true,
  allowRetry: true,       // NOUVEAU — false = pas de 2e essai
  itemOverrides: [{ index, value }]
}
```

---

### Migration automatique (fonction à ajouter au démarrage)

Ajouter `migrateAllPairs()` juste après `migratePatients()` (~ligne 1226).
L'appeler immédiatement après dans le bloc d'init.

```js
function migrateAllPairs() {
  let changed = false;
  exercises.forEach(ex => {
    ex.pairs = (ex.pairs || []).map(pair => {
      // String items → objets texte
      if (pair.type === 'sequence' || !pair.type) {
        const migrated = (pair.items || []).map(i =>
          typeof i === 'string' ? { type: 'text', text: i } : i);
        if (JSON.stringify(migrated) !== JSON.stringify(pair.items)) {
          changed = true; pair = { ...pair, items: migrated };
        }
        return pair;
      }
      // choice → sequence
      if (pair.type === 'choice') {
        changed = true;
        const l = pair.left  || {}; const r = pair.right || {};
        return {
          id: pair.id, type: 'sequence',
          items: [
            { type: l.imageUrl?'image': l.audioUrl?'audio':'text', ...l },
            { type: r.imageUrl?'image': r.audioUrl?'audio':'text', ...r }
          ],
          displayDuration: 0,
          questions: [{
            questionText: '',
            type: 'choice',
            choices: [l.text || 'Item 1', r.text || 'Item 2'],
            correctIndices: [pair.correct === 'left' ? 0 : 1],
            showOnRetry: true, allowRetry: true, itemOverrides: []
          }]
        };
      }
      // arrow → sequence
      if (pair.type === 'arrow') {
        changed = true;
        const bgHex = pair.bgColor === 'blue' ? '#3b82f6'
                    : pair.bgColor === 'yellow' ? '#fbbf24'
                    : (pair.bgColor || '#3b82f6');
        const rule = pair.rule || (pair.bgColor === 'yellow' ? 'inverse' : 'same');
        return {
          id: pair.id, type: 'sequence',
          items: [{ type: 'arrow', arrowDirection: pair.direction || 'left', bgColor: bgHex }],
          displayDuration: 1500,
          questions: [{
            questionText: '',
            type: 'direction',
            rule,
            numOptions: pair.numOptions || 4,
            showOnRetry: false, allowRetry: true, itemOverrides: []
          }]
        };
      }
      return pair;
    });
  });
  if (changed) saveExercises();
}
```

---

### CE QU'IL FAUT SUPPRIMER (zero legacy)

#### HTML à supprimer
| Bloc | Lignes approx. | Description |
|------|---------------|-------------|
| `<select id="pair-type">` + son `<div class="field-row">` | ~940–948 | Dropdown type de paire |
| `<div id="arrow-config">` | ~950–988 | Config paire flèche |
| `<div id="choice-config">` | ~1016–1215 | Config paire choix (left/right panels, correct selector, preview boxes) |
| `<div id="pair-container">` | ~729–732 | Conteneur exercice gauche/droite |
| `<div id="arrow-container">` | ~733–760 | Conteneur exercice flèche |

#### CSS à supprimer
- `.pair-container` (lignes ~122, ~402, ~599)
- `.arrow-container`, `.arrow-card`, `.arrow-card.bg-blue/yellow` (~512–535)
- `.arrow-keys`, `.arrow-keys-row`, `.arrow-key-btn` et variantes (~520–533)
- `.modal-preview`, `.preview-box`, `.preview-box.correct-side` (~278–289)
- `.items-edit-grid` (~290–293, ~645)
- `.item-edit-panel h4` (~294)
- `.correct-selector`, `.cs-label`, `.radio-option` (~311–323, ~646)
- `body.is-fullscreen .arrow-container/card` (~534–535)
- Mobile overrides pour `.arrow-card`, `.arrow-key-btn` (~602–603)

#### Fonctions JS à supprimer
| Fonction | Ligne approx. | Remplacée par |
|----------|--------------|---------------|
| `handleClick(side)` | ~1677 | renderPair() → startSequenceDisplay() |
| `handleArrowResponse(dir)` | ~1690 | nouveau `handleDirectionResponse()` |
| `playPairAudios(pair)` | ~1664 | lecture audio dans startSequenceDisplay (items typés) |
| `getArrowCorrect(pair)` | ~1240 | logique dans handleDirectionResponse |
| `getActiveDirections(pair)` | ~1245 | logique dans showDirectionButtons |
| `fillModalSide(s, item)` | ~2229 | `fillItemModal(item)` (modal sim-) |
| `readModalSide(s)` | ~2294 | `readItemModal()` |
| `setItemSect(s, type)` | ~2285 | `setSimSect(type)` |
| `applyPreviewBox(el, item, isCorrect)` | ~2334 | `applyItemStyle` suffit |
| `refreshModalPreview()` | ~2327 | `refreshSimPreview()` |
| `updateImageThumb(s)` | ~2259 | `updateSimImageThumb()` |
| `updateAudioUI(s)` | ~2271 | `updateSimAudioUI()` |
| `refreshArrowPreview()` | ~2169 | n/a (supprimée avec arrow-config) |

#### Variables JS à supprimer
- `modalImages`, `modalAudios` (objets left/right) → remplacés par `simModalImage`, `simModalAudio`
- Listeners sur `left-text`, `left-color`, `left-size`… `correct-left/right`

#### Branches dans `renderPair()` à supprimer (~1427)
- Branche `pair.type === 'arrow'` (~1435–1453) → remplacée par startSequenceDisplay
- Branche `else` (choice) (~1461–1471) → idem
- Conserver uniquement la branche `pair.type === 'sequence'` (et la généraliser)

---

### CE QU'IL FAUT CRÉER

#### A. Modal item séquentiel `#seq-item-modal`
Même structure qu'un panneau item (onglets Texte/Image/Audio/Flèche/Couleur)
mais avec IDs préfixés `sim-` (seq-item-modal).

IDs nécessaires :
- `sim-type-tabs` (onglets)
- `sim-sect-text` → `sim-text`, `sim-color`, `sim-size`, `sim-font`, `sim-transform`
- `sim-sect-image` → `sim-img-input`, `sim-img-btn`, `sim-img-thumb-row`, `sim-img-thumb`, `sim-img-remove`, `sim-img-text`, `sim-img-textcolor`
- `sim-sect-audio` → `sim-audio-input`, `sim-audio-btn`, `sim-audio-loaded`, `sim-audio-name`, `sim-audio-play`, `sim-audio-remove`, `sim-audio-label`
- `sim-sect-arrow` → `sim-arrow-dir`, `sim-arrow-bg`
- `sim-sect-color` → `sim-color-bg`, `sim-color-text`, `sim-color-textcolor`, `sim-color-size`
- `sim-preview-box` (aperçu live)
- `sim-cancel`, `sim-save`

Variables JS : `simModalImage` (string|null), `simModalAudio` (string|null), `editingItemIdx` (int).

Fonctions JS :
```js
function openSeqItemModal(idx)   // ouvre le modal, popule avec seqItems[idx]
function fillItemModal(item)      // comme fillModalSide mais pour sim-
function readItemModal()          // retourne l'objet item depuis les champs sim-
function updateSimImageThumb()
function updateSimAudioUI()
function setSimSect(type)         // show/hide sim-sect-*
function refreshSimPreview()      // applyItemStyle sur sim-preview-box
```

#### B. Refonte `seq-items-row` — cartes visuelles

Remplacer les `<input type="text">` par des cartes :
```js
// dans refreshSequenceItemInputs()
const card = document.createElement('div');
card.className = 'seq-item-card';
const preview = document.createElement('div');
preview.className = 'seq-item-preview';
applyItemStyle(preview, seqItems[i]); // rendu typé
const editBtn = document.createElement('button');
editBtn.className = 'seq-item-edit-btn';
editBtn.textContent = '✏';
editBtn.addEventListener('click', () => openSeqItemModal(i));
card.append(preview, editBtn);
```

CSS à ajouter :
```css
.seq-item-card {
  position:relative; min-width:72px; height:88px;
  border:2px solid #e2e8f0; border-radius:14px;
  background:white; display:flex; align-items:center;
  justify-content:center; overflow:hidden;
}
.seq-item-preview {
  width:100%; height:100%; display:flex; align-items:center;
  justify-content:center; font-size:1.8rem; border-radius:12px;
}
.seq-item-edit-btn {
  position:absolute; bottom:3px; right:3px; padding:2px 5px;
  font-size:0.68rem; border-radius:5px; border:1px solid #e2e8f0;
  background:rgba(255,255,255,.85); cursor:pointer;
}
```

Variable JS globale : `let seqItems = []` (tableau d'objets item en cours d'édition).

Fonctions à modifier :
- `refreshSequenceItemInputs()` → reconstruit les cartes depuis `seqItems`
- `getSequenceItemValues()` → retourne `seqItems` directement (plus de lecture d'inputs)
- `fillSequenceModal(pair)` → initialise `seqItems` depuis `pair.items` (coercion string→objet)
- `readSequenceModal()` → `items: seqItems`

#### C. Rendu exercice — items typés dans `startSequenceDisplay`

```js
(pair.items || []).forEach(item => {
  const el = document.createElement('div');
  const obj = typeof item === 'string' ? {type:'text', text:item} : item;
  el.className = isSingle ? 'sequence-text-display' : 'sequence-item-box';
  applyItemStyle(el, obj);
  displayEl.appendChild(el);
});
// Jouer les audios des items
(pair.items || []).filter(i => i?.audioUrl).forEach((item, idx) => {
  setTimeout(() => new Audio(item.audioUrl).play().catch(()=>{}), idx * 800);
});
```

Adapter `.sequence-item-box` CSS pour permettre background (images, couleurs, flèches) :
```css
.sequence-item-box {
  min-width:64px; height:80px; padding:0 16px;
  border:2.5px solid #e2e8f0; border-radius:16px;
  background:white; display:flex; align-items:center;
  justify-content:center; overflow:hidden;
  /* Supprimer font-family et font-size fixes — applyItemStyle les gère */
}
```

#### D. Nouveau type de question `'direction'` dans l'éditeur

Dans `buildSequenceQuestionBlock`, ajouter `<option value="direction">Direction (flèche)</option>`.

Section direction (à créer) :
```js
const dirSection = document.createElement('div');
dirSection.className = 'seq-q-dir-section';
// Règle : même sens / sens inverse
// Nbre d'options : 2/3/4
```

Dans `readSequenceModal()` :
```js
if (type === 'direction') {
  base.rule = block.querySelector('.seq-q-dir-rule').value;
  base.numOptions = parseInt(block.querySelector('.seq-q-dir-opts').value, 10);
}
```

#### E. Runtime — question type `'direction'`

Dans `startSequenceQuestion`, nouvelle branche :
```js
if (q.type === 'direction') {
  writeZone.style.display = 'none';
  choicesEl.style.display = 'none';
  showDirectionButtons(pair, q, questions, qIdx, isRetry);
  return;
}
```

Fonction `showDirectionButtons(pair, q, questions, qIdx, isRetry)` :
- Lit `pair.items` pour trouver l'item arrow (ou utilise le premier)
- `dir = arrowItem.arrowDirection`
- `correctDir = q.rule==='inverse' ? OPPOSITE[dir] : dir`
- `active = getActiveDirectionsFromNumOpts(dir, q.numOptions)`
- Crée 4 boutons directionnels dans `choicesEl`, masque les inactifs
- Au clic : compare à `correctDir`, appelle `handleDirectionResponse`

```js
function handleDirectionResponse(pressed, correctDir, pair, questions, qIdx, isRetry) {
  const q = questions[qIdx];
  const correct = pressed === correctDir;
  // Feedback visuel sur le bouton
  responses.push({ pairIndex, isRetry, correct, reactionTime: Date.now() - pairStartTime });
  if (correct) {
    advance(pair, questions, qIdx, isRetry);
  } else {
    if (!q.allowRetry) { advance(pair, questions, qIdx, false); return; }
    if (!isRetry) {
      setTimeout(() => startSequenceQuestion(pair, qIdx, true), 800);
    } else {
      advance(pair, questions, qIdx, isRetry);
    }
  }
}
```

#### F. Option `allowRetry` dans l'éditeur

Dans `buildSequenceQuestionBlock`, à côté de `showOnRetry` :
```js
const retryChk2 = document.createElement('input');
retryChk2.type = 'checkbox'; retryChk2.className = 'seq-q-allow-retry';
retryChk2.checked = q.allowRetry !== false; // défaut true
// Label : "2ᵉ essai"
```

Dans `handleSequenceResponse` et `handleSequenceWrite`, avant de lancer le retry :
```js
if (!q.allowRetry) {
  responses.push({ pairIndex, isRetry: false, correct: false, reactionTime });
  advance(pair, questions, qIdx, false);
  return;
}
```

#### G. Simplifier `renderPair()`

Supprimer les branches `arrow` et choice (`else`). Ne conserver que la branche `sequence` (renommée en branche par défaut). Toutes les paires passent par `startSequenceDisplay`.

```js
function renderPair() {
  const pair = currentPairs[pairIndex];
  // progress update...
  // TOUT passe par sequence désormais
  document.getElementById('sequence-container').style.display = 'flex';
  startSequenceDisplay(pair);
  pairStartTime = Date.now();
}
```

#### H. Simplifier `openPairModal(pairId)`

Supprimer les branches `arrow` et `choice`. Toujours charger `fillSequenceModal(pair)`.
Supprimer la lecture/écriture du dropdown `pair-type`.
Dans `btn-modal-save`, toujours lire `readSequenceModal()`.

---

### Ordre d'exécution (3 commits)

**Commit 1 — Migration + runtime**
1. Ajouter `migrateAllPairs()` + appel au démarrage
2. `startSequenceDisplay` : items typés + audio
3. `renderPair()` : supprimer branches choice/arrow, garder uniquement sequence
4. Supprimer `handleClick`, `handleArrowResponse`, `playPairAudios`, `getArrowCorrect`, `getActiveDirections`
5. Supprimer HTML `#pair-container`, `#arrow-container`
6. Supprimer CSS `.pair-container`, `.arrow-container`, `.arrow-card`, `.arrow-key-btn`, etc.
7. Ajouter `handleDirectionResponse()` + `showDirectionButtons()`
8. Dans `startSequenceQuestion` : ajouter branche `direction`
9. Dans `handleSequenceResponse`/`handleSequenceWrite` : ajouter `allowRetry` check

**Commit 2 — Modal item `#seq-item-modal` + refonte `seq-items-row`**
1. HTML `#seq-item-modal` (après `#pair-modal`)
2. CSS `.seq-item-card`, `.seq-item-preview`, `.seq-item-edit-btn`
3. Variables `seqItems`, `simModalImage`, `simModalAudio`, `editingItemIdx`
4. Fonctions : `openSeqItemModal`, `fillItemModal`, `readItemModal`, `setSimSect`, `refreshSimPreview`, `updateSimImageThumb`, `updateSimAudioUI`
5. Refonte `refreshSequenceItemInputs()` → cartes visuelles
6. `getSequenceItemValues()` → retourne `seqItems`
7. `fillSequenceModal` → init `seqItems`
8. `readSequenceModal` → `items: seqItems`
9. Supprimer `fillModalSide`, `readModalSide`, `setItemSect`, `applyPreviewBox`, `refreshModalPreview`, `updateImageThumb`, `updateAudioUI`, `modalImages`, `modalAudios`

**Commit 3 — Éditeur unifié (supprimer choice/arrow editor)**
1. Supprimer HTML `#pair-type` dropdown, `#arrow-config`, `#choice-config` (y compris les panels left/right, correct-selector, preview-boxes)
2. Supprimer CSS associé (`.modal-preview`, `.preview-box`, `.items-edit-grid`, `.item-edit-panel h4`, `.correct-selector`, `.cs-label`, `.radio-option`)
3. Supprimer `refreshArrowPreview()` et tous ses listeners
4. `openPairModal` : supprimer branches arrow/choice, toujours sequence
5. `btn-modal-save` : supprimer branches arrow/choice, toujours `readSequenceModal()`
6. `btn-modal-cancel` : simplifier check vide (toujours sequence)
7. `buildSequenceQuestionBlock` : ajouter type `'direction'` + section rule/numOptions + checkbox `allowRetry`
8. `readSequenceModal` : lire direction + allowRetry
9. `renderPairsList` : supprimer branches arrow/choice preview (tout via sequence)

---

## TÂCHE 2 — Règle générale : zéro code legacy

À chaque développement, lors de tout remplacement d'un système :
- Supprimer **tout** le HTML, CSS, JS dont dépendait l'ancienne implémentation
- Ne pas laisser de blocs commentés, de variables non utilisées, de fonctions orphelines
- Une fonction remplacée par une autre → supprimer l'ancienne dans le même commit
- Les migrations de données (localStorage) sont les seuls "ponts" tolérés, et uniquement dans des fonctions dédiées clairement nommées `migrateXxx()`
