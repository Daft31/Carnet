// Fonction serverless Vercel : parse une description de repas en langage
// naturel via Mammouth AI (API compatible OpenAI), en utilisant la clé
// stockée côté serveur uniquement (jamais exposée au client).

const MAMMOUTH_API_URL = 'https://api.mammouth.ai/v1/chat/completions';
const MAMMOUTH_MODEL = 'gpt-5.4-mini';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Message système : cadre le persona, le format de sortie strict et la
// gestion des quantités imprécises. Les exemples few-shot (voir plus bas)
// sont envoyés séparément comme tours user/assistant, pas inclus ici.
const SYSTEM_PROMPT = `Tu es un(e) diététicien(ne)-nutritionniste professionnel(le), spécialisé(e) dans l'estimation rapide des valeurs nutritionnelles de repas décrits en langage libre et familier (français courant, y compris argot alimentaire type "maxi best of", "kebab", "menu"). Tu connais aussi bien la cuisine internationale que la cuisine française régionale (plats mijotés, gratins, galettes, charcuterie, etc.), où une estimation générique naïve est souvent moins fiable.

Ta tâche : à partir d'une description de repas, estimer les valeurs nutritionnelles totales du repas décrit dans son ensemble (pas par portion de 100g).

Format de sortie — règles strictes :
- Réponds UNIQUEMENT avec un objet JSON valide, rien d'autre : pas de markdown, pas de blocs \`\`\`, pas de phrase avant ou après, pas de commentaire.
- L'objet JSON doit contenir exactement ces champs, dans cet ordre :
  {
    "name": "nom court et naturel du repas",
    "calories": nombre (kcal, total du repas),
    "protein": nombre (grammes, total du repas),
    "carbs": nombre (grammes de glucides totaux, total du repas — n'exclus PAS les fibres de ce chiffre),
    "fat": nombre (grammes, total du repas),
    "fiber": nombre (grammes de fibres, information séparée, incluse dans "carbs" et non soustraite),
    "ingredients": ["ingrédient 1", "ingrédient 2", "..."]
  }
- Tous les champs numériques sont des nombres (pas de chaînes, pas d'unités dans la valeur).
- "calories" doit être cohérent avec les macros : environ 4 kcal/g de protéines + 4 kcal/g de glucides + 9 kcal/g de lipides (un écart raisonnable est normal — alcool, arrondis — mais évite un écart flagrant).

Gestion des quantités imprécises :
- Si une quantité n'est pas précisée (ex. "un poulet basquaise", "des frites"), estime une portion normale de restaurant ou de repas fait maison (ni portion minuscule, ni portion XXL), de façon raisonnable et plutôt conservatrice (ne pas surestimer par excès de prudence dans l'autre sens non plus).
- Si le repas mentionne plusieurs éléments (plat + accompagnement + boisson), additionne tout dans le total retourné : le JSON représente le repas complet décrit, pas un seul élément.
- En cas de plat composite dont la recette varie (ex. "tartiflette", "blanquette"), base-toi sur une recette et une portion typiques, pas sur le cas le plus riche ni le plus léger possible.

Produits de marque / fast-food (ex. "Big Tasty", "Croq McDo", "Menu Best Of", produits McDonald's/Burger King/KFC/Subway...) :
- Ce ne sont PAS des plats à improviser librement : ce sont des références précises avec une composition standardisée quasiment fixe d'un restaurant à l'autre. Base-toi sur tes connaissances les plus précises et les plus stables des valeurs nutritionnelles réellement publiées par l'enseigne pour CE produit exact (nom, variante, taille), au lieu d'estimer "une assiette plausible" comme pour un plat maison.
- Reste cohérent avec toi-même : pour une même description exacte, tes valeurs ne doivent pas varier de façon significative d'une fois à l'autre — traite ça comme un rappel de fait connu, pas comme une nouvelle estimation à chaque fois.
- Si tu ne connais pas avec confiance un produit de marque précis (nom ambigu, enseigne peu connue), dis-le implicitement en restant sur une estimation raisonnable plutôt que d'inventer un chiffre à fausse précision.`;

// Exemples few-shot calibrés sur des plats français/régionaux, où un modèle
// généraliste a tendance à être moins précis que sur de la nourriture
// américaine/générique. Valeurs cohérentes avec des tables nutritionnelles
// usuelles (type CIQUAL) pour une portion typique du plat complet décrit,
// recoupées avec la règle 4/4/9 (protéines/glucides à 4 kcal/g, lipides à
// 9 kcal/g) pour rester elles-mêmes internement cohérentes.
const FEW_SHOT_EXAMPLES = [
  {
    user: 'poulet basquaise avec du riz',
    assistant: {
      name: 'Poulet basquaise avec riz',
      calories: 600,
      protein: 50,
      carbs: 58,
      fat: 14,
      fiber: 5,
      ingredients: ['blanc de poulet', 'poivrons', 'tomates', 'oignons', 'riz'],
    },
  },
  {
    user: 'une portion de tartiflette',
    assistant: {
      name: 'Tartiflette',
      calories: 650,
      protein: 22,
      carbs: 38,
      fat: 42,
      fiber: 4,
      ingredients: ['pommes de terre', 'reblochon', 'lardons', 'oignons', 'crème fraîche'],
    },
  },
  {
    user: 'blanquette de veau avec du riz',
    assistant: {
      name: 'Blanquette de veau avec riz',
      calories: 550,
      protein: 38,
      carbs: 52,
      fat: 18,
      fiber: 3,
      ingredients: ['veau', 'carottes', 'champignons', 'sauce crème', 'riz'],
    },
  },
  {
    user: 'une galette saucisse',
    assistant: {
      name: 'Galette saucisse',
      calories: 450,
      protein: 22,
      carbs: 23,
      fat: 29,
      fiber: 2,
      ingredients: ['galette de blé noir', 'saucisse de porc grillée'],
    },
  },
];

function buildMessages(mealDescription, isRemainderOnly) {
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
  for (const ex of FEW_SHOT_EXAMPLES) {
    messages.push({ role: 'user', content: `Description du repas : "${ex.user}"` });
    messages.push({ role: 'assistant', content: JSON.stringify(ex.assistant) });
  }
  // Cas repas partiellement reconnu (voir matchFastfoodItems) : le reste du repas a déjà
  // des valeurs fixes calculées côté serveur, on ne demande à l'IA d'estimer QUE les
  // éléments restants — évite de lui redemander d'estimer (avec variance) des éléments
  // déjà connus avec certitude.
  const prefix = isRemainderOnly
    ? `Les autres éléments de ce repas ont déjà été identifiés avec des valeurs connues et ne font PAS partie de ta réponse. Estime uniquement les éléments suivants : `
    : `Description du repas : `;
  messages.push({
    role: 'user',
    content: `${prefix}"${mealDescription}"`,
  });
  return messages;
}

// Vérification de cohérence côté code (aucun appel IA supplémentaire :
// calcul local instantané et gratuit). On recalcule les calories à partir
// des macros (4 kcal/g protéines, 4 kcal/g glucides, 9 kcal/g lipides) et on
// compare au total "calories" annoncé par le modèle.
//
// Choix volontairement conservateur : on se contente de logguer un
// avertissement serveur (console.warn) quand l'écart dépasse le seuil, sans
// jamais modifier les valeurs retournées au client. Corriger/ajuster
// automatiquement les chiffres serait risqué : des cas parfaitement valides
// s'écartent légèrement de la règle 4/4/9 (alcool à ~7 kcal/g non compté
// dans les champs macro, arrondis du modèle, polyols...), et une "correction"
// pourrait rendre un repas plausible incohérent avec sa propre estimation.
// Le but ici est de détecter et surveiller les cas aberrants (utile pour
// repérer un modèle qui dérive), pas de retoucher la réponse utilisateur.
const MACRO_MISMATCH_THRESHOLD = 0.3; // 30% d'écart relatif

function checkMacroConsistency(data) {
  if (!data || typeof data !== 'object') return null;

  const calories = Number(data.calories);
  const protein = Number(data.protein) || 0;
  const carbs = Number(data.carbs) || 0;
  const fat = Number(data.fat) || 0;

  if (!Number.isFinite(calories) || calories <= 0) return null;

  const computed = 4 * protein + 4 * carbs + 9 * fat;
  const relativeDiff = Math.abs(computed - calories) / calories;

  if (relativeDiff > MACRO_MISMATCH_THRESHOLD) {
    return {
      declaredCalories: calories,
      computedCalories: Math.round(computed),
      relativeDiff,
    };
  }
  return null;
}

/* ===================== CATALOGUE FAST-FOOD (valeurs fixes vérifiées) =====================
   Corrige la variance constatée par l'utilisateur (jusqu'à 400kcal d'écart entre deux
   régénérations d'un même repas McDonald's) : pour les produits de marque à composition
   standardisée, on préfère une valeur FIXE et vérifiée à une "estimation" IA qui varie à
   chaque appel. Recherché via WebSearch (mcdonalds.fr direct inaccessible depuis cet
   environnement de dev), croisé sur au moins 2 sources indépendantes quand possible, avec
   contrôle de cohérence 4/4/9 (protéines/glucides à 4kcal/g, lipides à 9kcal/g) systématique.
   N'inclut QUE les entrées "haute" ou "moyenne" confiance — les valeurs "faible confiance"
   (sources trop contradictoires pour trancher, ex. Big Tasty 2 viandes : 850/877/914/940 kcal
   selon la source) sont volontairement EXCLUES d'ici plutôt que d'inventer un chiffre : ces
   cas restent estimés par l'IA comme avant (avec le garde-fou du prompt ci-dessus).
   `aliases` doit être trié du plus spécifique au plus générique quand il y a un risque de
   collision de sous-chaîne (ex. "double cheeseburger" doit matcher avant "cheeseburger" seul
   — voir `matchFastfoodItems`, qui teste les aliases les plus longs en premier). */
const FASTFOOD_ITEMS = [
  // McDonald's — source officielle mcdonalds.fr (fiche produit par produit, fournie par
  // l'utilisateur, vérifiée le 2026-09-14), confiance haute pour toutes les entrées de ce
  // bloc. Remplace les valeurs WebSearch précédentes, moins fiables — corrections notables :
  // Filet-O-Fish était surestimé à 378kcal (officiel : 329kcal), et surtout Big Tasty 2
  // viandes n'avait AUCUNE valeur fiable avant (850/877/914/940 selon la source) — résolu.
  { id: 'mcdo_big_mac', brand: 'McDonald\'s', name: 'Big Mac', aliases: ['big mac'], calories: 530, protein: 27, carbs: 42, fat: 28, fiber: 3.8 },
  { id: 'mcdo_big_tasty_2v', brand: 'McDonald\'s', name: 'Big Tasty 2 viandes', aliases: ['big tasty 2 viandes', 'double big tasty'], calories: 961, protein: 58, carbs: 46, fat: 60, fiber: 2.6 },
  { id: 'mcdo_mcchicken', brand: 'McDonald\'s', name: 'McChicken', aliases: ['mcchicken', 'mc chicken'], calories: 434, protein: 19, carbs: 45, fat: 19, fiber: 3.3 },
  { id: 'mcdo_croque', brand: 'McDonald\'s', name: 'Croque McDo', aliases: ['croque mcdo', 'croque-mcdo', 'croq mcdo', 'croq'], calories: 255, protein: 13, carbs: 28, fat: 9.7, fiber: 1.7 },
  { id: 'mcdo_filet_o_fish', brand: 'McDonald\'s', name: 'Filet-O-Fish', aliases: ['filet-o-fish', 'filet o fish'], calories: 329, protein: 15, carbs: 36, fat: 14, fiber: 2.2 },
  { id: 'mcdo_double_cheeseburger', brand: 'McDonald\'s', name: 'Double Cheeseburger', aliases: ['double cheese', 'double cheeseburger'], calories: 442, protein: 27, carbs: 31, fat: 23, fiber: 2.2 },
  { id: 'mcdo_double_cheese_bacon', brand: 'McDonald\'s', name: 'Double Cheese Bacon', aliases: ['double cheese bacon'], calories: 456, protein: 28, carbs: 31, fat: 24, fiber: 2.0 },
  { id: 'mcdo_cheeseburger', brand: 'McDonald\'s', name: 'Cheeseburger', aliases: ['cheeseburger'], calories: 300, protein: 16, carbs: 30, fat: 13, fiber: 2.1 },
  { id: 'mcdo_royal_deluxe', brand: 'McDonald\'s', name: 'Royal Deluxe', aliases: ['royal deluxe', 'royal cheese'], calories: 549, protein: 30, carbs: 34, fat: 32, fiber: 2.7 },
  { id: 'mcdo_royal_bacon', brand: 'McDonald\'s', name: 'Royal Bacon', aliases: ['royal bacon'], calories: 492, protein: 30, carbs: 38, fat: 24, fiber: 2.6 },
  { id: 'mcdo_hamburger', brand: 'McDonald\'s', name: 'Hamburger', aliases: ['hamburger mcdo'], calories: 253, protein: 13, carbs: 29, fat: 8.9, fiber: 2.1 },
  { id: 'mcdo_petite_frite', brand: 'McDonald\'s', name: 'Petite frite', aliases: ['petite frite', 'petites frites'], calories: 231, protein: 2.7, carbs: 29, fat: 11, fiber: 2.8 },
  { id: 'mcdo_grande_frite', brand: 'McDonald\'s', name: 'Grande frite', aliases: ['grande frite', 'grandes frites'], calories: 328, protein: 3.9, carbs: 41, fat: 16, fiber: 4.0 },
  // Nuggets : seul le format officiel "4 pièces" est vérifié (174kcal) — les quantités 6/9/20
  // sont dérivées linéairement (174/4 par pièce), pas des fiches officielles à part entière.
  // qtyMultipliable + requireQty : ne matche QUE si un nombre est explicitement écrit devant
  // ("6 nuggets"), jamais sur "des nuggets" seul (éviterait de faire une hypothèse de quantité).
  { id: 'mcdo_nugget', brand: 'McDonald\'s', name: 'Chicken McNugget', aliases: ['nuggets', 'nugget', 'mcnuggets', 'mcnugget', 'chicken mcnuggets', 'chicken mcnugget'], calories: 43.5, protein: 2.5, carbs: 3.25, fat: 2.25, fiber: 0.15, qtyMultipliable: true, requireQty: true },
  { id: 'mcdo_mcflurry_oreo', brand: 'McDonald\'s', name: 'McFlurry Oreo', aliases: ['mcflurry oreo', 'mc flurry oreo'], calories: 251, protein: 6, carbs: 41, fat: 7 },
  // Burger King — source officielle burgerking.fr (fiche produit par produit, fournie par
  // l'utilisateur, vérifiée le 2026-09-14). Remplace les anciennes valeurs WebSearch — le
  // "Cheeseburger"/"Double Cheeseburger" générique testés avant n'apparaissent PAS au
  // catalogue officiel actuel (retirés), remplacés par les vrais burgers du menu France.
  { id: 'bk_whopper', brand: 'Burger King', name: 'Whopper', aliases: ['whopper'], calories: 629, protein: 28, carbs: 49, fat: 35 },
  { id: 'bk_double_whopper_cheese', brand: 'Burger King', name: 'Double Whopper Cheese', aliases: ['double whopper cheese', 'double whopper'], calories: 934, protein: 52, carbs: 49, fat: 58 },
  { id: 'bk_steakhouse', brand: 'Burger King', name: 'Steakhouse', aliases: ['steakhouse bk', 'bk steakhouse'], calories: 829, protein: 37, carbs: 54, fat: 51 },
  { id: 'bk_big_king', brand: 'Burger King', name: 'Big King', aliases: ['big king'], calories: 482, protein: 27, carbs: 30, fat: 28 },
  { id: 'bk_big_king_xxl', brand: 'Burger King', name: 'Big King XXL', aliases: ['big king xxl'], calories: 964, protein: 56, carbs: 49, fat: 59 },
  { id: 'bk_king_fish', brand: 'Burger King', name: 'King Fish', aliases: ['king fish'], calories: 398, protein: 17, carbs: 38, fat: 19 },
  { id: 'bk_petites_frites', brand: 'Burger King', name: 'Petites frites', aliases: ['petites frites bk', 'bk petites frites'], calories: 239, protein: 3.0, carbs: 36, fat: 10 },
  { id: 'bk_moyennes_frites', brand: 'Burger King', name: 'Moyennes frites', aliases: ['moyennes frites bk', 'bk moyennes frites', 'frites bk', 'bk frites'], calories: 309, protein: 3.8, carbs: 46, fat: 13 },
  { id: 'bk_grandes_frites', brand: 'Burger King', name: 'Grandes frites', aliases: ['grandes frites bk', 'bk grandes frites'], calories: 423, protein: 5.3, carbs: 63, fat: 18 },
  { id: 'bk_king_nuggets4', brand: 'Burger King', name: 'King Nuggets (4)', aliases: ['king nuggets 4', 'king nuggets'], calories: 174, protein: 10, carbs: 17, fat: 7.2 },
  // KFC — source officielle kfc.fr (fiche produit par produit, fournie par l'utilisateur,
  // vérifiée le 2026-09-14). "Zinger Burger" (ancienne valeur WebSearch) n'apparaît PAS au
  // catalogue officiel actuel — retiré, remplacé par les vrais burgers du menu France.
  { id: 'kfc_colonel', brand: 'KFC', name: 'Colonel Original', aliases: ['colonel original', 'colonel burger'], calories: 607, protein: 29.5, carbs: 56.4, fat: 30, fiber: 3.8 },
  { id: 'kfc_double_kentucky', brand: 'KFC', name: 'Double Kentucky Burger', aliases: ['double kentucky burger', 'double kentucky'], calories: 1012, protein: 65, carbs: 89.5, fat: 42.6, fiber: 5.1 },
  { id: 'kfc_kentucky_bbq_bacon', brand: 'KFC', name: 'Kentucky BBQ & Bacon', aliases: ['kentucky bbq bacon', 'kentucky bbq et bacon'], calories: 806, protein: 42.6, carbs: 69.3, fat: 38.2, fiber: 7.4 },
  { id: 'kfc_crispy_burger', brand: 'KFC', name: 'Crispy Burger', aliases: ['crispy burger'], calories: 385, protein: 19.2, carbs: 39.6, fat: 15.9, fiber: 2.6 },
  { id: 'kfc_boxmaster', brand: 'KFC', name: 'Boxmaster Original', aliases: ['boxmaster original', 'boxmaster'], calories: 686, protein: 30.1, carbs: 59.2, fat: 35.7, fiber: 2.9 },
  { id: 'kfc_tower_cheese_bacon', brand: 'KFC', name: 'Tower Cheese & Bacon', aliases: ['tower cheese bacon', 'tower cheese et bacon'], calories: 706, protein: 29.5, carbs: 78.5, fat: 29.3, fiber: 5.4 },
  { id: 'kfc_krunchy', brand: 'KFC', name: 'Krunchy', aliases: ['krunchy kfc', 'kfc krunchy'], calories: 334, protein: 16.9, carbs: 34.3, fat: 13.9, fiber: 2.0 },
  { id: 'kfc_2tenders', brand: 'KFC', name: '2 Tenders', aliases: ['2 tenders'], calories: 292, protein: 20.2, carbs: 14, fat: 17, fiber: 1.3 },
  { id: 'kfc_5tenders', brand: 'KFC', name: '5 Tenders', aliases: ['5 tenders'], calories: 730, protein: 50.6, carbs: 35, fat: 42.4, fiber: 3.2 },
  { id: 'kfc_moyennes_frites', brand: 'KFC', name: 'Moyennes Frites', aliases: ['moyennes frites kfc', 'kfc moyennes frites', 'frites kfc', 'kfc frites'], calories: 226, protein: 4.0, carbs: 33.7, fat: 9.2, fiber: 3.9 },
  { id: 'kfc_grandes_frites', brand: 'KFC', name: 'Grandes Frites', aliases: ['grandes frites kfc', 'kfc grandes frites'], calories: 316, protein: 5.6, carbs: 47.2, fat: 12.9, fiber: 5.5 },
  // Quick — source officielle quick.fr / déclaration nutritionnelle PDF (fournie par
  // l'utilisateur, valable à partir du 28/04/2026), nouvelle enseigne ajoutée au catalogue.
  { id: 'quick_mega_giant', brand: 'Quick', name: 'Méga Giant', aliases: ['mega giant', 'méga giant'], calories: 859, protein: 46, carbs: 38, fat: 58, fiber: 2.4 },
  { id: 'quick_giant_original', brand: 'Quick', name: 'Giant Original', aliases: ['giant original'], calories: 545, protein: 27, carbs: 27, fat: 36, fiber: 2 },
  { id: 'quick_giant_max', brand: 'Quick', name: 'Giant Max', aliases: ['giant max'], calories: 657, protein: 28, carbs: 38, fat: 43, fiber: 2.4 },
  { id: 'quick_double_cheeseburger', brand: 'Quick', name: 'Double Cheeseburger Quick', aliases: ['double cheeseburger quick', 'quick double cheeseburger'], calories: 407, protein: 25, carbs: 29, fat: 21, fiber: 1.9 },
  { id: 'quick_cheeseburger', brand: 'Quick', name: 'Cheeseburger Quick', aliases: ['cheeseburger quick', 'quick cheeseburger'], calories: 279, protein: 15, carbs: 28, fat: 11, fiber: 1.9 },
  { id: 'quick_long_chicken', brand: 'Quick', name: 'Long Chicken', aliases: ['long chicken'], calories: 528, protein: 22, carbs: 50, fat: 26, fiber: 4.2 },
  { id: 'quick_petite_frites', brand: 'Quick', name: 'Petite Frites Quick', aliases: ['petites frites quick', 'quick petites frites'], calories: 172, protein: 2, carbs: 23, fat: 8, fiber: 2.2 },
  { id: 'quick_moyenne_frites', brand: 'Quick', name: 'Moyenne Frites Quick', aliases: ['moyennes frites quick', 'quick moyennes frites', 'frites quick', 'quick frites'], calories: 296, protein: 4, carbs: 39, fat: 13, fiber: 3.7 },
  { id: 'quick_grande_frites', brand: 'Quick', name: 'Grande Frites Quick', aliases: ['grandes frites quick', 'quick grandes frites'], calories: 404, protein: 5, carbs: 53, fat: 18, fiber: 5.1 },
  { id: 'quick_chicken_dips4', brand: 'Quick', name: 'Chicken dips (4)', aliases: ['chicken dips 4', 'chicken dips'], calories: 178, protein: 11, carbs: 15, fat: 8, fiber: 1.5 },
];

function normalizeFoodText(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Coca-Cola (et variantes zero/light) : traité à part plutôt que comme des entrées fixes du
// catalogue, car la composition officielle Coca-Cola est un fait public stable et se calcule
// linéairement à partir du volume (4.2kcal/cl pour l'original — cohérent avec les valeurs
// trouvées : 25cl=105kcal, 40cl=168kcal, 50cl=210kcal — et ~0kcal/cl pour zero/light, édulcorés
// donc sans sucre). Évite de lister chaque combinaison marque×taille×variante séparément.
function matchCola(normalizedText) {
  const m = normalizedText.match(/coca(?:\s*-?\s*cola)?\s*(zero|light|z[eé]ro)?[^0-9]{0,15}?(\d{2})\s*cl/);
  if (!m) return null;
  const isDiet = !!m[1];
  const cl = Number(m[2]);
  if (!cl || cl < 15 || cl > 100) return null;
  const kcalPerCl = isDiet ? 0 : 4.2;
  return {
    id: 'coca_' + (isDiet ? 'zero' : 'regular') + '_' + cl,
    name: `Coca-Cola${isDiet ? ' Zero/Light' : ''} ${cl}cl`,
    calories: Math.round(kcalPerCl * cl),
    protein: 0,
    carbs: isDiet ? 0 : Math.round(cl * 1.06 * 10) / 10,
    fat: 0,
    matchedText: m[0],
  };
}

// Découpe le texte en segments (mêmes séparateurs qu'une saisie typique "item - item - item"),
// cherche pour chacun le meilleur match du catalogue (aliases les plus longs en premier, pour
// que "double cheeseburger" batte "cheeseburger"), avec une quantité en tête optionnelle
// ("2 big mac" -> qty 2). Retourne les items reconnus ET les segments non reconnus (texte brut,
// à faire estimer par l'IA si besoin).
function matchFastfoodItems(mealDescription) {
  // Découpe le texte BRUT (séparateurs "-", ",", "+", retour ligne, " et ") avant toute
  // normalisation : normalizeFoodText() supprime la ponctuation (dont les tirets), donc
  // normaliser avant de découper détruirait les séparateurs et fusionnerait tout le repas
  // en un seul segment (bug constaté : un seul item matchait, le reste du texte du même
  // "segment" géant était silencieusement perdu au lieu de finir en unmatchedSegments).
  const rawSegments = String(mealDescription || '').split(/\s*[-,+\n]\s*|\s+et\s+/i).map(s => s.trim()).filter(Boolean);
  if (!rawSegments.length) return { matched: [], unmatchedSegments: [] };

  const allAliases = [];
  FASTFOOD_ITEMS.forEach(item => item.aliases.forEach(a => allAliases.push({ item, alias: a })));
  allAliases.sort((a, b) => b.alias.length - a.alias.length);

  const matched = [];
  const unmatchedSegments = [];

  rawSegments.forEach(rawSeg => {
    const seg = normalizeFoodText(rawSeg);
    if (!seg) return;
    const cola = matchCola(seg);
    if (cola) { matched.push({ ...cola, qty: 1 }); return; }
    const hit = allAliases.find(a => seg.includes(a.alias));
    const qtyMatch = seg.match(/^(\d+)\s/);
    if (hit && hit.item.requireQty && !qtyMatch) {
      // Ex. "nuggets" (catalogue générique par pièce) sans nombre devant : pas de quantité
      // sûre à supposer, on laisse l'IA estimer plutôt que de fixer une quantité arbitraire.
      unmatchedSegments.push(rawSeg);
    } else if (hit) {
      const qty = (hit.item.qtyMultipliable && qtyMatch) ? Number(qtyMatch[1]) : 1;
      matched.push({ ...hit.item, qty });
    } else {
      unmatchedSegments.push(rawSeg);
    }
  });

  return { matched, unmatchedSegments };
}

function sumMatched(matched) {
  return matched.reduce((sum, m) => ({
    calories: sum.calories + m.calories * m.qty,
    protein: sum.protein + (m.protein || 0) * m.qty,
    carbs: sum.carbs + (m.carbs || 0) * m.qty,
    fat: sum.fat + (m.fat || 0) * m.qty,
    fiber: sum.fiber + (m.fiber || 0) * m.qty,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mealDescription } = req.body;

    if (!mealDescription) {
      return res.status(400).json({ error: 'Meal description is required' });
    }

    // Étape 1 : matching contre le catalogue fast-food à valeurs fixes (voir plus haut).
    // Repas entièrement reconnu -> réponse déterministe, AUCUN appel IA (zéro variance
    // possible). Repas partiellement reconnu -> l'IA n'estime que le reste, on additionne.
    // Repas non reconnu -> comportement inchangé (IA estime tout, comme avant).
    const { matched, unmatchedSegments } = matchFastfoodItems(mealDescription);

    if (matched.length && !unmatchedSegments.length) {
      const totals = sumMatched(matched);
      return res.status(200).json({
        success: true,
        data: {
          name: matched.map(m => (m.qty > 1 ? `${m.qty}x ` : '') + m.name).join(', '),
          calories: Math.round(totals.calories),
          protein: Math.round(totals.protein * 10) / 10,
          carbs: Math.round(totals.carbs * 10) / 10,
          fat: Math.round(totals.fat * 10) / 10,
          fiber: Math.round(totals.fiber * 10) / 10,
          ingredients: matched.map(m => m.name),
        },
      });
    }

    if (!process.env.CARNET_API_KEY) {
      return res.status(500).json({ error: 'CARNET_API_KEY manquante côté serveur (Vercel)' });
    }

    const isPartialMatch = matched.length > 0;
    const textForAI = isPartialMatch ? unmatchedSegments.join(', ') : mealDescription;

    const apiRes = await fetch(MAMMOUTH_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CARNET_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MAMMOUTH_MODEL,
        messages: buildMessages(textForAI, isPartialMatch),
        // Baissé de 0.2 à 0.1 : la variance élevée constatée en régénérant plusieurs fois
        // le même repas (ex. un repas McDonald's précis donnant entre 1200 et 1600 kcal
        // selon la régénération) venait surtout d'un manque de repère pour les produits de
        // marque dans le prompt (voir la section "Produits de marque / fast-food" plus haut),
        // mais une température plus basse réduit aussi la variance résiduelle de décodage.
        // Le catalogue fast-food ci-dessus règle maintenant le cas des produits reconnus ;
        // ceci reste utile pour les produits de marque absents du catalogue.
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error('Mammouth API error:', apiRes.status, errText);
      return res.status(502).json({
        error: 'Erreur API Mammouth',
        details: `${apiRes.status}: ${errText.slice(0, 300)}`,
      });
    }

    const payload = await apiRes.json();
    const responseText = payload?.choices?.[0]?.message?.content || '';

    let nutritionData;
    try {
      nutritionData = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        nutritionData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Réponse IA non parsable en JSON');
      }
    }

    // Repas partiellement reconnu : additionne le total fixe (catalogue) au total estimé
    // par l'IA pour le reste, plutôt que de faire confiance à l'IA pour reproduire les
    // valeurs connues sans dérive — garantit que la partie reconnue est TOUJOURS exacte.
    if (isPartialMatch && nutritionData && typeof nutritionData === 'object' && !nutritionData.error) {
      const fixedTotals = sumMatched(matched);
      nutritionData = {
        name: [matched.map(m => (m.qty > 1 ? `${m.qty}x ` : '') + m.name).join(', '), nutritionData.name].filter(Boolean).join(', '),
        calories: Math.round(fixedTotals.calories + (Number(nutritionData.calories) || 0)),
        protein: Math.round((fixedTotals.protein + (Number(nutritionData.protein) || 0)) * 10) / 10,
        carbs: Math.round((fixedTotals.carbs + (Number(nutritionData.carbs) || 0)) * 10) / 10,
        fat: Math.round((fixedTotals.fat + (Number(nutritionData.fat) || 0)) * 10) / 10,
        fiber: Math.round((fixedTotals.fiber + (Number(nutritionData.fiber) || 0)) * 10) / 10,
        ingredients: [...matched.map(m => m.name), ...(Array.isArray(nutritionData.ingredients) ? nutritionData.ingredients : [])],
      };
    }

    const mismatch = checkMacroConsistency(nutritionData);
    if (mismatch) {
      console.warn(
        'Incohérence macro/calories détectée pour la description',
        JSON.stringify(mealDescription),
        '- calories annoncées:', mismatch.declaredCalories,
        '- calories calculées depuis les macros (4/4/9):', mismatch.computedCalories,
        `- écart relatif: ${(mismatch.relativeDiff * 100).toFixed(0)}%`
      );
    }

    return res.status(200).json({
      success: true,
      data: nutritionData,
    });
  } catch (error) {
    console.error('Error parsing meal:', error);
    return res.status(500).json({
      error: 'Failed to parse meal description',
      details: error.message,
    });
  }
}
