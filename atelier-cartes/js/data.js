// Données d'exemple et constantes du jeu (format v2 : 9 cartes par affaire).
(function () {
	const uid = () =>
		window.crypto && crypto.randomUUID
			? crypto.randomUUID()
			: "id-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
	const card = (type, title, role, fields) => ({ id: uid(), type, title, role, image: "", fields });

	const JUGE_MISSION =
		"Vous êtes le maître du jeu. Vous ne défendez personne : vous écoutez, vous cherchez la vérité, vous tranchez.";
	const JUGE_STEPS =
		"1. Lisez l’affaire à voix haute.\n2. Premier tour : chacun parle 30 secondes (sablier), accusateur, accusé, puis témoins.\n3. Second tour : chacun parle de nouveau 30 secondes.\n4. À vous de trouver la vérité : donnez votre avis sur l’affaire.\n5. Lisez ensemble la carte Débrief.";
	const juge = () => card("juge", "Le juge", "Maître du jeu", { mission: JUGE_MISSION, steps: JUGE_STEPS });

	const settings = {
		gameName: "Le Tribunal du Chaos",
		subtitle: "Chroniques du royaume et conflits en audience",
		accent: "#733b3b",
		fontStyle: "ornate",
		frameStyle: "double"
	};

	const cases = [
		{
			id: "linge-dragon",
			title: "Le dragon et le linge royal",
			color: "#7a2e2e",
			summary: "Un dragon est accusé d’avoir carbonisé le linge de son voisin après une querelle d’étendoir.",
			cards: [
				card("affaire", "Le royaume contre Brasier", "Audience publique", {
					content:
						"Trois draps ont brûlé sur la corde à linge de maître Aubépine, tout près de la grotte du dragon Brasier.",
					accusation: "Maître Aubépine accuse Brasier d’avoir soufflé sur le linge exprès.",
					defense: "Brasier affirme ne pas l’avoir fait exprès."
				}),
				juge(),
				card("accusateur", "Maître Aubépine, voisin lésé", "Accusateur", {
					objective: "Obtenir réparation et libérer l’entrée du jardin.",
					facts:
						"Trois draps sont noircis.\nVous avez entendu un grondement juste avant la fumée.\nVous aviez refusé de déplacer la corde à linge."
				}),
				card("accuse", "Brasier, dragon de la colline", "Accusé", {
					objective: "Vous disculper et sauver votre réputation.",
					facts:
						"Vous aviez demandé de déplacer la corde, près de votre entrée.\nVous avez éternué en sortant, le nez irrité par le pollen.\nUn bâton d’encens brûlait sous la fenêtre ce matin-là."
				}),
				card("temoin", "Pimprenelle, gardienne du jardin", "Témoin", {
					facts:
						"Vous avez vu une lueur près de la corde.\nLe vent soufflait vers l’étendoir.\nVous n’avez pas vu le départ du feu."
				}),
				card("temoin", "Le jeune écuyer", "Témoin", {
					facts:
						"Vous avez aperçu un éclat avant la fumée.\nL’encens brûlait sous la fenêtre.\nVous n’avez pas vu d’où venait l’éclat."
				}),
				card("temoin", "L’apprenti de la forge", "Témoin", {
					facts:
						"Vous avez entendu un bruit avant de voir la fumée.\nUne dispute à propos de la corde avait eu lieu la veille.\nVous ne voyiez ni Brasier ni le départ du feu."
				}),
				card("temoin", "La marchande d’encens", "Témoin", {
					facts:
						"Vous avez vendu un bâton d’encens au voisin.\nL’encens se consume avec une petite flamme.\nVous n’étiez pas présente lors de l’incident."
				}),
				card("debrief", "Après l’audience", "Débrief", {
					story:
						"L’encens du voisin, poussé par le vent, a enflammé la corde. Brasier a éternué en sortant, sans viser personne.",
					mechanisms:
						"Une demande ignorée (déplacer la corde) a nourri la rancune. Le grondement a été pris pour une menace : biais de confirmation.",
					ending: "Vérifier l’encens, déplacer la corde, discuter de la réparation."
				})
			]
		},
		{
			id: "balai-sorcieres",
			title: "Le balai des deux sorcières",
			color: "#2f4f7a",
			summary: "Deux sorcières revendiquent le même balai, retrouvé devant l’atelier de réparation.",
			cards: [
				card("affaire", "L’affaire du balai envolé", "Audience publique", {
					content:
						"Un balai sombre a été retrouvé dans le vestibule de l’atelier de réparation. Deux sorcières le réclament.",
					accusation: "Mirelda accuse Séléné de vouloir garder le balai qu’elle a acheté.",
					defense: "Séléné répond que c’est le sien, confié à l’artisan."
				}),
				juge(),
				card("accusateur", "Mirelda, sorcière collectionneuse", "Accusateur", {
					objective: "Récupérer le balai acheté au marché.",
					facts:
						"Votre facture décrit un modèle « Nuit-de-Chêne ».\nLe numéro de série figure sur votre reçu.\nVous avez acheté ce balai il y a trois jours."
				}),
				card("accuse", "Séléné, sorcière des marais", "Accusé", {
					objective: "Retrouver votre balai et prouver qu’il est à vous.",
					facts:
						"Vous utilisez ce balai depuis des années.\nVous l’avez confié à l’artisan pour réparation.\nUne marque en forme de lune se trouve sous la poignée."
				}),
				card("temoin", "Toupin, apprenti réparateur", "Témoin", {
					facts:
						"Vous avez déplacé un balai vers le vestibule.\nDeux balais sombres étaient sur l’établi.\nVous n’avez pas vérifié à qui il appartenait."
				}),
				card("temoin", "Maître Chardon, artisan", "Témoin", {
					facts:
						"Vous avez reçu un balai de Séléné à réparer.\nLes deux balais ont des gravures différentes.\nVous n’avez assisté à aucun achat."
				}),
				card("temoin", "La vendeuse du marché", "Témoin", {
					facts:
						"Vous avez vendu un balai à Mirelda.\nPlusieurs balais du même modèle étaient en vente.\nVous ne reconnaissez pas le balai de l’atelier."
				}),
				card("temoin", "Le coursier de l’atelier", "Témoin", {
					facts:
						"Vous avez apporté des étiquettes à l’atelier.\nUne étiquette était décollée près de l’établi.\nVous n’avez pas vu qui a déplacé les balais."
				}),
				card("debrief", "Après l’audience", "Débrief", {
					story:
						"Deux balais semblables étaient à l’atelier. L’apprenti a déplacé celui de Séléné, que Mirelda a pris pour le sien.",
					mechanisms:
						"Aucun dépôt n’était étiqueté. Chacune a supposé la mauvaise foi de l’autre sans comparer les preuves : erreur d’attribution.",
					ending: "Comparer gravure et facture, puis étiqueter chaque dépôt."
				})
			]
		},
		{
			id: "fantome-chateau",
			title: "Le fantôme trop bruyant",
			color: "#3f6a4a",
			summary: "Un fantôme est accusé de traverser volontairement les chambres du château la nuit.",
			cards: [
				card("affaire", "Les nuits agitées de Brumelune", "Audience publique", {
					content:
						"Depuis plusieurs nuits, des portes claquent et des pas résonnent dans les chambres du château.",
					accusation: "Dame Pivoine accuse le fantôme Brumelune de vouloir effrayer les habitants.",
					defense: "Brumelune assure qu’il ne veut effrayer personne."
				}),
				juge(),
				card("accusateur", "Dame Pivoine, châtelaine", "Accusateur", {
					objective: "Retrouver le calme pendant la nuit.",
					facts:
						"Trois portes ont claqué près de vos chambres.\nVous avez noté l’heure et le lieu de chaque bruit.\nLes bruits ont commencé après les travaux."
				}),
				card("accuse", "Brumelune, fantôme des galeries", "Accusé", {
					objective: "Être cru : vous n’avez jamais voulu effrayer personne.",
					facts:
						"Depuis les travaux, vous vous perdez dans les couloirs.\nVotre ancien repère était une porte bleue.\nVous êtes passé dans les chambres en cherchant votre galerie."
				}),
				card("temoin", "Ronce, veilleur de nuit", "Témoin", {
					facts:
						"Vous avez guidé Brumelune, perdu à un embranchement.\nL’escalier a changé de place.\nVous n’avez observé qu’une seule nuit."
				}),
				card("temoin", "Lise, chambrière", "Témoin", {
					facts:
						"Vous avez vu Brumelune ressortir d’une chambre en s’excusant.\nIl cherchait l’ancienne galerie.\nVous ignorez ce qu’il voulait faire."
				}),
				card("temoin", "Le maître des travaux", "Témoin", {
					facts:
						"Vous avez dirigé les travaux du château.\nL’escalier a été déplacé et une porte repeinte.\nVous n’avez pas observé le fantôme la nuit."
				}),
				card("temoin", "Le jardinier du château", "Témoin", {
					facts:
						"Vous arrosiez la cour près de la galerie.\nVous avez entendu une porte claquer.\nVous n’avez pas vu qui traversait les chambres."
				}),
				card("debrief", "Après l’audience", "Débrief", {
					story:
						"Les travaux ont déplacé l’escalier et repeint la porte bleue. Brumelune, désorienté, errait de chambre en chambre.",
					mechanisms:
						"Les habitants ont accusé sans se parler : le bruit a été pris pour de l’intention. Personne n’a demandé à Brumelune ce qu’il cherchait.",
					ending: "Baliser un trajet et réparer les portes bruyantes."
				})
			]
		}
	];

	["dragon.svg", "sorcier.svg", "porte-fantasy.svg"].forEach((file, index) => {
		cases[index].cards[0].image = "assets/illustrations/" + file;
	});

	window.TDC_DATA = {
		version: 2,
		settings,
		cases,
		uid,
		illustrations: [
			{ src: "assets/illustrations/dragon.svg", name: "Dragon" },
			{ src: "assets/illustrations/sorcier.svg", name: "Sorcier" },
			{ src: "assets/illustrations/chevalier.svg", name: "Chevalier en joute" },
			{ src: "assets/illustrations/porte-fantasy.svg", name: "Porte fantasy" }
		]
	};
})();
