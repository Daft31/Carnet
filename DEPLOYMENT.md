# Deployment Guide

## Environment Variables Setup

### GitHub Secrets
Add the following secrets to your GitHub repository:

1. **CARNET_API_KEY** - Your Mammouth AI API key (nom de variable historique, gardé tel quel — voir CLAUDE.md)
   - Go to: https://github.com/Daft31/Carnet/settings/secrets/actions
   - Click "New repository secret"
   - Name: `CARNET_API_KEY`
   - Value: Your actual API key

2. **VERCEL_TOKEN** - Vercel authentication token
   - Generated from Vercel dashboard

3. **VERCEL_ORG_ID** - Your Vercel organization ID

4. **VERCEL_PROJECT_ID** - Your Vercel project ID

### Vercel Environment Variables
Set these directly in your Vercel project settings (Settings → Environment Variables),
as a plain value — not via the legacy `@secret` reference syntax:

- **CARNET_API_KEY** - Your Mammouth AI API key (NOT an Anthropic key — see CLAUDE.md rule 2), used server-side only by `api/parse-meal.js`

## Deployment Process

1. Push your changes to the `main` branch
2. GitHub Actions will automatically:
   - Run tests using the Mammouth AI API (via `CARNET_API_KEY`)
   - Deploy to Vercel using the deploy workflow
   - Deploy static files to GitHub Pages

## Troubleshooting

### "CARNET_API_KEY not found" error
- Verify the secret exists in GitHub Settings → Secrets and variables → Actions
- Ensure the secret name is exactly `CARNET_API_KEY`
- Check that Vercel project has `CARNET_API_KEY` configured

### Vercel Deployment Fails
- Check that `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are set
- Ensure `CARNET_API_KEY` is configured in Vercel environment variables
- Review the GitHub Actions logs for detailed error messages
