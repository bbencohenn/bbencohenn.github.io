// Copies the Sveltia CMS bundle out of node_modules into public/admin/,
// so the admin page is served from this site instead of a third-party CDN.
// That keeps the admin page's Content-Security-Policy tight.
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', '@sveltia', 'cms', 'dist');
const dest = join(root, 'public', 'admin', 'cms');

if (!existsSync(src)) {
  console.error('[copy-cms] @sveltia/cms is not installed. Run `npm install` first.');
  process.exit(1);
}

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log('[copy-cms] Copied Sveltia CMS to public/admin/cms/');
