# Accessoires par robot : récapitulatif (Orbe fait, 3 robots à faire)

Complète `docs/RECOMPENSES.md`. Écrit pour reprendre le chantier sans l'historique de la conversation.
Le code fait foi en cas de doute.

## Objectif

Aujourd'hui les 4 robots (Orbe, Cube, Lame, Char) partagent exactement les mêmes accessoires : seule la forme de départ change, c'est redondant. Chaque robot doit avoir **sa propre personnalité et ses propres accessoires**, pour que le patient qui avance bien termine un robot puis passe à un autre afin de tous les **collectionner**.

## Décisions validées

1. **Collection = option A** : les badges gagnés pendant qu'un robot est actif sont crédités à ce robot. Quand il a ses 8 éléments, il est « complet » (étoile ou cadre doré) et le patient en adopte un autre. L'XP et les niveaux restent communs à tous les robots ; seuls accessoires et badges se répartissent par robot.
2. **8 éléments par robot** = les 7 badges avec accessoire + un 8ᵉ, lié au badge « Machine à records » : une **pose** du robot propre à sa personnalité (pas un accessoire posé dessus).
3. **Un thème par robot** (voir plus bas). Rien ne doit couvrir l'antenne.
4. **On fait un robot à la fois** (l'Orbe sert de prototype), puis les autres, puis les Légumes avec le même principe.
5. Un accessoire reste relié à **son badge**, pas au niveau (le niveau est commun à tous les robots, ça casserait la collection). Quand un effet dépend du niveau, on dessine **deux rendus** selon le niveau atteint.

## Orbe : thème « explorateur de l'espace »

| Badge (id) | Touche `acc` | Élément |
|---|---|---|
| Premier pas (`first`) | `twinkle` | Antenne qui scintille : étincelle blanche qui pulse + points brillants |
| Fidèle (`five`) | `visor` | Lunettes bandeau : verre teinté qui laisse voir l'œil, sangle autour de la tête |
| Infatigable (`marathon`) | `wingfx` | Effets d'ailes (voir ci-dessous) |
| Inarrêtable (`titan`) | `drone` | Drone compagnon (même dessin que les autres robots) |
| Nouveau record (`record`) | `comet` | Étoile filante en haut à gauche |
| Attrape-étoiles (`stars`) | `planet` | Planète à anneau qui flotte à gauche |
| Sans faute (`perfect`) | `bubble` | Bulle de protection autour du robot |
| Machine à records (`triple`) | `combat` | Pose de combat |

**Infatigable, deux rendus** (les ailes n'existent qu'au niveau 5 = 1100 XP × rythme, et 25 exercices ne suffisent pas toujours à l'atteindre) :
- **niveau 5** : courants d'énergie animés (pointillés qui défilent) le long des contours et des plumes des deux ailes, éclats qui scintillent aux pointes ;
- **avant le niveau 5** : le réacteur sous l'Orbe s'embrase (grande flamme + étincelles). Peu visible au niveau 1 (soucoupe).

**Pose de combat** (`combat`) : robot penché de 6° (rotation du groupe principal), tête décalée de 4 px, regard tourné vers la droite (œil redessiné décalé), **bras gauche levé** (dessiné dès le niveau 2 dans ce cas, normalement les bras viennent au niveau 3), lunettes bandeau dessinées d'office même si `visor` n'est pas débloqué, laser qui part des lunettes vers la droite avec étincelles et étoile à l'impact.

## Où est le code (état actuel de la branche)

| Fichier | Rôle |
|---|---|
| `js/rewards-robot-orb.js` | **nouveau** : `rwOrbAccs({acc,A,E,B,st})` renvoie `{head, outer}` en SVG. `head` suit la tête (antenne, lunettes, laser), `outer` entoure le robot (bulle, planète, comète, effets d'ailes). Un fichier par robot est le modèle à reproduire. |
| `js/rewards-robot.js` | `rwRobotSvg` : pour l'Orbe, les accessoires génériques sont **désactivés** (`acc` ne garde que `drone`, réutilisé tel quel) et `orb.head` / `orb.outer` sont insérés. Gère aussi la pose de combat (lean, bras levé, tête décalée). |
| `css/rewards.css` | classes `rw-twinkle` (scintillement) et `rw-wingfx` (pointillés qui défilent), ajoutées aux listes qui coupent les animations (`body.no-answer-anim`, `prefers-reduced-motion`). |
| `index.html` | script `rewards-robot-orb.js` ajouté, `?v=66`. |

Repères de dessin de l'Orbe (viewBox 200×240) : tête = cercle centre (100,76) rayon 34, antenne de (100,44) à (100,27), œil en (100,78), corps = cercle centre (100,142) rayon 30, ailes niveau 5 : `M72 118 L14 66 L24 108 L8 126 L34 140 L72 152 Z` (et symétrique), flamme du réacteur sous (100,182). Au niveau 1 la tête est décalée de 70 px vers le bas (`translate`), les éléments de `head` suivent, ceux de `outer` non.

## Ce qui n'est PAS encore fait (à brancher)

Le dessin est validé en prototype (captures Playwright), mais **rien n'est relié au jeu** et **la branche ne doit pas être mergée telle quelle** : comme l'Orbe ignore désormais les accessoires génériques, les patients qui avaient équipé cape, jetpack, etc. sur l'Orbe les perdraient.

1. `accs` par modèle : déplacer la liste du thème (`RW_THEMES.robot.accs`) vers chaque robot (par exemple `RW_ROBOT_SPECIES[k].accs`), avec les touches ci-dessus pour l'Orbe.
2. Stockage : `r.acc` indexé par modèle (`r.acc[modèle][touche]`), avec une migration pour les patients existants.
3. Option A : créditer les badges gagnés au robot actif (`rwEvaluate`, `ev.on`), état « complet » avec marque visible, bilan de fin d'exercice (`newAccs`) et fenêtre du compagnon (`rw-acc`, texte du verrou) adaptés.
4. Pose de combat : l'afficher comme les autres éléments du robot (collection), avec son nom.
5. Mettre à jour `docs/RECOMPENSES.md` (tableau des badges et accessoires, désormais par robot).
6. Tests Chromium de bout en bout (CLAUDE.md) : débloquer chaque badge, équiper, vérifier que l'antenne reste visible, tester les niveaux 1 à 5.
7. Incrémenter `?v=` à chaque modification de `css/` ou `js/`.

## Robots à faire (idées validées en principe, à détailler un par un)

| Robot | Thème | Idées d'accessoires |
|---|---|---|
| **Cube** | Bricoleur / atelier | lunettes de soudeur relevées sur le front, ceinture d'outils, clé à molette, ressort-pieds, engrenages dans le dos, panneau solaire, boîte à outils |
| **Lame** (tête de chat) | Chat ninja | bandeau ninja, écharpe qui flotte, katana dans le dos, queue de chat articulée, shurikens, moustaches lumineuses, griffes. Pose : il semble se battre avec ses shurikens |
| **Char** (chenilles) | Engin de chantier / explorateur | pelle de bulldozer, gyrophare à côté de l'antenne, phares, remorque ou benne, drapeau, blindage rivetté, tourelle-lanterne |

Chaque robot garde un trait propre (mouvement, forme, petite animation) et une pose de combat qui lui ressemble. **Légumes** : même démarche après les robots.

## Méthode de travail utilisée

- Préparer une planche de rendu avec Playwright (Chromium headless) : `rwRobotSvg({species, stage, body, accent, eye, acc, uid})` appelé pour chaque touche seule, niveaux 1, 3 et 5, puis cumulée ; ouvrir la planche en capture et l'examiner.
- Valider avec la thérapeute avant de brancher, puis suivre le workflow du `CLAUDE.md` (rebase sur main, test de bout en bout, PR, merge).
- Piège : `pkill -f "http.server 8080"` tue aussi le shell qui le lance ; écrire `pkill -f "[h]ttp.server 8080"`.
