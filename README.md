# [swarmpit.io](https://swarmpit.io)

Landing page for [Swarmpit](https://github.com/swarmpit/swarmpit) — a static site built with vanilla HTML/CSS/JS, no build step.

## Local development

```bash
nvm use            # node 20
corepack enable    # makes pnpm available
pnpm install
pnpm dev           # http://localhost:3000
```

The contents of [`s3/swarmpit.io/`](s3/swarmpit.io/) are exactly what gets deployed — edit them directly.

## Deployment

Pushed to S3 + CloudFront via GitHub Actions on every push to `master`. See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the one-time AWS setup (bucket, distribution, IAM, secrets).
