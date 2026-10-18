# Memory / decisions log

## 2026-10-18 - Blog + AdSense readiness
- Created `/docs`. Added blog and AdSense pages on branch `blog-adsense` (PR to `main`, not merged; Nitesh must approve).
- **Demo post:** `/blog/buying-affordable-home-sector-89-gurgaon-checklist/` is a DEMO post written by Grok Bot for MAAI Property Care Team, dated 18 Oct 2026. No prices or statistics; readers are told to check current figures. Nitesh should review before launch.
- Cover image `images/blog/sector-89-affordable-home-checklist.jpg` is an original illustration drawn programmatically (city towers + checklist) in the brand palette; stored as base64 in `assets-b64/`.
- Blog pages are hand-authored static HTML (crawlable); shared look lives in `src/pages.css`, behaviour in `src/pages.ts`.
- Cookie banner (`src/consent.ts`) is also loaded on `/` and `/property.html`.
- AdSense: no publisher ID yet. `public/ads.txt` has a commented placeholder line; AdSense script is a commented block in the `<head>` of blog pages, and an in-article unit is commented inside the demo post.
- CSP updated on all pages for AdSense domains; existing inline-script hashes unchanged and still valid.
- robots.txt: added explicit Allow for Mediapartners-Google and AdsBot-Google.
