(function () {
	"use strict";

	// ---------- Constantes du jeu ----------
	const IMAGE_SIZE = { width: 1400, height: 600 }; // ratio 7:3, cadre des illustrations
	const UPLOAD_DIR = "uploads/illustrations";
	const IMAGE_PATH = /^(assets|uploads)\/illustrations\/[\w.-]+\.(svg|png|jpe?g|webp|gif)$/i;
	const HEX = /^#[0-9a-f]{6}$/i;
	const CARD_ORDER = ["affaire", "juge", "accusateur", "accuse", "temoin", "debrief"];
	const REQUIRED_COUNT = { affaire: 1, juge: 1, accusateur: 1, accuse: 1, temoin: 4, debrief: 1 };
	const SIDE_COPIES = 2; // exemplaires de chaque carte de côté
	const SIDE_BACK_COLOR = "#3b3b44";
	const CARD_LIMITS = { title: 48, role: 32, body: 650, bodyWithImage: 280 };
	const FAMILY_COLORS = {
		affaire: "#733b3b",
		juge: "#5a4a82",
		accusateur: "#3d6684",
		accuse: "#8a4a2e",
		temoin: "#3f6a4a",
		debrief: "#806a35"
	};
	const BACK_LABELS = {
		affaire: "Affaire",
		juge: "Juge",
		accusateur: "Accusateur",
		accuse: "Accusé",
		temoin: "Témoin",
		debrief: "Débrief"
	};
	const ICONS = window.TDC_ICONS;
	const BUILTIN = window.TDC_DATA.illustrations;

	const TYPES = {
		affaire: {
			label: "Affaire",
			fields: [
				["content", "Contexte public", ""],
				["accusation", "Reproche de l’accusateur", "Accusation"],
				["defense", "Réponse de l’accusé", "Défense"]
			]
		},
		juge: {
			label: "Juge",
			fields: [
				["mission", "Mission du juge (maître du jeu)", "Mission"],
				["steps", "Déroulé de la partie", "Déroulé"]
			]
		},
		accusateur: {
			label: "Accusateur",
			fields: [
				["objective", "Objectif (faire gagner l’accusation)", "Objectif"],
				["facts", "Faits connus — ne jamais mentir dessus", "Faits"]
			]
		},
		accuse: {
			label: "Accusé",
			fields: [
				["objective", "Objectif (faire gagner la défense)", "Objectif"],
				["facts", "Faits connus — ne jamais mentir dessus", "Faits"]
			]
		},
		temoin: { label: "Témoin", fields: [["facts", "Faits connus — ne jamais mentir dessus", ""]] },
		debrief: {
			label: "Débrief",
			fields: [
				["story", "Version réelle de l’histoire", "Histoire"],
				["mechanisms", "Mécanismes menant à cette issue", "Mécanismes"],
				["ending", "Issue de l’affaire", "Issue"]
			]
		}
	};

	// Cartes tirées par les témoins pour connaître leur côté
	const SIDE_CARDS = [
		{
			type: "accusateur",
			title: "Côté de l’accusateur",
			text: "Vous soutenez l’ACCUSATEUR.\n\nFaites-le gagner : ne mentez jamais sur les faits de votre carte, mais vous pouvez arranger vos opinions et vos sentiments, et taire ce qui le dessert."
		},
		{
			type: "accuse",
			title: "Côté de l’accusé",
			text: "Vous soutenez l’ACCUSÉ.\n\nFaites-le gagner : ne mentez jamais sur les faits de votre carte, mais vous pouvez arranger vos opinions et vos sentiments, et taire ce qui le dessert."
		}
	];

	// ---------- État ----------
	const content = document.getElementById("app-content");
	const title = document.getElementById("page-title");
	const project = window.TDC_STORAGE.load(validateProject);
	const images = window.TDC_STORAGE.loadImages();
	const ui = {
		view: "dashboard",
		caseId: project.cases[0] && project.cases[0].id,
		cardId: null,
		preview: "front",
		library: { search: "", type: "", caseId: "" },
		print: { caseId: "all", type: "", copies: 1, duplex: true, flip: false, sides: true, selected: [] }
	};
	let toastTimer;

	// ---------- Utilitaires ----------
	const esc = (value) =>
		String(value == null ? "" : value).replace(
			/[&<>"']/g,
			(ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]
		);
	const uid = window.TDC_DATA.uid;
	const getCase = (id) => project.cases.find((item) => item.id === id);
	const getCard = (id) => project.cases.flatMap((item) => item.cards).find((card) => card.id === id);
	const caseOf = (card) => project.cases.find((item) => item.cards.some((entry) => entry.id === card.id));
	const allCards = () => project.cases.flatMap((item) => item.cards.map((card) => ({ card, item })));
	const typeLabel = (type) => (TYPES[type] ? TYPES[type].label : "Carte");
	const safeColor = (value, fallback) => (HEX.test(value || "") ? value : fallback);
	const frameStyle = () => (project.settings.frameStyle === "simple" ? "simple" : "double");
	const cardText = (card) =>
		Object.values(card.fields || {})
			.filter(Boolean)
			.join("\n\n");
	const imgTag = (path, className) =>
		`<img class="${className}" src="${esc(path)}" data-path="${esc(path)}" alt="">`;

	function validateProject(data) {
		const fail = () => {
			throw new Error("Format du grimoire non reconnu (version 2 attendue : 9 cartes par affaire).");
		};
		if (
			!data ||
			data.version !== 2 ||
			!Array.isArray(data.cases) ||
			!data.settings ||
			typeof data.settings !== "object"
		)
			fail();
		if (
			data.uploads !== undefined &&
			!(Array.isArray(data.uploads) && data.uploads.every((path) => IMAGE_PATH.test(path)))
		)
			fail();
		const ids = new Set();
		data.cases.forEach((item) => {
			if (
				!item ||
				typeof item.id !== "string" ||
				ids.has(item.id) ||
				typeof item.title !== "string" ||
				!HEX.test(item.color) ||
				!Array.isArray(item.cards) ||
				item.cards.length !== 9
			)
				fail();
			ids.add(item.id);
			Object.entries(REQUIRED_COUNT).forEach(([type, count]) => {
				if (item.cards.filter((card) => card && card.type === type).length !== count) fail();
			});
			item.cards.forEach((card) => {
				if (
					!card ||
					typeof card.id !== "string" ||
					ids.has(card.id) ||
					typeof card.title !== "string" ||
					typeof card.role !== "string" ||
					!card.fields ||
					typeof card.fields !== "object" ||
					Array.isArray(card.fields) ||
					!Object.values(card.fields).every((v) => typeof v === "string")
				)
					fail();
				if (card.image && (card.type !== "affaire" || !IMAGE_PATH.test(card.image))) fail();
				ids.add(card.id);
			});
		});
		data.uploads = data.uploads || [];
	}

	function notify(message, error) {
		const node = document.getElementById("toast");
		node.textContent = message;
		node.style.background = error ? "#6c3430" : "";
		node.classList.add("show");
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => node.classList.remove("show"), error ? 6000 : 3500);
	}
	function persist() {
		try {
			window.TDC_STORAGE.save(project);
			return true;
		} catch (error) {
			notify(error.message, true);
			return false;
		}
	}
	function applyTheme() {
		document.documentElement.style.setProperty(
			"--card-accent",
			safeColor(project.settings.accent, "#733b3b")
		);
		document.documentElement.style.setProperty(
			"--display",
			project.settings.fontStyle === "classic" ? "Georgia, serif" : '"Cinzel", Georgia, serif'
		);
	}

	// ---------- Longueur des textes ----------
	function cardLength(card) {
		const body = cardText(card).length;
		const limit = card.image ? CARD_LIMITS.bodyWithImage : CARD_LIMITS.body;
		const warnings = [];
		if (card.title.length > CARD_LIMITS.title)
			warnings.push(`Titre : ${card.title.length}/${CARD_LIMITS.title}.`);
		if (card.role.length > CARD_LIMITS.role) warnings.push(`Rôle : ${card.role.length}/${CARD_LIMITS.role}.`);
		if (body > limit) warnings.push(`Texte : ${body}/${limit}${card.image ? " avec illustration" : ""}.`);
		return { body, limit, warnings };
	}
	function lengthStatus(card) {
		const r = cardLength(card);
		const summary = `Titre ${card.title.length}/${CARD_LIMITS.title} · rôle ${card.role.length}/${CARD_LIMITS.role} · texte ${r.body}/${r.limit}`;
		return `<div id="card-length-status" class="length-status ${r.warnings.length ? "length-warning" : "length-ok"}" role="${r.warnings.length ? "alert" : "status"}">${r.warnings.length ? "⚠ À RACCOURCIR — " + esc(r.warnings.join(" ")) : esc(summary) + " — dans les limites."}</div>`;
	}

	// ---------- Cartes : recto et verso ----------
	function frontBody(card) {
		return TYPES[card.type].fields
			.map(([key, , short]) => {
				const value = (card.fields[key] || "").trim();
				return value ? (short ? `<span class="sec">${esc(short)}</span>\n` : "") + esc(value) : "";
			})
			.filter(Boolean)
			.join("\n\n");
	}
	// mode : "preview" (écran) ou "print" (impression) ; les classes CSS sont préfixées en conséquence.
	// extra permet de remplacer le média et le texte (cartes de côté).
	function frontMarkup(card, mode, extra) {
		const print = mode === "print",
			p = print ? "print-card" : "preview";
		const frame = print ? "print-illustration-frame" : "illustration-frame";
		let media = "";
		if (extra) media = extra.media;
		else if (card.type === "affaire" && card.image)
			media = `<div class="${frame}">${imgTag(card.image, print ? "print-card-image" : "preview-image")}</div>`;
		const body = extra ? esc(extra.text) : frontBody(card) || "Le texte de la carte apparaîtra ici.";
		const inner = `<div class="${print ? "print-card-inner" : "card-preview-inner"} frame-${frameStyle()}" style="--family-color:${FAMILY_COLORS[card.type]}"><div class="card-ornament">⚖</div><div class="${p}-kind">${esc(typeLabel(card.type))}</div><div class="${p}-title">${esc(card.title || "Sans titre")}</div>${media}<div class="${print ? "print-card-content" : "preview-text"}${media && !extra ? " with-image" : ""}">${body}</div><div class="${p}-role">${esc(card.role || typeLabel(card.type))}</div></div>`;
		return print ? `<div class="print-card">${inner}</div>` : `<div class="card-preview">${inner}</div>`;
	}
	function sideFrontMarkup(side, mode) {
		const card = { type: side.type, title: side.title, role: "Carte de côté", image: "", fields: {} };
		return frontMarkup(card, mode, {
			media: `<div class="side-icon">${ICONS[side.type]}</div>`,
			text: side.text
		});
	}
	function backMarkup(type, color, mode) {
		const label = type === "side" ? "Témoin" : BACK_LABELS[type];
		const icon = ICONS[type === "side" ? "temoin" : type];
		const face = `<div class="back-face" style="--back-color:${safeColor(color, "#3b3b44")}"><div class="back-inner"><span class="back-icon">${icon}</span><strong>${esc(label)}</strong><small>${esc(project.settings.gameName)}</small></div></div>`;
		return mode === "print"
			? `<div class="print-card print-card-back">${face}</div>`
			: `<div class="card-preview preview-back">${face}</div>`;
	}
	function cardPreview(card, item) {
		if (!card) return `<div class="empty-state">Choisissez une carte pour en voir l’aperçu.</div>`;
		const warnings = cardLength(card).warnings.slice();
		if (!card.title) warnings.push("Ajoutez un titre.");
		const html =
			ui.preview === "back" ? backMarkup(card.type, item.color, "preview") : frontMarkup(card, "preview");
		return html + (warnings.length ? `<div class="preview-warning">${esc(warnings.join(" "))}</div>` : "");
	}
	function previewPanelHtml(card, item) {
		return `<div><h3>Aperçu du sceau</h3>${cardPreview(card, item)}<div class="preview-switch">
<button class="button button-small ${ui.preview === "front" ? "button-gold" : ""}" data-action="preview-side" data-side="front">Recto</button>
<button class="button button-small ${ui.preview === "back" ? "button-gold" : ""}" data-action="preview-side" data-side="back">Verso</button>
</div></div>`;
	}

	// ---------- Vues ----------
	function isComplete(item) {
		return item.cards.every((card) => card.title && Object.values(card.fields).some((v) => v.trim()));
	}
	function caseCard(item) {
		const art = (item.cards.find((card) => card.type === "affaire") || {}).image;
		return `<article class="case-card" style="border-top:5px solid ${safeColor(item.color, "#733b3b")}">${art ? imgTag(art, "case-card-image") : ""}<span class="type-label">${isComplete(item) ? "dossier préparé" : "à compléter"}</span>
<h3>${esc(item.title)}</h3><p>${esc(item.summary || "Aucun résumé pour le moment.")}</p>
<p class="case-meta">${item.cards.length} cartes · ${art ? "illustré" : "sans illustration"}</p>
<div class="case-actions">
<button class="button button-small" data-action="open-case" data-id="${esc(item.id)}">Ouvrir le dossier</button>
<button class="button button-small" data-action="duplicate-case" data-id="${esc(item.id)}">Dupliquer</button>
<button class="button button-small button-danger" data-action="delete-case" data-id="${esc(item.id)}">Supprimer</button>
</div></article>`;
	}
	function renderDashboard() {
		const cards = project.cases.length * 9;
		return `<section class="hero"><div><span class="eyebrow">LES ARCHIVES DU ROYAUME</span>
<h2>Chaque conflit a plus d’une version.</h2>
<p>Composez des affaires, distribuez les faits et préparez les débats. Les dossiers restent dans votre navigateur ; exportez-les pour les partager.</p>
</div><div class="hero-mark" aria-hidden="true"><span class="balance-mark">⚖</span></div></section>
		<div class="stat-grid"><div class="stat"><span class="stat-symbol">▤</span><div><strong>${project.cases.length}</strong><span>affaires au registre</span></div></div><div class="stat"><span class="stat-symbol">♧</span><div><strong>${cards}</strong><span>cartes consignées</span></div></div><div class="stat"><span class="stat-symbol">✥</span><div><strong>${project.cases.filter(isComplete).length}</strong><span>dossiers complets</span></div></div></div>
		<div class="section-heading"><div><h2>Affaires en cours</h2><p>Une affaire = 9 cartes. Les 4 cartes de côté des témoins sont ajoutées à l’impression.</p></div><button class="button button-gold" data-action="new-case">＋ Sceller une affaire</button></div>
		<div class="case-grid">${project.cases.length ? project.cases.map(caseCard).join("") : `<div class="empty-state">Le registre est vierge. Ouvrez une nouvelle affaire pour commencer.</div>`}</div>
		<hr class="ornament-rule"><div class="form-actions">
<button class="button" data-view="library">Parcourir la bibliothèque</button>
<button class="button" data-view="printing">Préparer l’impression A4</button>
<button class="button button-danger" data-action="reset">Réinitialiser le grimoire</button></div>`;
	}
	function renderCases() {
		return `<div class="section-heading"><div><h2>Registre des affaires</h2>
<p>Dupliquez un dossier pour créer une variante sans toucher à l’original.</p></div>
<button class="button button-gold" data-action="new-case">＋ Nouvelle affaire</button></div>
<div class="case-grid">${project.cases.length ? project.cases.map(caseCard).join("") : `<div class="empty-state">Aucune affaire n’a été créée.</div>`}</div>`;
	}
	function fieldControl(key, label, value) {
		return `<div class="field full"><label for="field-${esc(key)}">${esc(label)}</label>
<textarea id="field-${esc(key)}" name="field.${esc(key)}" rows="4">${esc(value || "")}</textarea>
</div>`;
	}
	function cardListHtml(item, active) {
		return item.cards
			.map(
				(card) =>
					`<button class="card-list-item ${active && card.id === active.id ? "active" : ""}" data-action="select-card" data-id="${esc(card.id)}"><strong>${esc(card.title || "Sans titre")}</strong><small>${esc(typeLabel(card.type))} · ${esc(card.role || "sans rôle")}</small>${cardLength(card).warnings.length ? `<span class="length-badge">⚠ à raccourcir</span>` : ""}</button>`
			)
			.join("");
	}
	function imageOptions(current) {
		const known = [
			...BUILTIN.map((entry) => [entry.src, entry.name]),
			...project.uploads.map((path) => [path, "Importée : " + path.split("/").pop()])
		];
		return `<option value="">Aucune illustration</option>${known.map(([src, name]) => `<option value="${esc(src)}" ${src === current ? "selected" : ""}>${esc(name)}</option>`).join("")}`;
	}
	function renderEditor() {
		const item = getCase(ui.caseId);
		if (!item) return `<div class="empty-state">Choisissez ou créez une affaire dans le registre.</div>`;
		let active = item.cards.find((card) => card.id === ui.cardId) || item.cards[0];
		ui.cardId = active.id;
		const left = `<section class="panel"><h3>Jeu de 9 cartes</h3>
<p class="muted">1 affaire · 1 juge · 1 accusateur · 1 accusé · 4 témoins · 1 débrief</p>
<div class="card-list">${cardListHtml(item, active)}</div></section>`;
		const caseForm = `<form id="case-form" class="panel"><h3>Identification de l’affaire</h3>
<div class="field-grid"><div class="field full"><label for="case-title">Titre de l’affaire</label>
<input id="case-title" name="case.title" value="${esc(item.title)}" required></div>
<div class="field full"><label for="case-summary">Résumé</label>
<textarea id="case-summary" name="case.summary" rows="2">${esc(item.summary)}</textarea></div>
<div class="field full"><label for="case-color">Couleur du dos des cartes de cette affaire</label>
<input id="case-color" type="color" name="case.color" value="${esc(safeColor(item.color, "#733b3b"))}">
</div></div><div class="form-actions">
<button type="button" class="button button-small" data-action="duplicate-case" data-id="${esc(item.id)}">Dupliquer le dossier</button>
<button type="button" class="button button-small button-danger" data-action="delete-case" data-id="${esc(item.id)}">Supprimer le dossier</button>
</div></form>`;
		const imageControls =
			active.type === "affaire"
				? `<div class="field full"><label for="card-image">Illustration (cadre 7:3, voir README)</label>
<div class="image-control">
<select id="card-image" name="card.image">${imageOptions(active.image)}</select>
<input type="file" accept="image/*" data-image-card="${esc(active.id)}" aria-label="Importer une image">
</div></div>`
				: "";
		const cardForm = `<form id="card-form" class="panel">
<h3>Graver une carte</h3>${lengthStatus(active)}<div class="field-grid"><div class="field full">
<label>Famille de carte</label>
<span>${esc(typeLabel(active.type))} — dossier : ${esc(item.title)}</span></div><div class="field">
<label for="card-title">Titre</label>
<input id="card-title" name="card.title" value="${esc(active.title)}"></div><div class="field">
<label for="card-role">Rôle ou catégorie</label>
<input id="card-role" name="card.role" value="${esc(active.role)}">
</div>${TYPES[active.type].fields.map(([key, label]) => fieldControl(key, label, active.fields[key])).join("")}${imageControls}</div>
</form>`;
		return `<div class="section-heading"><div><h2>${esc(item.title)}</h2>
<p>Les cartes ne contiennent que des faits : les opinions et sentiments sont libres.</p></div>
<button class="button" data-view="cases">Retour aux affaires</button></div>
<div class="editor-layout">${left}<div style="display:grid;gap:14px">${caseForm}${cardForm}</div>
<section class="panel preview-panel">${previewPanelHtml(active, item)}</section></div>`;
	}
	function renderLibrary() {
		const f = ui.library,
			q = f.search.toLowerCase();
		const cards = allCards().filter(
			({ card, item }) =>
				(!q || `${card.title} ${card.role} ${cardText(card)} ${item.title}`.toLowerCase().includes(q)) &&
				(!f.type || card.type === f.type) &&
				(!f.caseId || item.id === f.caseId)
		);
		return `<div class="section-heading"><div><h2>Bibliothèque des cartes</h2>
<p>${cards.length} résultat(s) · recherche dans les titres, rôles et textes.</p></div></div>
		<div class="toolbar"><div class="toolbar-control"><label for="lib-search">Recherche</label><input id="lib-search" value="${esc(f.search)}" placeholder="Un personnage, un fait…"></div><div class="toolbar-control"><label for="lib-type">Type</label><select id="lib-type"><option value="">Tous les types</option>${Object.entries(
			TYPES
		)
			.map(
				([key, value]) =>
					`<option value="${key}" ${f.type === key ? "selected" : ""}>${esc(value.label)}</option>`
			)
			.join("")}</select></div><div class="toolbar-control"><label for="lib-case">Affaire</label>
<select id="lib-case">
<option value="">Toutes les affaires</option>${project.cases.map((item) => `<option value="${esc(item.id)}" ${f.caseId === item.id ? "selected" : ""}>${esc(item.title)}</option>`).join("")}</select>
</div></div>
		<div class="library-list">${
			cards
				.map(
					({ card, item }) => `<article class="library-row"><div>
<h3>${esc(card.title || "Sans titre")} <span class="type-label">· ${esc(typeLabel(card.type))}</span>
</h3><p>${esc(item.title)} · ${esc(card.role || "sans rôle")}</p></div>
<span>${esc((Object.values(card.fields).find(Boolean) || "").slice(0, 85))}</span>
<div class="row-actions">
<button class="button button-small" data-action="edit-library-card" data-id="${esc(card.id)}">Modifier</button>
<button class="button button-small" data-action="print-one" data-id="${esc(card.id)}">Imprimer</button>
</div>
</article>`
				)
				.join("") || `<div class="empty-state">Aucune carte ne correspond aux filtres.</div>`
		}</div>`;
	}
	function backGallery() {
		const specimens = CARD_ORDER.map(
			(type) =>
				`<figure>${backMarkup(type, safeColor((project.cases[0] || {}).color, "#733b3b"), "preview")}<figcaption>${esc(BACK_LABELS[type])}</figcaption></figure>`
		).join("");
		return `${specimens}<figure>${backMarkup("side", SIDE_BACK_COLOR, "preview")}<figcaption>Cartes de côté</figcaption></figure>`;
	}
	function renderCustomize() {
		const s = project.settings;
		return `<div class="section-heading"><div><h2>Enluminures &amp; dos de cartes</h2>
<p>Une couleur de dos par affaire (réglable dans le dossier) et un logo par famille de carte.</p></div>
</div>
		<div class="customize-layout"><div style="display:grid;gap:14px"><form id="settings-form" class="panel"><h3>Identité du jeu</h3><div class="field-grid">
			<div class="field full"><label for="game-name">Nom du jeu</label><input id="game-name" name="settings.gameName" value="${esc(s.gameName)}"></div>
			<div class="field full"><label for="subtitle">Sous-titre</label><input id="subtitle" name="settings.subtitle" value="${esc(s.subtitle)}"></div>
			<div class="field"><label for="accent">Couleur des ornements</label><input id="accent" type="color" name="settings.accent" value="${esc(safeColor(s.accent, "#733b3b"))}"></div>
			<div class="field"><label for="frame-style">Cadre</label><select id="frame-style" name="settings.frameStyle"><option value="double" ${frameStyle() === "double" ? "selected" : ""}>Double enluminure</option><option value="simple" ${frameStyle() === "simple" ? "selected" : ""}>Filet simple</option></select></div>
			<div class="field"><label for="font-style">Typographie des titres</label><select id="font-style" name="settings.fontStyle"><option value="ornate" ${s.fontStyle !== "classic" ? "selected" : ""}>Gothique enluminée</option><option value="classic" ${s.fontStyle === "classic" ? "selected" : ""}>Livre ancien</option></select></div>
		</div><p class="muted">Format physique : 70 × 99 mm, 9 cartes par feuille A4.</p></form>
</div>
		<section class="panel"><h3>Les dos des cartes</h3><div class="back-gallery">${backGallery()}</div></section></div>`;
	}

	// ---------- Impression ----------
	function caseSlots(item) {
		const o = ui.print;
		const slots = Array(9).fill(null);
		item.cards
			.slice()
			.sort((a, b) => CARD_ORDER.indexOf(a.type) - CARD_ORDER.indexOf(b.type))
			.forEach((card, index) => {
				if ((!o.selected.length || o.selected.includes(card.id)) && (!o.type || card.type === o.type))
					slots[index] = { kind: "card", card, color: item.color };
			});
		return slots;
	}
	function printGroups() {
		const o = ui.print,
			groups = [];
		project.cases
			.filter((item) => o.caseId === "all" || item.id === o.caseId)
			.forEach((item) => {
				const slots = caseSlots(item);
				if (!slots.some(Boolean)) return;
				for (let copy = 0; copy < o.copies; copy++) groups.push({ title: item.title, slots });
			});
		if (o.sides && !o.selected.length && !o.type) {
			const slots = Array(9).fill(null);
			SIDE_CARDS.forEach((side, s) => {
				for (let n = 0; n < SIDE_COPIES; n++) slots[s * SIDE_COPIES + n] = { kind: "side", side };
			});
			groups.push({ title: "Cartes de côté des témoins", slots });
		}
		return groups;
	}
	const mirrored = (slots, flip) =>
		Array.from({ length: 9 }, (_, i) => slots[flip ? Math.floor(i / 3) * 3 + (2 - (i % 3)) : i]);
	function slotFront(slot) {
		if (!slot) return `<div class="print-card print-blank"></div>`;
		return slot.kind === "side" ? sideFrontMarkup(slot.side, "print") : frontMarkup(slot.card, "print");
	}
	function slotBack(slot) {
		if (!slot) return `<div class="print-card print-blank"></div>`;
		return slot.kind === "side"
			? backMarkup("side", SIDE_BACK_COLOR, "print")
			: backMarkup(slot.card.type, slot.color, "print");
	}
	function printPages(groups) {
		return groups
			.map(
				(group) =>
					`<section class="print-sheet">${group.slots.map(slotFront).join("")}</section>${ui.print.duplex ? `<section class="print-sheet">${mirrored(group.slots, ui.print.flip).map(slotBack).join("")}</section>` : ""}`
			)
			.join("");
	}
	function miniBack(slot) {
		if (!slot) return `<div class="mini-card mini-blank"></div>`;
		const type = slot.kind === "side" ? "temoin" : slot.card.type;
		return `<div class="mini-card back-mini" style="--back-color:${slot.kind === "side" ? SIDE_BACK_COLOR : safeColor(slot.color, "#3b3b44")}"><span class="mini-icon">${ICONS[type]}</span></div>`;
	}
	function renderPrinting() {
		const o = ui.print,
			groups = printGroups();
		const label = (slot) =>
			slot.kind === "side"
				? [slot.side.title, "Carte de côté"]
				: [slot.card.title, typeLabel(slot.card.type)];
		const mini = (slot) =>
			slot
				? `<div class="mini-card"><strong>${esc(label(slot)[0])}</strong><small>${esc(label(slot)[1])}</small></div>`
				: `<div class="mini-card mini-blank"></div>`;
		return `<div class="section-heading"><div><h2>Impression au format du jeu</h2>
<p>Une affaire par feuille A4 (9 cartes de 70 × 99 mm), puis une feuille pour les 4 cartes de côté des témoins.</p>
</div><button class="button button-gold" data-action="do-print">Imprimer / Exporter PDF</button></div>
		<div class="toolbar"><div class="toolbar-control"><label for="print-case">Affaire</label>
<select id="print-case">
<option value="all" ${o.caseId === "all" ? "selected" : ""}>Toutes les affaires</option>${project.cases.map((item) => `<option value="${esc(item.id)}" ${o.caseId === item.id ? "selected" : ""}>${esc(item.title)}</option>`).join("")}</select>
</div><div class="toolbar-control"><label for="print-type">Famille de cartes</label>
<select id="print-type"><option value="">Toutes les cartes</option>${Object.entries(TYPES)
			.map(
				([key, value]) =>
					`<option value="${key}" ${o.type === key ? "selected" : ""}>${esc(value.label)}</option>`
			)
			.join(
				""
			)}</select></div><div class="toolbar-control"><label for="print-copies">Exemplaires de chaque affaire</label><input type="number" id="print-copies" min="1" max="30" value="${o.copies}"></div><label><input id="print-sides" type="checkbox" ${o.sides ? "checked" : ""}> Ajouter les cartes de côté</label><label><input id="print-duplex" type="checkbox" ${o.duplex ? "checked" : ""}> Générer les versos</label><label><input id="print-flip" type="checkbox" ${o.flip ? "checked" : ""}> Retourner horizontalement les versos</label></div>
		<details class="panel"><summary>Sélectionner des cartes précises (facultatif)</summary><div class="select-cards">${allCards()
			.map(
				({ card }) =>
					`<label><input type="checkbox" data-print-card="${esc(card.id)}" ${o.selected.includes(card.id) ? "checked" : ""}> ${esc(card.title)} <span class="muted">· ${esc(typeLabel(card.type))}</span></label>`
			)
			.join(
				""
			)}</div><button class="button button-small" data-action="clear-print-selection">Effacer la sélection</button></details>
		<div class="section-heading"><div><h2>Aperçu des feuilles</h2><p>${groups.length} feuille(s) de cartes · ${groups.length * (o.duplex ? 2 : 1)} page(s)</p></div><span class="type-label">A4 · 210 × 297 mm</span></div>
		<div class="print-preview">${
			groups.length
				? groups
						.map(
							(group) => `<div>
<div class="sheet-caption">${esc(group.title)} · recto</div>
<div class="sheet-preview">${group.slots.map(mini).join("")}</div>${
								o.duplex
									? `<div class="sheet-caption">Verso correspondant</div>
<div class="sheet-preview">${mirrored(group.slots, o.flip).map(miniBack).join("")}</div>`
									: ""
							}</div>`
						)
						.join("")
				: `<div class="empty-state">Aucune carte à imprimer avec ces critères.</div>`
		}</div>
<div id="print-output">${printPages(groups)}</div>`;
	}

	// ---------- Navigation ----------
	function render() {
		applyTheme();
		const renderers = {
			dashboard: renderDashboard,
			cases: renderCases,
			editor: renderEditor,
			library: renderLibrary,
			customize: renderCustomize,
			printing: renderPrinting
		};
		content.innerHTML = (renderers[ui.view] || renderDashboard)();
		const out = document.getElementById("print-output");
		if (out) out.classList.toggle("hidden", ui.view !== "printing");
	}
	function setView(view) {
		ui.view = view;
		document
			.querySelectorAll(".nav-link")
			.forEach((button) =>
				button.classList.toggle("active", button.dataset.view === (view === "editor" ? "cases" : view))
			);
		const labels = {
			dashboard: "Bureau du greffier",
			cases: "Dossiers d’affaires",
			editor: "Édition de l’affaire",
			library: "Bibliothèque des cartes",
			customize: "Enluminures & dos",
			printing: "Imprimer les cartes"
		};
		title.textContent = labels[view] || labels.dashboard;
		render();
	}

	// ---------- Affaires ----------
	// Couleur de dos unique par affaire : teintes espacées de l'angle d'or (137,5°), donc jamais deux fois la même
	// teinte proche, même avec des dizaines d'affaires ; la luminosité alterne pour distinguer davantage.
	function hslToHex(h, s, l) {
		s /= 100;
		l /= 100;
		const k = (n) => (n + h / 30) % 12,
			f = (n) => l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
		return (
			"#" +
			[f(0), f(8), f(4)]
				.map((x) =>
					Math.round(x * 255)
						.toString(16)
						.padStart(2, "0")
				)
				.join("")
		);
	}
	function nextCaseColor() {
		const used = new Set(project.cases.map((item) => item.color.toLowerCase()));
		for (let i = project.cases.length; i < project.cases.length + 500; i++) {
			const color = hslToHex((i * 137.508) % 360, 52, [34, 28, 40][i % 3]);
			if (!used.has(color)) return color;
		}
		return "#733b3b";
	}
	function blankCard(type, name, role) {
		return { id: uid(), type, title: name, role, image: "", fields: {} };
	}
	function newCase() {
		const item = {
			id: uid(),
			title: "Nouvelle affaire",
			summary: "",
			color: nextCaseColor(),
			cards: [
				blankCard("affaire", "L’affaire", "Audience publique"),
				blankCard("juge", "Le juge", "Maître du jeu"),
				blankCard("accusateur", "L’accusateur", "Accusateur"),
				blankCard("accuse", "L’accusé", "Accusé"),
				...[1, 2, 3, 4].map((n) => blankCard("temoin", `Témoin ${n}`, "Témoin")),
				blankCard("debrief", "Débrief", "Débrief")
			]
		};
		const model = project.cases[0] && project.cases[0].cards.find((card) => card.type === "juge");
		if (model) {
			const juge = item.cards[1];
			juge.fields = { mission: model.fields.mission || "", steps: model.fields.steps || "" };
		}
		project.cases.push(item);
		ui.caseId = item.id;
		ui.cardId = item.cards[0].id;
		ui.preview = "front";
		persist();
		setView("editor");
	}
	function duplicateCase(id) {
		const original = getCase(id);
		if (!original) return;
		const copy = window.TDC_STORAGE.clone(original);
		copy.id = uid();
		copy.title += " — copie";
		copy.color = nextCaseColor();
		copy.cards.forEach((card) => {
			card.id = uid();
		});
		project.cases.push(copy);
		ui.caseId = copy.id;
		ui.cardId = copy.cards[0].id;
		const saved = persist();
		setView("editor");
		if (saved) notify("Le dossier a été dupliqué.");
	}
	function deleteCase(id) {
		const item = getCase(id);
		if (!item || !confirm(`Supprimer « ${item.title} » et ses ${item.cards.length} cartes ?`)) return;
		project.cases = project.cases.filter((entry) => entry.id !== id);
		ui.caseId = project.cases[0] && project.cases[0].id;
		ui.cardId = null;
		const saved = persist();
		setView(project.cases.length ? "cases" : "dashboard");
		if (saved) notify("Dossier supprimé.");
	}

	// ---------- Export / import du grimoire ----------
	function download(filename, blob) {
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = filename;
		link.click();
		setTimeout(() => URL.revokeObjectURL(link.href), 1000);
	}
	function exportProject() {
		const safeName =
			(project.settings.gameName || "grimoire")
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-|-$/g, "") || "grimoire";
		download(`${safeName}.json`, new Blob([JSON.stringify(project, null, 2)], { type: "application/json" }));
		notify("Export créé. Les images restent dans uploads/illustrations/ : joignez ce dossier.");
	}
	function importProject(text) {
		const incoming = JSON.parse(text);
		validateProject(incoming);
		if (
			!confirm(
				"Remplacer le projet actuel par le grimoire importé ? Exportez d’abord votre projet si vous souhaitez le conserver."
			)
		)
			return;
		window.TDC_STORAGE.save(incoming, true);
		Object.assign(project, incoming);
		ui.caseId = project.cases[0] && project.cases[0].id;
		ui.cardId = null;
		setView("dashboard");
		notify("Grimoire importé avec succès.");
	}
	function resetProject() {
		if (
			!confirm(
				"Réinitialiser le projet local et recharger les trois affaires d’exemple ? Pensez à exporter vos travaux avant."
			)
		)
			return;
		try {
			localStorage.removeItem(window.TDC_STORAGE.KEY);
		} catch (error) {
			notify("Impossible d’effacer les données locales : " + error.message, true);
			return;
		}
		window.location.reload();
	}

	// ---------- Import d’illustrations ----------
	function loadBitmap(file) {
		return new Promise((resolve, reject) => {
			const url = URL.createObjectURL(file),
				img = new Image();
			img.onload = () => {
				URL.revokeObjectURL(url);
				resolve(img);
			};
			img.onerror = () => {
				URL.revokeObjectURL(url);
				reject(new Error("Image illisible."));
			};
			img.src = url;
		});
	}
	// Recadre au centre au ratio 7:3 et exporte en JPEG 1400 × 600 : l’image remplit exactement le cadre.
	async function normalizeImage(file) {
		const img = await loadBitmap(file);
		const sw = img.naturalWidth || IMAGE_SIZE.width,
			sh = img.naturalHeight || IMAGE_SIZE.height;
		const scale = Math.max(IMAGE_SIZE.width / sw, IMAGE_SIZE.height / sh);
		const canvas = document.createElement("canvas");
		canvas.width = IMAGE_SIZE.width;
		canvas.height = IMAGE_SIZE.height;
		const ctx = canvas.getContext("2d");
		ctx.fillStyle = "#fff";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(
			img,
			(canvas.width - sw * scale) / 2,
			(canvas.height - sh * scale) / 2,
			sw * scale,
			sh * scale
		);
		const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
		if (!blob) throw new Error("Conversion impossible.");
		return blob;
	}
	const toDataUrl = (blob) =>
		new Promise((resolve, reject) => {
			const r = new FileReader();
			r.onload = () => resolve(r.result);
			r.onerror = reject;
			r.readAsDataURL(blob);
		});
	async function importIllustration(file, card) {
		if (!file.type.startsWith("image/")) throw new Error("Choisissez un fichier image.");
		if (file.size > 15 * 1024 * 1024) throw new Error("Image trop volumineuse (15 Mo maximum).");
		const blob = await normalizeImage(file);
		const base =
			file.name
				.replace(/\.[^.]+$/, "")
				.toLowerCase()
				.normalize("NFD")
				.replace(/[\u0300-\u036f]/g, "")
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-|-$/g, "")
				.slice(0, 40) || "image";
		const name = `${base}-${Date.now().toString(36)}.jpg`;
		let path = `${UPLOAD_DIR}/${name}`,
			how = "download";
		try {
			// serveur local (node server.js) : enregistrement automatique dans uploads/illustrations
			const response = await fetch(`api/upload?name=${encodeURIComponent(name)}`, {
				method: "POST",
				headers: { "Content-Type": "image/jpeg" },
				body: blob
			});
			if (response.ok) {
				path = (await response.json()).path;
				how = "server";
			}
		} catch (error) {
			/* pas de serveur d'upload : on passe aux solutions de repli */
		}
		if (how === "download") download(name, blob); // 2. repli : téléchargement manuel
		images[path] = await toDataUrl(blob);
		window.TDC_STORAGE.saveImages(images);
		project.uploads.push(path);
		card.image = path;
		persist();
		render();
		notify(
			how === "download"
				? `Image téléchargée seulement : placez « ${name} » dans atelier-cartes/${UPLOAD_DIR}/ (ou lancez node server.js pour l’enregistrement automatique).`
				: `Image enregistrée dans atelier-cartes/${UPLOAD_DIR}/.`
		);
	}
	// ---------- Saisie ----------
	function updateField(target) {
		const dot = target.name.indexOf(".");
		const scope = target.name.slice(0, dot),
			key = target.name.slice(dot + 1);
		const card = getCard(ui.cardId),
			item = getCase(ui.caseId);
		if (scope === "case" && item)
			item[key] = key === "color" ? safeColor(target.value, "#733b3b") : target.value;
		else if (scope === "card" && card) {
			if (key === "image") card.image = IMAGE_PATH.test(target.value) ? target.value : "";
			else card[key] = target.value;
		} else if (scope === "field" && card) card.fields[key] = target.value;
		else if (scope === "settings") project.settings[key] = target.value;
		persist();
		if (scope === "settings") {
			applyTheme();
			return;
		}
		const panel = document.querySelector(".preview-panel");
		if (panel && card) panel.innerHTML = previewPanelHtml(card, item);
		const status = document.getElementById("card-length-status");
		if (status && card) status.outerHTML = lengthStatus(card);
		const list = document.querySelector(".card-list");
		if (list && item) list.innerHTML = cardListHtml(item, card);
	}
	function handleAction(button) {
		const { action, id } = button.dataset;
		const actions = {
			"new-case": newCase,
			"open-case": () => {
				ui.caseId = id;
				ui.cardId = null;
				setView("editor");
			},
			"duplicate-case": () => duplicateCase(id),
			"delete-case": () => deleteCase(id),
			"select-card": () => {
				const item = getCase(ui.caseId);
				if (item && item.cards.some((card) => card.id === id)) {
					ui.cardId = id;
					ui.preview = "front";
					render();
				}
			},
			"preview-side": () => {
				ui.preview = button.dataset.side;
				render();
			},
			"edit-library-card": () => {
				const item = project.cases.find((entry) => entry.cards.some((card) => card.id === id));
				ui.caseId = item.id;
				ui.cardId = id;
				setView("editor");
			},
			export: exportProject,
			reset: resetProject,
			"do-print": () => window.print(),
			"clear-print-selection": () => {
				ui.print.selected = [];
				render();
			},
			"print-one": () => {
				ui.print.selected = [id];
				ui.print.caseId = "all";
				ui.print.type = "";
				setView("printing");
			}
		};
		if (actions[action]) actions[action]();
	}

	document.addEventListener("click", (event) => {
		const viewButton = event.target.closest("[data-view]");
		if (viewButton) {
			event.preventDefault();
			setView(viewButton.dataset.view);
			return;
		}
		const actionButton = event.target.closest("[data-action]");
		if (actionButton) {
			event.preventDefault();
			handleAction(actionButton);
		}
	});
	document.addEventListener("input", (event) => {
		const target = event.target;
		if (/^(case|card|field|settings)\./.test(target.name || "") && target.tagName !== "SELECT")
			updateField(target);
		if (target.id === "lib-search") {
			ui.library.search = target.value;
			render();
			const input = document.getElementById("lib-search");
			input.focus();
			input.setSelectionRange(input.value.length, input.value.length);
		}
	});
	document.addEventListener("change", (event) => {
		const target = event.target,
			o = ui.print;
		if (/^(case|card|field|settings)\./.test(target.name || "") && target.tagName === "SELECT") {
			updateField(target);
			if (target.name === "card.image") render();
			return;
		}
		const handlers = {
			"lib-type": () => {
				ui.library.type = target.value;
			},
			"lib-case": () => {
				ui.library.caseId = target.value;
			},
			"print-case": () => {
				o.caseId = target.value;
			},
			"print-type": () => {
				o.type = target.value;
			},
			"print-copies": () => {
				o.copies = Math.max(1, Math.min(30, Number(target.value) || 1));
			},
			"print-sides": () => {
				o.sides = target.checked;
			},
			"print-duplex": () => {
				o.duplex = target.checked;
			},
			"print-flip": () => {
				o.flip = target.checked;
			}
		};
		if (handlers[target.id]) {
			handlers[target.id]();
			render();
		} else if (target.dataset.printCard) {
			const id = target.dataset.printCard;
			o.selected = target.checked
				? [...new Set([...o.selected, id])]
				: o.selected.filter((entry) => entry !== id);
			render();
		} else if (target.dataset.imageCard) {
			const file = target.files && target.files[0],
				card = getCard(target.dataset.imageCard);
			if (file && card)
				importIllustration(file, card).catch((error) => notify("Import impossible : " + error.message, true));
			target.value = "";
		} else if (target.id === "import-file") {
			const file = target.files && target.files[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onerror = () => notify("Impossible de lire le fichier.", true);
			reader.onload = () => {
				try {
					importProject(reader.result);
				} catch (error) {
					notify("Import impossible : " + error.message, true);
				} finally {
					target.value = "";
				}
			};
			reader.readAsText(file);
		}
	});
	// Si le fichier d’une image importée n’est pas (encore) dans uploads/, on utilise la copie locale.
	document.addEventListener(
		"error",
		(event) => {
			const img = event.target;
			if (
				img.tagName === "IMG" &&
				img.dataset.path &&
				images[img.dataset.path] &&
				img.src !== images[img.dataset.path]
			)
				img.src = images[img.dataset.path];
		},
		true
	);

	setView("dashboard");
	if (window.TDC_STORAGE_LOAD_ERROR)
		notify(
			"Le projet local est illisible ou d’un ancien format : importez un grimoire v2 ou réinitialisez.",
			true
		);
})();
