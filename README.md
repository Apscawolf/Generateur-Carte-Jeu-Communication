# L’Atelier du Greffier

Générateur de cartes pour **Le Tribunal du Chaos**, un jeu de communication où des joueurs défendent chacun une version d’un même conflit.

C’est un **site statique** (HTML/CSS/JS, sans serveur ni base de données). Les dossiers sont sauvegardés dans le navigateur (`localStorage`) ; les illustrations vivent dans le dossier du projet.

## Lancer le site (important)

```bash
node server.js        # puis ouvrir http://localhost:8000
```

- **Le serveur est nécessaire pour enregistrer les images importées** dans `atelier-cartes/uploads/illustrations/` (tous navigateurs, Firefox compris). Une page statique ne peut pas écrire sur le disque ; `server.js` (Node ≥ 14, sans dépendance) le fait. Il n’écoute que sur votre machine.
- Sans serveur (double-clic sur [`atelier-cartes/index.html`](./atelier-cartes/index.html)) : tout marche (édition, aperçu, impression), sauf que l’import d’image se contente de **télécharger** le fichier, à ranger à la main dans `uploads/illustrations/`.

## Le jeu

### Rôles et matériel d’une affaire (9 cartes)

| Carte | Nb | Contenu | Logo du dos |
|---|---|---|---|
| Affaire | 1 | Contexte public, reproche de l’accusateur, réponse de l’accusé (+ illustration) | Marteau de juge |
| Juge | 1 | Mission et déroulé de la partie, sans question ni indice : le juge doit trouver la vérité lui-même (remplace l’ancienne carte « faits et indices ») | Tribunal (colonnes) |
| Accusateur | 1 | Objectif + **faits** connus | Casque de chevalier |
| Accusé | 1 | Objectif + **faits** connus | Épée |
| Témoin | 4 | **Faits** connus uniquement | Œil |
| Débrief | 1 | Version réelle de l’histoire + mécanismes qui ont mené à cette issue | Balance |

En plus, **4 cartes de côté** (2 « côté de l’accusateur » + 2 « côté de l’accusé »), imprimées sur une feuille à part à la fin du PDF. Elles ont toutes **le même dos** (neutre, logo œil) ; leur recto porte le logo du chevalier ou de l’épée.

**Dos :** une couleur de dos **par affaire**, attribuée automatiquement et toujours différente (teintes espacées de l’angle d’or : 50 affaires = 50 couleurs distinctes, sans cycle ; modifiable dans le dossier) et un logo différent par famille de carte. Les logos sont des SVG originaux dans [`atelier-cartes/js/icons.js`](./atelier-cartes/js/icons.js).

### Déroulement d’une partie

1. Chacun pioche une carte (affaire, rôles) et la regarde en secret.
2. Les témoins piochent en plus une **carte de côté** : ils soutiennent l’accusateur ou l’accusé.
3. Le **juge** est le maître du jeu : il lit l’affaire et donne la parole.
4. **Premier tour** : chacun parle **30 secondes** (sablier), accusateur, accusé, puis témoins. **Second tour** : chacun reparle 30 secondes.
5. On s’exprime **sans jamais mentir sur les faits** écrits sur sa carte, mais on peut taire des informations. Les cartes ne contiennent **que des faits** ; les **opinions et sentiments** sont libres : on peut les « arranger » pour faire gagner son camp.
6. Le juge n’a pas de questions préparées : c’est à lui de trouver la vérité. Il donne son avis sur l’affaire.
7. Tous lisent ensemble la carte **Débrief**.

### Points à garder en tête

- 4 témoins, 4 cartes de côté (2 accusateur + 2 accusé) : chaque témoin en pioche une, ce qui garantit 2 contre 2.
- Les témoins ont des faits neutres : le même fait peut servir l’un ou l’autre côté selon l’interprétation.
- Faits uniquement sur les cartes : pas de rubrique « avis » ou « sentiment », ce qui évite que la carte ne dicte la version à raconter.

## Que mettre sur chaque carte (guide de rédaction, notamment pour une IA)

Format de sortie : **JSON v2 uniquement** (voir plus bas ; le CSV n’existe plus). Une affaire = exactement 9 cartes. Écrire en français, phrases courtes, un fait par ligne (séparer par `\n` dans le JSON).

**Règle d’or : les cartes ne contiennent que des FAITS** (observable, vérifiable : ce qu’on a vu, entendu, fait, possédé, l’heure, le lieu). Jamais d’opinion, de sentiment, de jugement ni d’intention supposée (« il voulait nuire », « elle était jalouse »). Les joueurs inventent eux-mêmes opinions et sentiments, et peuvent les arranger pour faire gagner leur camp ; ils ne peuvent pas mentir sur les faits.

| Carte | Contenu attendu |
|---|---|
| `affaire` | `content` : ce qui s’est passé, neutre, 1-2 phrases. `accusation` : ce que l’accusateur reproche. `defense` : ce que l’accusé répond. Reste public et sans parti pris. |
| `juge` | `mission` et `steps` uniquement, identiques d’une affaire à l’autre (rôle de maître du jeu ; déroulé avec 2 tours de 30 s). **Pas de questions ni d’indices** : le juge cherche seul. |
| `accusateur` | `objective` : ce qu’il veut obtenir. `facts` : 3 faits qu’il connaît (dont au moins un qui l’arrange et un qui le dessert). |
| `accuse` | Idem `accusateur`, du point de vue de l’accusé. |
| `temoin` ×4 | `facts` : 2-3 faits vus ou entendus, **neutres** : chacun doit pouvoir servir l’accusateur *ou* l’accusé selon l’interprétation. Préciser ce que le témoin n’a pas vu. Les 4 témoins ont des faits différents et complémentaires. |
| `debrief` | Explications **courtes et claires**, lues à voix haute à la fin. `story` : ce qui s’est réellement passé, en 2-3 phrases. `mechanisms` : les mécanismes du conflit qui ont mené à cette issue, nommés (biais de confirmation, erreur d’attribution, communication absente, demande ignorée, escalade…) avec un exemple tiré de l’affaire. `ending` : l’issue et comment désamorcer en 1 phrase. |

Cohérence de l’affaire : les faits des 6 cartes (accusateur, accusé, 4 témoins) doivent former ensemble une histoire unique, sans contradiction ; chaque fait clé n’est détenu que par une ou deux personnes, pour obliger à s’écouter. La vérité complète n’apparaît que dans le débrief.

Limites : titre 48 caractères, rôle 32, texte 650 (280 pour l’affaire avec illustration, police réduite à 8 pt).

## Impression

Une affaire = une feuille A4 de 3 × 3 cartes de **70 × 99 mm**, suivie de sa feuille de versos ; à la fin, la feuille des cartes de côté. Dans la fenêtre d’impression : A4 portrait, échelle 100 %, **imprimer les arrière-plans**. Les filtres (affaire, famille, sélection) laissent les autres emplacements vides.

## Illustrations : dimensions et import

Seule la carte **Affaire** a une illustration (les autres faces manquent de place ; les logos ne sont que sur les dos).

- **Dimension parfaite : 1400 × 600 px (ratio 7:3), JPEG ou PNG.** Le cadre de la carte a ce ratio ; l’image y est affichée en `object-fit: cover`.
- Gardez le sujet au centre : tout import est recadré au centre au ratio 7:3.
- Formats acceptés : PNG, JPEG, WebP, GIF, SVG ; 15 Mo maximum avant conversion.

### Importer une image

1. `node server.js`, ouvrir http://localhost:8000.
2. Éditeur → carte Affaire → **Importer une image**.

L’image est recadrée au centre en 1400 × 600 JPEG et **enregistrée dans `atelier-cartes/uploads/illustrations/`** ; la carte référence `uploads/illustrations/nom.jpg`. Ce dossier se versionne et se transmet avec le projet. Sans serveur : le fichier est seulement téléchargé (voir plus haut).

### Pour une IA qui génère ou ajoute des images elle-même

Une IA n’a pas besoin de l’interface :

1. Créer l’image en **1400 × 600 px** (ratio 7:3, sujet centré, pas de texte près des bords), au format `.jpg`, `.png`, `.webp` ou `.svg` (SVG : `viewBox="0 0 1400 600"`).
2. L’enregistrer dans `atelier-cartes/uploads/illustrations/`. Nom : minuscules, chiffres, `-`, `_` ou `.` uniquement (ex. `dragon-grotte.jpg`).
3. La rattacher à une affaire : dans `atelier-cartes/js/data.js`, mettre `image: "uploads/illustrations/dragon-grotte.jpg"` sur la carte `affaire` (chemin relatif, sans `/` initial). Pour un grimoire JSON déjà exporté, mettre le même chemin dans `image` de la carte `affaire` **et** l’ajouter au tableau `uploads`.
4. Si le navigateur contient déjà un projet, utiliser « Réinitialiser le grimoire » ou réimporter le JSON : le projet local prime sur `data.js`.

Illustrations fournies : `atelier-cartes/assets/illustrations/` (CC0, openclipart).

## Sauvegarde et partage

- `localStorage` : clé `tribunal-du-chaos-atelier-v2`.
- **Exporter / importer le grimoire JSON** (barre latérale). L’export contient les textes et les **chemins** des images, pas les images : partagez aussi `uploads/illustrations/`.
- Format **v2 uniquement** : l’ancien format (carte « faits », 4 témoins sans côtés, CSV, images en base64) n’est plus lu.

## Format JSON (v2)

```json
{
  "version": 2,
  "settings": { "gameName": "", "subtitle": "", "accent": "#733b3b", "fontStyle": "ornate", "frameStyle": "double" },
  "uploads": ["uploads/illustrations/exemple.jpg"],
  "cases": [{
    "id": "slug-unique", "title": "", "summary": "", "color": "#7a2e2e",
    "cards": [
      { "id": "…", "type": "affaire", "title": "", "role": "", "image": "uploads/illustrations/exemple.jpg",
        "fields": { "content": "", "accusation": "", "defense": "" } }
    ]
  }]
}
```

Exactement 9 cartes par affaire : `affaire` ×1, `juge` ×1, `accusateur` ×1, `accuse` ×1, `temoin` ×4, `debrief` ×1. Champs par type :

- `affaire` : `content`, `accusation`, `defense`
- `juge` : `mission`, `steps`
- `accusateur` / `accuse` : `objective`, `facts`
- `temoin` : `facts`
- `debrief` : `story`, `mechanisms`, `ending`

`image` n’existe que sur `affaire` et doit être un chemin `assets/illustrations/…` ou `uploads/illustrations/…`. Couleurs en `#rrggbb`.

## Limites de texte conseillées

Titre 48 caractères, rôle 32, texte 650 (280 avec illustration). Les dépassements ne sont pas coupés, mais signalés dans l’éditeur.

## Se déplacer sur le site (pour un agent)

Page unique, sans routage : tout s’affiche dans `#app-content`. Navigation par les boutons `[data-view="…"]` de la barre latérale :

| `data-view` | Écran |
|---|---|
| `dashboard` | Bureau : statistiques, liste des affaires |
| `cases` | Registre des affaires (créer, dupliquer, supprimer) |
| `library` | Bibliothèque de toutes les cartes (recherche, filtres) |
| `customize` | Enluminures & dos : nom du jeu, accent, polices, cadres |
| `printing` | Impression A4 (affaire, famille, copies, recto/verso) |

L’éditeur s’ouvre avec `[data-action="open-case"]` (bouton « Ouvrir le dossier » d’une affaire) : liste des 9 cartes à gauche, formulaire `#case-form` et champs `field.<clé>` au centre, aperçu recto/verso à droite. Autres actions : `new-case`, `duplicate-case`, `delete-case`, `select-card`, `reset`. Pour tout automatiser sans interface, éditer `data.js` ou importer un JSON v2 (« Importer un grimoire »). Il n’y a pas d’import CSV.

## Notes pour les IA et contributeurs

- Code : [`data.js`](./atelier-cartes/js/data.js) (exemples), [`icons.js`](./atelier-cartes/js/icons.js) (logos des dos), [`storage.js`](./atelier-cartes/js/storage.js), [`app.js`](./atelier-cartes/js/app.js) (interface, aperçu, impression, import).
- Ne pas réintroduire de compatibilité avec l’ancien format.
- Pour ajouter une illustration fournie : déposer le fichier dans `assets/illustrations/` et l’ajouter à `illustrations` dans `data.js`.
