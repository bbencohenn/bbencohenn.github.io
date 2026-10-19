// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { callouts } from './src/lib/callouts.mjs';
import { figures } from './src/lib/figures.mjs';

export default defineConfig({
  site: 'https://bencohen.com.au',
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin/'),
    }),
  ],
  markdown: {
    // Prism marks code with classes (styled in global.css) instead of inline
    // colours, so code blocks work under the strict style-src policy.
    syntaxHighlight: 'prism',
    // "> [!NOTE] Title" blockquotes become styled callouts, and
    // ![alt](img.png "Caption") images become captioned figures.
    processor: satteri({ hastPlugins: [callouts, figures] }),
  },
  build: {
    // Everything ships as separate files so the Content-Security-Policy
    // can stay strict: no inline <style> or <script> anywhere on the site.
    inlineStylesheets: 'never',
    assets: '_astro',
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});
