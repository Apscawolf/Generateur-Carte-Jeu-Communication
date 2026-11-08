(function () {
  const card = (type, title, role, fields) => ({ id: crypto.randomUUID(), type, title, role, image: "", fields });
  const makeCase = (id, title, summary, context, disagreement, cards) => ({
    id, title, summary, context, disagreement, image: "", cards
  });
  const examples = [
    makeCase("linge-dragon", "Le dragon et le linge royal", "Un dragon est accusé d’avoir carbonisé le linge de son voisin après une querelle d’étendoir.", "Une flamme a brûlé trois draps sur la corde de maître Aubépine. Le dragon Brasier habite la grotte voisine et s’était plaint de l’étendoir, placé près de son entrée.", "Le voisin affirme que le dragon a soufflé volontairement sur le linge. Brasier dit avoir éternué et nie toute intention de nuire.", [
      card("affaire", "Le royaume contre Brasier", "Audience publique", { content: "Trois draps ont été brûlés au petit matin. Le voisin accuse Brasier, dont la grotte jouxte le jardin.", facts: "Les draps ont brûlé.\nBrasier s’était plaint de l’étendoir la veille.", interpretations: "Le dragon a voulu se venger.\nL’accident est lié à une flamme incontrôlée." }),
      card("accusateur", "Maître Aubépine, voisin lésé", "Accusation", { objective: "Obtenir réparation et faire déplacer l’étendoir.", available: "Vous avez entendu un grondement juste avant de voir la fumée. Brasier vous avait demandé de déplacer la corde.", evidence: "Vous pouvez montrer les draps noircis et rappeler la dispute de la veille.", interpretation: "Vous pensez que Brasier a voulu vous faire peur après votre refus.", unknown: "Vous ignorez qu’un encens magique brûlait près du linge et que le vent soufflait vers lui." }),
      card("accuse", "Brasier, dragon de la colline", "Défense", { objective: "Expliquer l’incident sans nier le dommage.", content: "Vous avez éternué en sortant de votre grotte. Vous n’avez pas vu les draps prendre feu et vous regrettez les dégâts.", available: "Votre nez était irrité par un pollen doré. Vous vous étiez plaint de l’étendoir parce qu’il bloquait l’entrée.", evidence: "Vous pouvez préciser que vous étiez seul et que vous n’avez pas visé le jardin.", unknown: "Vous ne saviez pas qu’un encens magique brûlait à proximité." }),
      card("temoin", "Pimprenelle, gardienne du jardin", "Témoin", { content: "Vous étiez dans la serre et avez aperçu une lueur orange près de la corde.", facts: "Le vent soufflait du côté de la grotte vers l’étendoir. Un bâton d’encens se consumait sous la fenêtre.", indirect: "Un apprenti vous a dit avoir entendu un rugissement, mais vous ne l’avez pas entendu vous-même.", interpretation: "Vous avez d’abord cru à une attaque, car Brasier et Aubépine se disputent souvent.", reliability: "Vous avez vu la fumée, pas le départ du feu. Votre récit est fiable sur le vent et l’encens, incertain sur l’origine de la flamme." }),
      card("jury", "Mission des jurés", "Jury", { mission: "1. Quels faits sont réellement établis ?\n2. Quel mécanisme a contribué à aggraver le conflit ?\n3. Quelle serait la meilleure prochaine étape pour désamorcer la situation ?", content: "Séparez ce qui a été observé de ce qui a été supposé. Interrogez chaque personne sur ce qu’elle sait directement." }),
      card("verdict", "Ce que révèle l’enquête", "Verdict", { certain: "Le linge a brûlé. Brasier s’était plaint de l’étendoir. Le vent allait vers la corde et un encens brûlait à proximité.", unproven: "Il n’est pas établi que Brasier ait soufflé volontairement ni qu’il ait voulu abîmer le linge.", mechanism: "Attribution hostile et erreur fondamentale d’attribution.", secondary: "Biais de confirmation : la dispute antérieure oriente l’interprétation du voisin.", explanation: "Un événement visible (la flamme) a été relié à une intention supposée. Les indices compatibles avec l’accusation ont pris plus de place que les explications alternatives.", takeaway: "Un dommage réel ne prouve pas une intention. Vérifier les circonstances avant de conclure." }),
      card("debrief", "Après l’audience", "Débrief", { origin: "L’étendoir gênait l’accès à la grotte et le voisin n’a pas entendu la demande comme une négociation.", aggravating: "La dispute antérieure a rendu l’accusation immédiatement crédible.", bias: "Attribution hostile, biais de confirmation et confusion entre comportement et intention.", needs: "Sécurité et respect du voisin ; accès libre et considération pour Brasier.", deescalation: "Décrire les faits sans accuser, entendre les deux versions, vérifier l’encens et le vent, puis convenir d’un emplacement sûr et d’une réparation.", question: "Qu’auriez-vous voulu vérifier avant d’attribuer l’incendie à une vengeance ?" })
    ]),
    makeCase("balai-sorcieres", "Le balai des deux sorcières", "Deux sorcières revendiquent le même balai, disparu puis retrouvé devant l’atelier de réparation.", "Mirelda présente une facture récente. Séléné utilise ce balai depuis plusieurs années et affirme l’avoir confié à l’artisan pour une réparation.", "Le balai a été déplacé par l’apprenti réparateur. Chacune interprète la présence de l’autre comme une tentative de s’approprier l’objet.", [
      card("affaire", "L’affaire du balai envolé", "Audience publique", { content: "Un balai ancien est revendiqué par Mirelda et Séléné. Elles se sont disputées devant l’atelier royal.", facts: "Mirelda possède une facture. Séléné utilisait le balai depuis longtemps. L’objet a été déplacé pour réparation.", interpretations: "La facture prouve la propriété.\nL’usage ancien prouve un prêt ou un droit d’usage." }),
      card("accusateur", "Mirelda, sorcière collectionneuse", "Demanderesse", { objective: "Récupérer le balai acheté au marché des merveilles.", available: "Vous avez payé un balai en bois sombre la semaine dernière. La facture porte le nom de votre boutique.", evidence: "La facture mentionne un balai modèle « Nuit-de-Chêne », série 8.", interpretation: "Vous croyez que Séléné a gardé le balai parce qu’elle envie votre collection.", unknown: "Vous ignorez que la facture peut concerner un modèle presque identique et que Séléné l’avait confié pour réparation." }),
      card("accuse", "Séléné, sorcière des marais", "Défenderesse", { objective: "Retrouver votre balai et être reconnue comme sa propriétaire.", content: "Vous utilisez ce balai depuis des années. Il guidait votre tournée de plantes médicinales et vous l’aviez confié à l’atelier pour consolider son manche.", available: "Vous avez une marque gravée sous la poignée, mais vous n’avez pas de facture.", evidence: "Vous connaissez une fente en forme de lune dans le manche et pouvez décrire son histoire.", unknown: "Vous n’avez pas vu la facture de Mirelda et ne saviez pas qu’elle avait acheté un balai ressemblant au vôtre." }),
      card("temoin", "Toupin, apprenti réparateur", "Témoin", { content: "Vous avez déplacé un balai de l’établi vers le vestibule pour libérer de la place.", facts: "Deux balais de bois sombre étaient en réparation. L’un portait une entaille en forme de lune.", indirect: "Le maître artisan vous a dit que la facture de Mirelda semblait correspondre à un modèle différent.", interpretation: "Vous pensiez que les deux sorcières s’étaient mises d’accord sur le dépôt.", reliability: "Vous avez déplacé le balai, mais vous n’avez pas vérifié à qui il appartenait. Vous avez vu deux objets proches, pas leur remise initiale." }),
      card("jury", "Mission des jurés", "Jury", { mission: "1. Quels sont les faits réellement établis ?\n2. Quel mécanisme a contribué à aggraver le conflit ?\n3. Quelle serait la meilleure prochaine étape pour désamorcer la situation ?", content: "Distinguez propriété, usage et besoin. Demandez quelles informations manquent avant de trancher." }),
      card("verdict", "Deux histoires, un balai", "Verdict", { certain: "Les deux sorcières revendiquent un balai. Séléné l’utilisait depuis longtemps. Mirelda a une facture récente. L’objet a été déplacé pour réparation.", unproven: "La facture ne suffit pas à identifier l’objet sans vérifier le modèle. Aucun élément ne prouve une appropriation volontaire.", mechanism: "Perceptions différentes et manque d’informations.", secondary: "Intérêts divergents ; besoin de reconnaissance.", explanation: "Un même objet porte des significations différentes : achat récent pour l’une, outil familier et utile pour l’autre. Le déplacement a créé une ambiguïté interprétée comme une provocation.", takeaway: "Clarifier les faits peut ouvrir des solutions sans désigner un coupable." }),
      card("debrief", "Après l’audience", "Débrief", { origin: "La remise en réparation n’a pas été documentée et l’atelier n’a pas différencié les modèles.", aggravating: "La facture et l’ancienneté d’usage ont été traitées comme des preuves exclusives.", bias: "Manque d’informations, interprétations rapides et rivalité supposée.", needs: "Reconnaissance de l’attachement de Séléné ; sécurité de l’achat de Mirelda.", deescalation: "Comparer la marque, le modèle et la facture ; écouter l’usage de chacune ; envisager un prêt temporaire, une compensation ou un accord d’usage.", question: "Quelles solutions seraient justes si la propriété ne pouvait pas être établie immédiatement ?" })
    ]),
    makeCase("fantome-chateau", "Le fantôme trop bruyant", "Un fantôme est accusé de traverser volontairement les chambres du château pendant la nuit.", "Plusieurs habitants ont entendu des bruits dans les couloirs. Le fantôme traverse régulièrement certaines chambres depuis que l’escalier a été déplacé.", "Les habitants pensent qu’il les dérange exprès. Le fantôme affirme s’être perdu dans des passages modifiés pendant les travaux.", [
      card("affaire", "Les nuits agitées de Brumelune", "Audience publique", { content: "Des bruits nocturnes troublent le sommeil des habitants. Le fantôme Brumelune est accusé de traverser les chambres exprès.", facts: "Plusieurs personnes ont entendu des bruits. Brumelune emprunte les couloirs la nuit. L’escalier a changé de place récemment.", interpretations: "Le fantôme cherche à effrayer les habitants.\nIl ne retrouve plus son chemin." }),
      card("accusateur", "Dame Pivoine, châtelaine", "Accusation", { objective: "Retrouver le calme dans les chambres après la tombée du jour.", available: "Vous avez entendu trois portes claquer et des chaînes frotter contre les murs.", evidence: "Vous avez noté les heures des bruits et leur proximité avec les chambres.", interpretation: "Vous pensez que Brumelune fait exprès de passer sous vos fenêtres parce qu’il déteste les vivants.", unknown: "Vous ignorez que l’escalier a été déplacé et que le fantôme a perdu ses repères." }),
      card("accuse", "Brumelune, fantôme des galeries", "Défense", { objective: "Traverser le château sans effrayer personne et retrouver votre ancienne galerie.", content: "Vous suivez depuis des siècles le corridor qui mène à la tour. Depuis les travaux, vous aboutissez dans les chambres et vous vous perdez.", available: "Vous vous souvenez d’une porte bleue près de l’ancien escalier. Les couloirs ont été modifiés pendant votre sommeil diurne.", evidence: "Vous pouvez décrire votre trajet et les tentatives faites pour retrouver l’ancienne galerie.", unknown: "Vous ne saviez pas que les portes claquaient et que les habitants vous entendaient si distinctement." }),
      card("temoin", "Ronce, veilleur de nuit", "Témoin", { content: "Vous avez accompagné Brumelune une nuit : il a hésité à chaque embranchement et a demandé où se trouvait la tour.", facts: "L’escalier a été déplacé. Le fantôme est passé devant trois chambres et a fait claquer une porte.", indirect: "Des résidents disent avoir entendu un rire, mais vous n’en avez pas été témoin.", interpretation: "Vous pensiez d’abord qu’il rôdait pour faire peur.", reliability: "Vous avez observé une nuit de déplacement et les nouveaux couloirs ; vous ne connaissez pas les intentions du fantôme." }),
      card("jury", "Mission des jurés", "Jury", { mission: "1. Quels sont les faits réellement établis ?\n2. Quel mécanisme a contribué à aggraver le conflit ?\n3. Quelle serait la meilleure prochaine étape pour désamorcer la situation ?", content: "Distinguez l’impact (le bruit) de l’intention. Cherchez ce qui a changé dans l’environnement." }),
      card("verdict", "Un détour dans la nuit", "Verdict", { certain: "Les habitants ont entendu des bruits. Brumelune traverse certaines chambres. L’escalier et les repères ont changé.", unproven: "Aucune preuve ne montre que le fantôme voulait réveiller ou effrayer les habitants.", mechanism: "Attribution hostile et interprétation erronée.", secondary: "Perte de repères provoquée par un changement récent.", explanation: "Les habitants attribuent un comportement gênant à une intention. Le changement de trajet fournit une explication alternative, sans nier l’effet réel des bruits.", takeaway: "On peut reconnaître l’impact subi tout en vérifiant l’intention et le contexte." }),
      card("debrief", "Après l’audience", "Débrief", { origin: "Le déplacement de l’escalier a supprimé les repères habituels de Brumelune.", aggravating: "Les bruits nocturnes ont été interprétés comme une provocation avant qu’une conversation ait lieu.", bias: "Attribution hostile et lecture d’intention à partir d’un effet.", needs: "Repos et tranquillité pour les habitants ; orientation et accès à ses repères pour Brumelune.", deescalation: "Créer un itinéraire balisé, réparer les portes bruyantes, convenir d’horaires et vérifier avec les habitants si les mesures fonctionnent.", question: "Comment reconnaître la gêne vécue sans conclure trop vite sur l’intention ?" })
    ])
  ];
  const optionalWitnesses = {
    "linge-dragon": ["Le jeune écuyer", { content:"Vous avez aperçu un éclat près de la corde avant l’arrivée de la fumée.", facts:"Le vent poussait vers l’étendoir. Vous n’avez pas vu qui a produit la flamme.", indirect:"Vous avez entendu dire que Brasier avait éternué.", interpretation:"Vous avez d’abord pensé à une étincelle de la forge.", reliability:"Vous avez vu la lueur mais pas son origine." }],
    "balai-sorcieres": ["Maître Chardon, artisan", { content:"Vous avez reçu un balai de Séléné pour réparer son manche, puis un second balai semblable pour estimation.", facts:"Les deux objets sont de la même essence mais leurs gravures diffèrent.", indirect:"Mirelda a présenté sa facture après le déplacement des balais.", interpretation:"Vous pensez qu’une erreur d’étiquetage est possible.", reliability:"Vous avez inspecté les objets, mais pas assisté à leur achat." }],
    "fantome-chateau": ["Lise, chambrière", { content:"Vous avez entendu des chaînes dans le corridor puis vu Brumelune ressortir en s’excusant.", facts:"La porte de votre chambre a claqué et le fantôme semblait chercher son chemin.", indirect:"Une autre personne dit avoir entendu un rire au même moment.", interpretation:"Vous avez cru à une farce avant de voir sa confusion.", reliability:"Vous avez observé un passage, pas les autres nuits." }]
  };
  const factsCards = {
    "linge-dragon": { established:"Le linge a brûlé. Brasier s’était plaint de l’étendoir. Un encens brûlait et le vent soufflait vers la corde.", uncertain:"Personne n’a vu Brasier souffler volontairement sur le linge.", questions:"Qui a allumé l’encens ? D’où venait la première flamme ?" },
    "balai-sorcieres": { established:"Mirelda a une facture. Séléné utilisait le balai depuis longtemps et l’avait confié pour réparation.", uncertain:"La facture désigne peut-être un modèle proche. L’étiquette du balai a pu être déplacée.", questions:"Comparer la gravure et la facture ; demander qui a remis chaque balai." },
    "fantome-chateau": { established:"Plusieurs habitants ont entendu des bruits. Brumelune a traversé des chambres après le déplacement de l’escalier.", uncertain:"Aucun témoin n’a établi que le fantôme cherchait à réveiller quelqu’un.", questions:"Quel chemin Brumelune empruntait-il avant les travaux ?" }
  };
  examples.forEach(item => {
    item.cards.push(card("faits","Faits et indices","Repères de l’enquête",factsCards[item.id]));
    const [title, fields] = optionalWitnesses[item.id];
    item.cards.push(card("temoin",title,"Témoin facultatif",fields));
    const order=["affaire","accusateur","accuse","faits","temoin","temoin","jury","verdict","debrief"];
    item.cards.sort((a,b)=>order.indexOf(a.type)-order.indexOf(b.type));
  });
  const legacyExamples=examples.map(item=>({
    id:item.id,title:item.title,summary:item.summary,context:item.context,disagreement:item.disagreement,
    cards:item.cards.map(card=>({type:card.type,title:card.title,role:card.role,fields:JSON.parse(JSON.stringify(card.fields))}))
  }));
  const illustrations = [
    { src:"assets/illustrations/dragon.svg", name:"Dragon fantasy", source:"https://openclipart.org/detail/319543", license:"CC0 1.0" },
    { src:"assets/illustrations/sorcier.svg", name:"Sorcier", source:"https://openclipart.org/detail/344786/wizard", license:"CC0 1.0" },
    { src:"assets/illustrations/chevalier.svg", name:"Chevalier en joute", source:"https://openclipart.org/detail/351169/jousting-knight", license:"CC0 1.0" },
    { src:"assets/illustrations/porte-fantasy.svg", name:"Porte de carte fantasy", source:"https://openclipart.org/detail/11461/rpg-map-symbols-gate", license:"CC0 1.0" }
  ];
  const compactFields = {
    "linge-dragon": {
      affaire:{content:"Trois draps brûlent près de la grotte de Brasier.",facts:"Brasier avait demandé le déplacement de la corde.",interpretations:"Vengeance ou éternuement accidentel ?"},
      accusateur:{objective:"Obtenir réparation et libérer l’entrée du jardin.",available:"Vous avez entendu un grondement avant la fumée.",evidence:"Les draps sont noircis ; une dispute a eu lieu.",interpretation:"Vous pensez que Brasier s’est vengé.",unknown:"Un encens brûlait ; le vent poussait vers la corde."},
      accuse:{objective:"Expliquer le feu et réparer les dégâts.",content:"Vous avez éternué en sortant ; vous regrettez les draps.",available:"Le pollen doré irritait votre nez.",evidence:"Vous n’avez pas visé le jardin.",unknown:"Un encens brûlait près de l’étendoir."},
      faits:{established:"Les draps ont brûlé ; un encens se consumait.",uncertain:"Personne n’a vu l’origine de la flamme.",questions:"Qui a allumé l’encens ? D’où venait le feu ?"},
      temoin:[
        {content:"Vous avez vu une lueur près de la corde.",facts:"Le vent soufflait vers l’étendoir.",indirect:"Un apprenti parle d’un rugissement.",interpretation:"Vous avez d’abord soupçonné Brasier.",reliability:"Vous n’avez pas vu le départ du feu."},
        {content:"Vous avez aperçu un éclat avant la fumée.",facts:"L’encens brûlait sous la fenêtre.",indirect:"On vous a dit que Brasier avait éternué.",interpretation:"La lueur venait peut-être de l’encens.",reliability:"Vous avez vu la lueur, pas sa source."}
      ],
      jury:{mission:"Établir les faits, puis proposer une issue juste.",content:"Séparez les observations des suppositions."},
      verdict:{certain:"Le linge a brûlé ; l’encens et le vent ont pu contribuer.",unproven:"L’intention de Brasier n’est pas démontrée.",mechanism:"Attribution hostile.",secondary:"Biais de confirmation.",explanation:"La dispute a orienté la lecture des indices.",takeaway:"Un dommage ne prouve pas une intention."},
      debrief:{origin:"La corde gênait l’accès à la grotte.",aggravating:"La demande de Brasier a été ignorée.",bias:"Le voisin a privilégié l’hypothèse de vengeance.",needs:"Accès, sécurité et respect mutuel.",deescalation:"Vérifier l’encens, déplacer la corde et discuter réparation.",question:"Que faudrait-il vérifier avant d’accuser ?"}
    },
    "balai-sorcieres": {
      affaire:{content:"Mirelda et Séléné réclament un balai retrouvé à l’atelier.",facts:"Mirelda a une facture ; Séléné l’utilisait depuis longtemps.",interpretations:"Achat récent ou objet confié pour réparation ?"},
      accusateur:{objective:"Récupérer le balai acheté au marché.",available:"Votre facture décrit un modèle « Nuit-de-Chêne ».",evidence:"Le numéro de série figure sur votre reçu.",interpretation:"Vous croyez que Séléné veut garder votre achat.",unknown:"Deux balais semblables étaient à l’atelier."},
      accuse:{objective:"Retrouver votre balai et son manche gravé.",content:"Vous l’avez confié à l’artisan pour réparation.",available:"Une marque en lune se trouve sous la poignée.",evidence:"Vous connaissez la fente près du manche.",unknown:"Mirelda a acheté un modèle ressemblant au vôtre."},
      faits:{established:"Deux balais semblables étaient en réparation.",uncertain:"La facture ne désigne peut-être pas le bon objet.",questions:"Comparer gravure, série et registre de dépôt."},
      temoin:[
        {content:"Vous avez déplacé un balai vers le vestibule.",facts:"Deux balais sombres étaient sur l’établi.",indirect:"Le maître doute que la facture corresponde.",interpretation:"Vous pensiez le dépôt autorisé.",reliability:"Vous n’avez pas vérifié à qui il appartenait."},
        {content:"Vous avez reçu un balai de Séléné à réparer.",facts:"Les deux objets ont des gravures différentes.",indirect:"Mirelda a montré sa facture après le déplacement.",interpretation:"Une erreur d’étiquette est possible.",reliability:"Vous n’avez assisté à aucun achat."}
      ],
      jury:{mission:"Clarifier les faits et proposer une solution provisoire.",content:"Distinguez propriété, usage et besoin."},
      verdict:{certain:"Les deux sorcières réclament un balai semblable.",unproven:"La facture seule ne permet pas de trancher.",mechanism:"Informations incomplètes.",secondary:"Besoins et intérêts divergents.",explanation:"Le déplacement a créé une confusion sur l’objet.",takeaway:"Vérifier avant de conclure à une appropriation."},
      debrief:{origin:"L’atelier n’a pas étiqueté les dépôts.",aggravating:"Chacune a défendu sa version sans vérifier l’autre.",bias:"La rivalité a été supposée.",needs:"Reconnaissance et sécurité de l’achat.",deescalation:"Comparer la gravure et la facture, puis convenir d’un prêt ou d’un délai.",question:"Quelle solution serait juste sans preuve immédiate ?"}
    },
    "fantome-chateau": {
      affaire:{content:"Des bruits nocturnes réveillent les habitants du château.",facts:"Brumelune traverse les chambres depuis les travaux.",interpretations:"Veut-il effrayer ou a-t-il perdu son chemin ?"},
      accusateur:{objective:"Retrouver le calme pendant la nuit.",available:"Trois portes ont claqué près de vos chambres.",evidence:"Vous avez noté l’heure et le lieu des bruits.",interpretation:"Vous pensez que Brumelune provoque les habitants.",unknown:"L’escalier a été déplacé récemment."},
      accuse:{objective:"Retrouver votre galerie sans effrayer personne.",content:"Depuis les travaux, vous vous perdez dans les couloirs.",available:"Votre ancien repère était une porte bleue.",evidence:"Vous pouvez décrire votre trajet nocturne.",unknown:"Les portes claquent et réveillent les habitants."},
      faits:{established:"Des bruits ont été entendus après le déplacement de l’escalier.",uncertain:"Aucun témoin n’a établi une intention de nuire.",questions:"Quel itinéraire Brumelune suivait-il avant les travaux ?"},
      temoin:[
        {content:"Vous avez guidé Brumelune, perdu à chaque embranchement.",facts:"L’escalier a changé ; une porte a claqué.",indirect:"Un résident dit avoir entendu un rire.",interpretation:"Vous aviez d’abord cru à une farce.",reliability:"Vous avez observé une seule nuit."},
        {content:"Vous avez vu Brumelune ressortir en s’excusant.",facts:"Le fantôme cherchait l’ancienne galerie.",indirect:"Les chaînes résonnent dans le corridor.",interpretation:"Les bruits semblaient intentionnels.",reliability:"Vous ignorez ce qu’il voulait faire."}
      ],
      jury:{mission:"Reconnaître la gêne et vérifier l’intention.",content:"Cherchez ce qui a changé dans les lieux."},
      verdict:{certain:"Les bruits dérangent ; le trajet a été modifié.",unproven:"Rien ne prouve que Brumelune voulait réveiller.",mechanism:"Attribution hostile.",secondary:"Perte des repères habituels.",explanation:"Un effet gênant ne révèle pas à lui seul l’intention.",takeaway:"Écouter l’impact sans présumer du motif."},
      debrief:{origin:"Les travaux ont déplacé l’escalier.",aggravating:"Les habitants ont accusé sans se parler.",bias:"Le bruit a été pris pour une provocation.",needs:"Repos pour les habitants, repères pour Brumelune.",deescalation:"Baliser un trajet et réparer les portes bruyantes.",question:"Comment réduire la gêne sans juger l’intention ?"}
    }
  };
  examples.forEach(item => {
    let witnessIndex=0;
    item.image=illustrations[Math.floor(Math.random()*illustrations.length)].src;
    item.cards.forEach(card => {
      const text=compactFields[item.id][card.type];
      card.fields=card.type==="temoin"?text[witnessIndex++]:text;
      card.image="";
    });
  });
  window.TDC_DATA = {
    version: 1,
    illustrations,
    legacyExamples,
    settings: {
      gameName: "Le Tribunal du Chaos",
      subtitle: "Chroniques du royaume et conflits en audience",
      emblem: "⚖",
      backNote: "",
      accent: "#733b3b",
      fontStyle: "ornate",
      frameStyle: "double",
      ornament: "⚖",
      familyColors: { affaire:"#733b3b", accusateur:"#644533", accuse:"#435c4b", temoin:"#435a67", jury:"#806a35", verdict:"#734747", debrief:"#506145" }
    },
    cases: examples
  };
})();
