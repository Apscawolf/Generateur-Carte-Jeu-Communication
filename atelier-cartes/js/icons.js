// Logos des dos de cartes : SVG originaux 64×64, dessinés pour ce projet (aucune licence externe).
(function () {
	const svg = (body) =>
		`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
	const GOLD = "#f0d48a",
		CREAM = "#fff3d2",
		RED = "#d9604c",
		BLUE = "#7fb6d8",
		GREEN = "#8fcf8f";

	window.TDC_ICONS = {
		// Affaire : marteau de juge
		affaire: svg(
			`<g transform="rotate(-35 32 32)"><rect x="14" y="10" width="36" height="16" rx="4" fill="${GOLD}" stroke="${CREAM}" stroke-width="1.5"/><rect x="10" y="12" width="6" height="12" rx="2" fill="${RED}"/><rect x="48" y="12" width="6" height="12" rx="2" fill="${RED}"/><rect x="29" y="26" width="6" height="30" rx="2.5" fill="${CREAM}"/></g><rect x="8" y="54" width="30" height="5" rx="2.5" fill="${GOLD}"/>`
		),
		// Juge : le tribunal (fronton et colonnes)
		juge: svg(
			`<path d="M6 24 32 8l26 16z" fill="${GOLD}" stroke="${CREAM}" stroke-width="1.5" stroke-linejoin="round"/><g fill="${CREAM}"><rect x="12" y="28" width="7" height="22" rx="1.5"/><rect x="28.5" y="28" width="7" height="22" rx="1.5"/><rect x="45" y="28" width="7" height="22" rx="1.5"/></g><rect x="8" y="51" width="48" height="5" rx="2" fill="${GOLD}"/><rect x="5" y="57" width="54" height="4" rx="2" fill="${RED}"/>`
		),
		// Accusateur : casque de chevalier
		accusateur: svg(
			`<path d="M16 58V28c0-12 7-20 16-20s16 8 16 20v30z" fill="${BLUE}" stroke="${CREAM}" stroke-width="2" stroke-linejoin="round"/><rect x="16" y="26" width="32" height="5" fill="#16232b"/><rect x="29.5" y="26" width="5" height="26" fill="#16232b"/><path d="M32 8c3-6 12-6 14-1-4-1-9 0-14 1z" fill="${RED}"/><circle cx="24" cy="44" r="1.6" fill="${CREAM}"/><circle cx="40" cy="44" r="1.6" fill="${CREAM}"/>`
		),
		// Accusé : épée
		accuse: svg(
			`<path d="M32 3l5 8v31H27V11z" fill="${CREAM}" stroke="${GOLD}" stroke-width="1.5" stroke-linejoin="round"/><path d="M32 8v34" stroke="#b9ac86" stroke-width="1.5"/><rect x="14" y="42" width="36" height="6" rx="3" fill="${GOLD}"/><rect x="28.5" y="48" width="7" height="10" rx="2" fill="${RED}"/><circle cx="32" cy="60" r="3.4" fill="${GOLD}"/>`
		),
		// Témoin : œil
		temoin: svg(
			`<path d="M3 32C12 18 22 12 32 12s20 6 29 20C52 46 42 52 32 52S12 46 3 32z" fill="${CREAM}" stroke="${GOLD}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="32" cy="32" r="11" fill="${GREEN}" stroke="#2f5a3a" stroke-width="2"/><circle cx="32" cy="32" r="5" fill="#16232b"/><circle cx="35.5" cy="28.5" r="2" fill="#fff"/>`
		),
		// Débrief : balance
		debrief: svg(
			`<rect x="30" y="8" width="4" height="46" rx="2" fill="${CREAM}"/><rect x="18" y="54" width="28" height="5" rx="2.5" fill="${GOLD}"/><circle cx="32" cy="8" r="4" fill="${GOLD}"/><path d="M8 18h48" stroke="${GOLD}" stroke-width="3.5" stroke-linecap="round"/><path d="M8 18 1 38h14zM56 18l-7 20h14z" fill="none" stroke="${CREAM}" stroke-width="1.6" stroke-linejoin="round"/><path d="M1 38c0 8 14 8 14 0zM49 38c0 8 14 8 14 0z" fill="${GOLD}"/>`
		)
	};
})();
