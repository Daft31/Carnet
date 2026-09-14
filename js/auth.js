/**
 * js/auth.js
 * ---------------------------------------------------------------------------
 * Phase 1 de la migration Supabase — AUTHENTIFICATION UNIQUEMENT.
 * Voir supabase/MIGRATION_PLAN.md pour le plan complet.
 *
 * Ce que ce fichier fait :
 *   - Un écran de connexion par lien magique (email, pas de mot de passe),
 *     accessible depuis Réglages ("Se connecter pour synchroniser").
 *   - Le suivi de l'état de session Supabase (connecté/déconnecté) via
 *     supabase.auth.onAuthStateChange, gardé en mémoire dans la variable
 *     globale `authSession` (pas de persistance supplémentaire ici : le SDK
 *     Supabase gère déjà sa propre persistance de session, sous des clés
 *     `sb-*` séparées des clés `ct_*` de l'appli).
 *
 * Ce que ce fichier NE fait PAS :
 *   - Aucune donnée (repas, séances, poids, aliments, notes, todos...) n'est
 *     lue ou écrite vers Supabase ici. `js/core.js` continue d'utiliser
 *     exclusivement `LS.get`/`LS.set` (localStorage), inchangés. La
 *     synchronisation réelle des données est la Phase 2, pas ce fichier.
 *   - Aucun blocage de l'appli : se connecter est optionnel. Que Supabase
 *     soit configuré ou non, que quelqu'un soit connecté ou non, toutes les
 *     fonctionnalités existantes continuent de fonctionner exactement comme
 *     avant, en localStorage pur.
 *
 * Garantie de robustesse : `getSupabaseClient()` (js/supabaseClient.js)
 * renvoie `null` tant qu'un vrai projet Supabase n'a pas été configuré
 * (credentials placeholders) ou si le SDK ne s'est pas chargé. Chaque
 * fonction ci-dessous vérifie ce cas et s'arrête proprement (aucune requête
 * réseau, aucune exception) — l'écran de connexion affiche alors un simple
 * message "non configuré" plutôt qu'un formulaire.
 */

let authSession = null;          // session Supabase courante ({user,...}) ou null — tenue à jour par onAuthStateChange
let authListenerBound = false;   // évite d'attacher onAuthStateChange plusieurs fois
let authMagicLinkSentTo = null;  // email en attente de clic sur le lien magique, ou null

/**
 * À appeler une fois au démarrage de l'appli (voir js/app.js). Défensif :
 * si Supabase n'est pas configuré, ne fait rigoureusement rien.
 */
function initSupabaseAuth(){
  const supabase = getSupabaseClient();
  if(!supabase) return; // pas de credentials/SDK : comportement localStorage pur, inchangé
  if(authListenerBound) return;
  authListenerBound = true;

  supabase.auth.onAuthStateChange((event, session)=>{
    authSession = session || null;
    if(event==='SIGNED_IN') authMagicLinkSentTo = null;
    // Si la modale de connexion est ouverte pendant le changement d'état
    // (ex. retour sur l'onglet après avoir cliqué le lien magique dans un
    // autre onglet), on la remet à jour plutôt que d'attendre une action.
    if(document.getElementById('authModalRoot')) renderAuthModalContent();
  });

  // Récupère une éventuelle session déjà active (retour sur l'appli après
  // avoir cliqué le lien magique, ou session persistée par le SDK).
  supabase.auth.getSession()
    .then(({ data })=>{
      authSession = (data && data.session) || null;
      if(document.getElementById('authModalRoot')) renderAuthModalContent();
    })
    .catch(()=>{ /* défensif : en cas d'échec réseau, on reste en état "non connecté" local */ });
}

/** Ouvre la modale de connexion (bouton "Se connecter pour synchroniser" dans Réglages). */
function openAuthModal(){
  openModal(`<div id="authModalRoot"></div>`);
  renderAuthModalContent();
}

/** (Re)dessine le contenu de la modale de connexion selon l'état courant. */
function renderAuthModalContent(){
  const root = document.getElementById('authModalRoot');
  if(!root) return; // modale pas ouverte, rien à faire
  const supabase = getSupabaseClient();

  // Cas 1 : Supabase pas encore configuré (placeholders) ou SDK non chargé.
  if(!supabase){
    root.innerHTML = `
      <h3>Connexion (bêta)</h3>
      <div class="hint">La synchronisation multi-appareils n'est pas encore configurée sur ce déploiement. Tes données restent stockées uniquement sur cet appareil, comme aujourd'hui — aucune action requise de ta part.</div>
    `;
    return;
  }

  // Cas 2 : déjà connecté.
  if(authSession && authSession.user){
    root.innerHTML = `
      <h3>Connexion (bêta)</h3>
      <div class="hint">Connecté en tant que <strong>${escapeHtml(authSession.user.email||'')}</strong>. La synchronisation des données n'est pas encore active (à venir) — tes données restent pour l'instant dans le stockage local de cet appareil.</div>
      <button class="btn ghost" id="authSignOutBtn">Se déconnecter</button>
    `;
    document.getElementById('authSignOutBtn').onclick = async ()=>{
      try{
        await supabase.auth.signOut();
        toast('Déconnecté', 'success');
      }catch(err){
        toast('Erreur de déconnexion', 'error');
      }
    };
    return;
  }

  // Cas 3 : lien magique déjà envoyé, en attente du clic.
  if(authMagicLinkSentTo){
    root.innerHTML = `
      <h3>Connexion (bêta)</h3>
      <div class="hint">Lien envoyé à <strong>${escapeHtml(authMagicLinkSentTo)}</strong>. Ouvre l'email et clique sur le lien pour te connecter, puis reviens sur cette page — cet écran se mettra à jour automatiquement.</div>
      <button class="btn ghost" id="authRetryBtn">Utiliser une autre adresse</button>
    `;
    document.getElementById('authRetryBtn').onclick = ()=>{
      authMagicLinkSentTo = null;
      renderAuthModalContent();
    };
    return;
  }

  // Cas 4 (par défaut) : formulaire email.
  root.innerHTML = `
    <h3>Connexion (bêta)</h3>
    <div class="hint">Reçois un lien de connexion par email — pas de mot de passe à retenir. Optionnel : l'appli fonctionne très bien sans compte, en local sur cet appareil.</div>
    <label>Email</label>
    <input id="authEmail" type="email" placeholder="toi@exemple.com" autocomplete="email">
    <button class="btn" id="authSendBtn">Recevoir un lien de connexion</button>
  `;
  const emailInput = document.getElementById('authEmail');
  const sendBtn = document.getElementById('authSendBtn');

  const sendMagicLink = async ()=>{
    const email = emailInput.value.trim();
    if(!email || !email.includes('@')){ toast('Adresse email invalide', 'error'); return; }
    sendBtn.disabled = true;
    sendBtn.textContent = 'Envoi...';
    try{
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.href.split('#')[0].split('?')[0] }
      });
      if(error){
        toast(error.message || 'Échec de l\'envoi du lien', 'error');
        sendBtn.disabled = false;
        sendBtn.textContent = 'Recevoir un lien de connexion';
        return;
      }
      authMagicLinkSentTo = email;
      renderAuthModalContent();
    }catch(err){
      toast('Erreur réseau — réessaie plus tard', 'error');
      sendBtn.disabled = false;
      sendBtn.textContent = 'Recevoir un lien de connexion';
    }
  };

  sendBtn.onclick = sendMagicLink;
  emailInput.addEventListener('keydown', e=>{ if(e.key==='Enter') sendMagicLink(); });
}
