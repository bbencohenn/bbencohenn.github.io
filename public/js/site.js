// bencohen.com.au: progressive enhancement.
// The site is fully readable without this file. It adds the theme toggle,
// the live SHA-256 demo, and keeps the timeline's "now" marker current.
(function () {
  'use strict';

  var root = document.documentElement;
  var reducedMotion = function () {
    return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  // ---------------------------------------------------------------- theme
  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function setupTheme() {
    var btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    var label = btn.querySelector('[data-theme-label]');
    var busy = false;

    function sync() {
      var dark = isDark();
      if (label) label.textContent = dark ? 'Plaintext' : 'Ciphertext';
      btn.setAttribute('aria-pressed', String(dark));
    }

    function apply(next) {
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem('theme', next);
      } catch (e) {
        /* fine: theme just won't persist */
      }
      sync();
    }

    btn.hidden = false;
    sync();

    btn.addEventListener('click', function () {
      if (busy) return;
      var next = isDark() ? 'light' : 'dark';
      if (reducedMotion()) {
        apply(next);
        return;
      }
      busy = true;
      var wipe = document.createElement('div');
      wipe.className = 'wipe to-' + next;
      wipe.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < 96; i++) {
        var cell = document.createElement('span');
        cell.style.animationDelay = ((((i * 37) % 96) / 96) * 0.48).toFixed(3) + 's';
        wipe.appendChild(cell);
      }
      document.body.appendChild(wipe);
      var pending = 2;
      var done = function () {
        if (--pending === 0) busy = false;
      };
      setTimeout(function () {
        apply(next);
        // Ciphertext -> plaintext: the text comes back as hex and resolves
        // while the cells clear.
        decrypt(btn, done);
      }, 600);
      setTimeout(function () {
        wipe.remove();
        done();
      }, 1040);
    });

    if (window.matchMedia) {
      var mq = matchMedia('(prefers-color-scheme: dark)');
      if (mq.addEventListener) mq.addEventListener('change', sync);
    }
  }

  // Scramble the visible text into hex, then resolve it left to right.
  // Letters and digits are swapped like for like (case and digits kept), so
  // lines barely change width while they resolve. Only text on screen is
  // touched, which keeps long posts cheap.
  function decrypt(skipEl, done) {
    var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, TITLE: 1 };
    var vh = window.innerHeight;
    var nodes = [];
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (!/[A-Za-z0-9]/.test(n.nodeValue) || SKIP[p.nodeName] || p.closest('[aria-hidden="true"]')) {
          return NodeFilter.FILTER_REJECT;
        }
        if (skipEl && skipEl.contains(p)) return NodeFilter.FILTER_REJECT;
        var r = p.getBoundingClientRect();
        return r.bottom > 0 && r.top < vh && r.width > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    var n;
    while ((n = walker.nextNode()) && nodes.length < 400) nodes.push({ n: n, s: n.nodeValue });
    if (!nodes.length) return done();

    var lo = '0123456789abcdef';
    var up = '0123456789ABCDEF';
    var steps = 16;
    var step = 0;
    var tick = setInterval(function () {
      step++;
      var at = step / steps;
      nodes.forEach(function (t) {
        var out = '';
        for (var i = 0; i < t.s.length; i++) {
          var ch = t.s[i];
          if (i / t.s.length < at - 0.15 || !/[A-Za-z0-9]/.test(ch)) out += ch;
          else if (ch >= '0' && ch <= '9') out += lo[Math.floor(Math.random() * 10)];
          else if (ch === ch.toUpperCase()) out += up[Math.floor(Math.random() * 16)];
          else out += lo[Math.floor(Math.random() * 16)];
        }
        t.n.nodeValue = out;
      });
      if (step >= steps) {
        clearInterval(tick);
        nodes.forEach(function (t) {
          t.n.nodeValue = t.s;
        });
        done();
      }
    }, 40);
  }

  // ---------------------------------------------------------------- sha-256
  // Small synchronous implementation so the demo can update on every keystroke.
  var K = null;
  var H0 = null;
  function primes() {
    var max = Math.pow(2, 32);
    var comp = {};
    var k = [];
    var h = [];
    for (var c = 2; k.length < 64; c++) {
      if (!comp[c]) {
        for (var i = 0; i < 313; i += c) comp[i] = c;
        h.push((Math.pow(c, 0.5) * max) | 0);
        k.push((Math.pow(c, 1 / 3) * max) | 0);
      }
    }
    K = k;
    H0 = h.slice(0, 8);
  }

  function sha256(str) {
    if (!K) primes();
    var utf8 = new TextEncoder().encode(str);
    var bytes = '';
    for (var u = 0; u < utf8.length; u++) bytes += String.fromCharCode(utf8[u]);
    var rr = function (v, a) {
      return (v >>> a) | (v << (32 - a));
    };
    var max = Math.pow(2, 32);
    var bitLen = bytes.length * 8;
    var words = [];
    bytes += '\x80';
    while ((bytes.length % 64) - 56) bytes += '\x00';
    for (var i = 0; i < bytes.length; i++) words[i >> 2] |= bytes.charCodeAt(i) << (((3 - i) % 4) * 8);
    words.push((bitLen / max) | 0);
    words.push(bitLen);
    var hash = H0.slice();
    for (var j = 0; j < words.length; ) {
      var w = words.slice(j, (j += 16));
      var old = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15];
        var w2 = w[i - 2];
        var a = hash[0];
        var e = hash[4];
        var t1 =
          hash[7] +
          (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) +
          ((e & hash[5]) ^ (~e & hash[6])) +
          K[i] +
          (w[i] =
            i < 16
              ? w[i]
              : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
        var t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(t1 + t2) | 0].concat(hash);
        hash[4] = (hash[4] + t1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + old[i]) | 0;
    }
    var out = '';
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        out += (b < 16 ? '0' : '') + b.toString(16);
      }
    }
    return out;
  }

  function toBits(hex) {
    var s = '';
    for (var i = 0; i < hex.length; i++) s += ('000' + parseInt(hex[i], 16).toString(2)).slice(-4);
    return s;
  }

  function setupHash() {
    var host = document.querySelector('[data-hash]');
    if (!host) return;
    var input = host.querySelector('[data-hash-input]');
    var hexEl = host.querySelector('[data-hash-hex]');
    var note = host.querySelector('[data-hash-note]');
    var bitsEl = document.querySelector('[data-hash-bits]');
    var countEl = document.querySelector('[data-hash-count]');
    var pctEl = document.querySelector('[data-hash-pct]');
    var prevEl = document.querySelector('[data-hash-prev]');
    var demos;
    try {
      demos = JSON.parse(host.getAttribute('data-demos') || '[]');
    } catch (e) {
      demos = [];
    }
    if (!input || !hexEl || demos.length < 2) return;

    var hexSpans = hexEl.querySelectorAll('span');
    var bitSpans = bitsEl ? bitsEl.querySelectorAll('span') : [];
    var current = input.value;
    var typed = false;
    var demoIndex = 0;
    var alt = false;

    function render(text, prev) {
      var h = sha256(text);
      var p = sha256(prev);
      var hb = toBits(h);
      var pb = toBits(p);
      alt = !alt;
      var flipped = 0;
      for (var i = 0; i < 64 && i < hexSpans.length; i++) {
        hexSpans[i].textContent = h[i];
        hexSpans[i].className = h[i] !== p[i] ? 'hx ch' : 'hx';
      }
      for (i = 0; i < 256 && i < bitSpans.length; i++) {
        var changed = hb[i] !== pb[i];
        if (changed) flipped++;
        bitSpans[i].className = 'bit' + (hb[i] === '1' ? ' on' : '') + (changed ? ' flip' + (alt ? ' alt' : '') : '');
      }
      if (countEl) countEl.textContent = String(flipped);
      if (pctEl) pctEl.textContent = ((flipped / 256) * 100).toFixed(1) + '% · expected ≈ 50%';
      if (prevEl) prevEl.textContent = prev;
    }

    input.addEventListener('input', function () {
      var prev = current;
      current = input.value.slice(0, 80);
      if (!typed) {
        typed = true;
        if (note) note.textContent = 'input · your text';
      }
      render(current, prev);
    });

    if (!reducedMotion()) {
      setInterval(function () {
        if (typed || document.hidden) return;
        var prev = demos[demoIndex];
        demoIndex = (demoIndex + 1) % demos.length;
        current = demos[demoIndex];
        input.value = current;
        render(current, prev);
      }, 2600);
    } else if (note) {
      note.textContent = 'input · type to try it';
    }
  }

  // ---------------------------------------------------------------- timeline
  // The layout is generated at build time; this keeps "now" and ongoing
  // entries current between rebuilds.
  function setupTimeline() {
    var canvases = document.querySelectorAll('[data-tl]');
    if (!canvases.length) return;
    var d = new Date();
    canvases.forEach(function (canvas) {
      var from = Number(canvas.getAttribute('data-from'));
      var span = Number(canvas.getAttribute('data-span'));
      if (!from || !span) return;
      var nowM = (d.getFullYear() - from) * 12 + d.getMonth() + (d.getDate() - 1) / 31;
      var pct = function (m) {
        return (Math.max(0, Math.min(span, m)) / span) * 100;
      };
      var now = canvas.querySelector('.tl-now');
      if (now) now.style.left = pct(nowM).toFixed(3) + '%';
      canvas.querySelectorAll('.tl-item[data-ongoing]').forEach(function (item) {
        var s = Number(item.getAttribute('data-s'));
        var width = Math.max(0, pct(nowM) - pct(s));
        item.style.width = width.toFixed(3) + '%';
        var p = item.getAttribute('data-p');
        var proj = item.querySelector('.tl-proj');
        if (p && proj && width > 0) {
          var pw = ((pct(Number(p)) - pct(nowM)) / width) * 100;
          proj.style.width = 'calc(' + Math.max(0, pw).toFixed(3) + '% - 10px)';
        }
      });
    });
  }

  function init() {
    setupTheme();
    setupHash();
    setupTimeline();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
