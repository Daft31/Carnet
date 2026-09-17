# Deployment Guide

Kalo deploys to two places from this single repo. See `README.md` (section "Déploiement") and `CLAUDE.md` (rules 5–7) for the full context — this file only covers environment variable setup.

## GitHub Pages

Fully automated by `.github/workflows/static.yml` on every push to `main`. No secrets, no build step, no tests — it just publishes the repo's static files as-is. This workflow does **not** touch Vercel and does **not** call the Mammouth API.

## Vercel

Deployed automatically via Vercel's native GitHub integration (project `carnet` under the `daft31` account) — **not** via a GitHub Actions workflow. Two Vercel-specific workflow files (`deploy-to-vercel.yml`, `mammouth-api.yml`) existed previously, were broken from the start, and were deleted — do not recreate them (see `CLAUDE.md` rule 7).

### Required setup

1. **`CARNET_API_KEY`** — your Mammouth AI API key (historical variable name, kept as-is — see `CLAUDE.md` rule 2). **Not** an Anthropic key.
   - Set in **Vercel → Settings → Environment Variables**, as a plain value (not the legacy `@secret` reference syntax from `vercel.json`).
   - Used server-side only, shared by all three serverless functions: `api/parse-meal.js`, `api/parse-recipe.js`, `api/parse-workout.js`.
2. **Vercel → Settings → Deployment Protection → "Vercel Authentication"** must stay **disabled** in Production. If re-enabled, every `/api/parse-*` route becomes unreachable from outside (blocked before the code even runs), which shows up as a generic "Failed to fetch" on the client.

No GitHub Secrets are required for Vercel deployment itself — Vercel's GitHub integration handles that independently of this repo's Actions.

## Troubleshooting

### AI features fail with "Failed to fetch"
- Check that `Vercel Authentication` (Deployment Protection) is disabled — this is the most common cause.
- Check that `CARNET_API_KEY` is set in Vercel's environment variables.
- If the Vercel production domain ever changes, `VERCEL_API_BASE` must be updated in all three client files (`js/mealparser.js`, `js/recipeimport.js`, `js/workoutparser.js`) — see `CLAUDE.md` rule 4.

### Mammouth API errors
- Check the model name in the relevant `api/parse-*.js` file is still valid on Mammouth's side — see `CLAUDE.md` rule 3 for the current (temporary) model situation.
