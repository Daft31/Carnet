# Phase 4 — Usage réel & détection des opportunités

Journal officiel de la Phase 4 de Kalo. Ce fichier est la **source détaillée** du protocole ; `CLAUDE.md`/`README.md` n'en donnent qu'un résumé de quelques lignes avec un renvoi ici — lire ce fichier en entier avant d'y ajouter quoi que ce soit ou avant de qualifier un signal.

## Objectif de la Phase 4

Répondre, à partir de l'observation réelle de l'usage de Kalo — pas de l'intuition ni d'une idée qui « semblerait logique » — à la question :

> Qu'est-ce qui empêche actuellement Kalo d'être réellement utile, simple et agréable à utiliser au quotidien ?

Cette phase n'a **pas** pour objectif de produire immédiatement de nouvelles fonctionnalités. Elle produit de la compréhension documentée de l'usage réel, qui devient — seulement si elle est suffisamment solide — le point de départ d'un cadrage Archiviste classique, suivi du workflow habituel (branche `agent/<domaine>`, review, intégration).

## Principe : usage réel avant complexification

```
USAGE RÉEL
    ↓
OBSERVATION
    ↓
SIGNAL
    ↓
ANALYSE
    ↓
PROBLÈME / OPPORTUNITÉ
    ↓
VALIDATION
    ↓
LOT DE DÉVELOPPEMENT
```

Jamais l'inverse (`IDÉE → FEATURE → JUSTIFICATION A POSTERIORI`). Ce principe reprend et outille celui déjà énoncé dans `CLAUDE.md`/`README.md` : *« Kalo est en phase d'usage réel, pas en phase de construction active. Aucun nouveau chantier ne doit être lancé sans un signal concret. »*

## Distinction observation / signal / opportunité / décision

Quatre niveaux, à ne jamais confondre ni fusionner :

- **Observation** — ce qui s'est réellement passé, brut, daté, contextualisé. Voir le format ci-dessous.
- **Signal** — ce qui commence à apparaître de manière récurrente à partir de plusieurs observations. Trois paliers (voir *Qualification des signaux*).
- **Opportunité** — un problème suffisamment documenté (signal au palier « suffisamment solide ») pour justifier une vraie fiche produit séparée du problème lui-même.
- **Décision** — `NO ACTION` / `SURVEILLER` / `CADRER`, associée à chaque opportunité. Jamais laissée implicite.

**Une observation ne devient pas automatiquement un ticket.** La très grande majorité des observations restera au stade « observation » ou « signal faible », et c'est un résultat normal, pas un échec du protocole.

---

## Comment ajouter une observation

Ajouter une nouvelle entrée **en haut** de la section « Observations » ci-dessous, en copiant le modèle. Ne pas réorganiser ni renuméroter les entrées existantes.

### Modèle d'observation

```
### [Date] — [titre court]

- Contexte :
- Action effectuée :
- Ce que Kalo a fait :
- Ce que l'utilisateur voulait faire :
- Friction observée :
- Contournement éventuel :
- Fréquence :
- Impact :
- Hypothèse :
- Catégorie :
```

### Catégories disponibles

`SAISIE` · `COMPRÉHENSION` · `SUIVI` · `UTILITÉ` · `BUG` · `PERFORMANCE` · `UX` · `AUTRE`

Les quatre premières correspondent aux axes d'observation de la Phase 4 :

- **SAISIE** — Où Kalo demande-t-il encore trop d'efforts à l'utilisateur ? (nombre d'actions, recherche, sélection, quantité, correction, scan, saisie libre, repas récurrents, aliments personnalisés, entraînements, imports IA)
- **COMPRÉHENSION** — Où Kalo comprend-il mal, ou donne-t-il une information difficile à comprendre ou à vérifier ? (interprétation repas/entraînements, estimations, propositions IA, éléments identifiés, provenance, corrections utilisateur, informations ambiguës)
- **SUIVI** — Quelles informations sont collectées mais ne produisent pas suffisamment de valeur ? (dashboard, historique, poids, nutrition, activité, tendances, récurrences, insights existants)
- **UTILITÉ** — Qu'est-ce qui fait réellement gagner du temps ou comprendre quelque chose ? (décisions facilitées, informations consultées spontanément, fonctionnalités utilisées/ignorées, retour vers Kalo, recours à un outil externe)

`BUG`/`PERFORMANCE`/`UX` restent disponibles pour ce qui ne relève pas d'une friction d'expérience au sens des quatre axes ci-dessus. `AUTRE` pour tout le reste.

Un problème n'est pas nécessairement un bug : il peut être *techniquement correct mais pénible*, *fonctionnel mais incompréhensible*, *précis mais trop long à utiliser*, *automatisé mais nécessitant trop de corrections*, *riche mais inutile*, ou au contraire *simple mais extrêmement utile* (une observation positive est aussi une observation valable — elle indique ce qu'il ne faut surtout pas casser).

---

## Qualification des signaux

**Aucun seuil numérique automatique ne transforme une observation en signal.** La qualification repose sur la convergence réelle des observations, jugée à la relecture — jamais sur un compteur.

- **Signal faible** — Observation isolée, ou impression ponctuelle non recoupée. Reste consigné dans le journal, ne déclenche rien par lui-même.
- **Signal intéressant** — Le même problème observé à plusieurs reprises dans des contextes différents, ou un impact suffisamment visible même en une seule occurrence (abandon net, contournement explicite de Kalo vers un outil externe). Mérite une surveillance active — pas encore d'analyse formelle.
- **Signal suffisamment solide** — Récurrent, documenté par plusieurs observations datées et contextualisées, avec un impact clair et une cause probable formulable sans ambiguïté. Seul ce palier autorise le passage à une fiche « Opportunité » ci-dessous.

Le passage d'un palier à l'autre est explicité par une courte note (pas un simple changement de mot) au moment où il est constaté, en listant les observations qui le justifient.

---

## Opportunités

Une opportunité n'est créée qu'à partir d'un signal qualifié « suffisamment solide ». Ajouter chaque opportunité selon ce modèle :

```
### Opportunité — [titre court]

- Problème :
- Utilisateur concerné :
- Contexte :
- Preuves observées : (renvoyer aux observations concernées, ex. dates)
- Impact :
- Comportement actuel :
- Comportement souhaité :
- Hypothèse de solution :
- Risques :

Décision : NO ACTION / SURVEILLER / CADRER
Date de la décision :
```

**Règle impérative : le champ « Problème » et le champ « Hypothèse de solution » restent strictement séparés.** Ne jamais transformer directement « je fais souvent X » en « il faut ajouter une fonctionnalité X » — l'hypothèse de solution n'est qu'une piste parmi d'autres possibles, à valider séparément lors d'un futur cadrage.

## Décisions

Chaque opportunité doit recevoir une décision explicite, jamais rester en silence :

- **NO ACTION** — décision valide et normale. Le problème est reconnu mais ne justifie pas (encore) d'intervention.
- **SURVEILLER** — le signal est intéressant mais pas encore assez solide ou documenté ; on continue à observer.
- **CADRER** — le signal est suffisamment solide : un cadrage Archiviste dédié doit être lancé avant tout développement, en suivant le workflow habituel de Kalo (`Observation → analyse → décision produit → cadrage Archiviste → validation → lot Dev → QA → intégration`).

---

## Rythme recommandé

Relecture du journal toutes les 1 à 2 semaines d'usage réel environ, pour repérer les convergences et faire progresser les paliers de signal. Pas de durée fixe pour la Phase 4 elle-même — elle dure tant qu'aucun signal solide ne justifie un nouveau chantier, et un résultat de type « aucun nouveau chantier justifié pour le moment » est un résultat de sortie valide.

---

## Observations

*(Aucune observation consignée pour l'instant — cette section se remplit au fil de l'usage réel.)*

## Opportunités actives

*(Aucune opportunité pour l'instant.)*
