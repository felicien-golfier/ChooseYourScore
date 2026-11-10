# Accessoires par légume : récapitulatif (Carotte, Patate, Brocoli et Radis faits)

Pendant de `docs/ROBOTS-ACCESSOIRES.md` pour l'univers « Légumes super-héros », même démarche :
chaque légume a ses propres accessoires (`RW_THEMES.veggie.speciesAccs[modèle]`, lu par `rwAccsOf`)
pour que le patient termine sa collection puis en adopte un autre. Les légumes sans entrée gardent la
liste générique de l'univers (bandeau, dents de lapin, lunettes, bouclier casserole, éclairs, fourchette,
petits pois). Le code fait foi en cas de doute.

## Carotte : « Super-carotte » (fait)

**Chaque légume a ses propres spécificités** (accessoires, couleurs, détails de dessin), comme les robots :
ce qui suit ne vaut que pour la Carotte. Les autres légumes gardent le dessin et les couleurs de l'univers
en attendant leur thème.

**Couleurs** (`RW_THEMES.veggie.speciesColors.carrot`, lu par `rwColorsOf`) : cape (`accent`) et monture
des lunettes de soleil (`lens`) ont des couleurs verrouillées jusqu'à un niveau (2 à 5), comme les robots ;
le masque reste libre.

**Ceinture** (niveaux 3 à 5) et ceinturon : découpés à la forme du corps (`RW_VEG_SHAPE`, clipPath
`bc<uid>`), ils ne dépassent pas de la carotte.

8 accessoires, un par badge. Dessin : `js/rewards-veggie-carrot.js`, `rwCarrotAccs({acc,A,AK,st,fy,ax,L,beltClip})`
renvoie `{leaves, chest, belt, face, arm, noMask}`, insérés par `rwVeggieSvg` : `leaves` par-dessus les fanes,
`chest` sur le torse, `belt` après le torse, `face` sur le visage, `arm` après le bras gauche. La fourchette géante et les petits pois
reprennent le dessin générique de `rwVeggieSvg` (même code pour tous les légumes).

| Badge (id) | Touche `acc` | Élément |
|---|---|---|
| Premier pas (`first`) | `sparkle` | Fanes scintillantes : nervures dorées et étincelles qui scintillent (`rw-twinkle`) |
| Fidèle (`five`) | `moustache` | Moustache en guidon, pointes recourbées |
| Infatigable (`marathon`) | `fork` | Fourchette géante dans la main levée (dessin générique) |
| Inarrêtable (`titan`) | `peas` | Petits pois copains (dessin générique) |
| Nouveau record (`record`) | `shades` | Lunettes de soleil rectangulaires, monture couleur `lens`, verres teintés ; remplacent le bandeau (`noMask`) |
| Attrape-étoiles (`stars`) | `oval` | Bouclier ovale couleur de la cape, bord doré, étoile au centre, dans la main gauche |
| Sans faute (`perfect`) | `superS` | Grand S doré sur le torse dans un écusson ovale couleur de la cape ; remplace l'étoile de héros des niveaux 4 et 5 |
| Machine à records (`triple`) | `belt` | Ceinturon (dès le niveau 1) : cuir, rivets dorés, boucle dorée étoilée, découpé à la forme du corps ; remplace la ceinture simple des niveaux 3 à 5 et passe devant le bas de l'écusson du S |

Repères de la Carotte (viewBox 200×240, avant l'échelle du niveau) : fanes partant de (100,88), pointes
en (100,46), (79,61), (121,61) ; yeux à y=114, bouche à y=130, torse vers (100,151), ceinture à y=161 ;
main gauche en (53,142), poing levé en (151,104).

## Branchement commun

`rwVeggieSvg` appelle la fonction du modèle (`RW_VEG_ACCS = { carrot: rwCarrotAccs, potato: rwPotatoAccs, broccoli: rwBroccoliAccs, radish: rwRadishAccs }`)
avec les repères du dessin (`acc, A, AK, L, CR, P, SC, st, fy, sh, ax, fist, beltClip, bodyClip`) et insère chaque
morceau renvoyé à son emplacement : `back` (derrière la cape), `mid` (entre la cape et le corps),
`leaves`, `chest`, `belt`, `face`, `hand` (avant les bras), `arm` (après les bras), `front` (devant tout).
Drapeaux : `noMask` (retire le bandeau), `noCrown` (retire la couronne de feuilles du niveau 5).
`bodyClip` est la découpe à la forme du corps (foulard du Radis) ; `fitBelt` dans `RW_VEGGIE_SPECIES` l'applique à la ceinture (Carotte, Patate, Radis). Les couleurs de cape et de
masque des légumes à couleurs propres sont partagées (`RW_VEG_CAPE`, `RW_VEG_MASK`).

## Patate : « Super-patate », chevalier (fait)

Dessin : `js/rewards-veggie-potato.js`, `rwPotatoAccs`. Couleurs (`speciesColors.potato`) : cape à
débloquer (comme la Carotte), masque libre, **blason** (`crest` : bouclier et étendard) à débloquer
(bleu et rouge, turquoise niv. 2, violet niv. 3, noir niv. 4, or niv. 5). Ceinture découpée à la forme du corps.

| Badge (id) | Touche `acc` | Élément |
|---|---|---|
| Premier pas (`first`) | `helmet` | Casque : casserole retournée, manche vers la gauche ; remplace la couronne de feuilles du niveau 5 |
| Fidèle (`five`) | `plume` | Plume couleur de la cape, sur le casque (plantée dans la pousse sans casque) |
| Infatigable (`marathon`) | `banner` | Étendard planté à gauche, flamme couleur du blason avec étoile |
| Inarrêtable (`titan`) | `horse` | Cheval-bâton : le bâton passe entre les jambes, la tête dépasse à gauche |
| Nouveau record (`record`) | `sword` | Épée-frite géante dans le poing droit, garde rouge ketchup |
| Attrape-étoiles (`stars`) | `pig` | Petit cochon rose compagnon, à droite |
| Sans faute (`perfect`) | `blason` | Bouclier en écu couleur du blason (bande dorée, couronne, étoile) à la main gauche. Touche `blason` et non `shield`, qui dessinerait aussi le bouclier casserole générique |
| Machine à records (`triple`) | `crown` | Couronne sur la tête du petit cochon ; sans le cochon, posée sur la tête de la patate (ou sur le casque) |

## Brocoli : « Super-brocoli », jungle (fait)

Dessin : `js/rewards-veggie-broccoli.js`, `rwBroccoliAccs`. Couleurs (`speciesColors.broccoli`) : cape à
débloquer (comme les autres), masque libre, **peintures** (`paint` : peintures des joues et pétales de la
couronne de fleurs) à débloquer (rose et bleu, orange niv. 2, rouge niv. 3, violet niv. 4, or niv. 5).
Pas de ceinture (le brocoli n'en a pas).

| Badge (id) | Touche `acc` | Élément |
|---|---|---|
| Premier pas (`first`) | `ladybug` | Coccinelle copine posée sur le côté gauche du bouquet |
| Fidèle (`five`) | `paint` | Peintures de jungle sur les joues (deux traits et un point, couleur `paint`) |
| Infatigable (`marathon`) | `vine` | Liane qui tombe du haut à gauche, avec des feuilles |
| Inarrêtable (`titan`) | `drum` | Tambour couleur de la cape à gauche, la main gauche posée dessus |
| Nouveau record (`record`) | `tornado` | Mini tornade au-dessus du poing droit (à côté de la main au niveau 1) |
| Attrape-étoiles (`stars`) | `bird` | Oiseau de la jungle qui lance un éclair, en haut à droite |
| Sans faute (`perfect`) | `flowers` | Couronne de fleurs sur le bouquet ; remplace la couronne de feuilles du niveau 5 |
| Machine à records (`triple`) | `rainbow` | Arc-en-ciel au-dessus du bouquet, posé sur deux nuages |

## Radis : « Super-radis », pirate (fait)

Dessin : `js/rewards-veggie-radish.js`, `rwRadishAccs`. Couleurs (`speciesColors.radish`) : cape à
débloquer (comme les autres), masque libre, **foulard** (`scarf`) à débloquer (bleu et noir, turquoise
niv. 2, orange niv. 3, violet niv. 4, or niv. 5 ; pas de rouge, il disparaîtrait sur le radis).
Ceinture découpée à la forme du corps.

| Badge (id) | Touche `acc` | Élément |
|---|---|---|
| Premier pas (`first`) | `patch` | Bandeau de pirate sur l'œil droit ; remplace le bandeau de héros (`noMask`) |
| Fidèle (`five`) | `scarf` | Foulard de pirate à pois noué sur le côté, découpé à la forme de la tête (`bodyClip`) |
| Infatigable (`marathon`) | `map` | Carte au trésor dépliée par terre, à droite (chemin en pointillés, croix rouge) |
| Inarrêtable (`titan`) | `hat` | Tricorne noir à galon doré et petite tête de mort ; remplace la couronne de feuilles du niveau 5 |
| Nouveau record (`record`) | `sabre` | Sabre en bois dans le poing droit |
| Attrape-étoiles (`stars`) | `parrot` | Perroquet copain (vert, pour ressortir sur le radis) sur l'épaule gauche |
| Sans faute (`perfect`) | `spyglass` | Longue-vue dorée dans la main gauche |
| Machine à records (`triple`) | `fire` | Le perroquet crache du feu ; dessine aussi le perroquet s'il n'est pas équipé à part |

## Méthode

Planche de rendu Playwright (`rwVeggieSvg` pour chaque touche seule aux niveaux 1, 3, 4, 5, puis
cumulée), puis test de bout en bout comme pour les robots (sessions injectées + `showRewardResult`,
clics dans la fenêtre du compagnon, changement de légume).
