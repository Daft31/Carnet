/**
 * js/supabaseClient.js
 * ---------------------------------------------------------------------------
 * SCAFFOLDING — pas encore branché sur le reste de l'appli.
 *
 * Ce fichier prépare la connexion à Supabase (auth par lien magique + Postgres
 * avec RLS, voir supabase/migrations/ et supabase/MIGRATION_PLAN.md) mais :
 *   - il n'est chargé par aucune balise <script> dans index.html pour l'instant,
 *   - rien dans js/core.js, js/ui.js ou js/app.js ne l'importe ou ne l'appelle,
 *   - LS.get/LS.set restent la seule source de vérité tant que la migration
 *     complète (réécriture async de la couche de stockage) n'est pas faite.
 *
 * À COMPLÉTER quand le projet Supabase existera réellement (voir MIGRATION_PLAN.md,
 * phase 0) :
 *   1. Remplacer SUPABASE_URL et SUPABASE_ANON_KEY ci-dessous par les vraies valeurs
 *      du projet (Supabase Dashboard -> Project Settings -> API).
 *   2. Charger le SDK Supabase JS (UMD) via une balise <script> dans index.html,
 *      AVANT ce fichier, par ex. (vérifier la dernière version stable) :
 *        <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
 *      Ce CDN (jsdelivr) est autorisé pour les scripts sur GitHub Pages/Vercel ;
 *      vérifier qu'aucune restriction CSP locale ne bloque ce host avant de l'ajouter.
 *   3. Une fois les credentials renseignés, ce module peut être importé par un futur
 *      js/storage.js (ou équivalent) qui réécrira LS.get/LS.set en version async
 *      Supabase — voir MIGRATION_PLAN.md, phase 2.
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
