# Récompenses : robots et super-légumes

Résumé de ce qui a été décidé. Le code fait foi en cas de doute.

## En bref

- Chaque patient a un **compagnon** qui évolue quand il termine des exercices.
- **Deux univers au choix** : **Robots** ou **Légumes super-héros**. La progression est la même, seul l'habillage change.
- **Désactivé par défaut** : la thérapeute l'active patient par patient dans la fiche patient (« Compagnon et récompenses »).
- Le choix de l'univers se fait dans la fiche patient ou dans la fenêtre du compagnon. Changer d'univers garde l'XP et les niveaux, et chaque univers garde sa propre apparence (badges et accessoires sont propres à chaque modèle).

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

## Badges, accessoires et collection par modèle

Les noms des badges sont **épicènes** (le même mot pour une fille et un garçon, sans point médian, plus lisible pour un enfant). L'objectif de chaque badge se règle dans la fiche patient, et un badge gagné reste acquis.

**Chaque modèle (Orbe, Cube, Lame, Char, légumes…) a sa propre collection de badges.** Un exercice terminé compte pour le modèle actif à ce moment-là (champ `robot` de la session) : ses compteurs (exercices terminés, records, 3 étoiles, sans faute) alimentent les badges de ce modèle uniquement. Quand un modèle a tous ses badges (8), il est **complet** (★ dans le sélecteur de modèle, annonce en fin d'exercice) et le patient peut en adopter un autre pour les collectionner tous. L'**XP, les niveaux et les records restent communs** à tous les modèles. Accessoires équipés (`r.acc[modèle]`) et badges acquis (`r.unlocked[modèle]`) sont rangés par modèle. Avant cette règle ils étaient à plat : ils vont au modèle actif, les autres repartent de zéro ; les exercices anciens (sans `robot`) comptent pour `legacyRobot`.

Un modèle peut avoir sa propre liste d'accessoires (`RW_THEMES.robot.speciesAccs[modèle]`, lue par `rwAccsOf`), sinon il prend celle de l'univers. Seul l'**Orbe** a la sienne pour l'instant (voir `docs/ROBOTS-ACCESSOIRES.md`).

| Badge (objectif par défaut) | Robot (Cube, Lame, Char) | Orbe | Légume |
|---|---|---|---|
| Premier pas (1 exercice) | Casquette | Antenne scintillante | Bandeau de héros |
| Fidèle (5) | Casque audio | Lunettes bandeau | Dents de lapin |
| Infatigable (25) | Jetpack | Étoile filante | Fourchette géante |
| Inarrêtable (50) | Drone compagnon | Réacteur embrasé | Petits pois copains |
| Nouveau record (1) | Lunettes | Sceptre de Saturne | Lunettes de soleil |
| Attrape-étoiles (5 exercices à 3 étoiles) | Cape | Drone compagnon | Bouclier casserole |
| Sans faute (1 exercice parfait) | Bouclier d'énergie | Bulle de protection | Éclairs de pouvoir |
| Machine à records (3) | — | Ailes d'énergie (niveau 5) | — |

## Où est le code

| Fichier | Rôle |
|---|---|
| `js/rewards.js` | XP, niveaux, badges, données des univers (`RW_THEMES`) |
| `js/rewards-ui.js` | fenêtre du compagnon, carte de l'écran d'accueil, bilan de fin d'exercice, fiche patient |
| `js/rewards-robot.js` | dessin des robots |
| `js/rewards-robot-orb.js` | accessoires de l'Orbe (un fichier par robot) |
| `js/rewards-veggie.js` | dessin des légumes |
| `css/rewards.css` | habillage : néon pour les robots, `.rw-t-veggie` pour le potager |

**Ajouter un univers** : ajouter une entrée dans `RW_THEMES` (vocabulaire, modèles, couleurs, accessoires, fonctions de dessin), un fichier de dessin et un bloc CSS `.rw-t-<univers>`. L'option `genders: true` ajoute un choix fille / garçon qui accorde le vocabulaire.

**Historique** : deux univers ont été essayés puis retirés, « Créatures magiques » (jugé peu parlant) puis « Sorciers ». Un patient resté sur un univers retiré revient automatiquement aux robots.

**Accessoires par robot** : voir `docs/ROBOTS-ACCESSOIRES.md`.
