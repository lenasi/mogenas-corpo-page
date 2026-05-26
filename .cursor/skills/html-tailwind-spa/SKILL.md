---
name: html-tailwind-spa
description: >-
  Builds single-page HTML websites with Tailwind CSS CDN and vanilla JS.
  Use when creating or editing index.html, corporate/landing pages, static
  sites, Tailwind utility layouts, or when the user mentions HTML + Tailwind
  without frameworks or build tools. Hosted on Railway as a static site.
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

## Hosting (Railway)

This site deploys to [Railway](https://railway.com). The page itself stays dependency-free; Railway needs a small static file server that listens on `$PORT`.

- Frontend: `index.html` only — no build step
- Deploy: root-level `package.json` with `serve` start script (deployment wrapper, not part of the page stack)
- Railway auto-detects Node via Nixpacks and runs `npm start`
- Bind to `0.0.0.0:$PORT` — Railway sets `PORT` at runtime
- Custom domain: **https://www.mogenas.com** — configure in Railway → Settings → Networking (CNAME `www` → Railway target)
- Do not add build scripts, bundlers, or frameworks for deployment

## Workflow

1. Read existing `index.html` if present; preserve structure and content unless asked to change them.
2. Plan mobile layout first, then add `sm:`, `md:`, `lg:` breakpoints.
3. Use semantic landmarks: `header`, `nav`, `main`, `section`, `footer`.
4. Add vanilla JS only for behavior Tailwind/CSS cannot handle (mobile nav toggle, smooth scroll targets).
5. Write the complete file to disk — do not reply with partial diffs.

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
- Spacing: generous padding on sections (`py-16` / `py-24`), consistent container (`max-w-6xl mx-auto px-4`)
- Interactions: `transition`, `hover:`, `focus-visible:` for links and buttons
- Custom CSS: only for `@keyframes` or cases Tailwind cannot express; prefer `tailwind.config` inline via CDN script if needed

## Delivery checklist

- [ ] Full self-contained `index.html`
- [ ] Tailwind CDN included
- [ ] Mobile-first responsive classes
- [ ] Semantic HTML structure
- [ ] No frameworks, build tools, or npm dependencies in the page itself
- [ ] Canonical URL and `og:url` point to `https://www.mogenas.com/`
- [ ] `package.json` start script serves static files on Railway `$PORT`
