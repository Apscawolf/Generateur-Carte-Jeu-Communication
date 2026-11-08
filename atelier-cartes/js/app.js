(function () {
  const TYPES = {
    affaire: { label: "Affaire", fields: [["content","Contexte public"],["facts","Faits connus"],["interpretations","Interprétations possibles"]] },
    accusateur: { label: "Accusateur", fields: [["objective","Objectif du joueur"],["available","Informations disponibles"],["evidence","Éléments qu’il peut présenter"],["interpretation","Interprétation personnelle"],["unknown","Ce qu’il ne connaît pas"]] },
    accuse: { label: "Accusé", fields: [["objective","Objectif du joueur"],["content","Version des événements"],["available","Informations disponibles"],["evidence","Éléments de défense"],["unknown","Ce qu’il ne connaît pas"]] },
    temoin: { label: "Témoin", fields: [["content","Version du témoin"],["facts","Faits directement observés"],["indirect","Informations indirectes"],["interpretation","Interprétations personnelles"],["reliability","Fiabilité du témoignage"]] },
    faits: { label: "Faits & indices", fields: [["established","Faits établis"],["uncertain","Éléments incertains"],["questions","Questions à vérifier"]] },
    jury: { label: "Jury", fields: [["mission","Mission des jurés"],["content","Consignes complémentaires"]] },
    verdict: { label: "Verdict", fields: [["certain","Faits certains"],["unproven","Faits non prouvés"],["mechanism","Mécanisme pédagogique principal"],["secondary","Mécanismes secondaires"],["explanation","Explication pédagogique"],["takeaway","Éléments à retenir"]] },
    debrief: { label: "Débrief", fields: [["origin","Origine du désaccord"],["aggravating","Facteurs aggravants"],["bias","Biais ou distorsions"],["needs","Besoins éventuellement menacés"],["deescalation","Pistes de désamorçage"],["question","Question finale"]] }
  };
  const content = document.getElementById("app-content");
  const title = document.getElementById("page-title");
  const project = window.TDC_STORAGE.load();
  delete project.legacyExamples;
  const CORE_CARD_TYPES = ["affaire","accusateur","accuse","faits","jury","verdict","debrief"];
  const CARD_LIMITS = { title:48, role:32, body:650, bodyWithImage:450 };
  const BUILTIN_ILLUSTRATIONS = window.TDC_DATA.illustrations || [];
  const ui = { view:"dashboard", caseId:project.cases[0] && project.cases[0].id, cardId:null, preview:"front", library:{ search:"", type:"", caseId:"", role:"", concept:"", illustrated:false }, print:{ caseId:"all", type:"", copies:1, duplex:true, flip:false, selected:[] } };
  let toastTimer;
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
  const getCase = id => project.cases.find(item => item.id === id);
  const getCard = id => project.cases.flatMap(item => item.cards).find(card => card.id === id);
  const allCards = () => project.cases.flatMap(item => item.cards.map(card => ({ ...card, image:card.type === "affaire" ? (card.image || item.image) : "", caseId:item.id, caseTitle:item.title })));
  const hasIllustration = card => !!(card && card.type === "affaire" && (card.image || project.cases.some(item => item.image && item.cards.some(entry => entry.id === card.id))));
  const isAllowedImage = image => !image || String(image).startsWith("data:image/") || BUILTIN_ILLUSTRATIONS.some(entry => entry.src === image);
  const safeColor = (value, fallback) => /^#[0-9a-f]{6}$/i.test(value || "") ? value : fallback;
  const familyColor = card => safeColor(project.settings.familyColors && project.settings.familyColors[card.type], "#846838");
  const imagePosition = value => ["center","top","bottom","left","right"].includes(value) ? value : "center";
  const frameStyle = () => project.settings.frameStyle === "simple" ? "simple" : "double";
  function emblemMarkup(value, className) {
    return `<span class="${className}">${esc(value || "⚖")}</span>`;
  }
  if ("cardTheme" in project.settings) {
    delete project.settings.cardTheme;
    persist();
  }
  function applyTheme() {
    document.documentElement.style.setProperty("--card-accent", safeColor(project.settings.accent,"#733b3b"));
    document.documentElement.style.setProperty("--display", project.settings.fontStyle === "classic" ? "Georgia, serif" : '"Cinzel", Georgia, serif');
  }
  function applyEmblem() {
    const sample=document.querySelector(".back-sample .emblem");
    if(sample) sample.outerHTML=emblemMarkup(project.settings.emblem,"emblem");
  }
  function pedagogicalConcepts(card) {
    return ["mechanism","secondary","bias"].flatMap(key => String(card.fields && card.fields[key] || "").split(/[\n;,]/).map(value => value.trim().replace(/[.]$/,"")).filter(Boolean));
  }
  function cardLength(card) {
    const body = Object.values(card.fields || {}).filter(Boolean).join("\n\n").length;
    const illustrated = hasIllustration(card);
    const bodyLimit = illustrated ? CARD_LIMITS.bodyWithImage : CARD_LIMITS.body;
    const warnings = [];
    if (String(card.title || "").length > CARD_LIMITS.title) warnings.push(`Titre : ${String(card.title).length}/${CARD_LIMITS.title} caractères.`);
    if (String(card.role || "").length > CARD_LIMITS.role) warnings.push(`Rôle : ${String(card.role).length}/${CARD_LIMITS.role} caractères.`);
    if (body > bodyLimit) warnings.push(`Texte : ${body}/${bodyLimit} caractères${illustrated ? " avec illustration" : ""}.`);
    return { body, bodyLimit, warnings };
  }
  function lengthStatus(card) {
    if (!card) return "";
    const result = cardLength(card);
    const summary = `Titre ${String(card.title || "").length}/${CARD_LIMITS.title} · rôle ${String(card.role || "").length}/${CARD_LIMITS.role} · texte ${result.body}/${result.bodyLimit}`;
    return `<div id="card-length-status" class="length-status ${result.warnings.length ? "length-warning" : "length-ok"}" role="${result.warnings.length ? "alert" : "status"}">${result.warnings.length ? `⚠ À RACCOURCIR — ${result.warnings.join(" ")}` : `${summary} caractères — dans les limites conseillées.`}</div>`;
  }
  function oversizedCards() {
    return allCards().map(card => ({card,warnings:cardLength(card).warnings})).filter(entry=>entry.warnings.length);
  }
  function refreshLengthWarnings() {
    content.querySelectorAll(".card-list-item").forEach(button=>{
      const card=getCard(button.dataset.id), warnings=card && cardLength(card).warnings;
      const badge=button.querySelector(".length-badge");
      if(badge) badge.remove();
      if(warnings && warnings.length) button.insertAdjacentHTML("beforeend",`<span class="length-badge">⚠ ${esc(warnings.join(" "))}</span>`);
    });
    const warnings=oversizedCards();
    let alert=content.querySelector(".length-alert");
    if(!warnings.length){if(alert)alert.remove();return;}
    if(!alert){alert=document.createElement("section");alert.className="length-alert";alert.setAttribute("role","alert");content.prepend(alert);}
    alert.innerHTML=`<strong>⚠ ${warnings.length} carte(s) à raccourcir avant impression</strong><ul>${warnings.slice(0,5).map(entry=>`<li><button data-action="edit-library-card" data-id="${esc(entry.card.id)}">${esc(entry.card.title||"Sans titre")}</button> — ${esc(entry.warnings.join(" "))}</li>`).join("")}</ul>${warnings.length>5?`<p>Et ${warnings.length-5} autre(s) carte(s).</p>`:""}`;
  }
  const countCards = () => project.cases.reduce((count, item) => count + item.cards.length, 0);
  function notify(message, error) {
    const node = document.getElementById("toast");
    node.textContent = message;
    node.style.background = error ? "#6c3430" : "";
    node.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove("show"), 3200);
  }
  function persist() {
    try {
      window.TDC_STORAGE.save(project);
    } catch (error) {
      notify(error.message, true);
    }
  }
  function migrateExampleCases() {
    const witnesses = {
      "linge-dragon": ["Le jeune écuyer", { content:"Vous avez aperçu un éclat près de la corde avant l’arrivée de la fumée.", facts:"Le vent poussait vers l’étendoir. Vous n’avez pas vu qui a produit la flamme.", indirect:"Vous avez entendu dire que Brasier avait éternué.", interpretation:"Vous avez d’abord pensé à une étincelle de la forge.", reliability:"Vous avez vu la lueur mais pas son origine." }],
      "balai-sorcieres": ["Maître Chardon, artisan", { content:"Vous avez reçu un balai de Séléné pour réparer son manche, puis un second balai semblable pour estimation.", facts:"Les deux objets sont de la même essence mais leurs gravures diffèrent.", indirect:"Mirelda a présenté sa facture après le déplacement des balais.", interpretation:"Vous pensez qu’une erreur d’étiquetage est possible.", reliability:"Vous avez inspecté les objets, mais pas assisté à leur achat." }],
      "fantome-chateau": ["Lise, chambrière", { content:"Vous avez entendu des chaînes dans le corridor puis vu Brumelune ressortir en s’excusant.", facts:"La porte de votre chambre a claqué et le fantôme semblait chercher son chemin.", indirect:"Une autre personne dit avoir entendu un rire au même moment.", interpretation:"Vous avez cru à une farce avant de voir sa confusion.", reliability:"Vous avez observé un passage, pas les autres nuits." }]
    };
    project.cases.forEach(item => {
      if (!witnesses[item.id]) return;
      if (!item.cards.some(card => card.type === "faits")) item.cards.push({ id:crypto.randomUUID(), type:"faits", title:"Faits et indices", role:"Repères de l’enquête", image:"", fields:{ established:item.context || "", uncertain:item.disagreement || "", questions:"Que sait-on directement ? Qu’est-ce qui reste à vérifier ?" } });
      if (item.cards.filter(card => card.type === "temoin").length < 2) {
        const [name, fields] = witnesses[item.id];
        item.cards.push({ id:crypto.randomUUID(), type:"temoin", title:name, role:"Témoin facultatif", image:"", fields });
      }
      const order = [...CORE_CARD_TYPES.slice(0,3),"faits","temoin","temoin",...CORE_CARD_TYPES.slice(4)];
      item.cards.sort((a,b) => order.indexOf(a.type)-order.indexOf(b.type));
    });
  }
  if (!Array.isArray(project.migrations) || !project.migrations.includes("nine-card-deck")) {
    migrateExampleCases();
    project.migrations = [...(project.migrations || []), "nine-card-deck"];
    persist();
  }
  if (!Array.isArray(project.migrations) || !project.migrations.includes("shortened-fantasy-examples")) {
    const previousExamples = window.TDC_DATA.legacyExamples || [];
    const currentExamples = window.TDC_DATA.cases || [];
    project.cases.forEach(item => {
      const previous = previousExamples.find(example => example.id === item.id);
      const current = currentExamples.find(example => example.id === item.id);
      if (!previous || !current || ["title","summary","context","disagreement"].some(key => item[key] !== previous[key])) return;
      if (!item.image && current.image) {
        item.image = current.image;
      }
      item.cards.forEach(card => {
        const oldCard = previous.cards.find(example => example.type === card.type && example.title === card.title && example.role === card.role);
        const newCard = current.cards.find(example => example.type === card.type && example.title === card.title && example.role === card.role);
        if (!oldCard || !newCard || JSON.stringify(card.fields) !== JSON.stringify(oldCard.fields)) return;
        card.fields = window.TDC_STORAGE.clone(newCard.fields);
        if (!card.image && card.type === "affaire" && newCard.image) card.image = newCard.image;
      });
    });
    project.migrations = [...(project.migrations || []), "shortened-fantasy-examples"];
    persist();
  }
  if (!Array.isArray(project.migrations) || !project.migrations.includes("case-only-illustration")) {
    project.cases.forEach(item => item.cards.forEach(card => {
      if (card.type !== "affaire") card.image = "";
    }));
    project.migrations = [...(project.migrations || []), "case-only-illustration"];
    persist();
  }
  function typeLabel(type) { return TYPES[type] ? TYPES[type].label : "Carte"; }
  function setView(view) {
    ui.view = view;
    document.querySelectorAll(".nav-link").forEach(button => button.classList.toggle("active", button.dataset.view === view));
    const labels = { dashboard:"Bureau du greffier", cases:"Dossiers d’affaires", editor:"Édition de l’affaire", library:"Bibliothèque des cartes", customize:"Enluminures & dos", printing:"Imprimer les cartes" };
    title.textContent = labels[view] || labels.dashboard;
    render();
  }
  function caseCard(item) {
    const complete = item.cards.some(card => card.type === "affaire") && item.cards.some(card => card.type === "verdict") && item.cards.some(card => card.type === "debrief");
    return `<article class="case-card">${item.image ? `<img class="case-card-image" src="${esc(item.image)}" alt="">` : ""}<span class="type-label">Dossier ${esc(item.id.slice(0,8))} · ${complete ? "dossier préparé" : "à compléter"}</span><h3>${esc(item.title)}</h3><p>${esc(item.summary || item.disagreement || "Aucun résumé pour le moment.")}</p><p class="case-meta">${item.cards.length} carte(s) · ${item.image ? "illustré" : "sans illustration"}</p><div class="case-actions"><button class="button button-small" data-action="open-case" data-id="${esc(item.id)}">Ouvrir le dossier</button><button class="button button-small" data-action="duplicate-case" data-id="${esc(item.id)}">Dupliquer</button><button class="button button-small button-danger" data-action="delete-case" data-id="${esc(item.id)}">Supprimer</button></div></article>`;
  }
  function renderDashboard() {
    return `<section class="hero"><div><span class="eyebrow">LES ARCHIVES DU ROYAUME</span><h2>Chaque conflit a plus d’une version.</h2><p>Composez des affaires, distribuez les informations et préparez les débats. Les dossiers restent ici, à l’abri des regards du royaume.</p></div><div class="hero-mark" aria-hidden="true">${emblemMarkup(project.settings.emblem,"balance-mark")}</div></section>
      <div class="stat-grid"><div class="stat"><span class="stat-symbol">▤</span><div><strong>${project.cases.length}</strong><span>affaires au registre</span></div></div><div class="stat"><span class="stat-symbol">♧</span><div><strong>${countCards()}</strong><span>cartes consignées</span></div></div><div class="stat"><span class="stat-symbol">✥</span><div><strong>${project.cases.filter(item => item.cards.some(card => card.type === "debrief")).length}</strong><span>débriefs préparés</span></div></div></div>
      <div class="section-heading"><div><h2>Affaires en cours</h2><p>Choisissez un dossier pour organiser les rôles et les indices.</p></div><button class="button button-gold" data-action="new-case">＋ Sceller une affaire</button></div>
      <div class="case-grid">${project.cases.length ? project.cases.map(caseCard).join("") : `<div class="empty-state">Le registre est vierge. Ouvrez une nouvelle affaire pour commencer.</div>`}</div>
      <hr class="ornament-rule"><div class="form-actions"><button class="button" data-view="library">Parcourir la bibliothèque</button><button class="button" data-view="printing">Préparer l’impression A4</button><button class="button button-danger" data-action="reset">Réinitialiser le grimoire</button></div>`;
  }
  function renderCases() {
    return `<div class="section-heading"><div><h2>Registre des affaires</h2><p>Dupliquez un dossier pour créer une variante sans toucher à l’original.</p></div><button class="button button-gold" data-action="new-case">＋ Nouvelle affaire</button></div><div class="case-grid">${project.cases.length ? project.cases.map(caseCard).join("") : `<div class="empty-state">Aucune affaire n’a été créée.</div>`}</div>`;
  }
  function cardPreview(card) {
    if (!card) return `<div class="empty-state">Choisissez une carte pour en voir l’aperçu.</div>`;
    const settings = project.settings;
    if (ui.preview === "back") return `<div class="card-preview"><div class="card-preview-inner preview-back"><div class="back-frame">${emblemMarkup(settings.emblem,"back-emblem")}<h3>${esc(settings.gameName)}</h3><p>${esc(settings.subtitle)}</p>${settings.backNote ? `<p>${esc(settings.backNote)}</p>` : ""}</div></div></div>`;
    const data = Object.values(card.fields || {}).filter(Boolean).join("\n\n");
    const length = cardLength(card);
    const warnings = [...length.warnings];
    if (!card.title) warnings.push("Ajoutez un titre.");
    const parentCase=project.cases.find(item=>item.cards.some(entry=>entry.id===card.id));
    const illustration=card.type==="affaire" ? (card.image || (parentCase && parentCase.image)) : "";
    return `<div class="card-preview"><div class="card-preview-inner frame-${frameStyle()}" style="--family-color:${familyColor(card)}"><div class="card-ornament">${esc(project.settings.ornament || "⚖")}</div><div class="preview-kind">${esc(typeLabel(card.type))}</div><div class="preview-title">${esc(card.title || "Sans titre")}</div>${illustration ? `<div class="illustration-frame"><img class="preview-image" style="object-position:${imagePosition(card.imagePosition)}" src="${esc(illustration)}" alt=""></div>` : ""}<div class="preview-text">${esc(data || "Le texte de la carte apparaîtra ici.")}</div><div class="preview-role">${esc(card.role || typeLabel(card.type))}</div></div></div>${warnings.length ? `<div class="preview-warning">${warnings.map(esc).join(" ")}</div>` : ""}`;
  }
  function fieldControl(key, label, value, full) {
    const long = ["content","available","evidence","unknown","certain","unproven","explanation","deescalation","mission"].includes(key);
    return `<div class="field ${full ? "full" : ""}"><label for="field-${key}">${esc(label)}</label><textarea id="field-${key}" name="field.${key}" class="${long ? "long" : ""}" rows="${long ? 4 : 3}">${esc(value || "")}</textarea></div>`;
  }
  function renderEditor() {
    const item = getCase(ui.caseId);
    if (!item) return `<div class="empty-state">Choisissez ou créez une affaire dans le registre.</div>`;
    let active = item.cards.find(card => card.id === ui.cardId);
    if (!active && item.cards.length) active = item.cards[0];
    if (active) ui.cardId = active.id;
    const fields = active ? TYPES[active.type].fields : [];
    const witnessCount = item.cards.filter(card => card.type === "temoin").length;
    const left = `<section class="panel"><h3>Jeu de 9 cartes</h3><p class="muted">7 cartes de base · jusqu’à 2 témoins facultatifs</p><div class="card-list">${item.cards.map(card => `<button class="card-list-item ${active && card.id === active.id ? "active" : ""}" data-action="select-card" data-id="${esc(card.id)}"><strong>${esc(card.title || "Sans titre")}</strong><small>${esc(typeLabel(card.type))} · ${esc(card.role || "sans rôle")}</small></button>`).join("")}</div><div class="form-actions"><button class="button button-small" data-action="new-card" ${witnessCount >= 2 || item.cards.length >= 9 ? "disabled" : ""}>＋ Témoin facultatif (${witnessCount}/2)</button></div></section>`;
    const caseForm = `<form id="case-form" class="panel"><h3>Identification de l’affaire</h3><div class="field-grid"><div class="field full"><label for="case-title">Titre de l’affaire</label><input id="case-title" name="case.title" value="${esc(item.title)}" required></div><div class="field full"><label for="case-summary">Résumé public</label><textarea id="case-summary" name="case.summary" rows="2">${esc(item.summary)}</textarea></div><div class="field full"><label for="case-context">Contexte commun</label><textarea id="case-context" name="case.context" rows="3">${esc(item.context)}</textarea></div><div class="field full"><label for="case-disagreement">Désaccord initial</label><textarea id="case-disagreement" name="case.disagreement" rows="3">${esc(item.disagreement)}</textarea></div><div class="field full"><label>Illustration de l’affaire</label><div class="image-control"><input type="file" accept="image/*" data-image-case="${esc(item.id)}">${item.image ? `<button type="button" class="button button-small button-danger" data-action="remove-case-image" data-id="${esc(item.id)}">Retirer</button>` : ""}</div></div></div><div class="form-actions"><button type="button" class="button button-small" data-action="duplicate-case" data-id="${esc(item.id)}">Dupliquer le dossier</button><button type="button" class="button button-small button-danger" data-action="delete-case" data-id="${esc(item.id)}">Supprimer l’affaire</button></div></form>`;
    const affairImageControls = active && active.type === "affaire" ? `<div class="field"><label for="image-position">Position de l’illustration</label><select id="image-position" name="card.imagePosition">${["center","top","bottom","left","right"].map(position=>`<option value="${position}" ${(active.imagePosition||"center")===position?"selected":""}>${position === "center" ? "Centre" : position === "top" ? "Haut" : position === "bottom" ? "Bas" : position === "left" ? "Gauche" : "Droite"}</option>`).join("")}</select></div><div class="field"><label>Illustration de la carte</label><div class="image-control"><input type="file" accept="image/*" data-image-card="${esc(active.id)}">${active.image ? `<button type="button" class="button button-small button-danger" data-action="remove-card-image" data-id="${esc(active.id)}">Retirer l’image</button>` : ""}</div></div>` : "";
    const cardForm = active ? `<form id="card-form" class="panel"><h3>Graver une carte</h3><p class="length-guide">Limites conseillées : titre ${CARD_LIMITS.title}, rôle ${CARD_LIMITS.role}, texte ${active.image ? CARD_LIMITS.bodyWithImage : CARD_LIMITS.body} caractères par carte. Les dépassements ne sont pas coupés, mais signalés.</p><div class="field-grid"><div class="field"><label for="card-type">Famille de carte</label><select id="card-type" name="card.type">${Object.entries(TYPES).map(([key,value]) => `<option value="${key}" ${active.type === key ? "selected" : ""}>${esc(value.label)}</option>`).join("")}</select></div><div class="field"><label for="card-case">Dossier associé</label><select id="card-case" name="card.caseId">${project.cases.map(entry => `<option value="${esc(entry.id)}" ${entry.id === item.id ? "selected" : ""}>${esc(entry.title)}</option>`).join("")}</select></div><div class="field full"><label for="card-title">Titre</label><input id="card-title" name="card.title" value="${esc(active.title)}"></div><div class="field"><label for="card-role">Rôle ou catégorie</label><input id="card-role" name="card.role" value="${esc(active.role || "")}"></div>${fields.map((field,index) => fieldControl(field[0],field[1],active.fields[field[0]],index === fields.length-1 && fields.length % 2 === 1)).join("")}${affairImageControls}</div>${lengthStatus(active)}<div class="form-actions">${active.type === "temoin" && witnessCount < 2 ? `<button type="button" class="button button-small" data-action="duplicate-card" data-id="${esc(active.id)}">Dupliquer le témoin</button>` : ""}<button type="button" class="button button-small" data-action="move-card" data-id="${esc(active.id)}" data-direction="-1">↑</button><button type="button" class="button button-small" data-action="move-card" data-id="${esc(active.id)}" data-direction="1">↓</button><button type="button" class="button button-small button-danger" data-action="delete-card" data-id="${esc(active.id)}">Supprimer</button></div></form>` : `<div class="panel empty-state">Ajoutez une carte pour commencer la composition de ce dossier.</div>`;
    const preview = `<section class="panel preview-panel"><div><h3>Aperçu du sceau</h3>${cardPreview(active)}<div class="preview-switch"><button class="button button-small ${ui.preview === "front" ? "button-gold" : ""}" data-action="preview-side" data-side="front">Recto</button><button class="button button-small ${ui.preview === "back" ? "button-gold" : ""}" data-action="preview-side" data-side="back">Verso</button></div></div></section>`;
    return `<div class="section-heading"><div><h2>${esc(item.title)}</h2><p>Les informations confidentielles restent sur leur carte de rôle.</p></div><button class="button" data-view="cases">Retour aux affaires</button></div><div class="editor-layout">${left}<div style="display:grid;gap:14px">${caseForm}${cardForm}</div>${preview}</div>`;
  }
  function renderLibrary() {
    let cards = allCards();
    const filter = ui.library;
    if (filter.search) cards = cards.filter(card => (card.title + " " + card.role + " " + Object.values(card.fields || {}).join(" ") + " " + card.caseTitle).toLowerCase().includes(filter.search.toLowerCase()));
    if (filter.type) cards = cards.filter(card => card.type === filter.type);
    if (filter.caseId) cards = cards.filter(card => card.caseId === filter.caseId);
    if (filter.illustrated) cards = cards.filter(hasIllustration);
    if (filter.role) cards = cards.filter(card => card.role === filter.role);
    if (filter.concept) cards = cards.filter(card => pedagogicalConcepts(card).includes(filter.concept));
    const roles = [...new Set(allCards().map(card=>card.role).filter(Boolean))].sort();
    const concepts = [...new Set(allCards().flatMap(pedagogicalConcepts))].sort();
    return `<div class="section-heading"><div><h2>Bibliothèque des cartes</h2><p>${cards.length} résultat(s) · recherche dans les titres, rôles et textes.</p></div><button class="button button-gold" data-action="new-card">＋ Créer une carte</button></div>
      <div class="toolbar"><div class="toolbar-control"><label for="lib-search">Recherche</label><input id="lib-search" value="${esc(filter.search)}" placeholder="Un personnage, une notion…"></div><div class="toolbar-control"><label for="lib-type">Type</label><select id="lib-type"><option value="">Tous les types</option>${Object.entries(TYPES).map(([key,value]) => `<option value="${key}" ${filter.type===key?"selected":""}>${esc(value.label)}</option>`).join("")}</select></div><div class="toolbar-control"><label for="lib-case">Affaire</label><select id="lib-case"><option value="">Toutes les affaires</option>${project.cases.map(item => `<option value="${esc(item.id)}" ${filter.caseId===item.id?"selected":""}>${esc(item.title)}</option>`).join("")}</select></div><div class="toolbar-control"><label for="lib-role">Rôle</label><select id="lib-role"><option value="">Tous les rôles</option>${roles.map(role=>`<option value="${esc(role)}" ${filter.role===role?"selected":""}>${esc(role)}</option>`).join("")}</select></div><div class="toolbar-control"><label for="lib-concept">Notion pédagogique</label><select id="lib-concept"><option value="">Toutes les notions</option>${concepts.map(concept=>`<option value="${esc(concept)}" ${filter.concept===concept?"selected":""}>${esc(concept)}</option>`).join("")}</select></div><label><input id="lib-illustrated" type="checkbox" ${filter.illustrated?"checked":""}> Illustrées uniquement</label></div>
      <div class="library-list">${cards.map(card => `<article class="library-row"><div><h3>${esc(card.title || "Sans titre")} <span class="type-label">· ${esc(typeLabel(card.type))}</span></h3><p>${esc(card.caseTitle)} · ${esc(card.role || "sans rôle")}${card.image ? " · illustration" : ""}</p></div><span>${esc((Object.values(card.fields || {}).find(Boolean) || "").slice(0,85))}</span><div class="row-actions"><button class="button button-small" data-action="edit-library-card" data-id="${esc(card.id)}">Modifier</button><button class="button button-small" data-action="print-one" data-id="${esc(card.id)}">Imprimer</button></div></article>`).join("") || `<div class="empty-state">Aucune carte ne correspond aux filtres.</div>`}</div>`;
  }
  function renderCustomize() {
    const settings = project.settings;
    return `<div class="section-heading"><div><h2>Enluminures &amp; dos de cartes</h2><p>Les changements de verso s’appliquent à toutes les familles.</p></div></div>
      <div class="customize-layout">
        <form id="settings-form" class="panel"><h3>Identité du jeu</h3><div class="field-grid">
          <div class="field full"><label for="game-name">Nom du jeu</label><input id="game-name" name="settings.gameName" value="${esc(settings.gameName)}"></div>
          <div class="field full"><label for="subtitle">Sous-titre du verso</label><input id="subtitle" name="settings.subtitle" value="${esc(settings.subtitle)}"></div>
          <div class="field"><label for="emblem">Emblème central</label><select id="emblem" name="settings.emblem"><option value="⚖" ${settings.emblem==="⚖"?"selected":""}>Balance de justice</option><option value="✦" ${settings.emblem==="✦"?"selected":""}>Étoile</option><option value="❧" ${settings.emblem==="❧"?"selected":""}>Feuille</option></select></div>
          <div class="field"><label for="back-note">Mention facultative</label><input id="back-note" name="settings.backNote" value="${esc(settings.backNote)}"></div>
          <div class="field"><label for="accent">Couleur de l’ornement</label><input id="accent" type="color" name="settings.accent" value="${esc(settings.accent)}"></div>
          <div class="field"><label for="ornament">Ornement de recto</label><select id="ornament" name="settings.ornament">${["✦","❧","◇","✧"].map(mark=>`<option value="${mark}" ${(settings.ornament||"✦")===mark?"selected":""}>${mark}</option>`).join("")}</select></div>
          <div class="field"><label for="frame-style">Cadre</label><select id="frame-style" name="settings.frameStyle"><option value="double" ${frameStyle()==="double"?"selected":""}>Double enluminure</option><option value="simple" ${frameStyle()==="simple"?"selected":""}>Filet simple</option></select></div>
          <div class="field"><label for="font-style">Typographie des titres</label><select id="font-style" name="settings.fontStyle"><option value="ornate" ${settings.fontStyle!=="classic"?"selected":""}>Gothique enluminée</option><option value="classic" ${settings.fontStyle==="classic"?"selected":""}>Livre ancien</option></select></div>
          <div class="field full"><label>Couleurs des familles</label><div class="field-grid">${Object.entries(TYPES).map(([key,value])=>`<div class="field"><label for="color-${key}">${esc(value.label)}</label><input id="color-${key}" type="color" name="familyColor.${key}" value="${safeColor(settings.familyColors && settings.familyColors[key],"#846838")}"></div>`).join("")}</div></div>
        </div><p class="muted">Les illustrations importées restent intégrées au projet JSON exporté. Les polices décoratives en ligne sont facultatives ; des polices système lisibles prennent le relais hors connexion. Le format physique reste fixé à 70 × 99 mm pour l’alignement A4.</p></form>
        <section class="panel"><h3>Verso commun</h3><div class="back-sample"><span class="emblem">${esc(settings.emblem)}</span><h3>${esc(settings.gameName)}</h3><p>${esc(settings.subtitle)}</p>${settings.backNote ? `<p>${esc(settings.backNote)}</p>` : ""}</div><p class="muted">Format de carte : 70 × 99 mm · A4 : 3 × 3.</p></section>
      </div>`;
  }
  function printCardMarkup(card, side, flip, caseImage) {
    if (side === "back") return `<div class="print-card print-card-back ${flip ? "flip-back" : ""}"><div class="print-card-inner">${emblemMarkup(project.settings.emblem,"print-back-emblem")}<div class="print-back-name">${esc(project.settings.gameName)}</div><div class="print-back-subtitle">${esc(project.settings.subtitle)}</div>${project.settings.backNote ? `<div class="print-back-note">${esc(project.settings.backNote)}</div>` : ""}</div></div>`;
    if (!card) return `<div class="print-card print-blank"></div>`;
    const text = Object.values(card.fields || {}).filter(Boolean).join("\n\n");
    const illustration=card.type==="affaire" ? (card.image || caseImage) : "";
    return `<div class="print-card"><div class="print-card-inner frame-${frameStyle()}" style="--family-color:${familyColor(card)}"><div class="card-ornament">${esc(project.settings.ornament || "⚖")}</div><div class="print-card-kind">${esc(typeLabel(card.type))}</div><div class="print-card-title">${esc(card.title || "Sans titre")}</div>${illustration ? `<div class="print-illustration-frame"><img class="print-card-image" style="object-position:${imagePosition(card.imagePosition)}" src="${esc(illustration)}" alt=""></div>` : ""}<div class="print-card-content">${esc(text)}</div><div class="print-card-role">${esc(card.role || typeLabel(card.type))}</div></div></div>`;
  }
  function printPages(groups, duplex, flip) {
    const pages = [];
    groups.forEach(group => {
      pages.push(`<section class="print-sheet">${group.slots.map(card => printCardMarkup(card,"front",false,group.caseImage)).join("")}</section>`);
      if (duplex) pages.push(`<section class="print-sheet">${Array.from({length:9},(_,i) => { const row=Math.floor(i/3), column=i%3, source=flip ? row*3+(2-column) : i; return printCardMarkup(group.slots[source],"back",false,group.caseImage); }).join("")}</section>`);
    });
    return pages.join("");
  }
  function filteredPrintGroups() {
    const options = ui.print;
    const chosenCases = project.cases.filter(item => !options.caseId || options.caseId === "all" || item.id === options.caseId);
    const groups = [];
    chosenCases.forEach(item => {
      const sorted = item.cards.slice().sort((a,b) => {
        const order = [...CORE_CARD_TYPES.slice(0,3),"faits","temoin","temoin",...CORE_CARD_TYPES.slice(4)];
        return order.indexOf(a.type)-order.indexOf(b.type);
      });
      const slots = Array(9).fill(null);
      sorted.forEach((card,index) => {
        const selected = !options.selected.length || options.selected.includes(card.id);
        const typeMatches = !options.type || card.type === options.type;
        if (selected && typeMatches && index < slots.length) slots[index] = card;
      });
      if (!slots.some(Boolean)) return;
      for (let copy=0;copy<options.copies;copy++) groups.push({ caseId:item.id, title:item.title, caseImage:item.image, slots:slots.slice() });
    });
    return groups;
  }
  function renderPrinting() {
    const options = ui.print;
    const groups = filteredPrintGroups();
    const pageCount = groups.length * (options.duplex ? 2 : 1);
    const pages = printPages(groups, options.duplex, options.flip);
    return `<div class="section-heading"><div><h2>Impression au format du jeu</h2><p>Une affaire par feuille A4 · 9 emplacements de 70 × 99 mm. Les témoins inutilisés restent vierges.</p></div><button class="button button-gold" data-action="do-print">Imprimer / Exporter PDF</button></div>
      <div class="toolbar"><div class="toolbar-control"><label for="print-case">Affaire</label><select id="print-case"><option value="all" ${options.caseId==="all"?"selected":""}>Toutes les affaires</option>${project.cases.map(item => `<option value="${esc(item.id)}" ${options.caseId===item.id?"selected":""}>${esc(item.title)}</option>`).join("")}</select></div><div class="toolbar-control"><label for="print-type">Famille de cartes</label><select id="print-type"><option value="">Toutes les cartes</option>${Object.entries(TYPES).map(([key,value]) => `<option value="${key}" ${options.type===key?"selected":""}>${esc(value.label)}</option>`).join("")}</select></div><div class="toolbar-control"><label for="print-copies">Exemplaires de chaque affaire</label><input type="number" id="print-copies" min="1" max="30" value="${options.copies}"></div><label><input id="print-duplex" type="checkbox" ${options.duplex?"checked":""}> Générer les versos</label><label><input id="print-flip" type="checkbox" ${options.flip?"checked":""}> Retourner horizontalement les versos</label></div>
      <details class="panel"><summary>Sélectionner des cartes précises (facultatif)</summary><div class="select-cards">${allCards().map(card => `<label><input type="checkbox" data-print-card="${esc(card.id)}" ${options.selected.includes(card.id)?"checked":""}> ${esc(card.title)} <span class="muted">· ${esc(typeLabel(card.type))}</span></label>`).join("")}</div><button class="button button-small" data-action="clear-print-selection">Effacer la sélection</button></details>
      <div class="section-heading"><div><h2>Aperçu des feuilles</h2><p>${groups.length} affaire(s) · ${pageCount} page(s) ${options.duplex ? "(recto puis verso pour chaque affaire)" : "(rectos seulement)"}</p></div><span class="type-label">A4 · 210 × 297 mm</span></div>
      <div class="print-preview">${groups.length ? groups.map((group,index) => `<div><div class="sheet-caption">${esc(group.title)} · recto</div><div class="sheet-preview">${group.slots.map(card => card ? `<div class="mini-card"><strong>${esc(card.title)}</strong><small>${esc(typeLabel(card.type))}</small></div>` : `<div class="mini-card mini-blank"></div>`).join("")}</div>${options.duplex ? `<div class="sheet-caption">Verso correspondant</div><div class="sheet-preview">${Array.from({length:9},() => `<div class="mini-card back-mini">${emblemMarkup(project.settings.emblem,"mini-back-emblem")}</div>`).join("")}</div>` : ""}</div>`).join("") : `<div class="empty-state">Aucune carte à imprimer avec ces critères.</div>`}</div><div id="print-output">${pages}</div>`;
  }
  function render() {
    applyTheme();
    if(project.settings.ornament==="◇") {project.settings.ornament="⚖";persist();}
    const renderers = { dashboard:renderDashboard, cases:renderCases, editor:renderEditor, library:renderLibrary, customize:renderCustomize, printing:renderPrinting };
    content.innerHTML = (renderers[ui.view] || renderDashboard)();
    const lengthGuide=content.querySelector(".length-guide"), activeCard=ui.cardId && getCard(ui.cardId);
    if(lengthGuide && activeCard) lengthGuide.textContent=`Limites conseillées : titre ${CARD_LIMITS.title}, rôle ${CARD_LIMITS.role}, texte ${cardLength(activeCard).bodyLimit} caractères par carte. Les dépassements ne sont pas coupés, mais signalés.`;
    const lengthStatusNode=content.querySelector("#card-length-status"), fields=content.querySelector("#card-form .field-grid");
    if(lengthStatusNode && fields) content.querySelector("#card-form").insertBefore(lengthStatusNode,fields);
    const ornamentSelect=content.querySelector("#ornament"), oldDiamond=ornamentSelect && ornamentSelect.querySelector('option[value="◇"]');
    if(oldDiamond){oldDiamond.value="⚖";oldDiamond.textContent="⚖ Balance";ornamentSelect.value=project.settings.ornament==="◇"?"⚖":project.settings.ornament;}
    if(ui.view!=="printing") refreshLengthWarnings();
    applyEmblem();
    const printOutput = document.getElementById("print-output");
    if (printOutput) printOutput.classList.toggle("hidden", ui.view !== "printing");
  }
  function blankCard(type, title, role) {
    return { id:crypto.randomUUID(), type, title, role, image:"", fields:{} };
  }
  function newCase() {
    const id = crypto.randomUUID();
    const item = {
      id, title:"Nouvelle affaire", summary:"", context:"", disagreement:"", image:"",
      cards:[
        blankCard("affaire","L’affaire","Audience publique"),
        blankCard("accusateur","La personne plaignante","Accusation"),
        blankCard("accuse","La personne mise en cause","Défense"),
        blankCard("faits","Faits et indices","Repères de l’enquête"),
        blankCard("jury","Mission des jurés","Jury"),
        blankCard("verdict","Verdict attendu","Verdict"),
        blankCard("debrief","Débrief pédagogique","Débrief")
      ]
    };
    project.cases.push(item); ui.caseId=id; ui.cardId=item.cards[0].id; persist(); setView("editor");
  }
  function newCard() {
    if (!project.cases.length) { newCase(); return; }
    const item = getCase(ui.caseId) || project.cases[0];
    if (item.cards.length >= 9 || item.cards.filter(card => card.type === "temoin").length >= 2) {
      notify("Une affaire ne peut contenir que deux témoins facultatifs et neuf cartes au total.", true);
      return;
    }
    const type = "temoin";
    const card = { id:crypto.randomUUID(), type, title:"Nouveau témoignage", role:TYPES[type].label, image:"", fields:{} };
    const juryIndex=item.cards.findIndex(entry => entry.type === "jury");
    item.cards.splice(juryIndex < 0 ? item.cards.length : juryIndex,0,card);
    ui.caseId=item.id; ui.cardId=card.id; ui.preview="front"; persist(); setView("editor");
  }
  function duplicateCase(id) {
    const original = getCase(id);
    if (!original) return;
    const copy = window.TDC_STORAGE.clone(original);
    copy.id = crypto.randomUUID(); copy.title += " — copie";
    copy.cards.forEach(card => { card.id=crypto.randomUUID(); });
    project.cases.push(copy); ui.caseId=copy.id; ui.cardId=copy.cards[0] && copy.cards[0].id; persist(); setView("editor"); notify("Le dossier a été dupliqué.");
  }
  function deleteCase(id) {
    const item = getCase(id);
    if (!item || !confirm(`Supprimer « ${item.title} » et ses ${item.cards.length} carte(s) ?`)) return;
    project.cases = project.cases.filter(entry => entry.id !== id);
    ui.caseId = project.cases[0] && project.cases[0].id; ui.cardId=null; persist(); setView(project.cases.length ? "cases" : "dashboard"); notify("Dossier supprimé.");
  }
  function duplicateCard(id) {
    const card = getCard(id); if (!card) return;
    const item = project.cases.find(entry => entry.cards.some(row => row.id === id));
    if (card.type !== "temoin") { notify("Pour garder le gabarit d’une affaire, seules les cartes témoin peuvent être dupliquées.", true); return; }
    if (item.cards.length >= 9 || item.cards.filter(row => row.type === "temoin").length >= 2) { notify("Cette affaire contient déjà ses deux témoins facultatifs.", true); return; }
    const copy = window.TDC_STORAGE.clone(card); copy.id=crypto.randomUUID(); copy.title += " — copie";
    item.cards.splice(item.cards.indexOf(card)+1,0,copy); ui.caseId=item.id; ui.cardId=copy.id; persist(); setView("editor"); notify("La carte a été dupliquée.");
  }
  function deleteCard(id) {
    const item = project.cases.find(entry => entry.cards.some(card => card.id === id));
    const card = getCard(id); if (!item || !card || !confirm(`Supprimer la carte « ${card.title} » ?`)) return;
    item.cards = item.cards.filter(row => row.id !== id); ui.caseId=item.id; ui.cardId=item.cards[0] && item.cards[0].id; persist(); setView("editor"); notify("Carte supprimée.");
  }
  function moveCard(id, direction) {
    const item = project.cases.find(entry => entry.cards.some(card => card.id === id)); if (!item) return;
    const index = item.cards.findIndex(card => card.id === id), target=index+direction;
    if (target<0 || target>=item.cards.length) return;
    [item.cards[index],item.cards[target]]=[item.cards[target],item.cards[index]]; ui.caseId=item.id; ui.cardId=id; persist(); render();
  }
  function download(filename, text, mime) {
    const link=document.createElement("a"); link.href=URL.createObjectURL(new Blob([text],{type:mime})); link.download=filename; link.click(); setTimeout(()=>URL.revokeObjectURL(link.href),1000);
  }
  function exportProject() {
    const safeName=(project.settings.gameName || "grimoire").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    download(`${safeName || "grimoire"}.json`,JSON.stringify(project,null,2),"application/json");
    notify("Export JSON créé avec les images intégrées.");
  }
  function parseCsv(text) {
    const rows=[];
    let row=[], value="", quoted=false;
    for(let i=0;i<text.length;i++) {
      const char=text[i];
      if(quoted) {
        if(char==='"' && text[i+1]==='"') { value+='"'; i++; }
        else if(char==='"') quoted=false;
        else value+=char;
      } else if(char==='"' && value.length===0) quoted=true;
      else if(char===",") { row.push(value); value=""; }
      else if(char==="\n" || char==="\r") {
        if(char==="\r" && text[i+1]==="\n") i++;
        row.push(value);
        if(row.some(cell=>cell!=="")) rows.push(row);
        row=[]; value="";
      } else value+=char;
    }
    if(quoted) throw new Error("CSV invalide : guillemet non refermé.");
    row.push(value);
    if(row.some(cell=>cell!=="")) rows.push(row);
    if(!rows.length) throw new Error("Le CSV est vide.");
    const headers=rows.shift().map((header,index)=>header.replace(index===0?/^\uFEFF/:"","").trim());
    if(new Set(headers).size!==headers.length) throw new Error("Le CSV contient des noms de colonnes en double.");
    return rows.map((cells,index)=>{
      if(cells.length!==headers.length) throw new Error(`Ligne ${index+2} : ${cells.length} colonnes au lieu de ${headers.length}.`);
      return Object.fromEntries(headers.map((header,column)=>[header,cells[column]]));
    });
  }
  function projectFromCsv(text) {
    const rows=parseCsv(text);
    const required=["case_id","case_title","card_order","card_type","card_title","role","fields_json"];
    const headers=new Set(Object.keys(rows[0] || {}));
    const missing=required.filter(key=>!headers.has(key));
    if(missing.length) throw new Error(`Colonnes CSV obligatoires absentes : ${missing.join(", ")}.`);
    const cases=new Map();
    rows.forEach((row,index)=>{
      if(!row.case_id || !row.case_title) throw new Error(`Ligne ${index+2} : case_id et case_title sont requis.`);
      let item=cases.get(row.case_id);
      if(!item) {
        item={id:row.case_id,title:row.case_title,summary:row.case_summary||"",context:row.case_context||"",disagreement:row.case_disagreement||"",image:row.case_image||"",cards:[]};
        cases.set(row.case_id,item);
      } else if(item.title!==row.case_title) throw new Error(`Ligne ${index+2} : case_title doit rester identique pour un même case_id.`);
      let fields;
      try { fields=JSON.parse(row.fields_json || "{}"); } catch { throw new Error(`Ligne ${index+2} : fields_json n’est pas un objet JSON valide.`); }
      if(!fields || Array.isArray(fields) || typeof fields!=="object") throw new Error(`Ligne ${index+2} : fields_json doit contenir un objet JSON.`);
      const cardOrder=Number(row.card_order);
      if(!Number.isInteger(cardOrder)||cardOrder<0||cardOrder>8) throw new Error(`Ligne ${index+2} : card_order doit être un entier de 0 à 8.`);
      item.cards.push({
        id:row.card_id || crypto.randomUUID(),
        type:row.card_type,
        title:row.card_title,
        role:row.role,
        fields,
        image:row.image_data_url||"",
        imagePosition:row.image_position||"center",
        order:cardOrder
      });
    });
    const importedCases=[...cases.values()];
    importedCases.forEach(item=>item.cards.sort((a,b)=>a.order-b.order).forEach(card=>delete card.order));
    return {version:1,settings:window.TDC_STORAGE.clone(window.TDC_DATA.settings),cases:importedCases};
  }
  function validateImportedProject(incoming) {
    if(!incoming||incoming.version!==1||!Array.isArray(incoming.cases)||!incoming.settings) throw new Error("Structure du grimoire non reconnue.");
    const caseIds=new Set(), cardIds=new Set();
    const valid=incoming.cases.every(item=>{
      if(!item.id||caseIds.has(item.id)||!Array.isArray(item.cards)||item.cards.length>9||item.cards.filter(card=>card.type==="temoin").length>2||!isAllowedImage(item.image)) return false;
      caseIds.add(item.id);
      return item.cards.every(card=>{
        if(!card.id||cardIds.has(card.id)||!TYPES[card.type]||!card.fields||Array.isArray(card.fields)||typeof card.fields!=="object"||!Object.values(card.fields).every(value=>typeof value==="string")) return false;
        if(item.cards.filter(entry=>entry.type===card.type).length>1 && card.type!=="temoin") return false;
        if(!isAllowedImage(card.image)) return false;
        cardIds.add(card.id);
        return true;
      });
    });
    if(!valid) throw new Error("Chaque affaire accepte au maximum 9 cartes : 7 rôles de base et 2 témoins, avec un exemplaire au plus par rôle de base.");
  }
  function assignImportedIllustrations(incoming) {
    incoming.cases.forEach(item => {
      const affairCard=item.cards.find(card=>card.type==="affaire");
      item.cards.forEach(card => { if(card.type!=="affaire") card.image=""; });
      if (!item.image && !(affairCard && affairCard.image) && BUILTIN_ILLUSTRATIONS.length) item.image=BUILTIN_ILLUSTRATIONS[Math.floor(Math.random()*BUILTIN_ILLUSTRATIONS.length)].src;
    });
  }
  function resetProject() {
    if (!confirm("Réinitialiser le projet local et recharger les trois affaires d’exemple ? Pensez à exporter vos travaux avant cette action.")) return;
    try { localStorage.removeItem("tribunal-du-chaos-atelier-v1"); } catch (error) { notify("Impossible d’effacer les données locales : "+error.message,true); return; }
    window.location.reload();
  }
  function updateField(target) {
    const [scope,key] = target.name.split(".");
    if (scope === "case") {
      const item=getCase(ui.caseId); if (item) item[key]=target.value;
    } else if (scope === "card") {
      const card=getCard(ui.cardId); if (card && key !== "caseId") card[key]=target.value;
    } else if (scope === "field") {
      const card=getCard(ui.cardId); if (card) card.fields[key]=target.value;
    } else if (scope === "settings") project.settings[key]=target.value;
    else if (scope === "familyColor") {
      project.settings.familyColors = project.settings.familyColors || {};
      project.settings.familyColors[key]=safeColor(target.value,"#846838");
    }
    persist();
    if (scope === "settings") applyTheme();
    if (scope === "field" || (scope === "card" && ["title","role","imagePosition"].includes(key))) {
      const panel=document.querySelector(".preview-panel");
      if (panel) panel.innerHTML=`<div><h3>Aperçu du sceau</h3>${cardPreview(getCard(ui.cardId))}<div class="preview-switch"><button class="button button-small ${ui.preview==="front"?"button-gold":""}" data-action="preview-side" data-side="front">Recto</button><button class="button button-small ${ui.preview==="back"?"button-gold":""}" data-action="preview-side" data-side="back">Verso</button></div></div>`;
    }
    if (scope === "field" || (scope === "card" && ["title","role"].includes(key))) {
      const card=getCard(ui.cardId), status=document.getElementById("card-length-status");
      if (card && status) status.outerHTML=lengthStatus(card);
      refreshLengthWarnings();
    }
    if (scope === "settings") {
      const back=document.querySelector(".back-sample");
      if (back) back.innerHTML=`<span class="emblem">${esc(project.settings.emblem)}</span><h3>${esc(project.settings.gameName)}</h3><p>${esc(project.settings.subtitle)}</p>${project.settings.backNote?`<p>${esc(project.settings.backNote)}</p>`:""}`;
      applyEmblem();
    }
  }
  function moveCardCase(cardId, targetCaseId) {
    const source=project.cases.find(item=>item.cards.some(card=>card.id===cardId)), target=getCase(targetCaseId);
    if (!source || !target || source===target) return;
    const card=source.cards.find(entry=>entry.id===cardId);
    if (target.cards.length >= 9 || (card.type === "temoin" && target.cards.filter(entry=>entry.type==="temoin").length >= 2) || (card.type !== "temoin" && target.cards.some(entry=>entry.type===card.type))) {
      notify("Le déplacement dépasserait le gabarit de neuf cartes ou créerait un doublon de rôle.", true);
      return;
    }
    const index=source.cards.findIndex(entry=>entry.id===cardId), [movedCard]=source.cards.splice(index,1); target.cards.push(movedCard); ui.caseId=target.id; ui.cardId=movedCard.id; persist(); setView("editor"); notify("Carte déplacée vers le dossier choisi.");
  }
  function handleAction(button) {
    const {action,id}=button.dataset;
    if (action==="new-case") newCase();
    if (action==="new-card") newCard();
    if (action==="open-case") { ui.caseId=id; ui.cardId=null; setView("editor"); }
    if (action==="duplicate-case") duplicateCase(id);
    if (action==="delete-case") deleteCase(id);
    if (action==="duplicate-card") duplicateCard(id);
    if (action==="delete-card") deleteCard(id);
    if (action==="move-card") moveCard(id,Number(button.dataset.direction));
    if (action==="select-card") { const item=getCase(ui.caseId); if(item && item.cards.some(card=>card.id===id)){ui.cardId=id;ui.preview="front";render();} }
    if (action==="preview-side") { ui.preview=button.dataset.side; render(); }
    if (action==="edit-library-card") { const item=project.cases.find(entry=>entry.cards.some(card=>card.id===id));ui.caseId=item.id;ui.cardId=id;setView("editor"); }
    if (action==="export") exportProject();
    if (action==="reset") resetProject();
    if (action==="do-print") window.print();
    if (action==="clear-print-selection") { ui.print.selected=[];render(); }
    if (action==="print-one") { ui.print.selected=[id];ui.print.caseId="all";ui.print.type="";setView("printing"); }
    if (action==="remove-card-image") { const card=getCard(id);if(card){card.image="";persist();render();} }
    if (action==="remove-case-image") {const item=getCase(id);if(item){item.image="";persist();render();}}
  }
  document.addEventListener("click", event => {
    const viewButton=event.target.closest("[data-view]");
    if (viewButton) { event.preventDefault(); setView(viewButton.dataset.view); return; }
    const actionButton=event.target.closest("[data-action]");
    if (actionButton) { event.preventDefault(); handleAction(actionButton); }
  });
  document.addEventListener("input", event => {
    const target=event.target;
    if (target.name && (target.name.startsWith("case.") || target.name.startsWith("card.") || target.name.startsWith("field.") || target.name.startsWith("settings.") || target.name.startsWith("familyColor."))) updateField(target);
    if (target.id==="lib-search") { ui.library.search=target.value; render(); const input=document.getElementById("lib-search");input.focus();input.setSelectionRange(input.value.length,input.value.length); }
  });
  document.addEventListener("change", event => {
    const target=event.target;
    if (target.id==="card-type") {
      const card=getCard(ui.cardId), item=getCase(ui.caseId);
      if(card && item){
        const duplicateRole=target.value !== "temoin" && item.cards.some(entry=>entry.id!==card.id && entry.type===target.value);
        const tooManyWitnesses=target.value==="temoin" && card.type!=="temoin" && item.cards.filter(entry=>entry.type==="temoin").length>=2;
        if(duplicateRole || tooManyWitnesses) { notify("Chaque rôle de base est unique et une affaire accepte deux témoins au maximum.",true);render();return; }
        card.type=target.value;
        if(card.type!=="affaire") card.image="";
        card.role=card.role||TYPES[target.value].label;
        persist();render();
      }
    } else if (target.id==="card-case") moveCardCase(ui.cardId,target.value);
    else if (target.id==="lib-type") {ui.library.type=target.value;render();}
    else if (target.id==="lib-case") {ui.library.caseId=target.value;render();}
    else if (target.id==="lib-role") {ui.library.role=target.value;render();}
    else if (target.id==="lib-concept") {ui.library.concept=target.value;render();}
    else if (target.id==="lib-illustrated") {ui.library.illustrated=target.checked;render();}
    else if (target.id==="print-case") {ui.print.caseId=target.value;render();}
    else if (target.id==="print-type") {ui.print.type=target.value;render();}
    else if (target.id==="print-copies") {ui.print.copies=Math.max(1,Math.min(30,Number(target.value)||1));render();}
    else if (target.id==="print-duplex") {ui.print.duplex=target.checked;render();}
    else if (target.id==="print-flip") {ui.print.flip=target.checked;render();}
    else if (target.dataset.printCard) {const id=target.dataset.printCard;ui.print.selected=target.checked?[...new Set([...ui.print.selected,id])]:ui.print.selected.filter(entry=>entry!==id);render();}
    else if (target.dataset.imageCard || target.dataset.imageCase) {
      const file=target.files && target.files[0];if(!file)return;
      if (!file.type.startsWith("image/")) {notify("Choisissez un fichier image.",true);return;}
      if (file.size>3*1024*1024) {notify("Image trop volumineuse (maximum 3 Mo par image).",true);return;}
      const reader=new FileReader();reader.onerror=()=>notify("Impossible de lire cette image.",true);
      reader.onload=()=>{if(target.dataset.imageCard){const card=getCard(target.dataset.imageCard);if(card)card.image=reader.result;}else{const item=getCase(target.dataset.imageCase);if(item)item.image=reader.result;}persist();render();notify("Illustration ajoutée au dossier.");};reader.readAsDataURL(file);
    } else if (target.id==="import-file") {
      const file=target.files && target.files[0];if(!file)return;
      const reader=new FileReader();reader.onerror=()=>notify("Impossible de lire le fichier.",true);
      reader.onload=()=>{try{
        const isCsv=file.name.toLowerCase().endsWith(".csv");
        const incoming=isCsv?projectFromCsv(reader.result):JSON.parse(reader.result);
        validateImportedProject(incoming);
        if(!confirm("Remplacer le projet actuel par le grimoire importé ? Exportez d’abord votre projet si vous souhaitez le conserver."))return;
        assignImportedIllustrations(incoming);
        incoming.settings.familyColors=incoming.settings.familyColors||{};
        project.version=incoming.version;project.settings=incoming.settings;project.cases=incoming.cases;project.migrations=["nine-card-deck"];
        persist();ui.caseId=project.cases[0]&&project.cases[0].id;ui.cardId=null;setView("dashboard");
        notify(`Grimoire ${isCsv?"CSV":"JSON"} importé avec succès.`);
      }catch(error){notify("Import impossible : "+error.message,true);}target.value="";};reader.readAsText(file);
    }
  });
  setView("dashboard");
  if (window.TDC_STORAGE_LOAD_ERROR) notify("Le projet local était illisible ; les affaires d’exemple ont été chargées. Importez une sauvegarde si nécessaire.", true);
})();
