# Deployment Guide

## Environment Variables Setup

### GitHub Secrets
Add the following secrets to your GitHub repository:

1. **CARNET_API_KEY** - Your Carnet API key
   - Go to: https://github.com/Daft31/Carnet/settings/secrets/actions
   - Click "New repository secret"
   - Name: `CARNET_API_KEY`
   - Value: Your actual API key

2. **VERCEL_TOKEN** - Vercel authentication token
   - Generated from Vercel dashboard

3. **VERCEL_ORG_ID** - Your Vercel organization ID

4. **VERCEL_PROJECT_ID** - Your Vercel project ID

### Vercel Environment Variables
Set these in your Vercel project settings:

- **CARNET_API_KEY** - Set to `@carnet_api_key` (references the secret)

## Deployment Process

1. Push your changes to the `main` branch
2. GitHub Actions will automatically:
   - Run tests using the Carnet API
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
