# PHASE 4 — RAPPORT DE SIMULATION COMPORTEMENTALE

> **Nature de ce rapport : SIMULATION QA.** Toutes les "journées", "utilisateurs"
> et "comportements" décrits ci-dessous sont fictifs, générés en exécutant le
> vrai code de Kalo dans un bac à sable Node (`vm`), jamais des observations
> d'usage réel. Voir `PHASE4-OBSERVATIONS.md` pour le journal des signaux retenus
> et leur statut vis-à-vis du protocole "signal d'usage réel" de `CLAUDE.md`.

## Méthodologie (à lire avant les résultats)

Contrainte assumée et documentée ici explicitement : ce QA ne dispose pas d'un
navigateur piloté (pas de clics DOM réels sur un rendu HTML complet). La
simulation exécute donc le **vrai code métier** (`js/core.js`, `js/ui.js`,
`js/scanner.js`, `js/mealparser.js`, `js/workoutparser.js`) chargé dans un
contexte `vm` Node, avec :
- un DOM minimal mémoïsé par id (mêmes éléments réutilisés d'un appel à
  l'autre, `addEventListener`/`onclick`/`classList` fonctionnels) — même
  technique que les fichiers `tests/*.test.js` existants (Phase 2.6/3) ;
- `fetch()` et `Quagga` mockés à la frontière externe uniquement (jamais de
  réseau réel, jamais de caméra) ;
- les vraies fonctions/handlers appelés tels quels : `openQtyModal()`,
  `openEditMealEntryModal()`/`openEditWorkoutEntryModal()`, le handler
  `#saveWorkout`, `findOrAddScannedFood()`/`lookupBarcode()`,
  `openAIDescribeModal()`/`openAIResultModal()`, `dayTotals()`,
  `calorieStreak()`, `weeklyDeficits()`, `typicalGramsFor()`,
  `frequentMealFor()`, `kaloInsights()`.

C'est donc une simulation **comportementale au niveau du code**, pas un test
d'utilisabilité visuelle (pas de vérification de rendu CSS, de lisibilité ou
d'ergonomie tactile) — limite assumée, voir section 15 "Zones insuffisamment
testées".

Script reproductible dans le repo : `tests/phase4-simulation/harness.js` (bac à
sable + helpers de parcours) et `tests/phase4-simulation/scenarios.js` (11
profils/campagnes). Exécution : `node tests/phase4-simulation/scenarios.js`.
Volontairement **pas** suffixé `.test.js` : pas un test de régression
pass/fail, exclu de `node --test tests/*.test.js`.

---

## 1. Volume de simulations

| Mesure | Valeur réelle obtenue |
|---|---|
| Profils/campagnes comportementales distincts | **11** |
| Journées simulées (`currentDate` distinctes traversées) | **46** |
| Parcours utilisateur (unités "journey" loguées) | **22** |
| Observations qualifiées produites | **23** |

Volume **honnête, pas gonflé artificiellement** pour atteindre un chiffre rond :
les cibles indicatives de la mission (≥20 profils, ≥50 journées, ≥200 parcours)
n'ont pas toutes été atteintes littéralement. Le choix a été de privilégier la
diversité et la profondeur de chaque parcours (exécution réelle du code,
observations concrètes avec valeurs mesurées) plutôt que de multiplier des
variations superficielles pour gonfler un compteur — conformément à la consigne
explicite de la mission ("la diversité des comportements est plus importante
que le nombre brut", "ne pas produire artificiellement des centaines de tests
identiques"). Voir section 15 pour ce qui resterait à couvrir pour se rapprocher
des cibles indicatives.

## 2. Profils simulés

| # | Profil | Volume | Points testés |
|---|---|---|---|
| A | Rigoureux | 7 jours | catalogue, portion habituelle, édition post-hoc, dashboard/tendances |
| B | Rapide | 10 jours + 1 abandon | répétition catalogue, détection repas fréquent, abandon IA en vol |
| C | Repas récurrents (avec variation) | 12 jours | fragilité exact-match sur une variation mineure et récurrente |
| D | Imprécis | 1 parcours IA | description vague, confidence `mixed`, correction avant confirmation |
| E | Sportif | 1 jour, 2 séances | weight-gate, cumul multi-séances/jour, règle "sport jamais soustrait" |
| F | Occasionnel | 2 jours (écart 25j) | reprise après longue absence, streak/Insights sans crash |
| G | Chaotique | 2 jours | doublon volontaire, suppression, édition grams-only, changement de jour en cours d'opération |
| H | Scanner | 1 jour, 5 sous-scénarios | connu, introuvable, kcal inconnue, dédup barcode, fragmentation catalogue |
| IRR-1/2 | Irrégularités — oubli + rattrapage | 3 jours (écart) | jour vide, ajout rétroactif |
| ANNIV | Irrégularité — anniversaire | 1 jour | journée très calorique, remaining fortement négatif |
| NOSPORT | Irrégularité — semaine sans sport | 7 jours | absence totale d'activité sur une semaine |

Profils de la liste-cible non simulés séparément dans cette campagne (voir
section 15) : aucun manquant à la lettre de la liste fournie n'a été ignoré par
choix — tous les 8 profils nommés (A à H) ont été couverts, avec en plus 3
scénarios d'irrégularité transversaux.

## 3. Journées simulées

46 `currentDate` distinctes traversées au total, réparties entre journées
consécutives (semaines complètes, profils A/B/C/E/NOSPORT), journées isolées
avec écart volontaire (profil F : 25 jours d'absence ; IRR : 1 jour d'oubli puis
rattrapage), et journées à contenu exceptionnel (ANNIV).

## 4. Parcours couverts

**Nutrition** : catalogue + recherche (via `allFoods().find`), portion
habituelle (`typicalGramsFor`), repas fréquent (`frequentMealFor`), aliment
personnalisé + scanner (dédup barcode, produit introuvable, kcal inconnue),
repas IA (description imprécise, confidence `mixed`, correction, abandon en
vol), édition d'un repas déjà journalisé, suppression, doublon volontaire.

**Sport** : ajout de séance (tapis, club), weight-gate, plusieurs séances le
même jour, édition d'une séance déjà journalisée (code lu, non exécuté dans
cette campagne — voir section 15), semaine sans sport.

**Poids** : ajout de pesées répétées, dépendance du calcul séance à
`getCurrentWeight()`.

**Dashboard/tendances** : `dayTotals()`, `calorieStreak()`, `weeklyDeficits()`,
`kaloInsights()`, tous exercés sur des historiques variés (7j, 10j, 12j, jour
vide, jour exceptionnel, absence longue).

Non exécutés dans cette campagne (lus dans le code, pas simulés) : import/export
(déjà couvert en profondeur par `tests/export-import-roundtrip.test.js`, Phase
2.6), recettes/TikTok, courses, notes/todos, onboarding Day 0 lui-même.

## 5. Bugs détectés

**Aucun bug au sens strict** (comportement contredisant une règle produit
documentée ou provoquant une exception/corruption de données) n'a été détecté
dans les parcours simulés. Le point le plus proche d'un bug — l'édition
"grams-only" qui ne recalcule pas les macros (SIM-2026-09-28-01) — est classé
FRICTION UX/incohérence potentielle plutôt que BUG strict, car aucune règle
produit documentée n'impose ce recalcul et le comportement est déterministe,
pas une exception.

## 6. Frictions UX

- **SIM-2026-09-28-01** — édition "grams-only" d'un repas ne recalcule pas les
  macros (détail : `PHASE4-OBSERVATIONS.md`).
- **SIM-2026-09-28-04** — aucune date sélectionnable dans les modales d'ajout ;
  rattrapage d'un jour passé nécessite 3 étapes de navigation séparées.

## 7. Incompréhensions

- **SIM-2026-09-28-03** — un utilisateur "sport only" qui atteindrait un état
  sans aucune pesée ne peut pas comprendre immédiatement pourquoi sa séance est
  refusée sans consulter l'onglet Poids (le message est clair, mais le lien
  structurel entre les deux sections n'est pas évident a priori).

## 8. Répétitions

- Aucune répétition manuelle inutile identifiée qui ne soit pas déjà couverte
  par un mécanisme existant (Quick-add pour les repas fréquents, confirmé
  fonctionnel en simulation B-J1 ; portion habituelle, confirmée fonctionnelle
  en simulation A-J1).
- Le seul point de répétition potentielle identifié — recréer un aliment déjà
  scanné en le retapant manuellement, ou l'inverse — est couvert par
  SIM-2026-09-28-02 (fragmentation catalogue), classé ici plutôt que
  "répétition" car le coût principal n'est pas la ressaisie elle-même (rapide
  dans les deux cas) mais la duplication de définition qui en résulte.

## 9. Problèmes récurrents

Aucun problème n'est apparu de façon récurrente dans **plusieurs profils
indépendants** au sens strict (chaque signal retenu provient d'un seul profil
dans cette campagne). C'est attendu vu le volume réel (11 profils, pas 20+) —
voir section 15 pour la couverture à étendre avant de pouvoir parler de
convergence multi-profils.

## 10. Signaux faibles

- SIM-2026-09-28-02 (fragmentation catalogue via scan) — cohérent avec un choix
  produit déjà assumé, n'ajoute rien de qualitativement nouveau.
- SIM-2026-09-28-03 (weight-gate séance) — mécanisme réel mais surface
  d'exposition très réduite par l'onboarding existant.
- Profil C (fragilité exact-match sur variation mineure du petit-déj) —
  reconfirme une limite **déjà documentée** dans `README.md` §7, pas une
  découverte.
- Profil ANNIV (aucun Insight ne réagit le jour même à une journée
  exceptionnelle) — conséquence directe et déjà documentée de la fenêtre
  minimale de `comparePeriods()` (14 jours, voir `CLAUDE.md`), pas une
  découverte.

## 11. Signaux intéressants

- **SIM-2026-09-28-01** (édition grams-only sans recalcul macro) — mécanisme
  structurel sur une fonctionnalité toute récente (Phase 3, Lot A), affecte
  potentiellement tout profil qui corrige une entrée par le chemin le plus
  intuitif.
- **SIM-2026-09-28-04** (aucune date dans les modales d'ajout) — mécanisme
  structurel confirmé par lecture directe du code (pas seulement par la
  simulation), touche transversalement plusieurs profils/scénarios de la
  mission (repas oublié, journée de reprise, correction rétroactive).

## 12. Signaux suffisamment solides

**Aucun** signal de cette campagne n'atteint le niveau "suffisamment solide" au
sens de la mission (convergence dans plusieurs scénarios indépendants **et**
impact clairement démontré au-delà du code). C'est un résultat honnête compte
tenu du volume réel de cette première campagne — voir section 19 (conclusion).

## 13. Opportunités potentielles

Formulées strictement comme OBSERVATION → PROBLÈME → IMPACT → HYPOTHÈSE, jamais
comme une fonctionnalité à construire (voir règle finale de la mission) :

- Rattrapage de date (SIM-2026-09-28-04) : hypothèse à corroborer avant toute
  décision — un raccourci de date accessible depuis les modales d'ajout
  elles-mêmes, sans dire sous quelle forme.
- Cohérence grams/macros à l'édition (SIM-2026-09-28-01) : hypothèse à
  corroborer — un lien entre les deux comparable à celui de l'ajout initial.

## 14. Scénarios sans problème

- Garde anti-double-confirmation, abandon IA en vol (AbortController), et
  fermeture propre des modales : confirmés fonctionnels sur les chemins
  exercés (profil B, D).
- Règle n°1 (sport jamais soustrait des calories restantes) : confirmée
  intacte y compris avec plusieurs séances le même jour (profil E).
- Étanchéité des jours (`currentDate` changée en cours de session) : aucune
  fuite d'entrées entre jours observée (profil G).
- Reprise après absence longue (25 jours) : `calorieStreak()`/`kaloInsights()`
  se recalculent sans exception, sans faux streak (profil F).
- Dédup stricte par barcode : confirmée fonctionnelle, aucun doublon sur un
  même produit re-scanné (profil H).
- Refus propre d'un produit à données nutritionnelles insuffisantes
  (`kcalKnown`) : confirmé, aucune valeur `0` fabriquée silencieusement
  (profil H).
- Détection de repas fréquent et portion habituelle : confirmées
  fonctionnelles sur répétition exacte (profils A, B).

## 15. Zones insuffisamment testées

À signaler explicitement plutôt que masquer :

- **Aucun rendu DOM réel** : cette campagne exécute la logique de données, pas
  le rendu HTML/CSS ni l'ergonomie tactile — aucune conclusion possible ici sur
  la lisibilité, la taille des zones cliquables, ou le ressenti mobile.
- **`openEditWorkoutEntryModal()`** (édition de séance) : lu, non exercé en
  simulation dans cette campagne — à couvrir dans une campagne suivante,
  notamment pour vérifier si le même risque grams/macros existe côté séance
  (durée vs kcalBurned, champs également indépendants a priori d'après lecture
  du code).
- **Import/export, recettes, courses, notes/todos, onboarding Day 0** : hors
  périmètre de cette campagne (import/export déjà couvert en détail par les
  tests Phase 2.6 dédiés).
- **Séquences 14/30 jours** demandées en cible (§6 de la mission) : non
  exécutées — le plus long historique simulé est de 12 jours (profil C).
- **Scénarios avec restaurant/fast-food/déplacement** explicitement listés en
  §7 de la mission : non simulés séparément dans cette campagne (le scénario
  ANNIV s'en approche mais n'a pas été nommé/traité comme tel).
- **Convergence multi-profils** : avec seulement 11 profils, aucun signal n'a
  eu l'occasion d'apparaître dans plusieurs contextes indépendants — une
  campagne future avec davantage de profils/journées est nécessaire avant de
  pouvoir élever un signal "intéressant" à "suffisamment solide".

## 16. Observations surprenantes

- La suite de handlers d'édition en place (`openEditMealEntryModal`/
  `openEditWorkoutEntryModal`, livrés très récemment) répond déjà, à elle
  seule, à un trou de couverture identifié lors de l'audit QA Phase 2.6
  (CP-06 : "aucun mécanisme d'édition d'une entrée déjà journalisée n'existe").
  Bonne nouvelle produit, mais elle introduit elle-même le signal le plus
  intéressant de cette campagne (grams/macros non liés) — un rappel qu'une
  fonctionnalité neuve mérite sa propre vague de simulation, pas seulement les
  anciens chemins.
- Le garde-fou `processing` du scanner (anti-détections-concurrentes) ne se
  réinitialise **jamais** sur le chemin de succès — uniquement sur erreur
  réseau. Vérifié comme un choix cohérent une fois qu'on modélise correctement
  le cycle de vie réel (fermeture de modale = fin de session de scan, une
  réouverture recrée l'état) ; a d'abord semblé être un bug dans la simulation
  elle-même avant vérification — bonne illustration du risque de faux positifs
  quand une simulation ne modélise pas fidèlement un cycle de vie complet.

## 17. Recommandations de surveillance

*(Recommandations de surveillance, pas de développement — voir section 18)*

- Surveiller si des utilisateurs réels corrigent des grammages d'entrées déjà
  journalisées (fonctionnalité très récente) et si l'incohérence
  grams/macros qui en résulterait est effectivement remarquée/gênante.
- Surveiller si le besoin de "rattraper une date passée" revient de façon
  répétée dans l'usage réel (pas seulement supposé plausible ici).
- Lors d'une prochaine campagne de simulation, élargir le volume (plus de
  profils, séquences 14/30 jours, scénarios restaurant/déplacement explicites)
  avant de chercher à qualifier un signal comme "suffisamment solide".

## 18. Aucun développement proposé automatiquement

Conformément à la mission : aucune des observations ci-dessus n'a été
transformée en ticket, en lot de travail, ni en modification de code. Les deux
signaux "intéressants" (SIM-2026-09-28-01, SIM-2026-09-28-04) sont documentés
dans `PHASE4-OBSERVATIONS.md` pour référence future, pas pour déclencher une
action immédiate — la décision produit reste séparée de ce travail QA.

## 19. Conclusion — critère de réussite

**Quels problèmes Kalo rencontre-t-il face à des utilisateurs fictifs aux
comportements variés ?** Peu, et rien de critique : les mécanismes déjà
audités/testés en Phase 2.6-3 (règle sport/calories, garde anti-double-clic,
abandon IA, dédup scanner, étanchéité des jours, reprise après absence) se
confirment robustes sous simulation. Les deux points structurels identifiés
(cohérence grams/macros à l'édition, absence de sélecteur de date dans les
flux d'ajout) sont réels et vérifiés par lecture de code, mais reposent chacun
sur un seul scénario simulé dans cette campagne.

**Quels problèmes apparaissent suffisamment souvent pour mériter d'être
observés dans l'usage réel ?** Avec le volume réellement atteint ici (11
profils, pas les 20+ visés), **aucun signal n'atteint le niveau "suffisamment
solide"** tel que défini par la mission. C'est un résultat valide et honnête,
explicitement anticipé par la mission elle-même ("les simulations ne révèlent
aucun signal suffisamment solide" est un résultat utile). Les deux signaux
"intéressants" (édition grams/macros, absence de date dans les modales d'ajout)
méritent d'être gardés en mémoire (`PHASE4-OBSERVATIONS.md`) et réévalués soit
par une campagne de simulation plus large, soit par un signal d'usage réel
indépendant — jamais transformés en chantier sur la seule base de cette
campagne.
