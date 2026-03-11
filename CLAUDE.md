# Project Instructions

## Stack
- Node.js / Express backend, vanilla JS + Tailwind CSS (CDN) frontend — no bundler, no framework
- PostgreSQL via `pg` pool (no ORM); sessions stored with `connect-pg-simple`
- Auth: bcrypt passwords, express-session, CSRF double-submit cookie
- `recipes.js` is the canonical recipe source — not the DB `app_data` table

## Commands
- `npm test` — run Jest tests
- `npm start` — start server (`node server.js`)
- `npm run migrate` — run DB migrations (`node migrate.js`)

## Third-Party Services
- **Render** — production hosting (diymealkit.com); auto-deploys from GitHub on push to main; config in `render.yaml`
- **Claude** — LLM API for AI features; env var `CLAUDE_API_KEY`
- **Resend** — transactional email (welcome, password reset); env vars `RESEND_API_KEY`, `RESEND_FROM`
- **Puppeteer** — recipe scraping (`scraper.js`)
- **Cloudflare** - DNS

## Key Files
- Server: `server.js` | Auth middleware: `middleware/auth.js` | Migration: `migrate.js`
- Client auth: `public/js/auth.js` | Main page: `public/index.html`

## Building
- When building features that involve user accounts, sharing, or user-generated content, proactively flag trust & safety considerations, like email verification, abuse vectors, rate limiting, privacy implications. Don't wait to be asked.

## Testing
- Always write tests for new code to validate it is working correctly and hasn't broken existing features. Test on web, ios, and android platforms. Test guest and logged in experiences. Test key workflows of selecting receipes, generating shopping list, sharing shopping list, adding new recipes.
- Use Jest for testing.
- Run tests after writing them to confirm they pass.