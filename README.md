# Peptides Easy

A fast, modern, **static educational website** about peptides — built with plain
HTML, CSS and vanilla JavaScript (no build step, no framework, no dependencies).

> ⚠️ **Educational/informational use only.** This project does not sell anything
> and provides no medical advice. Many peptides referenced are research chemicals
> not approved for human use. See `about.html#disclaimer`.

## Features

- **Homepage** with hero, feature cards and clear calls to action.
- **Beginner guide** (`learn.html`) — what peptides are, terminology, how to read research.
- **Searchable peptide library** (`library.html`) — live search + category filters, data-driven from `assets/data/peptides.json`.
- **Reconstitution / dosage calculator** (`calculator.html`) — converts vial mg, water mL and dose mcg into insulin-syringe units, with a live syringe visual.
- **FAQ** (`faq.html`) with `FAQPage` structured data.
- **About & disclaimer** (`about.html`).
- Custom **404** page.

## Built for SEO & performance

- Per-page `<title>`, meta description, canonical URL, Open Graph / Twitter tags.
- JSON-LD structured data (`Organization`, `WebSite`, `Article`, `FAQPage`, `WebApplication`, `BreadcrumbList`).
- `sitemap.xml`, `robots.txt`, `site.webmanifest`.
- System-font stack, deferred scripts, preloaded CSS, responsive + dark-mode, reduced-motion and accessibility (skip links, ARIA, focus styles).

## Project structure

```
.
├── index.html            # Home
├── learn.html            # Beginner guide
├── library.html          # Searchable peptide library
├── calculator.html       # Reconstitution calculator
├── faq.html              # FAQ (+ FAQ schema)
├── about.html            # About + full disclaimer
├── 404.html
├── sitemap.xml, robots.txt, site.webmanifest, CNAME
└── assets/
    ├── css/styles.css    # Design system
    ├── js/site.js        # Shared nav + footer year
    ├── js/library.js     # Library search/filter
    ├── js/calculator.js  # Calculator logic
    ├── data/peptides.json
    └── img/logo.svg
```

## Run locally

It's a static site — open `index.html` directly, or serve the folder so
`fetch()` (used by the library) works:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

Works on any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, S3).
A `CNAME` file is included for GitHub Pages on the custom domain
`peptides-easy.com` — remove it if you deploy elsewhere.

## Editing the peptide library

Add or edit entries in `assets/data/peptides.json`. Each object:

```json
{
  "name": "BPC-157",
  "alias": "Body Protection Compound 157",
  "category": "Recovery",
  "summary": "Short, neutral, plain-English description…",
  "halflife": "~4 hours (estimated)",
  "research": "Soft-tissue & gut repair models"
}
```

New categories appear as filter chips automatically.
