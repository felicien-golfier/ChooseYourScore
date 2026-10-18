# Récompenses : robots et super-légumes

Résumé de ce qui a été décidé. Le code fait foi en cas de doute.

## En bref

- Chaque patient a un **compagnon** qui évolue quand il termine des exercices.
- **Deux univers au choix** : **Robots** ou **Légumes super-héros**. La progression est la même, seul l'habillage change.
- **Désactivé par défaut** : la thérapeute l'active patient par patient dans la fiche patient (« Compagnon et récompenses »).
- Le choix de l'univers se fait dans la fiche patient ou dans la fenêtre du compagnon. Changer d'univers garde l'XP, les niveaux et les badges, et chaque univers garde sa propre apparence.

## XP (`js/rewards.js`, `RW_XP`)

Un « exercice terminé » est une session non partielle. Une session arrêtée avec ⏹ ne rapporte rien.

| Gain | XP |
|---|---|
| Exercice terminé la **1re fois** | 30 |
| Exercice **déjà terminé** avant (refait) | 15 |
| Par étoile (1 à 3) : ≥ 30 % → 1, ≥ 60 % → 2, ≥ 85 % → 3 | +10 |
| Record battu (meilleur % que tous les essais précédents du même exercice) | +25 |

- **L'XP ne baisse jamais** : le maximum atteint est gardé dans `xpPeak`.
- Mode **« items échoués »** (on ne refait que les items ratés à la dernière session) : rapporte 15 + les étoiles, mais ne compte ni comme 1re fois, ni comme record, ni pour les badges 3 étoiles et sans faute.

## Niveaux

5 niveaux à 0 / 100 / 300 / 650 / 1100 XP. Le **rythme** choisi dans la fiche patient multiplie ces seuils : doux ×0,5, normal ×1, exigeant ×1,5.

| | Robots | Légumes |
|---|---|---|
| Noms des niveaux | Prototype, Recrue, Pilote, Élite, Légende | Graine, Pousse, Costaud, Super-légume, Légende |
| Modèles | Orbe, Cube, Lame, Char | Carotte, Radis, Patate, Brocoli |
| Couleurs | carrosserie, détails, yeux (certaines verrouillées jusqu’au niveau 2 à 5, voir `RW_THEMES.robot.colors`) | cape, masque |
| Nom par défaut | Zéphyr | Capitaine Croc |

## Badges et accessoires

Les noms des badges sont **épicènes** (le même mot pour une fille et un garçon, sans point médian, plus lisible pour un enfant). Chaque badge débloque un accessoire, différent selon l'univers. L'objectif de chaque badge se règle dans la fiche patient, et un badge gagné reste acquis.

| Badge (objectif par défaut) | Robot | Légume |
|---|---|---|
| Premier pas (1 exercice) | Écharpe | Bandeau de héros |
| Fidèle (5) | Casque audio | Dents de lapin |
| Infatigable (25) | Jetpack | Fourchette géante |
| Inarrêtable (50) | Drone compagnon | Petits pois copains |
| Nouveau record (1) | Lunettes | Lunettes de soleil |
| Attrape-étoiles (5 exercices à 3 étoiles) | Cape | Bouclier casserole |
| Sans faute (1 exercice parfait) | Bouclier d'énergie | Éclairs de pouvoir |
| Machine à records (3) | — | — |

## Où est le code

| Fichier | Rôle |
|---|---|
| `js/rewards.js` | XP, niveaux, badges, données des univers (`RW_THEMES`) |
| `js/rewards-ui.js` | fenêtre du compagnon, carte de l'écran d'accueil, bilan de fin d'exercice, fiche patient |
| `js/rewards-robot.js` | dessin des robots |
| `js/rewards-veggie.js` | dessin des légumes |
| `css/rewards.css` | habillage : néon pour les robots, `.rw-t-veggie` pour le potager |

**Ajouter un univers** : ajouter une entrée dans `RW_THEMES` (vocabulaire, modèles, couleurs, accessoires, fonctions de dessin), un fichier de dessin et un bloc CSS `.rw-t-<univers>`. L'option `genders: true` ajoute un choix fille / garçon qui accorde le vocabulaire.

**Historique** : deux univers ont été essayés puis retirés, « Créatures magiques » (jugé peu parlant) puis « Sorciers ». Un patient resté sur un univers retiré revient automatiquement aux robots.
