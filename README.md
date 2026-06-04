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

## Store / commerce

This is a **research-peptide storefront** ("for laboratory research use only — not
for human consumption"). The cart is client-side; **checkout needs a payment
backend** before it can take real money.

- **`shop.html`** — product grid with search, category filter and sort (`assets/js/shop.js`).
- **`product.html?sku=…`** — dynamic product detail page driven by the SKU in the
  query string (`assets/js/product.js`); injects `Product` JSON-LD.
- **`cart.html` + `assets/js/cart.js`** — `localStorage` cart, nav badge, quantity
  controls, free-shipping logic, add-to-cart toast. Checkout is a **demo** until a
  provider is connected.
- **`assets/data/products.json`** — the catalog. Each product:

```json
{
  "sku": "BPC157-5", "name": "BPC-157", "alias": "Body Protection Compound 157",
  "category": "Recovery", "size": "5 mg / vial", "purity": "≥ 99%",
  "price": 39.99, "tag": "Bestseller", "stock": true,
  "summary": "Short, neutral, research-context description…"
}
```

### Going live — replace these placeholders

- **Catalog:** real products, prices, purity, SKUs and stock in `products.json`.
- **Policies:** `contact.html`, `shipping.html`, `returns.html`, `terms.html`,
  `privacy.html` contain `[bracketed]` placeholders — fill in your business
  details and have them professionally reviewed.
- **Checkout:** connect Stripe / Snipcart / Shopify (or another provider) to the
  "Proceed to checkout" button in `cart.js`.
- **Contact form:** set the `action` in `contact.html` to a form service or backend.

## Project structure

```
.
├── index.html            # Home (storefront)
├── shop.html             # Product grid
├── product.html          # Product detail (?sku=)
├── cart.html             # Cart + demo checkout
├── learn.html            # Beginner guide
├── library.html          # Searchable peptide library
├── calculator.html       # Reconstitution calculator
├── faq.html              # FAQ (+ FAQ schema)
├── about.html            # About + full disclaimer
├── contact.html, shipping.html, returns.html, terms.html, privacy.html
├── 404.html
├── sitemap.xml, robots.txt, site.webmanifest, CNAME
└── assets/
    ├── css/styles.css    # Design system
    ├── js/site.js        # Shared nav + footer year
    ├── js/cart.js        # Cart (localStorage) + badges
    ├── js/shop.js        # Shop search/filter/sort
    ├── js/product.js     # Product detail page
    ├── js/featured.js    # Homepage featured products
    ├── js/library.js     # Library search/filter
    ├── js/calculator.js  # Calculator logic
    ├── data/products.json, data/peptides.json
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
