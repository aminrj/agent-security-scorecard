#!/usr/bin/env bash
set -e

PROJECT="agent-security-scorecard"
ACCOUNT="cd3ee86da0a111677fc64f91ed6a99d4"

echo "▶ Building..."
npm run build

echo ""
echo "▶ Creating Pages project (skips if already exists)..."
npx wrangler pages project create "$PROJECT" \
  --production-branch main 2>&1 || true

echo ""
echo "▶ Deploying dist/ to Cloudflare Pages..."
npx wrangler pages deploy dist \
  --project-name "$PROJECT" \
  --branch main \
  --commit-dirty true

echo ""
echo "✅ Deploy complete."
echo "   URL: https://${PROJECT}.pages.dev"
echo ""
echo "Next: set your Beehiiv secrets by running:"
echo "  npx wrangler pages secret put BEEHIIV_PUBLICATION_ID --project-name $PROJECT"
echo "  npx wrangler pages secret put BEEHIIV_API_KEY --project-name $PROJECT"
