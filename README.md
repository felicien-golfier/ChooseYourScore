# ChooseYourScore

Application web pour orthophonistes et neuropsychologues : exercices à faire passer à un patient, avec suivi des scores dans le temps.

**Application en ligne :** https://felicien-golfier.github.io/ChooseYourScore/

## Fonctionnalités
- Exercices de type séquence (choix, saisie, direction, clic sur l'item, ordre, dénomination, réponse orale) et Go/No-Go
- Éditeur d'exercices (dossiers, import/export JSON, bibliothèque partagée dans `library/`)
- Patients, résultats, graphiques (Chart.js), export PDF
- Pause/reprise d'un exercice, récompenses (robots / super-légumes)

## Technique
HTML/CSS/JavaScript pur, sans installation ni serveur : ouvrir `index.html` (ou `python3 -m http.server`).
Données stockées dans le navigateur (IndexedDB). Règles de développement : `CLAUDE.md`.
