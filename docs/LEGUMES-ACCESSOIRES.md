# Accessoires par légume : récapitulatif (Carotte faite)

Pendant de `docs/ROBOTS-ACCESSOIRES.md` pour l'univers « Légumes super-héros », même démarche :
chaque légume a ses propres accessoires (`RW_THEMES.veggie.speciesAccs[modèle]`, lu par `rwAccsOf`)
pour que le patient termine sa collection puis en adopte un autre. Les légumes sans entrée gardent la
liste générique de l'univers (bandeau, dents de lapin, lunettes, bouclier casserole, éclairs, fourchette,
petits pois). Le code fait foi en cas de doute.

## Carotte : « Super-carotte » (fait)

7 accessoires (rien pour « Machine à records », comme la Lame ; le badge compte quand même pour la
collection complète). Dessin : `js/rewards-veggie-carrot.js`, `rwCarrotAccs({acc,A,AK,st,fy})` renvoie
`{leaves, chest, face, arm}`, insérés par `rwVeggieSvg` : `leaves` par-dessus les fanes, `chest` sur le
torse, `face` sur le visage, `arm` après le bras gauche. Les lunettes de soleil, la fourchette géante et
les petits pois reprennent le dessin générique de `rwVeggieSvg` (même code pour tous les légumes).

| Badge (id) | Touche `acc` | Élément |
|---|---|---|
| Premier pas (`first`) | `sparkle` | Fanes scintillantes : nervures dorées et étincelles qui scintillent (`rw-twinkle`) |
| Fidèle (`five`) | `moustache` | Moustache en guidon, pointes recourbées |
| Infatigable (`marathon`) | `fork` | Fourchette géante dans la main levée (dessin générique) |
| Inarrêtable (`titan`) | `peas` | Petits pois copains (dessin générique) |
| Nouveau record (`record`) | `shades` | Lunettes de soleil (dessin générique) |
| Attrape-étoiles (`stars`) | `oval` | Bouclier ovale couleur de la cape, bord doré, étoile au centre, dans la main gauche |
| Sans faute (`perfect`) | `superS` | Grand S doré sur le torse dans un écusson ovale couleur de la cape ; remplace l'étoile de héros des niveaux 4 et 5 |

Repères de la Carotte (viewBox 200×240, avant l'échelle du niveau) : fanes partant de (100,88), pointes
en (100,46), (79,61), (121,61) ; yeux à y=114, bouche à y=130, torse vers (100,151), ceinture à y=161 ;
main gauche en (53,142), poing levé en (151,104).

## Méthode

Planche de rendu Playwright (`rwVeggieSvg` pour chaque touche seule aux niveaux 1, 3, 4, 5, puis
cumulée), puis test de bout en bout comme pour les robots (sessions injectées + `showRewardResult`,
clics dans la fenêtre du compagnon, changement de légume).
