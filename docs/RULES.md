# Rules

1. Use only verified business facts (see PRD.md). Never invent stats, reviews, awards, prices or testimonials.
2. Do not deploy to `main` without Nitesh's approval. Work on a branch and open a PR.
3. `npm run lint` and `npm run build` must pass before merging.
4. Binary files go in `assets-b64/` as base64 (decoded at build). Do not commit large binaries directly.
5. If an inline script changes, recompute its sha256 and update the CSP on every page. Prefer external module scripts.
6. Blog/info pages stay light: no Three.js, only subtle CSS/IntersectionObserver animation, respect `prefers-reduced-motion`.
7. Every new page: canonical, OG/Twitter tags, JSON-LD, breadcrumbs, footer links, add to `vite.config.ts` inputs, `public/sitemap.xml` and `public/llms.txt`.
8. Images for posts must be original or generated, never copied.
9. Content is general information, not legal advice; link the Disclaimer from posts.
10. Keep pushes via the GitHub connector to about 4 files per commit.
