# Architecture

Vite 6 + TypeScript multi-page static site, deployed to GitHub Pages from `main` (`.github/workflows/deploy.yml`). CI (`ci.yml`) runs `npm ci`, `npm run lint`, `npm run build` on pushes and PRs.

## Pages (Vite inputs in `vite.config.ts`)
| URL | File | Script/CSS |
| --- | --- | --- |
| `/` | `index.html` | `src/boot.ts` → `src/main.ts` (Three.js + GSAP), `src/style.css`, `src/consent.ts` |
| `/property.html` | `property.html` | `src/property.ts`, `src/property.css`, `src/consent.ts` |
| `/blog/` | `blog/index.html` | `src/pages.ts`, `src/pages.css` |
| `/blog/buying-affordable-home-sector-89-gurgaon-checklist/` | `blog/<slug>/index.html` | same |
| `/about/`, `/contact/`, `/privacy-policy/`, `/terms-and-conditions/`, `/disclaimer/` | `<slug>/index.html` | same |

- `src/pages.ts`: light page script (sticky header state, IntersectionObserver reveal, TOC highlight). Imports `src/consent.ts`.
- `src/consent.ts` + `src/consent.css`: cookie banner, key `maai-cookie-consent` in localStorage.
- No Three.js on blog/info pages.

## Binary assets
Binary files are committed as base64 text in `assets-b64/<path>.b64`. `npm run build` runs `prebuild` → `scripts/decode-assets.mjs`, which writes them to `public/<path>`. Example: blog cover `assets-b64/images/blog/sector-89-affordable-home-checklist.jpg.b64` → `/images/blog/sector-89-affordable-home-checklist.jpg`.

## Static files in `public/`
`robots.txt`, `sitemap.xml`, `llms.txt`, `ads.txt` (placeholder).

## Security
Each HTML page has a CSP meta. Inline scripts are allowed only by hash:
- `sha256-MhtPZXr7+LpJUY5qtMutB+qWfQtMaPccfe7QXtCcEYc=` = font `onload="this.media='all'"` (with `'unsafe-hashes'`)
- `sha256-vBu1G6yZWwH2aOqmBBV3fDVZZMvsX7fOk6pc5NOIHkg=` = loader timeout script on the home page
AdSense domains allowed: pagead2.googlesyndication.com, googleads.g.doubleclick.net, tpc.googlesyndication.com, adservice.google.com, www.google.com.
