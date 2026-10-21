# Accessoires par robot : récapitulatif (Orbe fait, Cube / Lame / Char à faire)

Complète `docs/RECOMPENSES.md`. Écrit pour reprendre le chantier sans l'historique de la conversation.
Le code fait foi en cas de doute.

## Objectif

Aujourd'hui les robots partageaient les mêmes accessoires : seule la forme de départ changeait, c'était redondant. Chaque robot doit avoir **sa propre personnalité et ses propres accessoires**, pour que le patient qui avance bien termine un robot puis passe à un autre afin de tous les **collectionner**.

## Décisions validées

1. **Collection par modèle** (option A) : les exercices comptent pour le modèle actif, chaque modèle a ses propres badges (compteurs repartant de zéro) ; quand il a ses 8 badges il est « complet » (★) et on en adopte un autre. XP et niveaux restent communs. **Fait et branché** (voir RECOMPENSES.md).
2. **8 éléments par robot**, un par badge (Machine à records inclus).
3. **Un thème par robot** (plus bas). Rien ne doit couvrir l'antenne.
4. **Un robot à la fois** : on montre le rendu (planche Playwright), on valide, puis on implémente. L'Orbe est fait ; Légumes ensuite avec le même principe.
5. Un accessoire reste relié à **son badge**, jamais au niveau (le niveau est commun, ça casserait la collection). Quand un effet dépend du niveau, on dessine **deux rendus** selon le niveau atteint.
6. Les patients ayant déjà l'Orbe : les accessoires de l'ancienne liste disparaissent (remise à zéro acceptée), les badges déjà gagnés restent crédités au modèle qu'ils utilisaient.

## Orbe : thème « explorateur de l'espace » (fait)

| Badge (id) | Touche `acc` | Élément |
|---|---|---|
| Premier pas (`first`) | `twinkle` | Antenne scintillante : étincelle blanche qui pulse + points brillants |
| Fidèle (`five`) | `visor` | Lunettes bandeau : verre teinté qui laisse voir l'œil, sangle autour de la tête |
| Infatigable (`marathon`) | `comet` | Étoile filante en haut à gauche |
| Inarrêtable (`titan`) | `thrust` | Réacteur embrasé : grande flamme sous le robot (sous la soucoupe au niveau 1) |
| Nouveau record (`record`) | `scepter` | Sceptre tenu à droite (aligné avec la main dès le niveau 3), pommeau en forme de Saturne |
| Attrape-étoiles (`stars`) | `drone` | Drone compagnon (même dessin que les autres robots) |
| Sans faute (`perfect`) | `bubble` | Bulle de protection autour du robot |
| Machine à records (`triple`) | `wingfx` | Voir ci-dessous |

**Machine à records, deux rendus** (les ailes n'existent qu'au niveau 5 = 1100 XP × rythme) :
- **niveau 5** : courants d'énergie animés (pointillés qui défilent) sur les contours et les plumes des ailes, éclats aux pointes ;
- **niveaux 2 à 4** : arcs électriques qui crépitent de chaque côté du corps (rien au niveau 1, la soucoupe n'a pas de corps ; il faut 3 records pour ce badge, donc le cas est quasi impossible).

La pose de combat (penché, bras levé, laser des lunettes) a été essayée puis retirée de la liste ; elle est dans l'historique git (commit « Orbe : accessoires revus (antenne qui scintille, lunettes bandeau, drone, pose de combat) »).

## Où est le code

| Fichier | Rôle |
|---|---|
| `js/rewards-robot-orb.js` | `rwOrbAccs({acc,A,E,B,st})` renvoie `{head, outer}` en SVG : `head` suit la tête (antenne, lunettes), `outer` entoure le robot (bulle, comète, sceptre, réacteur, effets d'ailes). **Un fichier par robot** est le modèle à reproduire. |
| `js/rewards-robot.js` | `rwRobotSvg` : pour l'Orbe, les accessoires génériques sont désactivés (`acc` ne garde que `drone`, réutilisé tel quel) et `orb.head` / `orb.outer` sont insérés. |
| `js/rewards.js` | `RW_THEMES.robot.speciesAccs.orb` (liste des 8 : touche, nom, badge), `rwAccsOf(r, modèle)`, collection par modèle (`rwAnalyze`, `rwEvaluate(patient, liste, modèle)`, `rwRobotComplete`, `rwOnSessionSaved`), migration des anciennes données dans `getReward`. |
| `js/rewards-ui.js` | fenêtre du compagnon (accessoires du modèle, ★ complet), bilan de fin d'exercice (annonce « Collection complète »). |
| `css/rewards.css` | `rw-twinkle`, `rw-wingfx` (coupées par le réglage « animations » et `prefers-reduced-motion`), `.rw-sp.done`. |

Repères de dessin de l'Orbe (viewBox 200×240) : tête = cercle centre (100,76) rayon 34, antenne de (100,44) à (100,27), œil en (100,78), corps = cercle centre (100,142) rayon 30, ailes niveau 5 : `M72 118 L14 66 L24 108 L8 126 L34 140 L72 152 Z` (et symétrique), flamme du réacteur sous (100,182). Au niveau 1 la tête est décalée de 70 px vers le bas (`translate`), les éléments de `head` suivent, ceux de `outer` non.

## Robots à faire (thèmes validés, accessoires à détailler un par un, avec rendu validé avant implémentation)

| Robot | Thème | Idées d'accessoires |
|---|---|---|
| **Cube** | Bricoleur / atelier | lunettes de soudeur relevées sur le front, ceinture d'outils, clé à molette, ressort-pieds, engrenages dans le dos, panneau solaire, boîte à outils |
| **Lame** (tête de chat) | Chat ninja | bandeau ninja, écharpe qui flotte, katana dans le dos, queue de chat articulée, shurikens, moustaches lumineuses, griffes |
| **Char** (chenilles) | Engin de chantier / explorateur | pelle de bulldozer, gyrophare à côté de l'antenne, phares, remorque ou benne, drapeau, blindage rivetté, tourelle-lanterne |

Pour chacun : 8 éléments (un par badge, dont « Machine à records » qui peut être une pose, un effet ou un objet propre à sa personnalité), un trait propre (mouvement, forme, petite animation), deux rendus quand un effet dépend du niveau. À ajouter : une entrée dans `speciesAccs`, un fichier `js/rewards-robot-<modèle>.js`, l'appel dans `rwRobotSvg`, `?v=` incrémenté, planche de rendu, test Chromium. **Légumes** : même démarche après les robots.

## Méthode de travail utilisée

- Planche de rendu avec Playwright (Chromium headless) : `rwRobotSvg({species, stage, body, accent, eye, acc, uid})` pour chaque touche seule aux niveaux 1, 3, 4 et 5, puis cumulée ; ouvrir la capture et l'examiner.
- Test de bout en bout : patient avec objectifs bas, sessions poussées dans `sessions` + `showRewardResult(session)` (le vrai bilan), puis clics dans la fenêtre du compagnon (`openRewardModal`) : badges, équipement, ★ complet, changement de modèle (collection vierge), migration d'anciennes données.
- Valider le rendu avec la thérapeute avant d'implémenter, puis le workflow du `CLAUDE.md` (rebase sur main, test de bout en bout, PR, merge).
- Piège : `pkill -f "http.server 8080"` tue aussi le shell qui le lance ; écrire `pkill -f "[h]ttp.server 8080"`.
