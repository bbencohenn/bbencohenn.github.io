# bencohen.com.au

Personal site of Ben Cohen. Static [Astro](https://astro.build) site, edited through a
git-based admin panel ([Sveltia CMS](https://sveltiacms.app)), hosted free on Cloudflare.

- **Every page is plain HTML.** Recruiters' tools and search engines read everything; JavaScript only adds the theme toggle, the hash demo and a live "now" marker on the timeline.
- **No server, no database, no login form.** The admin panel is a static app that commits to this repo through the GitHub API. Cloudflare rebuilds and deploys on every commit (about a minute).
- **Strict security headers** (`public/_headers`): a Content-Security-Policy with `script-src 'self'` and `style-src 'self'`, HSTS, and no third-party requests. Fonts are self-hosted. `npm run build` fails if any page would break the policy.

## Project layout

```
src/content/            ← everything you edit (the admin panel writes here)
  posts/<slug>/index.md   blog posts; images sit next to the post
  categories/*.json       writing categories
  projects/<slug>/index.md
  timeline/<slug>/index.md
  settings/site.json      homepage text, about, hiring details
  pages/resume.md         the plain-text résumé page
src/pages/              routes (home, timeline, work, writing, résumé, RSS, 404)
src/components/         Timeline, HashDemo, BitGrid, HiringFacts, …
src/lib/site.ts         data helpers and the timeline layout (lanes are automatic)
src/pages/styles/timeline.css.ts   generates timeline positions/colours as a real stylesheet
src/styles/global.css   the design system
public/_headers         security headers for Cloudflare
public/admin/           the admin panel (config.yml defines every editable field)
public/js/              progressive-enhancement scripts
scripts/                CMS copy step, CSP guard, local server with real headers
```
