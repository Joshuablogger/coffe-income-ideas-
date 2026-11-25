# Soodne – Estonian supermarket offers

A website that shows the current offers at Estonian supermarkets (Rimi, Selver,
Prisma, Maxima, Coop, Lidl) and compares each offer with the other stores' prices.

**Right now it uses sample data. The prices are not real.** See "Connecting real data" below.

## Features
- **Today's offers**: every discounted product, with the % off, the old price,
  how long the offer lasts, and a "loyalty card only" tag. Each card says whether
  the offer really is the cheapest price, or which other store sells it for less.
- **Compare prices**: a table of every product × store with the cheapest
  price highlighted and offers marked `%`.
- **Basket**: add products to see your whole shop's total at each store, and
  the total if you buy each item wherever it's cheapest.
- Search (English or Estonian names), category filter, store toggles, sorting,
  mobile layout and dark mode.

## Run it
No build step. Open `index.html` in a browser, or host the folder on any
static host (GitHub Pages, Netlify, …).

## Data
All data lives in `data/offers.js` (plus the same content in `data/offers.json`):

```json
{ "sample": false, "updated": "…", "stores": [{ "id": "rimi", "name": "Rimi", "color": "#d7171f" }],
  "products": [{ "id": "…", "name": "Milk 2.5%", "nameEt": "Piim 2,5%", "category": "Dairy", "unit": "1 L",
                 "prices": { "rimi": { "price": 0.99, "regular": 1.19, "until": "2026-11-30", "loyalty": true } } }] }
```

- `node scraper/sample-data.mjs` regenerates the sample data.
- `node scraper/run.mjs` runs every store adapter in `scraper/adapters/` and
  writes the merged real data.

## Connecting real data
1. Copy `scraper/adapters/_template.mjs` to e.g. `rimi.mjs`.
2. Find the JSON request each e-shop uses for its campaign/offer pages
   (browser DevTools → Network) and map it to the adapter format.
3. Match products across stores by **EAN barcode** where possible. Name
   matching between stores is unreliable.
4. Run the scraper on a schedule (e.g. a daily GitHub Actions job that commits
   the new `data/` files), and the site updates itself.

Respect each store's terms of use and keep request rates low.
