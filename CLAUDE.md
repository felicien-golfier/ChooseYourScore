# ChooseYourScore — règles de développement

## Workflow Git

### Toujours synchroniser main avant de commencer

Avant toute modification, fetch et rebase la branche de travail sur main :

```bash
git fetch origin main
git checkout claude/<feature-branch>
git rebase origin/main
```

Ne jamais commencer à coder sans avoir d'abord aligné la branche sur le dernier état de main. Cela évite les conflits au moment du merge.

### Toujours créer une PR et merger dans main quand la tâche est terminée

Une fois les modifications commitées et poussées sur la branche de travail, créer une pull request et la merger dans main :

```bash
# Créer la PR via les outils GitHub MCP disponibles
# Puis merger la PR dans main une fois créée
```

Ne jamais laisser une tâche terminée sans que le code soit mergé dans main.

## Tests end-to-end obligatoires

### Toujours vérifier visuellement dans un vrai navigateur avant de merger

Chaque fonctionnalité doit être testée dans Chromium via Playwright avant la PR. Ce test simule un vrai utilisateur qui clique dans l'application — c'est la seule façon de confirmer que la feature fonctionne réellement, pas seulement que le code est syntaxiquement correct.

**Procédure obligatoire :**

1. Lancer un serveur web local :
```bash
python3 -m http.server 8080 &
```

2. Installer Playwright si nécessaire :
```bash
pip install playwright
```

3. Écrire un script Python qui :
   - Ouvre `http://localhost:8080` dans Chromium headless
   - Navigue jusqu'à la fonctionnalité modifiée
   - Interagit avec elle (clics, saisies, attentes)
   - Prend des screenshots aux moments clés
   - Vérifie les états attendus (textes, classes CSS, visibilité des éléments)

4. Lancer le script et vérifier les résultats :
```bash
python3 /tmp/verify_feature.py
```

5. Envoyer les screenshots à l'utilisateur comme preuve visuelle.

**Chromium est disponible à `/opt/pw-browsers/chromium` — ne pas le réinstaller.**

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/opt/pw-browsers/chromium', headless=True)
    page = browser.new_page()
    page.goto('http://localhost:8080/')
    # ... interactions et assertions
    page.screenshot(path='/tmp/feature.png')
    browser.close()
```

Ne jamais considérer une tâche terminée sans avoir exécuté ce test et confirmé visuellement que la fonctionnalité marche de bout en bout.

## Principes de code

### Uniformité : deux choses qui font la même chose utilisent le même code

Si une fonctionnalité apparaît à plusieurs endroits (ex : boutons ↑/↓ pour réordonner une liste), elle doit être implémentée une seule fois via un helper partagé, éventuellement paramétré par des variables pour s'adapter au contexte. Jamais de copie-colle de logique identique.

**Exemples concrets :**
- `makeReorderBtns(upHandler, downHandler)` — fabrique les boutons ↑/↓ avec le style `.pair-action-btn` pour toutes les listes (exercices, paires, questions, items, choix).
- `syncReorderBtns(wrappers)` — met à jour l'état disabled de ces boutons après tout changement d'ordre.
- `setReorderDisabled(btn, disabled)` — active/désactive un bouton de réordonnancement.

### Toute liste doit être réordonnable

Dès qu'un élément est affiché dans une liste ordonnée et que l'utilisateur pourrait vouloir en changer l'ordre, des boutons ↑/↓ doivent être présents, en utilisant `makeReorderBtns`.
