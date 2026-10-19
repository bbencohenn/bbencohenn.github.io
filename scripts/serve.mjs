// Local preview that applies public/_headers the same way Cloudflare does,
// so you can test the real Content-Security-Policy before deploying.
//   npm run build && npm run serve   ->   http://localhost:4322
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT || 4322);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.map': 'application/json',
};

// Parse _headers: "path" lines, then indented "Name: value" or "! Name" lines.
function parseHeaders() {
  const file = join(dist, '_headers');
  if (!existsSync(file)) return [];
  const rules = [];
  let cur = null;
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    if (!/^\s/.test(raw)) {
      const pattern = new RegExp('^' + raw.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
      cur = { pattern, set: [], detach: [] };
      rules.push(cur);
    } else if (cur) {
      const line = raw.trim();
      if (line.startsWith('! ')) cur.detach.push(line.slice(2).toLowerCase());
      else {
        const i = line.indexOf(':');
        cur.set.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]);
      }
    }
  }
  return rules;
}
const rules = parseHeaders();

// Matching rules are merged; a repeated header is comma-joined; "! Name" removes it.
function headersFor(path) {
  const out = new Map(); // lower-case name -> [Name, value]
  for (const r of rules) {
    if (!r.pattern.test(path)) continue;
    for (const d of r.detach) out.delete(d);
    for (const [k, v] of r.set) {
      const prev = out.get(k.toLowerCase());
      out.set(k.toLowerCase(), [k, prev ? `${prev[1]}, ${v}` : v]);
    }
  }
  return [...out.values()];
}

function resolve(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  let p = join(dist, clean);
  if (!p.startsWith(dist)) return null;
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  if (!existsSync(p) && !extname(p) && existsSync(p + '.html')) p += '.html';
  return existsSync(p) ? p : null;
}

createServer((req, res) => {
  const path = (req.url || '/').split('?')[0];
  const file = resolve(path);
  const status = file ? 200 : 404;
  const target = file || join(dist, '404.html');
  for (const [k, v] of headersFor(path)) res.setHeader(k, v);
  res.setHeader('Content-Type', types[extname(target)] || 'application/octet-stream');
  res.writeHead(status);
  res.end(readFileSync(target));
}).listen(port, () => console.log(`Serving dist/ with _headers at http://localhost:${port}`));
