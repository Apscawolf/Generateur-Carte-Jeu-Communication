const COLORS = {
	"Source du désaccord": { color: "#5c92da", short: "DÉBUT" },
	"Contexte fragilisant": { color: "#eea246", short: "FACTEUR" },
	"Stéréotypes / préjugés": { color: "#9670bf", short: "FACTEUR" },
	"Biais cognitifs": { color: "#65af83", short: "FACTEUR" },
	"Distorsions de pensée": { color: "#e7c547", short: "FACTEUR" },
	"Mécanismes de défense": { color: "#df6b61", short: "FACTEUR" },
	"Communication dysfonctionnelle": { color: "#486896", short: "FACTEUR" },
	"Besoins insatisfaits": { color: "#53b7b1", short: "FACTEUR" },
	"Postures relationnelles": { color: "#dd83a0", short: "FACTEUR" },
	"Karpman": { color: "#dd83a0", short: "FACTEUR" },
	"Moment charnière / FIN": { color: "#94a0a3", short: "FIN" },
	"FIN": { color: "#94a0a3", short: "FIN" }
};
const DEFAULT_COLORS = Object.fromEntries(Object.entries(COLORS).map(([key, value]) => [key, value.color]));
const COLOR_ALIASES = {
	debut: "Source du désaccord", début: "Source du désaccord", source: "Source du désaccord",
	facteur: "Contexte fragilisant", fin: "Moment charnière / FIN"
};
const EXAMPLE = [
	{ type: "DÉBUT", text: "Le groupe doit choisir entre finir vite ou produire quelque chose de très ambitieux, et...", category: "Source du désaccord", tone: "Objectifs différents" },
	{ type: "DÉBUT", text: "Après la même réunion, certains pensent que tout est clair tandis que d’autres estiment que rien n’a été décidé, et...", category: "Source du désaccord", tone: "Perceptions différentes" },
	{ type: "FACTEUR", text: "Tout doit finalement être décidé beaucoup plus vite que prévu, et la pression commence à monter...", category: "Contexte fragilisant", tone: "Contrainte : délai court" },
	{ type: "FACTEUR", text: "Quelqu’un remarque surtout les détails qui confirment qu’il avait raison depuis le début...", category: "Biais cognitifs", tone: "Biais de confirmation" },
	{ type: "FACTEUR", text: "Deux options deviennent soudain « ma solution ou une catastrophe »...", category: "Distorsions de pensée", tone: "Pensée dichotomique" },
	{ type: "FACTEUR", text: "Un problème signalé est balayé d’un « Ce n’est pas si important »...", category: "Mécanismes de défense", tone: "Minimisation" },
	{ type: "FACTEUR", text: "Chacun écoute surtout pour préparer sa prochaine réponse, plutôt que pour comprendre...", category: "Communication dysfonctionnelle", tone: "Mauvaise écoute" },
	{ type: "FACTEUR", text: "Une personne réclame davantage d’aide tandis qu’une autre souhaite surtout son autonomie...", category: "Besoins insatisfaits", tone: "Individuation" },
	{ type: "FIN", text: "Un détail fait naître un doute sur cette lecture. Peut-être faudrait-il revenir aux faits...", category: "Moment charnière / FIN", tone: "Retour possible aux faits" }
];

const input = document.querySelector("#data-input");
const preview = document.querySelector("#preview");
const printArea = document.querySelector("#print-area");
const message = document.querySelector("#message");
const cardCount = document.querySelector("#card-count");
const pageCount = document.querySelector("#page-count");
const status = document.querySelector("#status");
const gameName = document.querySelector("#game-name");
const mirrorBack = document.querySelector("#mirror-back");
const fileName = document.querySelector("#file-name");
const backSubtitle = document.querySelector("#back-subtitle");
const backFooter = document.querySelector("#back-footer");
let colorValues = { ...DEFAULT_COLORS };
const STORAGE_KEY = "atelier-cartes-settings";

function saveSettings() {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({
			data: input.value,
			gameName: gameName.value,
			backSubtitle: backSubtitle.value,
			backFooter: backFooter.value,
			mirrorBack: mirrorBack.checked,
			colors: colorValues
		}));
	} catch (error) {
		console.warn("Les réglages ne peuvent pas être sauvegardés dans ce navigateur.", error);
	}
}

function loadSettings() {
	try {
		const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
		if (!saved || typeof saved !== "object") return;
		if (typeof saved.data === "string") input.value = saved.data;
		if (typeof saved.gameName === "string") gameName.value = saved.gameName;
		if (typeof saved.backSubtitle === "string") backSubtitle.value = saved.backSubtitle;
		if (typeof saved.backFooter === "string") backFooter.value = saved.backFooter;
		if (typeof saved.mirrorBack === "boolean") mirrorBack.checked = saved.mirrorBack;
		if (saved.colors && typeof saved.colors === "object") {
			colorValues = { ...DEFAULT_COLORS, ...saved.colors };
		}
	} catch (error) {
		console.warn("Les réglages sauvegardés sont illisibles et ont été ignorés.", error);
	}
}

function escapeHtml(value) {
	return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}
function parseCsv(text) {
	const lines = text.trim().split(/\r?\n/).filter((line) => line.trim());
	if (lines.length < 2) throw new Error("Le CSV doit contenir une ligne d’en-têtes et au moins une carte.");
	const split = (line) => {
		const values = []; let value = ""; let quoted = false;
		for (const char of line) {
			if (char === '"') quoted = !quoted;
			else if (char === "," && !quoted) { values.push(value.trim()); value = ""; }
			else value += char;
		}
		values.push(value.trim());
		return values.map((item) => item.replace(/^"|"$/g, "").replace(/""/g, '"'));
	};
	const headers = split(lines.shift()).map((item) => item.toLowerCase());
	return lines.map((line) => Object.fromEntries(headers.map((header, index) => [header, split(line)[index] || ""])));
}
function normalize(value) {
	return String(value || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function resolveCategory(card, index) {
	const rawCategory = card.category || card.family || "";
	const categoryKey = Object.keys(COLORS).find((key) => normalize(key) === normalize(rawCategory));
	if (categoryKey) return categoryKey;
	const alias = COLOR_ALIASES[normalize(rawCategory)];
	if (alias) return alias;
	const type = normalize(card.type);
	if (type === "debut") return "Source du désaccord";
	if (type === "fin") return "Moment charnière / FIN";
	if (!rawCategory) throw new Error(`La carte ${index + 1} doit indiquer « category » (famille).`);
	throw new Error(`Famille inconnue à la carte ${index + 1} : « ${rawCategory} ». Vérifiez la légende.`);
}
function parseCards() {
	const raw = input.value.trim();
	if (!raw) throw new Error("Ajoutez des données avant de générer les cartes.");
	const cards = raw.startsWith("[") ? JSON.parse(raw) : parseCsv(raw);
	if (!Array.isArray(cards) || !cards.length) throw new Error("Les données doivent être un tableau contenant au moins une carte.");
	return cards.map((card, index) => {
		if (!card || typeof card !== "object" || !String(card.text || "").trim()) throw new Error(`La carte ${index + 1} n’a pas de champ « text ».`);
		const category = resolveCategory(card, index);
		const palette = COLORS[category];
		const expectedType = palette.short;
		return { type: expectedType, text: String(card.text).trim(), category, tone: card.tone || "", color: colorValues[category] };
	});
}
function cardMarkup(card, index, printable = false) {
	return `<article class="${printable ? "print-card" : "preview-card"}" style="--card-color:${card.color}" ${printable ? `data-game="${escapeHtml(gameName.value || "NOM DU JEU")}"` : ""}>
	  <div class="card-top"><div><span class="card-type">${escapeHtml(card.type)}</span><span class="card-family">${escapeHtml(card.category)}</span></div><span class="card-number">${String(index + 1).padStart(2, "0")}</span></div>
	  <div class="card-content"><span class="card-label">Situation</span><p class="card-text">${escapeHtml(card.text)}</p></div>
	  <small class="card-meta"><i class="card-dot"></i><span>${escapeHtml(card.tone || card.category)}</span></small>
  </article>`;
}
function pageMarkup(cards, start, back = false) {
	const pageCards = cards.slice(start, start + 9);
	if (back) return `<div class="print-page back-page${mirrorBack.checked ? " mirrored" : ""}">${pageCards.map(() => `<div class="print-card" data-game="${escapeHtml(gameName.value || "NOM DU JEU")}" style="--card-color:#e85d3c"><span class="back-mark">AC</span><span class="back-name">${escapeHtml(gameName.value || "NOM DU JEU")}</span><span class="back-subtitle">${escapeHtml(backSubtitle.value)}</span><span class="back-footer">${escapeHtml(backFooter.value)}</span></div>`).join("")}</div>`;
	return `<div class="print-page">${pageCards.map((card, index) => cardMarkup(card, start + index, true)).join("")}</div>`;
}
function render() {
	try {
		const cards = parseCards();
		const pages = Math.ceil(cards.length / 9);
		preview.innerHTML = cards.map((card, index) => cardMarkup(card, index)).join("");
		printArea.innerHTML = Array.from({ length: pages }, (_, page) => pageMarkup(cards, page * 9) + pageMarkup(cards, page * 9, true)).join("");
		cardCount.textContent = `${cards.length} carte${cards.length > 1 ? "s" : ""}`;
		pageCount.textContent = `${pages * 2} pages imprimées`;
		status.textContent = "Prêt à imprimer";
		status.style.color = "#4d916f";
		status.style.background = "#e9f4ec";
		message.classList.remove("visible");
	} catch (error) {
		preview.innerHTML = "";
		message.textContent = error.message;
		message.classList.add("visible");
		status.textContent = "Données à vérifier";
		status.style.color = "#a34a3d";
		status.style.background = "#fff0ec";
	}
	saveSettings();
}
function formatJson() {
	try { input.value = JSON.stringify(JSON.parse(input.value), null, 2); render(); }
	catch { render(); }
}
function renderLegend() {
	const legend = document.querySelector("#legend-items");
	const items = Object.entries(COLORS).filter(([name]) => !["FIN", "Karpman"].includes(name));
	legend.innerHTML = items.map(([name]) => `<label class="legend-item"><input type="color" data-category="${escapeHtml(name)}" value="${colorValues[name]}" /><span>${name}</span></label>`).join("");
	legend.querySelectorAll("input[type=color]").forEach((control) => control.addEventListener("input", (event) => {
		colorValues[event.target.dataset.category] = event.target.value;
		render();
	}));
}

input.value = JSON.stringify(EXAMPLE, null, 2);
loadSettings();
renderLegend();
render();
input.addEventListener("input", render);
gameName.addEventListener("input", render);
backSubtitle.addEventListener("input", render);
backFooter.addEventListener("input", render);
mirrorBack.addEventListener("change", render);
document.querySelector("#format-data").addEventListener("click", formatJson);
document.querySelector("#load-example").addEventListener("click", () => { input.value = JSON.stringify(EXAMPLE, null, 2); render(); });
document.querySelector("#print-cards").addEventListener("click", () => { render(); if (!message.classList.contains("visible")) window.print(); });
document.querySelector("#file-input").addEventListener("change", async (event) => {
	const file = event.target.files[0];
	if (!file) return;
	input.value = await file.text();
	fileName.textContent = file.name;
	if (file.name.toLowerCase().endsWith(".json")) formatJson(); else render();
});
document.querySelector("#clear-data").addEventListener("click", () => {
	input.value = "";
	fileName.textContent = "Aucun fichier sélectionné";
	render();
});
document.querySelector("#reset-colors").addEventListener("click", () => {
	colorValues = { ...DEFAULT_COLORS };
	renderLegend();
	render();
});
document.querySelector("#clear-settings").addEventListener("click", () => {
	localStorage.removeItem(STORAGE_KEY);
	fileName.textContent = "Aucun fichier sélectionné";
	input.value = JSON.stringify(EXAMPLE, null, 2);
	gameName.value = "NOM DU JEU";
	backSubtitle.value = "JEU DE COMMUNICATION";
	backFooter.value = "UN JEU POUR MIEUX ÉCHANGER";
	mirrorBack.checked = false;
	colorValues = { ...DEFAULT_COLORS };
	renderLegend();
	render();
});
