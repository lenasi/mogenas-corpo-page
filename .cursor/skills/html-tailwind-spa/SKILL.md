---
name: html-tailwind-spa
description: >-
  Builds single-page HTML websites with Tailwind CSS CDN and vanilla JS.
  Use when creating or editing index.html, corporate/landing pages, static
  sites, Tailwind utility layouts, or when the user mentions HTML + Tailwind
  without frameworks or build tools. Hosted on SiteGround; agents auto-deploy
  to production after site file changes via npm run deploy.
---

# HTML + Tailwind Single-Page Frontend

You are an expert frontend developer specializing in single-page HTML + Tailwind CSS websites.

## Stack

- Single index.html file
- Tailwind CSS via CDN (`<script src="https://cdn.tailwindcss.com"></script>`)
- Vanilla JS only when necessary
- No frameworks, no build tools, no dependencies

## Rules

- Always write complete, self-contained HTML files
- Use Tailwind utility classes exclusively — no custom CSS unless absolutely necessary
- Mobile-first, responsive by default
- Clean, modern design — avoid generic/bland layouts
- Smooth interactions with CSS transitions, not JS libraries
- When updating, always return the full file — never partial snippets
- Prefer semantic HTML (section, nav, article, etc.)

## Hosting (SiteGround)

Production is **static files on SiteGround** at **https://www.mogenas.com** — Apache serves the site; no Railway, no Node on the server.

- **Document root:** domain `public_html` (e.g. `~/www/mogenas.com/public_html` or `~/public_html` — confirm in Site Tools → Site → File Manager or SSH).
- **SSH setup:** `npm run setup-ssh` writes `Host mogenas-siteground` to `~/.ssh/config` and creates `~/.ssh/siteground_mogenas`. Add the printed public key in SiteGround → Devs → SSH Keys Manager (key-only auth; password login is not used).
- **Deploy:** `npm run deploy` runs `scripts/deploy.sh` (`rsync` via `mogenas-siteground`). Credentials in `.env` (copy from `.env.deploy.example`); never commit `.env`.
- **SSH host:** `ssh.mogenas.com`, port `18765` (see Site Tools → Devs → SSH Terminal).
- **Local dev only:** `npm start` runs `serve` for preview — not used in production.
- **HTTPS / www:** optional root `.htaccess` redirects apex and HTTP to `https://www.mogenas.com`.
- Do not add build scripts, bundlers, or server-side runtimes for deployment.

## Workflow

1. Read existing `index.html` if present; preserve structure and content unless asked to change them.
2. Plan mobile layout first, then add `sm:`, `md:`, `lg:` breakpoints.
3. Use semantic landmarks: `header`, `nav`, `main`, `section`, `footer`.
4. Add vanilla JS only for behavior Tailwind/CSS cannot handle (mobile nav toggle, smooth scroll targets).
5. Write the complete file to disk — do not reply with partial diffs.
6. **Always deploy** after site changes: `npm run deploy` (same turn, no need to wait for user). Skip only for non-site files (`.env`, scripts, docs) or if user says not to deploy.

## HTML skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="canonical" href="https://www.mogenas.com/" />
  <meta property="og:url" content="https://www.mogenas.com/" />
  <title>Mogenas</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="antialiased">
  <header><!-- ... --></header>
  <main><!-- ... --></main>
  <footer><!-- ... --></footer>
  <script><!-- minimal JS if needed --></script>
</body>
</html>
```

## Design defaults

- Typography: vary weight and size for hierarchy; avoid default gray-on-white without accent color
- Spacing: generous padding on sections (`py-16` / `py-24`); site container cap is `--max-w: 1400px` in `assets/styles.css` (`.container`)
- Interactions: `transition`, `hover:`, `focus-visible:` for links and buttons
- Custom CSS: only for `@keyframes` or cases Tailwind cannot express; prefer `tailwind.config` inline via CDN script if needed

## Delivery checklist

- [ ] Full self-contained `index.html`
- [ ] Tailwind CDN included
- [ ] Mobile-first responsive classes
- [ ] Semantic HTML structure
- [ ] No frameworks, build tools, or npm dependencies in the page itself
- [ ] Canonical URL and `og:url` point to `https://www.mogenas.com/` (or the page URL)
- [ ] `robots.txt` and `sitemap.xml` at site root
- [ ] Ran `npm run deploy` and confirmed live at https://www.mogenas.com/
