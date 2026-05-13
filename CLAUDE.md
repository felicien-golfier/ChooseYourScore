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

## Principes de code

### Uniformité : deux choses qui font la même chose utilisent le même code

Si une fonctionnalité apparaît à plusieurs endroits (ex : boutons ↑/↓ pour réordonner une liste), elle doit être implémentée une seule fois via un helper partagé, éventuellement paramétré par des variables pour s'adapter au contexte. Jamais de copie-colle de logique identique.

**Exemples concrets :**
- `makeReorderBtns(upHandler, downHandler)` — fabrique les boutons ↑/↓ avec le style `.pair-action-btn` pour toutes les listes (exercices, paires, questions, items, choix).
- `syncReorderBtns(wrappers)` — met à jour l'état disabled de ces boutons après tout changement d'ordre.
- `setReorderDisabled(btn, disabled)` — active/désactive un bouton de réordonnancement.

### Toute liste doit être réordonnable

Dès qu'un élément est affiché dans une liste ordonnée et que l'utilisateur pourrait vouloir en changer l'ordre, des boutons ↑/↓ doivent être présents, en utilisant `makeReorderBtns`.
