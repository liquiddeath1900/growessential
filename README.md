# GrowEssential

Soil-first regenerative agriculture consulting. Static marketing site for growessential.com.

## Stack
- Static HTML, Tailwind CSS (via CDN), vanilla JS
- Hosted on Vercel
- Domain: growessential.com (Porkbun → Vercel)

## Pages
- `/` — home
- `/about` — story + positioning
- `/services` — pricing tiers + add-ons + investor CTA
- `/land-audit` — lead-magnet form (free audit request)
- `/contact` — email + audit form CTA

## Local dev
Just open the HTML files in a browser, or:
```
cd ~/Documents/GrowEssential
python3 -m http.server 8000
# visit http://localhost:8000
```

## Deploy
Vercel auto-deploys from `main` branch. `vercel.json` handles clean URLs + security headers + asset caching.

## TODO (v1 polish)
- [ ] Wire `/land-audit` form to a real backend (n8n webhook → Brevo contact + email notification)
- [ ] Replace placeholder favicons with custom GrowEssential branding
- [ ] Add Open Graph image (assets/og.jpg)
- [ ] Add Google Analytics or Plausible
- [ ] Submit sitemap to GSC after launch
- [ ] Add `robots.txt` allowing crawl + sitemap URL

## v2 (later)
Land-audit tool — geo-based plant + invasive recommendation engine. Likely fork [treescape](https://github.com/treescape-io/treescape) instead of building from scratch. See `research/04-data-sources.md` in the site-builder scaffold.
