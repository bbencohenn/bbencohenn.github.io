/* ---------- Tiny helpers ---------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------- Footer year ---------- */
(() => {
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();

/* ---------- Contact form (mailto, honeypot, simple human check) ---------- */
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  // simple math challenge
  const qEl = document.getElementById('cap-q');
  const aEl = document.getElementById('c-cap');
  let answer = 0;
  const newChallenge = () => {
    const a = Math.floor(Math.random()*8)+1;
    const b = Math.floor(Math.random()*8)+1;
    answer = a + b;
    if (qEl) qEl.textContent = `${a} + ${b} = ?`;
    if (aEl) aEl.value = '';
  };
  newChallenge();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('c-name').value.trim();
    const email = document.getElementById('c-email').value.trim();
    const msg = document.getElementById('c-msg').value.trim();
    const hp = document.getElementById('c-hp').value.trim();
    if (hp) return alert('Spam detected.');
    const cap = (document.getElementById('c-cap').value || '').trim();
    if (String(answer) !== cap) { alert('Captcha incorrect.'); newChallenge(); return; }
    if (!name || !email || !msg) return alert('Please fill all fields.');
    const to = (window.CONTACT_EMAIL || 'ben@bencohen.com.au');
    const subject = encodeURIComponent('Contact via portfolio');
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${msg}`);
    location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    newChallenge();
  });
})();

/* ---------- Active nav highlighting ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const current = (location.pathname.split('/').pop() || 'index.html').replace('./','');
  $$('.nav-card').forEach(a => {
    const href = a.getAttribute('href') || '';
    // Ignore external links
    if (/^https?:\/\//i.test(href)) return;
    if (href.replace('./','') === current) a.classList.add('active');
  });
});

/* ---------- Subtle parallax for [data-speed] ---------- */
(() => {
  // Respect reduced motion
  const prefersReduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const els = $$('[data-speed]');
  if (!els.length) return;

  const onScroll = () => {
    const y = window.scrollY || 0;
    els.forEach(el => {
      const s = parseFloat(el.dataset.speed || 0);
      el.style.transform = `translate3d(0, ${y * s}px, 0)`;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---------- Overlay navigation (burger) ---------- */
(() => {
  const overlay = $('#overlay');
  const burger  = $('#burger');
  if (!overlay || !burger) return;

  const toggleNav = (force) => {
    const open = force ?? !overlay.classList.contains('open');
    overlay.classList.toggle('open', open);
    burger.classList.toggle('active', open);
    overlay.setAttribute('aria-hidden', String(!open));
  };

  burger.addEventListener('click', () => toggleNav());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) toggleNav(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleNav(false); });

  // Close overlay when clicking an in-site link inside the panel
  overlay.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (!/^https?:\/\//i.test(href)) toggleNav(false);
  });

  // Fancy hover glow for nav cards
  $$('.nav-card').forEach(card => {
    card.addEventListener('mousemove', (ev) => {
      const r = card.getBoundingClientRect();
      const mx = ((ev.clientX - r.left) / r.width) * 100;
      const my = ((ev.clientY - r.top)  / r.height) * 100;
      card.style.setProperty('--mx', mx + '%');
      card.style.setProperty('--my', my + '%');
    });
  });
})();

/* ---------- Scroll indicator (always visible) ---------- */
/* If clicked, smoothly scrolls to #highlights (if present). */
(() => {
  const sd = $('#scrolldown');
  const target = $('#highlights');
  if (sd && target) {
    sd.style.cursor = 'pointer';
    sd.setAttribute('role', 'button');
    sd.setAttribute('aria-label', 'Scroll to highlights');
    sd.addEventListener('click', (e) => {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
})();

/* ---------- Cursor-follow glow for highlight cards ---------- */
(() => {
  const cards = $$('.card.highlight');
  if (!cards.length) return;
  cards.forEach(card => {
    card.addEventListener('mousemove', (ev) => {
      const r = card.getBoundingClientRect();
      const mx = ((ev.clientX - r.left) / r.width) * 100;
      const my = ((ev.clientY - r.top)  / r.height) * 100;
      card.style.setProperty('--mx', mx + '%');
      card.style.setProperty('--my', my + '%');
    });
  });
})();

/* ---------- Reveal the Highlights grid once it enters view ---------- */
(() => {
  const group = document.querySelector('[data-reveal-group]');
  if (!group || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        group.classList.add('revealed');
        io.disconnect(); // fire once
      }
    });
  }, { threshold: 0.2 });

  io.observe(group);
})();

/* ---------- Home: populate Highlights with recent posts/projects ---------- */
(() => {
  const cont = document.querySelector('#highlights .cards');
  if (!cont) return;
  // Clear any filler
  cont.innerHTML = '';

  const hasFirebase = typeof window !== 'undefined' && window.firebase && window.firebaseConfig && window.firebaseConfig.apiKey;
  const loadAll = async () => {
    let posts = [], projects = [];
    if (hasFirebase) {
      try {
        if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(window.firebaseConfig);
        const db = firebase.firestore();
        const [ps, pr] = await Promise.all([
          db.collection('posts').get(),
          db.collection('projects').get().catch(()=>null)
        ]);
        posts = ps.docs.map(d => ({ id: d.id, ...d.data(), _type:'post' }));
        projects = pr ? pr.docs.map(d => ({ id: d.id, ...d.data(), _type:'project' })) : [];
      } catch (_) { /* ignore */ }
    }
    if (!posts.length) {
      try { const r = await fetch('data/blog.json'); if (r.ok){ const j = await r.json(); posts = (j.posts||[]).map(p=>({...p,_type:'post'})); } } catch(_){ }
    }
    if (!projects.length) {
      try { const r = await fetch('data/projects.json'); if (r.ok){ const j = await r.json(); projects = (j.projects||[]).map(p=>({...p,_type:'project'})); } } catch(_){ }
    }
    return { posts, projects };
  };

  const dateVal = (x) => Date.parse(x?.date || '') || 0;
  const pickIcon = (x) => x.icon || (x._type==='post' ? 'fa-note-sticky' : 'fa-code');
  const hrefFor = (x) => x._type==='post' ? `blog.html#post-${x.id}` : (x.links&&x.links[0]&&x.links[0].href ? x.links[0].href : 'playground.html');

  loadAll().then(({posts, projects}) => {
    const items = [...posts, ...projects]
      .sort((a,b) => dateVal(b) - dateVal(a))
      .slice(0, 9);
    cont.innerHTML = items.map((it, i) => `
      <a class="card highlight" href="${hrefFor(it)}" style="--i:${i}">
        <h3><i class="fa-solid ${pickIcon(it)}"></i> ${it.title}</h3>
        <p class="muted">${it.summary || (it._type==='post' ? 'Read more' : 'View project')}</p>
        ${(it.tags||[]).slice(0,3).map(t => `<span class='chip mono' data-k='${t}'>#${t}</span>`).join('')}
      </a>`).join('');
  });
})();

/* ---------- Generic modal for timeline buttons ---------- */
(() => {
  const modal = document.getElementById('modal');
  if (!modal) return;
  const panel    = modal.querySelector('.modal__panel');
  const content  = modal.querySelector('.modal__content');
  const closeBtn = modal.querySelector('.modal__close');

  const open = (html) => {
    content.innerHTML = html;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // focus trap start
    closeBtn?.focus?.();
  };
  const close = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // Open on any timeline, blog, or playground card button
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.tl-card .btn, .blog-card .btn, .pg-card .btn');
    if (!btn) return;
    e.preventDefault();
    const card = btn.closest('.tl-card, .blog-card, .pg-card');
    const title = card.querySelector('h2, h3, h4')?.textContent?.trim() || 'Details';
    const imgEl = card.querySelector('img');
    const imgFit = imgEl ? (imgEl.getAttribute('data-modal-fit') || imgEl.dataset?.modalFit || '') : '';
    const img = imgEl ? `<img src="${imgEl.getAttribute('src')}" alt="" ${imgFit ? `data-fit=\"${imgFit}\"` : ''}/>` : '';
    const desc = card.querySelector('p.muted')?.textContent?.trim() || 'More information will appear here.';

    // Per-button overrides via data attributes
    const btnText = (btn.textContent || '').replace(/\s+/g, ' ').trim();
    const modalTitle = btn.getAttribute('data-modal-title') || btnText || title;
    const modalDesc  = btn.getAttribute('data-modal-desc')  || desc;
    const itemsAttr  = btn.getAttribute('data-modal-items'); // pipe (|) separated
    let customHTML = btn.getAttribute('data-modal-html');
    // Decode URI-encoded HTML if present (works for blog + playground)
    if (customHTML && /%[0-9A-Fa-f]{2}/.test(customHTML)) {
      try { customHTML = decodeURIComponent(customHTML); } catch (_) { /* ignore */ }
    }

    let bodyInner = '';
    if (customHTML) {
      // If from blog card, strip a duplicate leading H1/H2/H3 since the modal already shows a title
      if (card?.classList?.contains('blog-card')) {
        try {
          const temp = document.createElement('div');
          temp.innerHTML = customHTML;
          const firstEl = temp.firstElementChild;
          if (firstEl && /H[1-3]/.test(firstEl.tagName)) firstEl.remove();
          bodyInner = temp.innerHTML;
        } catch (_) { bodyInner = customHTML; }
      } else {
        bodyInner = customHTML;
      }
    } else {
      const list = (itemsAttr || '')
        .split('|')
        .map(s => s.trim())
        .filter(Boolean)
        .map(it => `<li><i class=\"fa-solid fa-circle-check\"></i> ${it}</li>`) // safe, text-only items
        .join('');

      bodyInner = `
        ${img}
        <div>
          <p class="muted">${modalDesc}</p>
          ${list ? `<ul class="list-clean" style="margin-top:8px">${list}</ul>` : ''}
        </div>`;
    }

    // Blog-specific layout tweaks: if a blog post, allow full-width content
    const isBlog = card?.classList?.contains('blog-card');
    const hasGallery = isBlog && /class=("|')blog-gallery\b/.test(bodyInner);

    open(`
      <div class="modal__head">
        <h3 style="margin:2px 0 10px">${modalTitle || title}</h3>
      </div>
      <div class="modal__body ${isBlog ? 'blog-mode' : ''} ${hasGallery ? 'has-media' : ''}">${bodyInner}</div>
    `);
  });

  // Close interactions
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  closeBtn?.addEventListener('click', close);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();
/* ===== Timeline Pen (namespaced, runs only on timeline page) ===== */
(function ($) {
  if (!$) return; // jQuery not loaded? skip.

  // Support both legacy tlpen-* and new tl-* markup
  const usingNew = $('.tl-section').length > 0;
  const $sections = usingNew ? $('.tl-section') : $('.tlpen-section');
  const $items    = usingNew ? $('.tl-nav > li') : $('.tlpen-nav > li');

  if (!$sections.length || !$items.length) return; // not on timeline page

  // Smooth scroll like the CodePen
  $('a[href*="#"]:not([href="#"])').on('click', function (e) {
    const samePage =
      location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') ||
      location.hostname === this.hostname;

    if (!samePage) return;

    const $target = $(this.hash.length ? this.hash : `[name=${this.hash.slice(1)}]`);
    if ($target.length) {
      e.preventDefault();
      $('html, body').stop().animate({ scrollTop: $target.offset().top }, 1000);
    }
  });

  // Scroll spy: expand title/body for the active section
  function setActiveByScroll() {
    const scrollTop = $(window).scrollTop();
    const vh        = $(window).height();
    const anchor    = scrollTop + vh * 0.35; // feel free to tweak

    let currentId = $sections.first().attr('id');
    $sections.each(function () {
      const $s = $(this);
      if (anchor >= $s.offset().top) currentId = $s.attr('id');
    });

    $items.removeClass('active');
    $items.each(function () {
      const $li  = $(this);
      const href = $li.find('a').attr('href');
      if (href === '#' + currentId) $li.addClass('active');
    });
  }

  // rAF throttle for smoothness
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      setActiveByScroll();
      ticking = false;
    });
  }

  // init + bind
  setActiveByScroll();
  $(window).on('scroll resize', onScroll);

})(window.jQuery);

/* ---------- Next-section buttons under cards ---------- */
(() => {
  const sections = $$('.tl-section');
  if (!sections.length) return;

  sections.forEach((sec, i) => {
    if (i === sections.length - 1) return; // skip last
    const card = sec.querySelector('.tl-card');
    if (!card) return;
    // Avoid duplicates if rerun
    if (sec.querySelector('.tl-next-wrap')) return;
    // Wrap card + next button to keep section centered as one block
    let stack = sec.querySelector('.tl-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'tl-stack';
      sec.insertBefore(stack, card);
      stack.appendChild(card);
    }
    const wrap = document.createElement('div');
    wrap.className = 'tl-next-wrap';
    wrap.innerHTML = `
      <a href="javascript:void(0)" class="tl-next" aria-label="Next section">
        Next <i class="fa-solid fa-angles-down"></i>
      </a>`;
    stack.appendChild(wrap);
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.tl-next');
    if (!btn) return;
    e.preventDefault();
    const sec = btn.closest('.tl-section');
    if (!sec) return;
    let next = sec.nextElementSibling;
    while (next && !next.classList?.contains('tl-section')) next = next.nextElementSibling;
    if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();

/* ---------- Shell-style command palette (site-wide) ---------- */
(() => {
  // Build overlay lazily
  const make = () => {
    if (document.getElementById('shellpal')) return document.getElementById('shellpal');
    const wrap = document.createElement('div');
    wrap.id = 'shellpal';
    wrap.innerHTML = `
      <div class="shellpal__panel" role="dialog" aria-modal="true" aria-label="Command Palette">
        <div class="shellpal__head">
          <span class="chip mono shell">ben@site</span>
          <span class="chip mono shell">~/</span>
          <input id="shellpal-input" class="shellpal__input" placeholder="Type a command or page… (Ctrl/Cmd+K)" aria-label="Command input" />
        </div>
        <div id="shellpal-list" class="shellpal__list" role="listbox"></div>
      </div>`;
    document.body.appendChild(wrap);
    return wrap;
  };

  // Data sources
  const staticItemsBase = [
    { label: 'About Me',         sub: 'About page',          icon: 'fa-user',         href: 'index.html' },
    { label: 'Timeline',         sub: 'Experience timeline', icon: 'fa-timeline',     href: 'timeline.html' },
    { label: 'Playground',       sub: 'Experiments',         icon: 'fa-otter',        href: 'playground.html' },
    { label: 'Blog & Snippets',  sub: 'Articles and notes',  icon: 'fa-droplet',      href: 'blog.html' },
    { label: 'Contact',          sub: 'Say hi',              icon: 'fa-address-book', href: 'contact.html' }
  ];

  const getStaticItems = () => {
    const current = (location.pathname.split('/').pop() || 'index.html').replace('./','');
    return staticItemsBase.map(it => ({ ...it, sub: (it.href && it.href.replace('./','') === current) ? 'This page' : it.sub }));
  };

  // Current-page sections (if any)
  const sectionItems = () => {
    const els = $$('.tl-section');
    if (!els.length) return [];
    return els.map((s, i) => {
      const t = s.querySelector('h2, h3, h4');
      const label = (t?.textContent || `Section ${i+1}`).trim();
      return {
        label,
        sub: '#'+s.id,
        icon: 'fa-hashtag',
        anchor: '#'+s.id,
        keywords: [label.toLowerCase(), (s.id||'').toLowerCase()]
      };
    });
  };

  // Cross-page heading index (built lazily on first open)
  let crossIndex = [];
  let crossIndexBuilt = false;
  let crossIndexBuilding = false;

  const isInternal = (href) => href && !/^https?:\/\//i.test(href) && !href.startsWith('mailto:') && !href.startsWith('#');

  const getInSitePages = () => {
    // Use nav cards as the source of truth for in-site pages
    const cards = $$('.nav-card[href]');
    const pages = [];
    const seen = new Set();
    cards.forEach(a => {
      const href = a.getAttribute('href') || '';
      if (!isInternal(href)) return;
      const path = href.replace('./','');
      if (seen.has(path)) return; seen.add(path);
      const title = a.querySelector('.nav-card__title')?.textContent?.trim() || path;
      pages.push({ path, title });
    });
    return pages;
  };

  const parseTimelineSections = (doc, page) => {
    const out = [];
    const secs = Array.from(doc.querySelectorAll('.tl-section'));
    secs.forEach((s, i) => {
      const id = s.id || '';
      if (!id) return;
      const t = s.querySelector('h2, h3, h4');
      const label = (t?.textContent || `Section ${i+1}`).trim();
      const crumb = s.querySelector('.shell-crumbs .chip.shell')?.textContent?.trim() || '';
      const meta = Array.from(s.querySelectorAll('.tl-meta .chip')).map(c => c.textContent.trim());
      const kw = [label, id, page.title, crumb, ...meta]
        .join(' ').toLowerCase().replace(/~/g,'').replace(/\s+/g,' ');
      out.push({
        label: `${page.title}: ${label}`,
        sub: `${page.path}#${id}`,
        icon: 'fa-hashtag',
        href: `${page.path}#${id}`,
        keywords: [kw]
      });
    });
    return out;
  };

  const parseGenericHeadings = (doc, page) => {
    const out = [];
    // Prefer explicit ids on headings
    const heads = Array.from(doc.querySelectorAll('h1[id], h2[id], h3[id], h4[id]'));
    heads.forEach(h => {
      const id = h.id;
      const label = h.textContent.trim();
      const kw = `${label} ${id} ${page.title}`.toLowerCase();
      out.push({ label: `${page.title}: ${label}`, sub: `${page.path}#${id}`, icon: 'fa-hashtag', href: `${page.path}#${id}`, keywords: [kw] });
    });
    // Also index section/article with ids + inner heading
    const containers = Array.from(doc.querySelectorAll('section[id], article[id]'));
    containers.forEach(s => {
      const id = s.id;
      const t = s.querySelector('h1, h2, h3, h4');
      if (!t) return;
      const label = t.textContent.trim();
      const kw = `${label} ${id} ${page.title}`.toLowerCase();
      // Avoid duplicates already captured by heading[id]
      if (heads.some(h => h.id === id)) return;
      out.push({ label: `${page.title}: ${label}`, sub: `${page.path}#${id}`, icon: 'fa-hashtag', href: `${page.path}#${id}`, keywords: [kw] });
    });
    return out;
  };

  const buildCrossIndex = async () => {
    if (crossIndexBuilt || crossIndexBuilding) return crossIndex;
    crossIndexBuilding = true;
    const pages = getInSitePages();
    const current = (location.pathname.split('/').pop() || 'index.html').replace('./','');
    const toFetch = pages.filter(p => p.path !== current);
    const results = [];
    for (const page of toFetch) {
      try {
        const res = await fetch(page.path, { credentials: 'same-origin' });
        if (!res.ok) continue;
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        // Detect timeline markup
        const items = doc.querySelector('.tl-section') ? parseTimelineSections(doc, page) : parseGenericHeadings(doc, page);
        results.push(...items);
      } catch (e) { /* ignore fetch/parse errors */ }
    }
    // Also include blog posts from data/blog.json if available
    try {
      const bres = await fetch('data/blog.json', { credentials: 'same-origin' });
      if (bres.ok) {
        const bjson = await bres.json();
        const posts = (bjson.posts || []);
        posts.forEach(p => {
          const title = p.title || 'Post';
          const tags  = (p.tags || []).join(' ');
          const cat   = (p.category || '').toString();
          const date  = (p.date || '').toString();
          const kw = `${title} ${tags} ${cat} ${date}`.toLowerCase();
          results.push({
            label: `Blog: ${title}`,
            sub: `blog.html#post-${p.id}`,
            icon: 'fa-droplet',
            href: `blog.html#post-${p.id}`,
            keywords: [kw]
          });
        });
      }
    } catch (e) { /* ignore */ }

    crossIndex = results;
    crossIndexBuilt = true;
    crossIndexBuilding = false;
    return crossIndex;
  };

  let open = false, selIndex = 0, items = [];
  const openPalette = () => {
    const pal = make();
    pal.classList.add('open');
    open = true;
    const input = document.getElementById('shellpal-input');
    const list  = document.getElementById('shellpal-list');
    items = [...getStaticItems(), ...sectionItems()];
    render(items, list);
    selIndex = 0;
    updateSelection(list);
    input.value = '';
    setTimeout(() => input.focus(), 0);

    // Build cross-page index lazily, then update results if still open
    buildCrossIndex().then(() => {
      if (!open) return;
      const data = filterItems(input.value);
      render(data, list);
      updateSelection(list);
    });
  };

  const closePalette = () => {
    const pal = document.getElementById('shellpal');
    if (!pal) return;
    pal.classList.remove('open');
    open = false;
  };

  const render = (data, list) => {
    list.innerHTML = data.map((it, i) => `
      <div class="shellpal__item" role="option" data-i="${i}" aria-selected="${i===selIndex}">
        <span class="shellpal__icon"><i class="fa-solid ${it.icon}"></i></span>
        <div>
          <div>${it.label}</div>
          <small>${it.sub}</small>
        </div>
      </div>`).join('');
  };

  const updateSelection = (list) => {
    list.querySelectorAll('.shellpal__item').forEach((el, i) => {
      el.setAttribute('aria-selected', String(i===selIndex));
    });
    const active = list.querySelector(`.shellpal__item[data-i="${selIndex}"]`);
    if (active) active.scrollIntoView({ block: 'nearest' });
  };

  // Events
  document.addEventListener('keydown', (e) => {
    if ((e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) && !open) {
      e.preventDefault();
      openPalette();
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      closePalette();
    }
  });

  document.addEventListener('click', (e) => {
    const pal = document.getElementById('shellpal');
    if (!pal || !open) return;
    if (e.target === pal) closePalette();
    const item = e.target.closest('.shellpal__item');
    if (item) selectIndex(parseInt(item.dataset.i, 10));
  });

  const selectIndex = (i) => {
    selIndex = i;
    const list = document.getElementById('shellpal-list');
    const input = document.getElementById('shellpal-input');
    const data = filterItems(input.value);
    const it = data[selIndex];
    if (!it) return;
    if (it.anchor && !it.href) {
      closePalette();
      const el = document.querySelector(it.anchor);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (it.href) {
      location.href = it.href;
    }
  };

  const filterItems = (q) => {
    const query = (q || '').toLowerCase();
    const tokens = query.split(/[\s\/]+/).filter(Boolean);
    const all = [...getStaticItems(), ...sectionItems(), ...(crossIndexBuilt ? crossIndex : [])];
    if (!query) return all;
    const hay = (it) => [it.label||'', it.sub||'', (it.keywords||[]).join(' '), it.href||''].join(' ').toLowerCase();
    return all.filter(it => tokens.every(t => hay(it).includes(t)));
  };

  document.addEventListener('input', (e) => {
    const input = e.target.closest('#shellpal-input');
    if (!input) return;
    const list = document.getElementById('shellpal-list');
    const data = filterItems(input.value);
    selIndex = 0;
    render(data, list);
    updateSelection(list);
  });

  document.addEventListener('keydown', (e) => {
    if (!open) return;
    const input = document.getElementById('shellpal-input');
    const list  = document.getElementById('shellpal-list');
    const data  = filterItems(input.value);
    // Simple terminal-esque commands
    const cmd = (input.value || '').trim();
    const go = (href) => { closePalette(); location.href = href; };
    if (e.key === 'Enter') {
      if (/^cd\s*\.\.$/i.test(cmd)) { e.preventDefault(); closePalette(); history.length ? history.back() : go('index.html'); return; }
      const m = cmd.match(/^cd\s+([\w\-\/]+)$/i);
      if (m) {
        e.preventDefault();
        const dest = m[1].toLowerCase();
        if (dest === '/' || dest === 'home' || dest === 'index') return go('index.html');
        const map = { blog: 'blog.html', playground: 'playground.html', timeline: 'timeline.html', contact: 'contact.html' };
        if (map[dest]) return go(map[dest]);
      }
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); selIndex = Math.min(selIndex+1, data.length-1); updateSelection(list); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); selIndex = Math.max(selIndex-1, 0); updateSelection(list); }
    if (e.key === 'Enter')     { e.preventDefault(); selectIndex(selIndex); }
  });
})();

/* ---------- Playground: filterable project grid ---------- */
(() => {
  const grid = document.querySelector('.pg-grid');
  if (!grid) return;
  // Remove any static filler so we don't flash placeholder content
  grid.innerHTML = '';
  const chips = Array.from(document.querySelectorAll('.pg-filter .chip.filter'));

  let current = 'all';
  let projects = [];

  const render = (data) => {
    grid.innerHTML = data.map(p => `
      <article class="pg-card" data-tags="${(p.tags||[]).join(',').toLowerCase()}">
        ${p.images && p.images.length ? `
          <div class="pg-thumb"><img src="${p.images[0]}" alt="${p.title}" loading="lazy"/></div>` : `
          <div class="pg-thumb"><i class="fa-solid ${p.icon || 'fa-code'}" style="opacity:.8"></i></div>`}
        <div class="pg-body">
          <h3 style="margin:0 0 6px">${p.title}</h3>
          <p class="muted" style="margin:0 0 8px">${p.summary || ''}</p>
          <div class="blog-tags">${(p.tags||[]).map(t => `<a href="#" class="chip mono" data-tag="${t}">#${t}</a>`).join('')}</div>
          <div class="blog-actions" style="margin-top:10px">
            ${p.bodyHtml ? `<a class="btn" href="javascript:void(0)" data-modal-title="${p.title}" data-modal-html="${encodeURIComponent(`<div class='blog-content'>${p.bodyHtml}</div>`)}"><i class="fa-solid fa-book-open"></i> Details</a>` : ''}
            ${(p.links||[]).map(l => `<a class="btn" href="${l.href}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> ${l.label||'Open'}</a>`).join('')}
          </div>
        </div>
      </article>`).join('');

    // Hover glow per card
    Array.from(grid.querySelectorAll('.pg-card')).forEach(card => {
      card.addEventListener('mousemove', (ev) => {
        const r = card.getBoundingClientRect();
        const mx = ((ev.clientX - r.left) / r.width) * 100;
        const my = ((ev.clientY - r.top)  / r.height) * 100;
        card.style.setProperty('--mx', mx + '%');
        card.style.setProperty('--my', my + '%');
      });
    });
  };

  const apply = () => {
    const cards = Array.from(grid.querySelectorAll('.pg-card'));
    cards.forEach(el => {
      const tags = (el.getAttribute('data-tags') || '').toLowerCase().split(',').map(s=>s.trim());
      const show = current === 'all' || tags.includes(current);
      el.classList.toggle('hide', !show);
    });
  };

  const loadProjectsData = async () => {
    const hasFirebase = typeof window !== 'undefined' && window.firebase && window.firebaseConfig && window.firebaseConfig.apiKey;
    if (hasFirebase) {
      try {
        if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(window.firebaseConfig);
        const db = firebase.firestore();
        const snap = await db.collection('projects').get();
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (docs && docs.length) return { projects: docs };
      } catch (e) { /* fall through */ }
    }
    try {
      const r = await fetch('data/projects.json', { credentials: 'same-origin' });
      return r.ok ? r.json() : { projects: [] };
    } catch (_) { return { projects: [] }; }
  };

  document.addEventListener('click', (e) => {
    const chip = e.target.closest('.pg-filter .chip.filter');
    if (!chip) return;
    e.preventDefault();
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    current = (chip.getAttribute('data-filter') || 'all').toLowerCase();
    apply();
  });

  document.addEventListener('click', (e) => {
    const tag = e.target.closest('.pg-card .blog-tags .chip');
    if (!tag) return;
    e.preventDefault();
    const t = (tag.getAttribute('data-tag') || '').toLowerCase();
    chips.forEach(c => c.classList.remove('active'));
    const all = document.querySelector('.pg-filter [data-filter="all"]');
    all?.classList.add('active');
    current = 'all';
    const cards = Array.from(grid.querySelectorAll('.pg-card'));
    cards.forEach(el => {
      const tags = (el.getAttribute('data-tags') || '').split(',').map(s=>s.trim());
      el.classList.toggle('hide', !tags.includes(t));
    });
  });

  loadProjectsData().then(json => {
    projects = json.projects || [];
    render(projects);
    apply();
  });
})();

/* ---------- Blog: render posts + filters + modal ---------- */
(() => {
  const grid = document.getElementById('blog-grid');
  if (!grid) return;

  const filters = Array.from(document.querySelectorAll('.blog-filter .chip.filter'));
  let posts = [];
  let current = 'all';
  let tagMetaById = null;

  // Try to load from Firestore first (if Firebase is configured), else fallback to JSON file
  const loadPostsData = async () => {
    const hasFirebase = typeof window !== 'undefined' && window.firebase && window.firebaseConfig && window.firebaseConfig.apiKey;
    if (hasFirebase) {
      try {
        if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(window.firebaseConfig);
        const db = firebase.firestore();
        const [ps, ts] = await Promise.all([
          db.collection('posts').get(),
          db.collection('tags').get().catch(()=>null)
        ]);
        const docs = ps.docs.map(d => ({ id: d.id, ...d.data() }));
        const tags = ts ? ts.docs.map(d => ({ id: d.id, ...d.data() })) : [];
        if (docs && docs.length) return { posts: docs, tags };
      } catch (e) {
        // swallow and fallback
      }
    }
    try {
      const r = await fetch('data/blog.json', { credentials: 'same-origin' });
      return r.ok ? r.json() : { posts: [] };
    } catch (_) { return { posts: [] }; }
  };

  const render = (data) => {
    grid.innerHTML = data.map(p => `
      <article class="blog-card" data-cat="${p.categoryKey}" data-tags="${(p.tags||[]).join(',').toLowerCase()}" id="post-${p.id}">
        ${p.images && p.images.length ? `
          <div class="blog-media">
            ${p.images.slice(0,2).map(src => `<img src="${src}" alt="${p.title}" loading="lazy"/>`).join('')}
          </div>` : ''}
        <div class="blog-body">
          <div class="blog-head">
            <h3 class="blog-title">${p.title}</h3>
            <div class="blog-meta">
              <span class="chip mono"><i class="fa-solid ${p.icon}"></i> ${p.category}</span>
              ${p.date ? `<span class="chip mono"><i class="fa-solid fa-calendar"></i> ${p.date}</span>` : ''}
            </div>
          </div>
          <p class="muted">${p.summary || ''}</p>
          <div class="blog-tags">${(p.tags||[]).map(t => {
            const meta = tagMetaById && tagMetaById[t];
            const label = meta?.name || t;
            const icon = meta?.icon ? `<i class=\"fa-solid ${meta.icon}\"></i> ` : '';
            return `<a href=\"#\" class=\"chip mono\" data-tag=\"${t}\">${icon}#${label}</a>`;
          }).join('')}</div>
          <div class="blog-actions">
            <a class="btn" href="javascript:void(0)" data-modal-title="${p.title}"
               data-modal-html="${encodeURIComponent(`
                 ${(p.images||[]).length ? `<div class='blog-gallery'>${p.images.map(src => `<img src='${src}' alt='${p.title}'/>`).join('')}</div>` : ''}
                 <div class='blog-content'>${p.bodyHtml || ''}</div>
                 ${(p.links||[]).length ? `<div style='margin-top:10px;'>${p.links.map(l => `<a class='btn' href='${l.href || '#'}' target='_blank' rel='noopener'><i class='fa-solid fa-link'></i> ${l.label}</a>`).join('')}</div>` : ''}
               `)}">
              <i class="fa-solid fa-book-open"></i> Read post
            </a>
          </div>
        </div>
      </article>`).join('');
  };

  // Intercept modal open for blog/pg with data-modal-html (encoded)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('.blog-card .btn[data-modal-html], .pg-card .btn[data-modal-html]');
    if (!a) return;
    // decode and set attribute for generic modal block
    const html = decodeURIComponent(a.getAttribute('data-modal-html'));
    a.setAttribute('data-modal-html', html);
  }, { capture: true });

  const apply = () => {
    const cards = Array.from(grid.querySelectorAll('.blog-card'));
    cards.forEach(el => {
      const cat = (el.getAttribute('data-cat') || '').toLowerCase();
      const tags = (el.getAttribute('data-tags') || '').split(',').map(s=>s.trim());
      const q = current;
      const show = q === 'all' || cat === q;
      el.classList.toggle('hide', !show);
    });
  };

  document.addEventListener('click', (e) => {
    const chip = e.target.closest('.blog-filter .chip.filter');
    if (!chip) return;
    e.preventDefault();
    filters.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    current = (chip.getAttribute('data-filter') || 'all').toLowerCase();
    apply();
  });

  document.addEventListener('click', (e) => {
    const tag = e.target.closest('.blog-tags .chip');
    if (!tag) return;
    e.preventDefault();
    const t = (tag.getAttribute('data-tag') || '').toLowerCase();
    // Select All then soft-filter by tag
    filters.forEach(c => c.classList.remove('active'));
    const all = document.querySelector('.blog-filter [data-filter="all"]');
    all?.classList.add('active');
    current = 'all';
    const cards = Array.from(grid.querySelectorAll('.blog-card'));
    cards.forEach(el => {
      const tags = (el.getAttribute('data-tags') || '').split(',').map(s=>s.trim());
      el.classList.toggle('hide', !tags.includes(t));
    });
  });

  // Fetch posts data (Firestore preferred)
  loadPostsData().then(json => {
    const tagMeta = (json.tags || []);
    tagMetaById = Object.fromEntries(tagMeta.map(t => [t.id, t]));
    posts = (json.posts || []).map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      categoryKey: p.categoryKey || (p.category || '').toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9_-]/g,''),
      icon: p.icon || 'fa-note-sticky',
      date: p.date,
      summary: p.summary,
      bodyHtml: p.bodyHtml,
      images: p.images || [],
      tags: p.tags || [],
      links: p.links || []
    }));
    render(posts);
    apply();
  }).catch(() => { /* ignore */ });
})();
