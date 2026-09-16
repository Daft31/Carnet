// Fonction serverless Vercel : structure un programme de musculation/fitness
// collé en texte libre (format toujours variable : "Block"/"Circuit"/EMOM/
// AMRAP/Tabata/liste simple, tempo "2/2/X/1" ou "3-1-1", repos en secondes ou
// minutes...) via Mammouth AI (API compatible OpenAI), avec la clé stockée
// côté serveur uniquement (jamais exposée au client) — même clé/modèle que
// api/parse-meal.js et api/parse-recipe.js.
//
// Contrairement à parse-meal/parse-recipe, la durée totale estimée
// (estimatedDurationMin) n'est PAS demandée au modèle : elle est recalculée
// ici, côté code, à partir des blocks/exercices structurés que le modèle
// renvoie (voir estimateWorkoutDurationMin plus bas). Un LLM est fiable pour
// extraire "4 séries de 8 reps, tempo 2/2/X/1, repos 90s" d'un texte libre,
// beaucoup moins pour faire l'arithmétique qui en découle — mieux vaut un
// calcul déterministe, testable, et indépendant d'une éventuelle dérive du
// modèle sur ce point précis.

const MAMMOUTH_API_URL = 'https://api.mammouth.ai/v1/chat/completions';
const MAMMOUTH_MODEL = 'gpt-5.4-mini';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Message système : cadre le persona, le domaine (programmes de musculation/
// fitness/crossfit, français ET anglais), les formats variés rencontrés en
// pratique, et surtout la règle « ne pas inventer » — un texte collé peut très
// bien ne pas être un programme de sport exploitable du tout.
const SYSTEM_PROMPT = `Tu es un coach sportif spécialisé dans la lecture de programmes de musculation/fitness/crossfit écrits en langage libre par d'autres coachs (français ou anglais), et dans leur mise en forme structurée.

Le texte fourni peut prendre des formes très variées, à reconnaître automatiquement :
- Découpage en "Block 1", "Block 2"... ou "Circuit 1", "Circuit 2"...
- Exercices numérotés en superset/biset (ex. "A1. Squat", "A2. Développé couché") : chaque ligne numérotée est un exercice à part entière, à garder dans l'ordre, dans le même block.
- Formats chronométrés explicites : EMOM (Every Minute On the Minute), AMRAP (As Many Rounds/Reps As Possible), Tabata, Circuit — souvent avec leur durée totale indiquée entre parenthèses ou à côté (ex. "EMOM 12min", "AMRAP 20min", "Tabata 4min").
- Simple liste de séries/répétitions sans structure de "block" explicite.
- Tempo écrit en 3 ou 4 chiffres/lettres séparés par "/" ou "-" (ex. "2/2/X/1", "3-1-1") : chaque position correspond à une phase du mouvement (excentrique, pause bas, concentrique, pause haut) en secondes ; "X" signifie une phase explosive/rapide (environ 1 seconde), pas une valeur manquante.
- Repos exprimé en secondes ("repos 90s", "r: 90s") ou en minutes ("repos 2min", "2' de repos").

Ta tâche : extraire la structure du programme en JSON, SANS jamais inventer un exercice, un nombre de séries/répétitions, un tempo ou un temps de repos qui n'est pas indiqué, même vaguement, dans le texte. Une information non précisée doit être laissée à null, jamais devinée.

Format de sortie — règles strictes :
- Réponds UNIQUEMENT avec un objet JSON valide, rien d'autre : pas de markdown, pas de blocs \`\`\`, pas de phrase avant ou après, pas de commentaire.
- Cas normal (texte exploitable), réponds exactement avec ces champs, dans cet ordre :
  {
    "blocks": [
      {
        "name": "nom du block tel que dans le texte, ou un nom court généré si absent (ex. \\"Bloc 1\\")",
        "type": "standard" | "emom" | "amrap" | "tabata" | "circuit",
        "durationMin": nombre de minutes si une durée chronométrée est explicitement indiquée pour ce block (ex. EMOM 12min -> 12), sinon null,
        "rounds": nombre de tours/rounds si indiqué explicitement pour ce block (ex. "3 tours", "x4 rounds"), sinon null,
        "exercises": [
          {
            "name": "nom de l'exercice",
            "sets": nombre de séries (entier) si indiqué, sinon null,
            "reps": répétitions en texte libre tel qu'écrit (ex. "8", "8-12", "max", "AMRAP", "15 cal"), ou null si non précisé,
            "tempo": tempo tel qu'écrit (ex. "2/2/X/1"), ou null si non précisé,
            "restSec": repos en secondes (convertis les minutes en secondes), ou null si non précisé
          }
        ]
      }
    ],
    "warnings": ["courte remarque en français sur une ambiguïté ou une notation non standard rencontrée, si besoin — tableau vide si rien à signaler"]
  }
- "blocks" doit contenir au moins un block avec au moins un exercice identifiable dans le texte.
- Cas insuffisant (le texte n'est manifestement pas un programme de sport exploitable — hors-sujet, recette de cuisine, liste de courses, texte vide, ou trop vague pour identifier le moindre exercice), réponds EXACTEMENT avec cet objet, rien d'autre :
  {"error": "insufficient_info", "message": "courte explication en français de pourquoi le texte ne permet pas d'extraire un programme"}`;

function buildMessages(programText) {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Programme collé par l'utilisateur :\n"""\n${programText}\n"""` },
  ];
}

/* ===================== ESTIMATION DE DURÉE (code, pas IA) ===================== */
// Heuristique volontairement simple et documentée, appliquée aux blocks/
// exercices structurés renvoyés par le modèle :
//  - Block chronométré explicitement (EMOM/AMRAP/Tabata avec durationMin
//    connu) : on prend cette durée telle quelle, c'est la définition même de
//    ces formats (un EMOM 12min dure 12 minutes, par construction).
//  - Block "standard"/"circuit" (ou EMOM/AMRAP/Tabata SANS durée explicite,
//    ex. juste "Tabata" sans minutage) : pour chaque exercice, temps ≈
//    séries × (répétitions × secondes/répétition déduites du tempo + repos
//    après la série), multiplié par le nombre de tours si précisé (rounds).
//  - Une marge de transition fixe est ajoutée par block (installation,
//    changement de poste/matériel, lecture des consignes).
// Valeurs par défaut utilisées uniquement quand l'info manque vraiment (pas
// de tempo -> ~3s/rep en moyenne pour un mouvement de muscu classique ; pas
// de repos précisé -> 60s, repos "moyen" usuel entre séries de renfo ; pas de
// reps précisées -> 10, une valeur de série "type" ; pas de séries précisées
// -> 1). Le but est une estimation raisonnable, pas une vérité absolue —
// l'utilisateur peut toujours ajuster manuellement avant d'enregistrer.
const TRANSITION_SEC_PER_BLOCK = 90;
const DEFAULT_SEC_PER_REP = 3;
const DEFAULT_REST_SEC = 60;
const DEFAULT_REPS = 10;

function parseRepsToNumber(reps) {
  if (reps == null) return null;
  const s = String(reps).toLowerCase();
  const range = s.match(/(\d+)\s*(?:-|à|to)\s*(\d+)/);
  if (range) return Math.round((Number(range[1]) + Number(range[2])) / 2);
  const single = s.match(/\d+/);
  if (single) return Number(single[0]);
  return null; // "max", "amrap", "échec", etc. — pas de nombre exploitable
}

function tempoToSecPerRep(tempo) {
  if (tempo == null) return null;
  const parts = String(tempo).split(/[\/\-\s]+/).map(p => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const secs = parts.map(p => (/^x$/i.test(p) ? 1 : (Number(p) || 0)));
  const total = secs.reduce((a, b) => a + b, 0);
  return total > 0 ? total : null;
}

function estimateStandardBlockSec(block) {
  const rounds = Math.max(1, Number(block.rounds) || 1);
  const exercises = Array.isArray(block.exercises) ? block.exercises : [];
  const blockSec = exercises.reduce((sum, ex) => {
    const sets = Math.max(1, Number(ex.sets) || 1);
    const reps = parseRepsToNumber(ex.reps) ?? DEFAULT_REPS;
    const secPerRep = tempoToSecPerRep(ex.tempo) ?? DEFAULT_SEC_PER_REP;
    const restSec = (ex.restSec != null && Number.isFinite(Number(ex.restSec))) ? Number(ex.restSec) : DEFAULT_REST_SEC;
    return sum + sets * (reps * secPerRep + restSec);
  }, 0);
  return blockSec * rounds;
}

function estimateWorkoutDurationMin(blocks) {
  if (!Array.isArray(blocks) || !blocks.length) return 0;
  const totalSec = blocks.reduce((sum, block) => {
    const isTimedFormat = ['emom', 'amrap', 'tabata'].includes(block.type);
    const explicitMin = Number(block.durationMin);
    const blockSec = (isTimedFormat && Number.isFinite(explicitMin) && explicitMin > 0)
      ? explicitMin * 60
      : estimateStandardBlockSec(block);
    return sum + blockSec + TRANSITION_SEC_PER_BLOCK;
  }, 0);
  return Math.max(5, Math.round(totalSec / 60));
}

// Garde-fou défensif : au-delà du contrat d'erreur explicite demandé au
// modèle, on revérifie nous-mêmes qu'il y a bien au moins un exercice
// identifiable quelque part dans les blocks — un résultat "blocks: []" ou
// "blocks: [{exercises: []}]" n'est pas exploitable, même sans le flag
// d'erreur.
function hasAtLeastOneExercise(data) {
  return Array.isArray(data?.blocks) && data.blocks.some(b => Array.isArray(b.exercises) && b.exercises.length > 0);
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
    const { programText } = req.body || {};

    if (!programText || typeof programText !== 'string' || !programText.trim()) {
      return res.status(400).json({ error: 'Texte du programme manquant' });
    }

    if (!process.env.CARNET_API_KEY) {
      return res.status(500).json({ error: 'CARNET_API_KEY manquante côté serveur (Vercel)' });
    }

    const apiRes = await fetch(MAMMOUTH_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CARNET_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MAMMOUTH_MODEL,
        messages: buildMessages(programText.trim()),
        temperature: 0.2,
        max_tokens: 1200,
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error('Mammouth API error:', apiRes.status, errText);
      // Voir api/parse-meal.js : blocage compte amont (Mammouth/OpenRouter), pas une erreur
      // liée à ce programme précis.
      const isAccountBlocked = /policy violation|has been blocked/i.test(errText);
      if (isAccountBlocked) {
        return res.status(502).json({
          error: 'Compte Mammouth bloqué',
          details: "L'API Mammouth a bloqué ce compte suite à une violation de politique détectée sur une requête précédente (probablement un faux positif). Ce n'est pas lié à ce programme précis : va vérifier ton compte sur mammouth.ai ou contacte leur support.",
        });
      }
      return res.status(502).json({
        error: 'Erreur API Mammouth',
        details: `${apiRes.status}: ${errText.slice(0, 300)}`,
      });
    }

    const payload = await apiRes.json();
    const responseText = payload?.choices?.[0]?.message?.content || '';

    let workoutData;
    try {
      workoutData = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          workoutData = JSON.parse(jsonMatch[0]);
        } catch {
          throw new Error('Réponse IA non parsable en JSON');
        }
      } else {
        throw new Error('Réponse IA non parsable en JSON');
      }
    }

    if (workoutData && workoutData.error === 'insufficient_info') {
      return res.status(422).json({
        error: 'Programme non identifiable',
        details: workoutData.message || "Ce texte ne contient pas assez d'information pour en extraire un programme de sport.",
      });
    }

    if (!hasAtLeastOneExercise(workoutData)) {
      return res.status(422).json({
        error: 'Programme non identifiable',
        details: "Ce texte ne contient pas assez d'information pour en extraire un programme de sport.",
      });
    }

    // Normalisation légère + calcul déterministe de la durée totale (voir
    // commentaire d'estimateWorkoutDurationMin plus haut).
    const blocks = workoutData.blocks.map((b, i) => ({
      name: (b && typeof b.name === 'string' && b.name.trim()) || `Bloc ${i + 1}`,
      type: ['standard', 'emom', 'amrap', 'tabata', 'circuit'].includes(b?.type) ? b.type : 'standard',
      durationMin: Number.isFinite(Number(b?.durationMin)) && Number(b.durationMin) > 0 ? Number(b.durationMin) : null,
      rounds: Number.isFinite(Number(b?.rounds)) && Number(b.rounds) > 0 ? Number(b.rounds) : null,
      exercises: (Array.isArray(b?.exercises) ? b.exercises : []).map(ex => ({
        name: (ex && typeof ex.name === 'string' && ex.name.trim()) || 'Exercice',
        sets: Number.isFinite(Number(ex?.sets)) && Number(ex.sets) > 0 ? Number(ex.sets) : null,
        reps: (ex && ex.reps != null && String(ex.reps).trim()) ? String(ex.reps).trim() : null,
        tempo: (ex && ex.tempo != null && String(ex.tempo).trim()) ? String(ex.tempo).trim() : null,
        restSec: Number.isFinite(Number(ex?.restSec)) && Number(ex.restSec) >= 0 ? Number(ex.restSec) : null,
      })),
    }));

    const estimatedDurationMin = estimateWorkoutDurationMin(blocks);
    const warnings = Array.isArray(workoutData.warnings) ? workoutData.warnings.filter(w => typeof w === 'string' && w.trim()) : [];

    return res.status(200).json({
      success: true,
      data: { blocks, estimatedDurationMin, warnings },
    });
  } catch (error) {
    console.error('Error parsing workout:', error);
    return res.status(500).json({
      error: 'Failed to parse workout program',
      details: error.message,
    });
  }
}
