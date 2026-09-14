/**
 * js/supabaseClient.js
 * ---------------------------------------------------------------------------
 * Phase 1 (voir supabase/MIGRATION_PLAN.md) : ce fichier est maintenant chargé
 * par index.html (après le SDK Supabase UMD, avant js/auth.js) et utilisé par
 * js/auth.js pour l'écran de connexion par lien magique. Il reste néanmoins
 * défensif par construction : tant que SUPABASE_URL/SUPABASE_ANON_KEY ci-dessous
 * sont des placeholders, getSupabaseClient() renvoie `null` et rien d'autre ne
 * fait de requête réseau — voir js/auth.js pour comment ce `null` est géré.
 *
 * Important : LS.get/LS.set (js/core.js) restent la seule source de vérité
 * pour toutes les données de l'appli (repas, séances, poids, etc.) — aucune
 * donnée n'est encore synchronisée vers Supabase à ce stade. Ça, c'est la
 * Phase 2, pas ce fichier.
 *
 * À COMPLÉTER quand le projet Supabase existera réellement (voir MIGRATION_PLAN.md,
 * phase 0) :
 *   1. Remplacer SUPABASE_URL et SUPABASE_ANON_KEY ci-dessous par les vraies valeurs
 *      du projet (Supabase Dashboard -> Project Settings -> API).
 *   2. (déjà fait) Le SDK Supabase JS (UMD) est chargé dans index.html, avant ce
 *      fichier : <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
 *   3. Une fois les credentials renseignés, un futur js/storage.js (ou équivalent)
 *      pourra réécrire LS.get/LS.set en version async adossée à Supabase —
 *      voir MIGRATION_PLAN.md, phase 2.
 *
 * IMPORTANT — ne pas confondre avec CARNET_API_KEY (clé Mammouth AI, côté serveur,
 * voir CLAUDE.md racine) : la clé "anon" de Supabase est conçue pour vivre côté
 * client, en clair, et n'autorise que ce que les policies RLS Postgres permettent.
 * Ce n'est PAS un secret à cacher — mais l'URL/clé ci-dessous restent des valeurs
 * de placeholder tant qu'un vrai projet Supabase n'a pas été créé par l'utilisateur.
 */

// TODO: remplacer par l'URL réelle du projet, ex. "https://xxxxxxxx.supabase.co"
const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';

// TODO: remplacer par la clé "anon" (publique) réelle du projet.
// Ne JAMAIS y mettre la clé "service_role" (celle-là doit rester secrète, côté serveur).
const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';

/**
 * Renvoie un client Supabase, ou null si les credentials n'ont pas encore été
 * renseignés (état par défaut de ce scaffold) ou si le SDK n'est pas chargé.
 * Volontairement défensif : tant que ce fichier n'est branché nulle part,
 * cette fonction ne doit jamais faire planter une page qui l'importerait par erreur.
 */
function getSupabaseClient() {
  const placeholderUrl = SUPABASE_URL.includes('YOUR-PROJECT-REF');
  const placeholderKey = SUPABASE_ANON_KEY.includes('YOUR-ANON-KEY');
  if (placeholderUrl || placeholderKey) {
    console.warn(
      '[supabaseClient] Credentials Supabase non configurés — ' +
      'renseigne SUPABASE_URL et SUPABASE_ANON_KEY dans js/supabaseClient.js. ' +
      'Voir supabase/MIGRATION_PLAN.md.'
    );
    return null;
  }
  if (typeof window === 'undefined' || !window.supabase || !window.supabase.createClient) {
    console.warn(
      '[supabaseClient] SDK Supabase non chargé — ajoute le <script> UMD ' +
      '@supabase/supabase-js dans index.html avant ce fichier.'
    );
    return null;
  }
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Exposé globalement pour un futur js/storage.js, mais non utilisé pour l'instant.
window.CarnetSupabase = { getSupabaseClient };
