# Deployment

The site is a static bundle (`s3/swarmpit.io/`) served from **S3 + CloudFront**, deployed by [GitHub Actions](.github/workflows/deploy.yml) on every push to `master`.

```
master ──push──▶ GitHub Actions ──▶ aws s3 sync ──▶ S3 (swarmpit-io) ──▶ CloudFront (CDN, TLS) ──▶ swarmpit.io
                                  └─▶ aws cloudfront create-invalidation
```

This document covers the **one-time AWS setup** you do before the workflow can run.

---

## Prerequisites

- AWS account with billing enabled
- AWS CLI installed locally (`brew install awscli`) — only needed for the manual setup below; CI uses its own credentials
- Owner/admin access to the GitHub repo (to add Actions secrets)
- A registered domain (`swarmpit.io`) — registrar can be Route53 or external

---

## 1. ACM certificate (us-east-1, **must**)

CloudFront only accepts certs from `us-east-1`, regardless of where your bucket lives.

1. AWS Console → **Certificate Manager** → switch region to **N. Virginia (us-east-1)**
2. Request a public certificate
3. Domain names: `swarmpit.io` and `www.swarmpit.io`
4. Validation method: **DNS validation**
5. After issuance, ACM gives you CNAME records to add to your DNS — add them, wait for status `Issued` (a few minutes)

Note the **certificate ARN**.

---

## 2. S3 bucket

1. AWS Console → **S3** → Create bucket
2. Name: `swarmpit-io` — bucket name is **arbitrary** when fronted by CloudFront with OAC (the legacy "name must equal the domain" rule only applied to S3 website endpoints). If you change this, update line 61 of [`deploy.yml`](.github/workflows/deploy.yml) and the resource ARNs in step 5a below.
3. Region: `eu-central-1` (or wherever — update [`deploy.yml`](.github/workflows/deploy.yml#L57) if you change it)
4. **Block all public access**: leave **enabled** — the bucket stays private; CloudFront fetches via Origin Access Control (OAC)
5. Versioning: optional (cheap insurance against bad deploys)
6. Default encryption: SSE-S3 (default)

> CloudFront's OAC will be granted bucket-policy access in step 3.

---

## 3. CloudFront distribution

1. AWS Console → **CloudFront** → Create distribution
2. **Origin domain**: pick the S3 bucket from the dropdown (use the `*.s3.region.amazonaws.com` form, NOT the website endpoint)
3. **Origin access**: choose *Origin access control settings (recommended)* → Create new OAC, accept defaults
4. **Default cache behavior**:
   - Viewer protocol policy: *Redirect HTTP to HTTPS*
   - Allowed methods: *GET, HEAD*
   - Cache policy: *CachingOptimized*
   - Compress objects automatically: *Yes*
5. **Settings**:
   - Price class: *Use only North America and Europe* (or all — your call)
   - Alternate domain names (CNAMEs): `swarmpit.io`, `www.swarmpit.io`
   - Custom SSL certificate: pick the ACM cert from step 1
   - Default root object: `index.html`
6. **Custom error responses** (optional, for cleaner 404s):
   - HTTP 403 → `/index.html`, response code 200, TTL 0
   - HTTP 404 → `/index.html`, response code 200, TTL 0
7. Create the distribution. AWS will show you a **bucket policy snippet** — copy it and paste it into your S3 bucket's *Permissions → Bucket policy* tab. (CloudFront needs this to read the private bucket.)

Wait for the distribution to deploy (5–15 min). Note the **Distribution ID** and the domain (`xyz.cloudfront.net`).

---

## 4. DNS

Point your domain at CloudFront.

**Route53:**
- Hosted zone for `swarmpit.io` → Create record
- Type: `A`
- Alias: *Yes* → Alias to CloudFront distribution → pick the distribution
- Repeat for `www.swarmpit.io` (or set up a redirect bucket — outside the scope of this doc)

**External registrar:**
- Add a `CNAME` (or ALIAS/ANAME if your registrar supports it) pointing `swarmpit.io` → `xyz.cloudfront.net`. Apex CNAMEs aren't strictly RFC-compliant; ALIAS/ANAME or registrars that fake-flatten CNAMEs work, otherwise migrate the zone to Route53.

DNS can take up to an hour to propagate.

---

## 5. IAM users for CI

Two minimal-permission users so a leaked CI credential can't do anything else in your account.

### 5a. Deploy user (S3 sync)

Console → IAM → Users → Create user — call it `swarmpit-io-deploy`.
- Programmatic access only (no console password)
- Attach this **inline policy** (replace `swarmpit.io` if your bucket is named differently):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": ["s3:ListBucket"],
            "Resource": "arn:aws:s3:::swarmpit.io"
        },
        {
            "Effect": "Allow",
            "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
            "Resource": "arn:aws:s3:::swarmpit.io/*"
        }
    ]
}
```

After creation: *Security credentials* tab → Create access key → use case *Other* → save the key ID and secret somewhere safe; AWS only shows the secret once.

### 5b. Invalidation user (CloudFront)

Same drill — call it `swarmpit-io-invalidate`. Inline policy (replace `ACCOUNT_ID` and `DIST_ID`):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": ["cloudfront:CreateInvalidation"],
            "Resource": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DIST_ID"
        }
    ]
}
```

Generate an access key and secret as before.

---

## 6. GitHub Actions secrets

Repo → Settings → **Secrets and variables → Actions** → New repository secret. Add all six:

| Secret | Value |
| --- | --- |
| `AWS_ACCESS_KEY` | deploy user access key ID (5a) |
| `AWS_SECRET_KEY` | deploy user secret access key (5a) |
| `AWS_CLOUDFRONT_ACCESS_KEY` | invalidation user key ID (5b) |
| `AWS_CLOUDFRONT_SECRET_KEY` | invalidation user secret (5b) |
| `AWS_REGION` | `eu-central-1` (or your S3 region) |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | from step 3 |

---

## 7. First deploy

```bash
git push origin master
```

Watch it run at `https://github.com/swarmpit/swarmpit.io/actions`. You can also trigger manually from the Actions tab via *Run workflow* (the workflow has `workflow_dispatch`).

The job will:
1. Install the (single) dev dependency
2. `aws s3 sync s3/swarmpit.io/ s3://swarmpit.io/ --delete --cache-control "public, max-age=3600"`
3. `aws cloudfront create-invalidation --paths "/*"` so visitors see new content immediately

---

## Local development

```bash
nvm use            # node 20
corepack enable    # ensures pnpm is available
pnpm install
pnpm dev           # http://localhost:3000
```

No build step — the contents of `s3/swarmpit.io/` are exactly what gets deployed.
