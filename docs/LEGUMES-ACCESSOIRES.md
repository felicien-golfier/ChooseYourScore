# Accessoires par légume : récapitulatif (Carotte et Patate faites)

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

`rwVeggieSvg` appelle la fonction du modèle (`RW_VEG_ACCS = { carrot: rwCarrotAccs, potato: rwPotatoAccs }`)
avec les repères du dessin (`acc, A, AK, L, CR, st, fy, sh, ax, fist, beltClip`) et insère chaque
morceau renvoyé à son emplacement : `back` (derrière la cape), `mid` (entre la cape et le corps),
`leaves`, `chest`, `belt`, `face`, `hand` (avant les bras), `arm` (après les bras), `front` (devant tout).
Drapeaux : `noMask` (retire le bandeau), `noCrown` (retire la couronne de feuilles du niveau 5).
`fitBelt` dans `RW_VEGGIE_SPECIES` découpe la ceinture à la forme du corps. Les couleurs de cape et de
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

## Méthode

Planche de rendu Playwright (`rwVeggieSvg` pour chaque touche seule aux niveaux 1, 3, 4, 5, puis
cumulée), puis test de bout en bout comme pour les robots (sessions injectées + `showRewardResult`,
clics dans la fenêtre du compagnon, changement de légume).
