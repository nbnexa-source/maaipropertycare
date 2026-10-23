# Tasks

## Done (branch `blog-adsense`, 18 Oct 2026, awaiting Nitesh's approval)
- [x] `/docs` folder
- [x] Blog index `/blog/` + "Blog" link in main nav and footer
- [x] Demo post: Buying an affordable home in Sector 89, Gurgaon: a simple checklist (DEMO POST)
- [x] Privacy Policy, Terms & Conditions, Disclaimer, About Us, Contact Us (linked in footer)
- [x] Cookie consent banner (localStorage)
- [x] `ads.txt` placeholder + commented AdSense script slot in blog layout
- [x] Sitemap, robots.txt, llms.txt, CSP updated for AdSense

## Needs Nitesh
- [ ] Review and approve the PR, then merge to `main` to deploy
- [ ] Review the demo post; edit or replace before going live if wanted
- [ ] Sign up for Google AdSense; once approved, put the publisher ID in `public/ads.txt` and uncomment the AdSense script in blog pages
- [ ] Verify the site in Google Search Console and submit `sitemap.xml`
- [ ] If analytics is added later, add its domains to the CSP and keep the Privacy Policy accurate

## Next ideas
- [ ] More posts (renting, resale, property care for NRIs) - each needs original content and images

## In progress — Listing pages (Website Designer, 23 Oct 2026)
- [ ] `/sale/` — Homes for sale in Gurgaon (4 project cards, no invented prices/RERA on cards)
- [ ] `/rent/` — Homes for rent in Gurgaon (same 4; soft “Ask about rentals” where needed)
- [ ] `/plots/` — Stub intro + contact/WhatsApp CTA (no fake listings)
- [ ] Wire nav on home (For Sale / For Rent), Plots space card → `/plots/`, vite inputs, sitemap
- Fact sources: `verified-project-cards.md`, Proxima / AVL 36 / Golf Greens-79 sheets. Basic fields only.
