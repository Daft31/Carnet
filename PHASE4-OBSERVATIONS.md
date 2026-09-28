# PHASE4-OBSERVATIONS.md

Journal des signaux issus des simulations comportementales QA de Kalo (Phase 4 et
phases futures du même type). Ce fichier n'existait pas avant la première
simulation ci-dessous — il est créé à cette occasion, pas réécrit.

> ⚠️ **Toutes les entrées de ce fichier sont des SIMULATIONS QA**, produites en
> exécutant le vrai code de Kalo (`js/core.js`/`js/ui.js`/`js/scanner.js`/
> `js/mealparser.js`/`js/workoutparser.js`) dans un bac à sable Node (`vm`) piloté
> par des profils utilisateurs **fictifs**, jamais une observation d'un utilisateur
> humain réel. Aucune entrée ici ne doit être présentée ou traitée comme un
> signal d'usage réel au sens du protocole de `CLAUDE.md`/`README.md` §9 — c'est
> une source d'hypothèses à corroborer par de l'usage réel, pas un substitut à
> celui-ci. Un futur agent qui lirait "friction observée" dans ce fichier doit
> comprendre : "observée en simulation de code", pas "signalée par l'utilisateur".

> Avant d'ajouter une nouvelle campagne de simulation, lire les entrées
> existantes ci-dessous pour éviter de re-découvrir (et re-décrire comme neuve)
> une friction déjà cartographiée — et pour repérer si un signal simulé a depuis
> été corroboré par un signal d'usage réel (auquel cas il change de nature et
> relève alors du protocole `CLAUDE.md`, pas de ce journal).

---

## Campagne 2026-09-28 — Phase 4, simulation comportementale intensive

Rapport complet : [`PHASE4-SIMULATION-REPORT.md`](./PHASE4-SIMULATION-REPORT.md).
Script reproductible : `tests/phase4-simulation/` (`node tests/phase4-simulation/scenarios.js`).
État de référence : `main` à `3e3ed6d`.

### Signaux retenus (voir le rapport complet pour la méthode et tous les autres résultats)

---

**ID** : SIM-2026-09-28-01
**Profil** : G — Chaotique (et par extension A — Rigoureux, tout profil qui corrige une entrée)
**Scénarios concernés** : G-J1 (édition grams-only d'un repas déjà journalisé)
**Contexte** : `openEditMealEntryModal()` (`js/ui.js`), fonctionnalité récente (Phase 3, Lot A).
**Observation** : Le formulaire "Modifier ce repas" expose `Quantité (g)` et les
quatre champs macro (kcal/protéines/glucides/lipides) comme des champs
**indépendants**. Modifier uniquement la quantité (ex. 100g → 300g) et valider
n'entraîne **aucun recalcul automatique** des macros — contrairement au flux
d'ajout initial (`openQtyModal()`), où kcal/macros sont toujours dérivées de
`food.kcal × grams/100`.
**Problème** : Un utilisateur qui corrige seulement le grammage d'une entrée déjà
journalisée (le geste le plus intuitif pour "j'ai mangé plus que prévu") obtient
une entrée durablement incohérente : la quantité affichée ne correspond plus aux
valeurs nutritionnelles affichées à côté.
**Impact** : Risque de désinformation silencieuse dans le journal et l'historique
(totaux caloriques faux sans qu'aucune erreur ne soit signalée) ; dégrade aussi la
fiabilité de `typicalGramsFor()` pour cet aliment (une médiane de grammages qui ne
reflète plus la réalité calorique associée).
**Fréquence observée** : Systématique dès qu'on modifie `grams` sans modifier les
quatre autres champs à la main (chemin le plus court, donc le plus probable).
**Reproductibilité** : Élevée (comportement du code, pas un état transitoire).
**Signal** : **Intéressant** — un seul scénario testé directement, mais le
mécanisme en cause (indépendance grams/macros dans un formulaire d'édition tout
juste livré) est structurel, pas un cas limite ; à corroborer par un signal
d'usage réel avant toute décision.
**Hypothèse** *(pas une solution imposée)* : reproduire, dans le formulaire
d'édition, un lien entre `grams` et les macros comparable à celui qui existe déjà
à l'ajout — à réévaluer si l'usage réel confirme que ce chemin est emprunté.

---

**ID** : SIM-2026-09-28-02
**Profil** : H — Scanner
**Scénarios concernés** : H-J5 (aliment personnalisé créé manuellement puis scan du même produit réel)
**Contexte** : `openCustomFoodModal()` (`js/ui.js`) et `findOrAddScannedFood()` (`js/scanner.js`, Side Quest P0).
**Observation** : Créer manuellement un aliment personnalisé ("Nutella", valeurs
approximatives) PUIS scanner le code-barres du même produit réel crée une
**deuxième** entrée `customFoods` distincte — la déduplication de
`findOrAddScannedFood()` ne porte que sur le `barcode`, jamais sur le nom
(comportement documenté et volontaire dans le code, cohérent avec la philosophie
"correspondance exacte, zéro fuzzy matching" déjà appliquée ailleurs — voir
`README.md` §6/§7). Confirmé : les deux entrées coexistent avec des valeurs
nutritionnelles légèrement différentes, aucune ne référence l'autre.
**Problème** : Fragmentation du catalogue personnel — plusieurs entrées
conceptuellement identiques mais non reliées, chacune constituant un
foodId séparé pour `typicalGramsFor()`/`frequentMealFor()`.
**Impact** : Dilue l'historique d'un même aliment sur plusieurs foodIds,
retardant ou empêchant la détection de portion habituelle/repas fréquent pour cet
aliment ; laisse deux définitions divergentes visibles dans la recherche (source
de confusion à la sélection).
**Fréquence observée** : Un scénario simulé, mais le mécanisme est présent sur
les 3 chemins de création de définitions catalogue (`openCustomFoodModal`,
`findOrAddScannedFood`, et par extension tout futur chemin) — aucun ne vérifie
les 2 autres.
**Reproductibilité** : Élevée dès qu'un même produit est d'abord saisi à la main
puis scanné (ou l'inverse), ce qui est plausible pour un utilisateur qui
découvre le scanner après avoir déjà commencé à saisir manuellement.
**Signal** : **Faible à ce stade** — cohérent avec un choix produit déjà assumé
(pas de fuzzy matching) et déjà documenté comme limite connue en creux
(`README.md` §7, "correspondance exacte d'identifiant") ; ce signal rend le cas
concret mais n'ajoute rien de qualitativement nouveau à ce qui est déjà su.
**Hypothèse** : aucune — explicitement listé en Decisions/Do Not Build
(`CLAUDE.md`) tant qu'aucun besoin démontré n'apparaît.

---

**ID** : SIM-2026-09-28-03
**Profil** : E — Sportif (et tout profil qui priorise le sport sur le poids)
**Scénarios concernés** : E-J1 (tentative de log séance sans aucune pesée existante)
**Contexte** : handler `#saveWorkout` (`js/ui.js`), `getCurrentWeight()`.
**Observation** : Logger une séance sans **aucune** pesée déjà enregistrée est
bloqué net par le code (`toast("Renseigne ton poids dans l'onglet Poids
d'abord")`, aucune entrée créée) — comportement clair et non silencieux, mais un
blocage dur.
**Problème** : Un utilisateur qui voudrait suivre uniquement ses séances (sans
intérêt particulier pour le poids) ne peut pas logger sa toute première séance
tant qu'il n'a pas fourni un poids — dépendance imposée entre deux fonctions
présentées comme des sections distinctes du produit (Séances / Poids).
**Impact** : Frein au tout premier usage de la section Séances pour un profil
"sport only" — mais atténué en pratique par l'onboarding Day 0, qui demande déjà
un poids avant tout accès aux autres sections (donc ce blocage n'est atteignable
qu'après une réinitialisation complète des données ou un import qui aurait vidé
`weightEntries` sans vider `logEntries`).
**Fréquence observée** : Un scénario simulé (délibérément sans onboarding
préalable, pour isoler le mécanisme).
**Reproductibilité** : Élevée dans les conditions testées, mais ces conditions
(zéro pesée après avoir passé l'onboarding) sont rares en usage réel normal.
**Signal** : **Faible** — mécanisme réel et confirmé, mais surface d'exposition
probablement très réduite par l'onboarding existant ; à surveiller seulement si
un signal réel indépendant apparaît (ex. après un reset/import).
**Hypothèse** : aucune proposée à ce stade.

---

**ID** : SIM-2026-09-28-04
**Profil** : Tous (transversal — observé via Irrégularités, journée oubliée)
**Scénarios concernés** : IRR-2 (ajout rétroactif sur un jour passé)
**Contexte** : `openQtyModal()`/flux d'ajout catalogue (`js/ui.js`), `dateStrip()`/`switchTab` (`js/core.js`).
**Observation** : Aucun des flux d'ajout de repas (recherche catalogue, IA,
scanner, aliment personnalisé) n'expose de sélecteur de date dans sa propre
modale. La seule façon de journaliser sur une date passée est de d'abord changer
le jour actif via le bandeau de dates (dateStrip), PUIS d'ajouter, PUIS de
revenir à aujourd'hui.
**Problème** : Le rattrapage d'un "repas oublié hier" ou d'une "journée de
reprise après absence" (scénarios explicitement dans le périmètre Phase 4)
demande une navigation en 3 étapes séparées, alors que le besoin ("j'ai oublié de
loguer, je le fais maintenant pour hier") est probablement fréquent.
**Impact** : Charge de navigation ajoutée pour un besoin récurrent plausible ;
risque concret d'erreur si l'utilisateur oublie de revenir sur "aujourd'hui"
après coup et continue à loguer par erreur sur la date passée.
**Fréquence observée** : Un scénario simulé, mais le mécanisme (absence de champ
date dans les modales d'ajout) est structurel et touche tous les profils.
**Reproductibilité** : Certaine (vérifié par lecture directe du code des 4
modales d'ajout, pas seulement par la simulation).
**Signal** : **Intéressant** — mécanisme structurel confirmé, touchant
potentiellement plusieurs profils (F — Occasionnel, G — Chaotique, et toute
"journée de reprise"), mais fréquence réelle d'usage non mesurée (à corroborer).
**Hypothèse** : aucune solution imposée — noter seulement que le besoin
("rattraper une date passée sans quitter le flux d'ajout") n'est aujourd'hui
couvert par aucun raccourci dédié.

---

*(Les autres observations de cette campagne — sans anomalie, ou signal jugé trop
faible pour un ID dédié — sont listées dans leur intégralité dans
`PHASE4-SIMULATION-REPORT.md`, section 10 "Signaux faibles" et 14 "Scénarios sans
problème".)*

---

## Campagne 2026-09-28 (V2) — Phase 4, simulation longue durée/générative

**Source : SIMULATION QA.** Prolonge la campagne ci-dessus, mêmes réserves
méthodologiques. Rapport complet : section "V2 — Simulation longue durée" de
[`PHASE4-SIMULATION-REPORT.md`](./PHASE4-SIMULATION-REPORT.md). Scripts
reproductibles : `tests/phase4-simulation/rng.js`, `harness-v2.js`,
`scenarios-v2.js` (`node tests/phase4-simulation/scenarios-v2.js`, seeds
1001-9009, un par campagne, journalisés dans le rapport). État de référence :
`main` à `3e3ed6d` (inchangé depuis la campagne V1).

Les deux observations retenues ci-dessus (grams/macros non liés à l'édition ;
absence de date dans les modales d'ajout) **restent valables telles quelles** —
non recherchées à nouveau, non corrigées, conservées sans modification.

### Nouvelle observation retenue (V2)

---

**ID** : SIM-2026-09-28-05
**Source** : SIMULATION QA
**Profil** : Transversal (campagne "Abandons ciblés", cas scanner ; corroboré
par la campagne "Scanner longue durée")
**Scénarios concernés** : abandon de la modale de quantité après un scan de
code-barres réussi (produit trouvé, jamais confirmé).
**Contexte** : `findOrAddScannedFood()`/`openScannedProductModal()`
(`js/scanner.js`, mécanisme "Side Quest P0").
**Observation** : Sur les 3 flux qui peuvent créer une définition dans
`customFoods` (recherche catalogue via `openQtyModal()`, aliment personnalisé
via `openCustomFoodModal()`, scan via `findOrAddScannedFood()`), le scanner est
le seul où l'écriture catalogue a lieu **avant** la confirmation de quantité —
dès la détection réussie du code-barres, avant même l'affichage de la modale
de quantité. Les deux autres flux n'écrivent rien tant que l'utilisateur n'a
pas explicitement confirmé.
**Problème** : Un utilisateur qui scanne puis abandonne (se ravise, ferme
l'app, se trompe de produit, change d'avis) laisse une nouvelle entrée
catalogue derrière lui, même si strictement aucun repas n'est jamais
journalisé — contrairement à ce qui se passerait avec les deux autres flux
d'ajout dans la même situation.
**Impact** : Accumulation potentielle d'entrées catalogue jamais utilisées
(un scan "pour voir", un scan par erreur, un scan suivi d'un changement
d'avis) — aucune perte de données utilisateur (le repas lui-même n'est
jamais fantôme), mais un effet de bord asymétrique et invisible pour
l'utilisateur, qui n'a aucune raison de savoir qu'un simple scan — même
abandonné — a déjà modifié son catalogue personnel.
**Fréquence observée** : Un scénario direct (campagne "Abandons ciblés"), mais
le mécanisme lui-même (écriture avant confirmation) est vérifié par lecture de
code, pas seulement déduit de la simulation — donc systématique, pas
occasionnel, dès qu'un scan aboutit à un produit reconnu.
**Reproductibilité** : Certaine (comportement du code, indépendant de l'aléa
de la simulation — vérifié à la fois en isolant `findOrAddScannedFood()`
directement et via le flux complet `onDetected()`).
**Signal** : **Suffisamment solide** au sens mécanique (asymétrie claire,
vérifiée par code ET simulation, impact concret et démontrable) — mais reposant
sur un seul scénario direct, donc sans mesure de fréquence réelle d'usage. À
traiter comme un signal robuste sur le MÉCANISME, pas encore comme une preuve
que ce mécanisme cause un problème perçu par un utilisateur réel.
**Hypothèse** *(pas une solution imposée)* : aligner le moment d'écriture
catalogue du flux scanner sur celui des deux autres flux (écriture différée à
la confirmation) — à évaluer uniquement si un signal d'usage réel démontre que
des entrées catalogue orphelines issues de scans abandonnés posent
effectivement un problème.

---

*(Les autres observations de cette campagne V2 — sans anomalie, signal jugé
trop faible pour une fiche dédiée, ou reconfirmation d'un signal déjà
consigné ci-dessus sans rien y ajouter de qualitativement nouveau — sont
listées dans leur intégralité dans `PHASE4-SIMULATION-REPORT.md`, section
"V2 — Simulation longue durée".)*
