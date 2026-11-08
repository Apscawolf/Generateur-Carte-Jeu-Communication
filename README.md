# L’Atelier du Greffier

Générateur hors ligne de cartes pour **Le Tribunal du Chaos**. Ouvrir [`atelier-cartes/index.html`](./atelier-cartes/index.html) dans un navigateur récent ; aucun serveur ni installation n’est requis.

## Règle du paquet

Chaque affaire utilise une feuille A4 dédiée de **3 × 3 emplacements**, soit neuf cartes de **70 × 99 mm** :

1. `affaire` — contexte public
2. `accusateur` — version de l’accusation
3. `accuse` — version de la défense
4. `faits` — faits établis, éléments incertains et questions
5–6. `temoin` — jusqu’à deux témoins facultatifs
7. `jury` — mission des jurés
8. `verdict` — faits prouvés et mécanismes pédagogiques
9. `debrief` — analyse et pistes de désamorçage

Les sept cartes de base sont créées avec chaque nouvelle affaire. Ajouter au besoin zéro, un ou deux témoins. Les emplacements inutilisés restent vierges, avec leurs lignes de coupe. Le paquet ne peut pas dépasser neuf cartes ni contenir plus de deux témoins ; chaque type de base est unique. Dupliquer une affaire pour créer une variante complète.

**Impression :** une affaire = une feuille de rectos ; avec les versos, son verso est imprimé sur la feuille suivante. Pour plusieurs affaires, les feuilles sont produites dans l’ordre affaire 1 recto, affaire 1 verso, affaire 2 recto, affaire 2 verso, etc. Les filtres de type et la sélection individuelle laissent les autres emplacements vierges, sans mélanger les affaires. Le nombre d’exemplaires répète le paquet entier. Les traits pointillés autour de chaque emplacement servent de lignes de coupe.

Dans la boîte de dialogue d’impression, sélectionner A4 portrait, échelle 100 % et impression des arrière-plans. La mise en page CSS occupe toute la page A4 ; pour une imprimante papier, seule une imprimante avec impression sans bordure peut réellement imprimer jusqu’aux bords. Sinon, le pilote peut réduire ou rogner la page selon sa zone non imprimable. Pour conserver exactement les dimensions de 70 × 99 mm, exporter d’abord en PDF puis imprimer à taille réelle, sans « ajuster à la page ». Vérifier l’option de retournement recto-verso et imprimer une feuille de test avant un grand tirage.

## Dimensions des cartes et éléments visuels

Les dimensions ci-dessous sont celles du rendu imprimé à **100 %**, hors réduction éventuelle par une imprimante sans impression bord à bord. Elles servent de gabarit pour créer des illustrations ou modifier la mise en page.

| Élément | Dimensions imprimées | Détails |
|---|---:|---|
| Feuille | 210 × 297 mm | A4 portrait, sans marge CSS |
| Grille | 3 × 3 cartes | Chaque emplacement mesure 70 × 99 mm |
| Carte / ligne de coupe | 70 × 99 mm | Bordure de coupe pointillée de 0,2 mm |
| Cadre intérieur | 65,2 × 94,2 mm | Inset de 2,4 mm de chaque côté de la carte |
| Zone de contenu intérieure | 58,3 mm de large | Le cadre intérieur a 3 mm de retrait horizontal supplémentaire de chaque côté, hors bordure |
| Cadre d’illustration | 58,3 × 26 mm | Pleine largeur de la zone de contenu, hauteur fixe, dans le cadre intérieur |
| Image visible dans son cadre | Environ 55,1 × 22,8 mm | L’encadrement médiéval prend le reste ; `object-fit: cover` recadre sans déformer |
| Emblème du verso | 38 × 38 mm | Balance ou autre emblème choisi dans les réglages |

Le cadre intérieur a un retrait imprimé de **3,5 mm en haut**, **3 mm sur les côtés** et **2,5 mm en bas**. Les textes sont composés dans la zone restante, après le titre, le type et, sur la carte `affaire`, l’illustration. Les tailles typographiques imprimées sont : type **7 pt**, titre **11 pt**, corps **9 pt**, rôle **7 pt**, ornement de recto **11 pt**. Le texte peut être masqué s’il dépasse l’espace de la carte ; respecter aussi les limites de caractères indiquées plus bas.

### Préparer une illustration

L’image n’est imprimée que sur le recto de la carte `affaire`. Pour limiter le recadrage, générer une illustration **paysage au ratio d’environ 2,42:1** ; une image d’environ **651 × 269 px à 300 ppp** convient au cadre imprimé de 55,1 × 22,8 mm. Le ratio n’est pas obligatoire : les images plus hautes ou plus larges sont recadrées au centre, sans étirement. La position du recadrage peut être réglée dans l’éditeur (centre, haut, bas, gauche, droite). Ne pas intégrer le titre ni le texte de la carte dans l’image : le texte est composé séparément sous l’illustration.

Les tailles de carte, de cadre et de texte imprimé sont fixes dans le gabarit ; les réglages de l’application permettent de changer certains aspects graphiques (cadre simple ou double, typographie, ornement, couleurs par famille et position de l’image), mais pas ces dimensions. Pour modifier le gabarit, consulter les règles correspondantes dans `atelier-cartes/css/print.css` (`.print-card`, `.print-card-inner`, `.print-illustration-frame`, `.print-card-content`) et son aperçu écran dans `atelier-cartes/css/atelier.css`.

## Limites de texte

L’éditeur signale les dépassements sans couper ni effacer le texte :

- Titre : **48 caractères** conseillés.
- Rôle/catégorie : **32 caractères** conseillés.
- Ensemble des champs de texte de la carte : **650 caractères** sans illustration, **450 caractères** avec illustration.

Le total du texte correspond aux valeurs non vides de `fields`, assemblées avec deux sauts de ligne. Ces limites sont des seuils de lisibilité pour une carte de 70 × 99 mm, pas une troncature automatique. Un avertissement dans l’éditeur et l’aperçu indique les éléments à raccourcir avant l’impression. Les limites s’appliquent aux chaînes comme comptées par JavaScript.

## Sauvegarde, images et import

- Les modifications sont sauvegardées dans le stockage local du navigateur.
- Les textes d’exemple enregistrés par une ancienne version sont raccourcis automatiquement uniquement lorsqu’ils n’ont pas été modifiés ; les textes personnalisés et illustrations déjà ajoutées sont conservés.
- **Exporter le grimoire JSON** télécharge un fichier portable, y compris les illustrations personnalisées intégrées en data URI.
- **Importer un grimoire** accepte les fichiers JSON ou CSV décrits ci-dessous et remplace le projet courant après confirmation.
- Les fichiers image personnalisés sont intégrés comme data URI `data:image/...;base64,...` dans le JSON/CSV. Taille maximale par image importée dans l’interface : 3 Mo.
- L’illustration apparaît uniquement sur le recto de la carte `affaire`, jamais sur les cartes de rôle ni sur les versos. Elle peut être fournie par `case.image` ou par `image` sur la carte `affaire`. Les réglages de position s’appliquent à cette illustration.
- L’atelier inclut quatre illustrations fantasy CC0 dans `atelier-cartes/assets/illustrations/`. À l’import JSON ou CSV, une illustration fournie est conservée ; si l’affaire n’en a pas, une image intégrée est choisie au hasard pour sa carte `affaire`. Les images indiquées sur d’autres cartes ne sont pas utilisées. Garder le dossier `assets` avec l’application pour afficher et imprimer ces images.

### Illustrations intégrées

Ces œuvres fantasy sont publiées sous **CC0 1.0** sur Openclipart ; elles sont fournies localement pour garder l’atelier hors ligne :

- [Fantasy dragon](https://openclipart.org/detail/319543) — `dragon.svg`
- [Wizard](https://openclipart.org/detail/344786/wizard) — `sorcier.svg`
- [Jousting Knight](https://openclipart.org/detail/351169/jousting-knight) — `chevalier.svg`
- [RPG map symbols: Gate](https://openclipart.org/detail/11461/rpg-map-symbols-gate) — `porte-fantasy.svg`

## Format JSON recommandé pour une IA

Le JSON est le format recommandé : il représente proprement les tableaux, les textes multilignes et les images, et peut être importé directement. Produire un objet racine `version`, `settings`, `cases`. Les identifiants doivent être uniques. Une affaire contient ses cartes directement dans `cards` ; il n’y a pas de `caseId` dans chaque carte.

Les types acceptés sont `affaire`, `accusateur`, `accuse`, `faits`, `temoin`, `jury`, `verdict`, `debrief`. Chaque carte doit avoir `id`, `type`, `title`, `role`, `fields` (objet de chaînes). `image` et `imagePosition` sont facultatifs et ne s’appliquent qu’à la carte `affaire`. L’image peut être une data URI ; si l’affaire n’a pas d’image, l’application en choisit une au hasard parmi les illustrations fantasy intégrées. Dans une affaire : sept types de base au maximum une fois chacun, zéro à deux `temoin`, neuf cartes au maximum. Pour une affaire complète, fournir les sept types de base.

Champs recommandés par type :

| Type | Clés `fields` |
|---|---|
| `affaire` | `content`, `facts`, `interpretations` |
| `accusateur` | `objective`, `available`, `evidence`, `interpretation`, `unknown` |
| `accuse` | `objective`, `content`, `available`, `evidence`, `unknown` |
| `faits` | `established`, `uncertain`, `questions` |
| `temoin` | `content`, `facts`, `indirect`, `interpretation`, `reliability` |
| `jury` | `mission`, `content` |
| `verdict` | `certain`, `unproven`, `mechanism`, `secondary`, `explanation`, `takeaway` |
| `debrief` | `origin`, `aggravating`, `bias`, `needs`, `deescalation`, `question` |

`settings` contient notamment `gameName`, `subtitle`, `emblem`, `backNote`, `accent`, `fontStyle`, `frameStyle`, `ornament` et `familyColors`. Les couleurs sont des codes hexadécimaux. Pour une image personnalisée, fournir une data URI et non un chemin local.

Exemple compact, valide et directement importable (les textes peuvent être remplacés, sans dépasser les seuils de longueur ci-dessus) :

```json
{
  "version": 1,
  "settings": {
    "gameName": "Le Tribunal du Chaos",
    "subtitle": "Chroniques du royaume",
    "emblem": "⚖",
    "backNote": "",
    "accent": "#733b3b",
    "fontStyle": "ornate",
    "frameStyle": "double",
    "ornament": "✦",
    "familyColors": {}
  },
  "cases": [{
    "id": "linge-dragon",
    "title": "Le dragon et le linge royal",
    "summary": "Un linge brûlé après un désaccord sur un étendoir.",
    "context": "Le linge du voisin a brûlé près de la grotte de Brasier.",
    "disagreement": "Le voisin soupçonne une vengeance ; le dragon parle d’un éternuement.",
    "image": "",
    "cards": [
      {"id":"linge-affaire","type":"affaire","title":"Le royaume contre Brasier","role":"Audience publique","fields":{"content":"Le linge a brûlé près de la grotte du dragon.","facts":"Le linge est brûlé ; Brasier s’était plaint de l’étendoir.","interpretations":"Vengeance ou accident ?"},"image":""},
      {"id":"linge-accusateur","type":"accusateur","title":"Maître Aubépine","role":"Accusation","fields":{"objective":"Obtenir réparation.","available":"Un grondement a précédé la fumée.","evidence":"Montrer les draps brûlés.","interpretation":"Brasier s’est vengé de la dispute.","unknown":"Un encens brûlait près du linge."}},
      {"id":"linge-accuse","type":"accuse","title":"Brasier","role":"Défense","fields":{"objective":"Expliquer l’incident et réparer le dommage.","content":"J’ai éternué en sortant de ma grotte.","available":"Le pollen irritait mon nez.","evidence":"Je n’ai pas visé le jardin.","unknown":"Le vent poussait vers l’étendoir."}},
      {"id":"linge-faits","type":"faits","title":"Faits et indices","role":"Repères de l’enquête","fields":{"established":"Le linge a brûlé ; le vent allait vers la corde.","uncertain":"Personne n’a vu l’origine de la flamme.","questions":"Un encens a-t-il déclenché le feu ?"}},
      {"id":"linge-temoin-a","type":"temoin","title":"Pimprenelle","role":"Témoin","fields":{"content":"J’ai vu de la fumée près de la corde.","facts":"Le vent soufflait vers le linge.","indirect":"Un apprenti parle d’un rugissement.","interpretation":"J’ai d’abord soupçonné le dragon.","reliability":"J’ai vu la fumée, pas le départ du feu."}},
      {"id":"linge-temoin-b","type":"temoin","title":"Le jeune écuyer","role":"Témoin facultatif","fields":{"content":"J’ai aperçu une lueur près de la corde.","facts":"Je n’ai vu personne produire la flamme.","indirect":"On m’a dit que Brasier avait éternué.","interpretation":"La lueur pouvait venir de l’encens.","reliability":"J’ai vu la lueur mais pas son origine."}},
      {"id":"linge-jury","type":"jury","title":"Mission des jurés","role":"Jury","fields":{"mission":"Établir les faits, le mécanisme d’escalade et une prochaine étape d’apaisement.","content":"Séparer observations et suppositions."}},
      {"id":"linge-verdict","type":"verdict","title":"Ce que révèle l’enquête","role":"Verdict","fields":{"certain":"Le linge a brûlé et le vent soufflait vers lui.","unproven":"L’intention de Brasier n’est pas établie.","mechanism":"Attribution hostile.","secondary":"Biais de confirmation.","explanation":"Un dommage ne prouve pas une intention.","takeaway":"Vérifier les circonstances avant de conclure."}},
      {"id":"linge-debrief","type":"debrief","title":"Après l’audience","role":"Débrief","fields":{"origin":"L’étendoir gênait l’accès à la grotte.","aggravating":"La dispute a orienté les soupçons.","bias":"Attribution hostile et biais de confirmation.","needs":"Sécurité, accès et respect du voisinage.","deescalation":"Vérifier les indices et convenir d’un emplacement sûr.","question":"Qu’auriez-vous vérifié avant de conclure ?"}}
    ]
  }]
}
```

Les deux témoins sont facultatifs : retirer l’un ou les deux conserve une affaire valide ; leurs emplacements sur la feuille restent blancs. Pour choisir une illustration précise, renseigner `image` sur l’objet affaire ou sur sa carte `affaire` avec une data URI. Sinon, l’application en choisit une au hasard à l’import.

## Format CSV accepté

Le CSV est importable. Il contient **une ligne par carte** ; les métadonnées de l’affaire sont répétées pour chaque ligne de cette affaire. Encodage UTF-8, séparateur virgule, première ligne d’en-tête, échappement CSV standard (valeur entre guillemets si elle contient une virgule, un saut de ligne ou un guillemet ; un guillemet interne est doublé). `fields_json` est un objet JSON sérialisé, lui-même échappé comme champ CSV.

Colonnes obligatoires :

```text
case_id,case_title,card_order,card_type,card_title,role,fields_json
```

Colonnes facultatives :

```text
case_summary,case_context,case_disagreement,case_image,card_id,image_data_url,image_position
```

- `card_order` est un nombre de 0 à 8 ; il détermine l’ordre des cartes.
- `fields_json` utilise les clés du tableau JSON ci-dessus.
- `card_id` est facultatif ; l’application crée un identifiant s’il manque.
- `case_image` et `image_data_url` sur la ligne de la carte `affaire` doivent être des data URI ou rester vides, jamais des chemins de disque. Une image renseignée sur une autre ligne de carte n’est pas utilisée. Si l’affaire n’a aucune image, l’application en choisit une au hasard.
- Les paramètres graphiques ne sont pas stockés en CSV ; l’import CSV reprend le thème par défaut.
- Toutes les lignes de même `case_id` doivent garder le même `case_title`.

Exemple de deux lignes ; continuer avec les sept cartes de base et, si souhaité, jusqu’à deux lignes `temoin` :

```csv
case_id,case_title,case_summary,case_context,case_disagreement,card_order,card_type,card_title,role,fields_json,image_data_url,image_position
linge-dragon,"Le dragon et le linge royal","Un linge brûlé","Le linge brûle près de la grotte","Le voisin soupçonne une vengeance",0,affaire,"Le royaume contre Brasier","Audience publique","{""content"":""Le linge a brûlé."",""facts"":""Brasier s’était plaint de l’étendoir."",""interpretations"":""Vengeance ou accident ?""}",,center
linge-dragon,"Le dragon et le linge royal","Un linge brûlé","Le linge brûle près de la grotte","Le voisin soupçonne une vengeance",1,accusateur,"Maître Aubépine","Accusation","{""objective"":""Obtenir réparation."",""available"":""Un grondement a précédé la fumée."",""evidence"":""Montrer les draps brûlés."",""interpretation"":""Brasier s’est vengé."",""unknown"":""Un encens brûlait près du linge.""}",,center
```

## Consigne à transmettre à une IA

> Génère un projet JSON importable par L’Atelier du Greffier. Respecte le schéma de `README.md` : sept cartes de base uniques par affaire (`affaire`, `accusateur`, `accuse`, `faits`, `jury`, `verdict`, `debrief`), zéro à deux cartes `temoin`, neuf cartes maximum. Chaque carte a un identifiant unique, un titre, un rôle et les champs adaptés à son type. Fournis des faits observés distincts des interprétations, des informations confidentielles cohérentes entre les rôles, et un débrief qui propose plusieurs pistes. Respecte les limites : titre ≤ 48 caractères, rôle ≤ 32, texte cumulé ≤ 650 caractères sans image ou ≤ 450 avec image. Retourne uniquement le JSON, sans Markdown ni chemins locaux d’images.

## Personnalisation hors ligne

Le thème, les cadres, ornements, typographies, dos de cartes et couleurs de famille sont personnalisables. Les illustrations des rectos sont affichées en pleine largeur dans un cadre décoratif inspiré des enluminures, de hauteur fixe ; l’image est recadrée pour remplir le cadre sans être déformée. Google Fonts peut fournir une typographie enluminée si Internet est disponible ; des polices de repli lisibles sont utilisées hors ligne.
