---
title: Rebuilding this site from scratch
year: '2026'
kind: Personal
summary: Why I got rid of my old site, what the hash demo on the homepage is actually doing, and how the whole thing runs with no server, no database, and a very strict security policy
cover: pasted-image-1791953789557.webp
cover_alt: Homepage of new website
featured: true
order: 98
draft: false
---

The old version of this site did its job, but it had started to bother me. It was a Next.js app with its own admin API and a contact form - there was a server running somewhere that I was responsible for keeping secure. As a cybersecurity student, I think it's quite backwards and ironic for the most exposed thing I own to be my own portfolio.

So, I rebuilt it! The goals were pretty simple:

### Static

No server, no database, no login form on the public site. Nothing to break into.

### Readable by bots

Recruiters run résumés and portfolios through ATS tools, so every page had to work as plain HTML, with JS disabled. My old site had a lot of modal content loaded in with JS, so that was a no-go.

### Still fun for people

Static doesn't have to mean boring!

### Basically free

The only thing I'm paying for here is the domain :)

![New homepage in light theme](20261014-160121.webp "The new homepage in the light theme, with the hash demo at the top. At the top of the article, you'll see the same page in dark theme.")

## Finding a design

I didn't want it to look like every other developer portfolio (dark background, gradient blob, "Hi, I'm Ben 👋"). I went through a LOT of different directions before settling on one: terminal-style ones, editorial ones, ones that looked like an RFC document, and a few that were honestly just too much.

![](20261014-160913.webp)

![](20261014-160930.webp)

![](20261014-160952.webp)

The one I picked is built around a single idea from cryptography: the [avalanche effect](https://en.wikipedia.org/wiki/Avalanche_effect).

### The hash demo

The thing at the top of the homepage is a live SHA-256 hash of whatever's in the input box. Change one character, and \~50% of the 256 output bits flip. That's the avalanche effect and it's a big part of why hashes are useful: tiny changes in the input give completely unrelated outputs, so you can't work backwards from a hash or nudge an input towards a target.

![Hash demo](20261014-162510.webp "The hash demo after changing one letter, with the flipped bits highlighted in the grid")

The demo cycles through a few variations based on my name on its own, and as soon as the user types in the box it switches to their input instead. The bit grid highlights every bit that flipped compared to the previous input, with a running count. It usually lands somewhere around 50%, which is exactly what you'd expect from a good hash.

The SHA-256 is a small implementation written straight into the site's JavaScript, because the browser's built-in crypto API is async and I wanted the demo to update on every keystroke without lag. I checked its output against Node's `crypto` module to make sure it was actually correct and not just plausible-looking hex.

### The timeline

![Timeline](20261014-162959.webp "The timeline onthe homepage, with coloured bars and dots for UTS, Code4Fun, Elcom, and the exchanges")

The timeline might be my favourite part of the new site. Each entry is a coloured line from its start date to its end date, with a dot at each end. One-off things like the Penang and Poznań programs are a single dot. Hover over one for a quick summary, click it for the full page.

#### A few small details I'm happy with:

##### Rows are worked out automatically

When two entries overlap in time, the later one moves down a row, so I never have to manually arrange anything.

##### Ongoing entries grow by themselves

UTS and Code4Fun stretch up to a "now" marker that updates when the page loads, so the timeline would stay current even if I hypothetically went months without touching the site.

##### Dark mode lifts the colours

The same hex colour that looks good on a light background looks muddy and muted on a dark one, so in dark mode every entry gets automatically mixed with a bit of white.

![Hovering over the Beijing entry, showing its tooltip](20261014-163339.webp "Hovering over the Beijing entry, showing its tooltip")

### Ciphertext and Plaintext

The light and dark themes are called Plaintext and Ciphertext (dark is ciphertext, of course). Switching between them runs a pixel dissolve across the screen, and when the new theme appears, all the text on screen comes back as scrambled hex and decrypts itself left to right.
