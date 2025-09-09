Admin (Secure Blog Manager)

Goal
- Provide a highly secure way to log in and add/edit/delete blog posts via a UI (no editing HTML).
- Use modern, phishing-resistant authentication (WebAuthn/passkeys), server-verified sessions, CSRF protection, and strict origin checks.

What’s included here
- admin.html + admin.js: A read-only UI scaffold that lists posts from data/blog.json, and supports import/export for local preview.
- blog.html renders posts from data/blog.json. In production, replace this with server API calls.

Security architecture (recommended)
1) Authentication: WebAuthn (Passkeys)
   - Register: Client requests /api/auth/register-begin → server returns challenge; browser.create() with resident keys; send to /api/auth/register-finish; server stores public key + credential id bound to your account.
   - Login: /api/auth/login-begin → challenge; browser.get() → /api/auth/login-finish; server verifies signature and issues a secure session cookie.

2) Sessions & CSRF
   - Session cookie: HttpOnly, Secure, SameSite=Strict, short TTL with sliding refresh.
   - CSRF: Double-submit token in cookie + header (X-CSRF-Token). Reject missing/invalid.
   - Origin/Referer: Enforce exact origin. Enable CORS only for your site. Reject others.

3) RBAC & Audit
   - Admin role only for your account. Optional: second factor (TOTP) on sensitive actions.
   - Log all changes with actor, IP, user-agent, and diff of content.

4) Content API (server)
   - /api/blog/list (GET): returns posts.
   - /api/blog/create (POST): creates draft; body: {title, bodyHtml, images[], tags[], category, date}.
   - /api/blog/update (POST): updates by id; body: {id, patch}.
   - /api/blog/delete (POST): deletes by id; body: {id}.
   All require a valid session + CSRF token. Rate-limit and validate input. Store content as JSON or in a DB.

5) Deployment options
   - Cloudflare Workers / Vercel Functions / Netlify Functions with WebAuthn libs (e.g., @simplewebauthn/server).
   - Put admin.html behind an allowlist (e.g., Cloudflare Access) for an extra layer.

Hooking up the UI
- Replace data/blog.json fetches with calls to your API:
  - blog.html/main.js → fetch('/api/blog/list') to render posts.
  - admin.js → fetch('/api/blog/list') and implement POSTs for create/update/delete.
- In admin.js, enable the Register/Login buttons to call:
  - POST /api/auth/register-begin, /api/auth/register-finish
  - POST /api/auth/login-begin, /api/auth/login-finish
  Include {credentials:'include'} and X-CSRF-Token from a cookie or meta tag.

Hardening checklist
- Strict-Transport-Security (1y, includeSubDomains)
- Content-Security-Policy: default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline' (if needed); connect-src 'self'
- X-Frame-Options: DENY; Referrer-Policy: no-referrer; Permissions-Policy: minimal
- Build admin at /admin with Access control or IP allowlist during testing
- Rotate session keys regularly; add rate limiting and IP throttling

Local testing
- Open admin.html to preview read-only listing from data/blog.json.
- Use Export/Import JSON to iterate on content offline; when API is ready, run a one-time migration to your DB.

Notes
- Without a server, any client-only “auth” can be bypassed. Do not enable write operations until the server is deployed and verified. The included admin is intentionally disabled for writes by default.
