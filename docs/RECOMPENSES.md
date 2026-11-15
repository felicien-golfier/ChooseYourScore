# Récompenses : robots et super-légumes

Résumé de ce qui a été décidé. Le code fait foi en cas de doute.

## En bref

- Chaque patient a un **compagnon** qui évolue quand il termine des exercices.
- **Deux univers au choix** : **Robots** ou **Légumes super-héros**. La progression est la même, seul l'habillage change.
- **Désactivé par défaut** : la thérapeute l'active patient par patient dans la fiche patient (« Compagnon et récompenses »).
- Le choix de l'univers se fait dans la fiche patient ou dans la fenêtre du compagnon.
- **Chaque modèle (Orbe, Cube, Carotte…) est un personnage indépendant** : son XP, son niveau, ses badges, ses accessoires, ses couleurs et son **nom personnalisé** lui sont propres. Un exercice ne fait progresser que le modèle actif à ce moment-là. Chaque univers mémorise seulement quel modèle est actif.

## XP (`js/rewards.js`, `RW_XP`)

Un « exercice terminé » est une session non partielle. Une session arrêtée avec ⏹ ne rapporte rien.

| Gain | XP |
|---|---|
| Exercice terminé la **1re fois** | 30 |
| Exercice **déjà terminé** avant (refait) | 15 |
| Par étoile (1 à 3) : ≥ 30 % → 1, ≥ 60 % → 2, ≥ 85 % → 3 | +10 |
| Record battu (meilleur % que tous les essais précédents du même exercice) | +25 |

- L'XP est **par modèle** : chaque exercice terminé rapporte son XP au modèle actif (champ `robot` de la session). « 1re fois » et « record » restent jugés sur l'historique du patient (ce sont ses performances, pas celles du personnage).
- **L'XP ne baisse jamais** : le maximum atteint par chaque modèle est gardé dans `xpPeak[modèle]`.
- Mode **« items échoués »** (on ne refait que les items ratés à la dernière session) : rapporte 15 + les étoiles, mais ne compte ni comme 1re fois, ni comme record, ni pour les badges 3 étoiles et sans faute.

## Niveaux

5 niveaux à 0 / 100 / 300 / 650 / 1100 XP. Le **rythme** choisi dans la fiche patient multiplie ces seuils : doux ×0,5, normal ×1, exigeant ×1,5.

| | Robots | Légumes |
|---|---|---|
| Noms des niveaux | Prototype, Recrue, Pilote, Élite, Légende | Graine, Pousse, Costaud, Super-légume, Légende |
| Modèles | Orbe, Cube, Lame, Char | Carotte, Radis, Patate, Brocoli |
| Couleurs | carrosserie, détails, yeux (certaines verrouillées jusqu’au niveau 2 à 5, voir `RW_THEMES.robot.colors`) | cape, masque ; chaque légume a sa propre liste (cape et lunettes / blason / peintures / foulard à débloquer, voir `RW_THEMES.veggie.speciesColors`) |
| Nom par défaut (un par modèle, modifiable dans la fenêtre du compagnon) | Orbe Zéphyr, Cube Boulon, Lame Shuriken, Char Bulldo | Carotte Capitaine Croc, Radis Barbe-Rose, Patate Sire Patate, Brocoli Brocoman |

## Badges, accessoires et collection par modèle

Les noms des badges sont **épicènes** (le même mot pour une fille et un garçon, sans point médian, plus lisible pour un enfant). L'objectif de chaque badge se règle dans la fiche patient, et un badge gagné reste acquis.

**Chaque modèle (Orbe, Cube, Lame, Char, légumes…) a sa propre collection de badges.** Un exercice terminé compte pour le modèle actif à ce moment-là (champ `robot` de la session) : ses compteurs (exercices terminés, records, 3 étoiles, sans faute) alimentent les badges de ce modèle uniquement. Quand un modèle a tous ses badges (8), il est **complet** (★ dans le sélecteur de modèle, annonce en fin d'exercice) et le patient peut en adopter un autre pour les collectionner tous. L'XP et le niveau sont aussi propres à chaque modèle. Accessoires équipés (`r.acc[modèle]`), badges acquis (`r.unlocked[modèle]`), couleurs (`r.colors[modèle]`), noms (`r.names[modèle]`, lus par `rwName`) et XP max (`r.xpPeak[modèle]`) sont rangés par modèle. Avant cette règle ils étaient à plat : ils vont au modèle actif, les autres repartent de zéro ; les exercices anciens (sans `robot`) comptent pour `legacyRobot`.

Un modèle peut avoir sa propre liste d'accessoires (`RW_THEMES.robot.speciesAccs[modèle]`, lue par `rwAccsOf`), sinon il prend celle de l'univers. Tous les robots (**Orbe**, **Cube**, **Lame**, **Char**) ont la leur (voir `docs/ROBOTS-ACCESSOIRES.md`). Côté légumes, les 4 modèles ont aussi la leur : la **Carotte** (Super-carotte : fanes scintillantes, moustache, fourchette géante, petits pois copains, lunettes de soleil, bouclier ovale, grand S, ceinturon) et la **Patate** (Super-patate, chevalier : casque casserole, plume, étendard, cheval-bâton, épée-frite, petit cochon, bouclier à blason, couronne du cochon) et le **Brocoli** (Super-brocoli, jungle : coccinelle, peintures, liane, tambour, mini tornade, oiseau lanceur d'éclairs, couronne de fleurs, arc-en-ciel) et le **Radis** (Super-radis, pirate : bandeau sur l'œil, foulard, carte au trésor, tricorne, sabre en bois, perroquet, longue-vue, perroquet qui crache du feu) ; voir `docs/LEGUMES-ACCESSOIRES.md`. La colonne « Légume » ci-dessous est la liste générique de repli de l'univers, plus utilisée par les 4 légumes.

Les objectifs par défaut d'Infatigable et Inarrêtable sont passés de 25 / 50 à 15 / 20. Migration unique dans `getReward` (drapeau `r.goalsV`) : un patient resté sur 25 / 50 passe à 15 / 20, un objectif personnalisé est conservé.

| Badge (objectif par défaut) | Robot (liste générique de repli, plus utilisée par les 4 modèles) | Orbe | Légume (liste générique de repli, plus utilisée par les 4 modèles) |
|---|---|---|---|
| Premier pas (1 exercice) | Casquette | Antenne scintillante | Bandeau de héros |
| Fidèle (5) | Casque audio | Lunettes bandeau | Dents de lapin |
| Infatigable (15) | Jetpack | Étoile filante | Fourchette géante |
| Inarrêtable (20) | Drone compagnon | Réacteur embrasé | Petits pois copains |
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
| `js/rewards-robot-orb.js`, `-bolt.js`, `-spike.js`, `-tank.js` | accessoires de l'Orbe, du Cube, de la Lame et du Char (un fichier par robot) |
| `js/rewards-veggie.js` | dessin des légumes |
| `js/rewards-veggie-carrot.js`, `-potato.js`, `-broccoli.js`, `-radish.js` | accessoires de la Carotte, de la Patate, du Brocoli et du Radis |
| `css/rewards.css` | habillage : néon pour les robots, `.rw-t-veggie` pour le potager |

**Ajouter un univers** : ajouter une entrée dans `RW_THEMES` (vocabulaire, modèles, couleurs, accessoires, fonctions de dessin), un fichier de dessin et un bloc CSS `.rw-t-<univers>`. L'option `genders: true` ajoute un choix fille / garçon qui accorde le vocabulaire.

**Migration vers les personnages indépendants** (`rwSplitLooks`, une seule fois) : avant, nom et couleurs étaient rangés par univers et l'XP max était commune. Le nom et les couleurs de chaque univers vont à son modèle actif (les autres prennent leur nom et leurs couleurs par défaut), les accessoires sont regroupés dans `r.acc`, et l'XP de chaque modèle est recalculée à partir de ses propres exercices. Si l'ancienne XP max dépassait l'XP des exercices (sessions supprimées), le surplus reste au modèle actif.

**Historique** : deux univers ont été essayés puis retirés, « Créatures magiques » (jugé peu parlant) puis « Sorciers ». Un patient resté sur un univers retiré revient automatiquement aux robots.

**Accessoires par robot** : voir `docs/ROBOTS-ACCESSOIRES.md`. **Par légume** : `docs/LEGUMES-ACCESSOIRES.md`.
