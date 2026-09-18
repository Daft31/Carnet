// Fonction serverless Vercel : importe une recette depuis une vidéo TikTok
// publique. Étape 1, récupère la légende via l'API oEmbed publique de
// TikTok (pas de dépendance, fetch natif Node, aucune authentification
// nécessaire pour une vidéo publique). Étape 2, fait structurer cette
// légende en recette par Mammouth AI (API compatible OpenAI), avec la
// clé stockée côté serveur uniquement (jamais exposée au client) — même
// clé/modèle que api/parse-meal.js.

const TIKTOK_OEMBED_URL = 'https://www.tiktok.com/oembed';
const MAMMOUTH_API_URL = 'https://api.mammouth.ai/v1/chat/completions';
// Les modèles GPT sont temporairement indisponibles côté Mammouth (confirmé par
// leur support le 16/09/2026) — bascule sur claude-haiku-4-5 (non-GPT) en
// attendant. Revenir à gpt-5.4-mini une fois l'incident résolu si souhaité.
const MAMMOUTH_MODEL = 'claude-haiku-4-5';

// AI-P2-2 (audit Phase 2.3.1) : voir le commentaire équivalent (plus détaillé) dans
// api/parse-meal.js — même liste blanche, même limite assumée (CORS = navigateurs
// uniquement, pas un rate limiting serveur contre un appel direct).
const ALLOWED_ORIGINS = [/^https:\/\/daft31\.github\.io$/, /^https:\/\/[a-z0-9-]+\.vercel\.app$/];

function isAllowedOrigin(origin) {
  if (!origin) return true;
  return ALLOWED_ORIGINS.some(re => re.test(origin));
}

function setCors(res, origin) {
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// AI-P2-2 : limite de longueur du lien TikTok soumis — un lien légitime tient très
// largement sous ce seuil ; réduit la surface d'abus d'un appel direct avec un payload
// démesuré.
const MAX_TIKTOK_URL_LENGTH = 500;

// Accepte uniquement des liens TikTok (domaine principal + domaines de
// partage courts vm.tiktok.com / vt.tiktok.com) — évite de faire de cette
// fonction un proxy oEmbed générique vers n'importe quel domaine.
function isTikTokUrl(raw) {
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    return host === 'tiktok.com' || host.endsWith('.tiktok.com');
  } catch {
    return false;
  }
}

// Message système : cadre le persona, le format de sortie strict, et
// surtout la règle « ne pas inventer » — une légende TikTok est souvent
// courte, familière, pleine d'emojis/hashtags, et parfois ne décrit pas du
// tout une recette exploitable (vidéo humoristique, pas de cuisine, etc.).
const SYSTEM_PROMPT = `Tu es un(e) chef cuisinier(ère) qui transforme la légende (caption) d'une vidéo TikTok de cuisine en recette structurée, à partir du texte fourni uniquement.

Règle la plus importante : ne JAMAIS inventer un ingrédient, une quantité ou une étape qui n'est pas suggéré, même vaguement, par la légende. Si la légende ne permet pas d'identifier une vraie recette exploitable (texte hors-sujet, juste des hashtags/emojis, légende vide, vidéo qui n'est manifestement pas une recette de cuisine, ou légende trop vague pour en tirer des ingrédients), tu dois répondre avec un objet d'erreur plutôt que d'halluciner un contenu plausible.

Format de sortie — règles strictes :
- Réponds UNIQUEMENT avec un objet JSON valide, rien d'autre : pas de markdown, pas de blocs \`\`\`, pas de phrase avant ou après, pas de commentaire.
- Cas normal (légende exploitable), réponds exactement avec ces champs, dans cet ordre :
  {
    "name": "nom court et naturel de la recette",
    "servings": nombre de personnes (entier) ou null si non déductible,
    "ingredients": [{"name": "ingrédient", "qty": "quantité en texte libre (ex. \\"200 g\\", \\"2 cuillères à soupe\\") ou null si non précisée"}],
    "steps": ["étape 1", "étape 2", "..."]
  }
- "ingredients" doit contenir au moins un élément identifiable dans la légende ; ne complète jamais une liste avec des ingrédients "probables" non mentionnés.
- "steps" : uniquement les étapes réellement décrites ou clairement suggérées dans la légende (une légende TikTok décrit rarement toutes les étapes en détail — dans ce cas renvoie un tableau plus court, voire vide, plutôt que d'inventer la suite).
- Cas insuffisant (légende non exploitable), réponds EXACTEMENT avec cet objet, rien d'autre :
  {"error": "insufficient_info", "message": "courte explication en français de pourquoi la légende ne permet pas d'extraire une recette"}`;

function buildMessages(caption) {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Légende de la vidéo TikTok : "${caption}"` },
  ];
}

export default async function handler(req, res) {
  const origin = req.headers && req.headers.origin;
  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({ error: 'Origine non autorisée' });
  }
  setCors(res, origin);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tiktokUrl } = req.body || {};

    if (!tiktokUrl || typeof tiktokUrl !== 'string') {
      return res.status(400).json({ error: "Lien TikTok manquant" });
    }
    if (tiktokUrl.length > MAX_TIKTOK_URL_LENGTH) {
      return res.status(400).json({ error: `Lien trop long (max ${MAX_TIKTOK_URL_LENGTH} caractères)` });
    }
    if (!isTikTokUrl(tiktokUrl)) {
      return res.status(400).json({ error: "Ce lien ne ressemble pas à un lien TikTok valide" });
    }

    if (!process.env.CARNET_API_KEY) {
      return res.status(500).json({ error: 'CARNET_API_KEY manquante côté serveur (Vercel)' });
    }

    // Étape 1 : récupérer la légende via l'API oEmbed publique de TikTok.
    let oembedRes;
    try {
      oembedRes = await fetch(`${TIKTOK_OEMBED_URL}?url=${encodeURIComponent(tiktokUrl)}`);
    } catch (networkErr) {
      console.error('Erreur réseau oEmbed TikTok:', networkErr);
      return res.status(502).json({
        error: 'Impossible de contacter TikTok',
        details: networkErr.message,
      });
    }

    if (!oembedRes.ok) {
      // TikTok répond généralement 404 pour un lien invalide, une vidéo
      // supprimée, privée, ou une URL mal formée.
      return res.status(404).json({
        error: 'Vidéo TikTok introuvable',
        details: "Vérifie le lien : la vidéo doit être publique et le lien complet (pas juste un lien de partage raccourci cassé).",
      });
    }

    let oembedData;
    try {
      oembedData = await oembedRes.json();
    } catch (parseErr) {
      console.error('Réponse oEmbed TikTok non-JSON:', parseErr);
      return res.status(502).json({ error: 'Réponse TikTok invalide', details: parseErr.message });
    }

    const caption = (oembedData && typeof oembedData.title === 'string') ? oembedData.title.trim() : '';
    if (!caption) {
      return res.status(422).json({
        error: 'Légende vide',
        details: "Cette vidéo n'a pas de légende exploitable — impossible d'en extraire une recette.",
      });
    }

    // Étape 2 : structurer la légende en recette via Mammouth AI.
    const apiRes = await fetch(MAMMOUTH_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CARNET_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MAMMOUTH_MODEL,
        messages: buildMessages(caption),
        temperature: 0.2,
        max_tokens: 700,
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error('Mammouth API error:', apiRes.status, errText);
      // Voir api/parse-meal.js : blocage compte amont (Mammouth/OpenRouter), pas une erreur
      // liée à cette recette précise.
      const isAccountBlocked = /policy violation|has been blocked/i.test(errText);
      if (isAccountBlocked) {
        return res.status(502).json({
          error: 'Compte Mammouth bloqué',
          details: "L'API Mammouth a bloqué ce compte suite à une violation de politique détectée sur une requête précédente (probablement un faux positif). Ce n'est pas lié à cette recette précise : va vérifier ton compte sur mammouth.ai ou contacte leur support.",
        });
      }
      return res.status(502).json({
        error: 'Erreur API Mammouth',
        details: `${apiRes.status}: ${errText.slice(0, 300)}`,
      });
    }

    const payload = await apiRes.json();
    const responseText = payload?.choices?.[0]?.message?.content || '';

    let recipeData;
    try {
      recipeData = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          recipeData = JSON.parse(jsonMatch[0]);
        } catch {
          throw new Error('Réponse IA non parsable en JSON');
        }
      } else {
        throw new Error('Réponse IA non parsable en JSON');
      }
    }

    if (recipeData && recipeData.error === 'insufficient_info') {
      return res.status(422).json({
        error: 'Recette non identifiable',
        details: recipeData.message || "La légende de cette vidéo ne contient pas assez d'information pour en extraire une recette.",
      });
    }

    // Garde-fou défensif : même sans le flag d'erreur explicite, un
    // résultat sans nom ni ingrédient n'est pas une recette exploitable —
    // mieux vaut répondre une erreur claire que de laisser passer un
    // objet vide/inventé vers le front.
    if (!recipeData || !recipeData.name || !Array.isArray(recipeData.ingredients) || recipeData.ingredients.length === 0) {
      return res.status(422).json({
        error: 'Recette non identifiable',
        details: "La légende de cette vidéo ne contient pas assez d'information pour en extraire une recette.",
      });
    }

    return res.status(200).json({
      success: true,
      data: recipeData,
    });
  } catch (error) {
    console.error('Error parsing recipe:', error);
    return res.status(500).json({
      error: 'Failed to parse recipe',
      details: error.message,
    });
  }
}
