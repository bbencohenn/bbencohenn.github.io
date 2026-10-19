// Post-build guard: fails the build if any page would break the strict
// Content-Security-Policy in public/_headers, i.e. if it contains an inline
// script, an inline style, or loads a resource from another origin.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const problems = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (relative(dist, p) === 'admin') continue; // the CMS has its own, looser policy
      walk(p);
    } else if (p.endsWith('.html')) {
      check(p);
    }
  }
}

function check(file) {
  const html = readFileSync(file, 'utf8');
  const rel = relative(dist, file);

  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = m[1];
    const isData = /type=["']?application\/ld\+json/i.test(attrs);
    if (!/\bsrc=/i.test(attrs) && !isData && m[2].trim()) problems.push(`${rel}: inline <script>`);
    const src = attrs.match(/\bsrc=["']([^"']+)/i);
    if (src && /^(https?:)?\/\//i.test(src[1])) problems.push(`${rel}: third-party script ${src[1]}`);
  }
  if (/<style[\s>]/i.test(html)) problems.push(`${rel}: inline <style>`);
  if (/\sstyle=["']/i.test(html)) problems.push(`${rel}: style="" attribute`);
  if (/\son[a-z]+=["']/i.test(html)) problems.push(`${rel}: inline event handler`);

  for (const m of html.matchAll(/<(link|img|source|iframe|video|audio)\b[^>]*\b(?:href|src|srcset)=["']([^"']+)/gi)) {
    const [, tag, url] = m;
    if (tag.toLowerCase() === 'link' && /rel=["'](canonical|alternate|me)/i.test(m[0])) continue;
    if (/^(https?:)?\/\//i.test(url)) problems.push(`${rel}: <${tag}> loads ${url}`);
  }
}

walk(dist);

if (problems.length) {
  console.error(`\n[check-dist] ${problems.length} CSP problem(s):`);
  for (const p of [...new Set(problems)]) console.error('  - ' + p);
  process.exit(1);
}
console.log('[check-dist] OK: no inline scripts or styles, no third-party resources.');
