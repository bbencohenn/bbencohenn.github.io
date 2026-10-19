# Security

Found a problem with bencohen.com.au? Please email **security@bencohen.com.au**
(see also [/.well-known/security.txt](https://bencohen.com.au/.well-known/security.txt)).

## How the site is built

- Static HTML served from Cloudflare. There's no application server, database or
  login form on the public site.
- Content is edited through Sveltia CMS, which commits to this repository using the
  editor's own GitHub credentials. Access to the site's content = write access to this repo.
- Every response carries a strict Content-Security-Policy (`public/_headers`). The
  build fails if a page contains inline scripts, inline styles, event-handler
  attributes or third-party resources (`scripts/check-dist.mjs`).
- Fonts and the CMS bundle are self-hosted. The public site makes no third-party requests.
- Dependencies are pinned, audited in CI, and updated by Dependabot with a cool-down
  period. GitHub Actions are pinned to commit SHAs.

## Scope

In scope: anything served from bencohen.com.au, and this repository's build and deploy
pipeline. Out of scope: Cloudflare and GitHub themselves, volumetric DoS, and findings
that need a compromised GitHub account.

Reports are credited (with your permission) in the commit that fixes them.
