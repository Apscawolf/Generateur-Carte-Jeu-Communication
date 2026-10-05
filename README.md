# Atelier cartes — générateur A4

Petit site statique, sans installation ni serveur, pour transformer un fichier de cartes en pages imprimables. Ouvrez simplement `index.html` dans un navigateur.

## Impression

- Les cartes sont organisées en grille de **3 × 3 sur A4**.
- Pour chaque feuille, une page de rectos est suivie d’une page de dos.
- Dans la boîte d’impression du navigateur, choisissez le format **A4**, l’échelle **100 %** et désactivez les en-têtes et pieds de page.
- Imprimez en recto-verso. Si le verso est inversé avec votre imprimante, activez **Retourner les dos horizontalement**.
- Le bouton **Imprimer / PDF** permet aussi de choisir « Enregistrer au format PDF ».
- Les cartes occupent exactement un tiers de la largeur et de la hauteur d’une feuille A4 (70 × 99 mm), sans marge entre les 9 cases.
- Les couleurs de chaque famille sont modifiables directement dans la section **Couleurs par famille** ; **Réinitialiser** restaure la légende par défaut.
- Le dos est personnalisable avec un nom principal, un sous-titre et une mention libre.
- Les lettres du monogramme dans le cercle du dos sont également personnalisables (jusqu’à 4 caractères).
- L’éditeur indique maintenant précisément où apparaît chaque élément du dos : monogramme dans le cercle, texte sous le nom, et texte tout en bas.
- Les données, textes du dos, couleurs et réglages d’impression sont sauvegardés automatiquement dans le stockage local du navigateur. Ils restent sur l’ordinateur utilisé et peuvent être supprimés avec **Oublier mes réglages enregistrés**.
- Le bouton **Mode sombre** change uniquement l’interface du générateur ; les cartes et le PDF conservent leurs couleurs et leur apparence d’impression.
- L’aperçu utilise une structure fixe en trois zones (en-tête, contenu, concept) pour éviter que les textes et les indicateurs se chevauchent. Les textes trop longs sont raccourcis proprement avec une ellipse.
- L’aperçu ajoute un espacement vertical renforcé entre les rangées et reprend le rectangle décoratif en haut à droite dans les cartes du PDF.
- L’espacement vertical de l’aperçu est indépendant de la grille imprimée A4 : il sert uniquement à rendre la lecture à l’écran plus confortable.
- Les cartes ne sont pas numérotées : leur identité repose sur le type, la famille, la situation et le concept.
- Le recto imprimé utilise une bordure continue et un motif diagonal limité à l’en-tête. La taille du texte s’adapte automatiquement à la longueur de chaque situation afin d’éviter les lignes coupées.
- La barre supérieure reste visible pendant le défilement pour garder les actions principales accessibles.

## Format JSON recommandé

Le générateur attend un tableau. Seul `text` est obligatoire ; les autres champs rendent la carte plus précise.

```json
[
  {
    "type": "DÉBUT",
    "text": "Le groupe doit choisir entre finir vite ou produire quelque chose de très ambitieux, et...",
    "category": "Source du désaccord",
    "tone": "Objectifs différents"
  },
  {
    "type": "FACTEUR",
    "text": "La situation devient stressante et les réactions deviennent plus vives...",
    "category": "Contexte fragilisant",
    "tone": "Stress"
  },
  {
    "type": "FIN",
    "text": "Un détail fait naître un doute sur cette lecture. Peut-être faudrait-il revenir aux faits...",
    "category": "Moment charnière / FIN",
    "tone": "Retour possible aux faits"
  }
]
```

### Champs

| Champ      | Obligatoire | Utilité                                                          |
| ---------- | ----------- | ---------------------------------------------------------------- |
| `type`     | non         | Libellé affiché en haut de la carte (`DÉBUT`, `FACTEUR`, `FIN`). |
| `text`     | **oui**     | Texte imprimé sur la carte.                                      |
| `category` | non         | Famille et couleur de la carte.                                  |
| `tone`     | non         | Concept précis affiché en bas de la carte.                       |

Familles et couleurs reconnues : `Source du désaccord` (bleu), `Contexte fragilisant` (orange), `Stéréotypes / préjugés` (violet), `Biais cognitifs` (vert), `Distorsions de pensée` (jaune), `Mécanismes de défense` (rouge), `Communication dysfonctionnelle` (bleu foncé), `Besoins insatisfaits` (turquoise), `Postures relationnelles` (rose), `Moment charnière / FIN` (gris).

Le type imprimé est déterminé de manière fiable par la famille : `Source du désaccord` donne `DÉBUT`, les familles de facteurs donnent `FACTEUR`, et `Moment charnière / FIN` donne `FIN`. Une famille inconnue est refusée avec le numéro de la carte à corriger, au lieu d’être silencieusement remplacée par une autre couleur.

## Format CSV accepté

La première ligne doit contenir les en-têtes. Utilisez des guillemets si un texte contient une virgule.

```csv
type,text,category,tone
DÉBUT,"Le groupe doit choisir entre finir vite ou produire quelque chose de très ambitieux, et...",Source du désaccord,Objectifs différents
FACTEUR,"La situation devient stressante et les réactions deviennent plus vives...",Contexte fragilisant,Stress
```

## Structure

- `index.html` : interface et zone d’impression.
- `styles.css` : design, aperçu et règles `@media print`.
- `app.js` : parsing, validation, aperçu et génération des pages recto-verso.