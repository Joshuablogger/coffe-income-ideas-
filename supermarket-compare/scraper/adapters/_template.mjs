// Copy this file to e.g. rimi.mjs (files starting with "_" are skipped) and
// fill in fetchProducts() for that store's website.
//
// Tips:
// - Open the store's e-shop "campaigns/offers" page in your browser, open
//   DevTools > Network, and look for the JSON request that loads products.
//   Calling that JSON directly is far more robust than parsing HTML.
// - Check the store's terms of use / robots.txt, keep the request rate low,
//   and run the scraper at most a few times per day.

export const store = { id: "example", name: "Example Store", color: "#444444" };

export async function fetchProducts() {
  const res = await fetch("https://example.com/api/offers", {
    headers: { "User-Agent": "Mozilla/5.0 (price comparison)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();

  return json.items.map((item) => ({
    key: item.ean ?? item.name.toLowerCase(), // EAN barcode matches best across stores
    name: item.name,
    category: item.category,
    unit: item.size,
    price: item.price, // current price (with discount)
    regular: item.oldPrice, // regular price, if discounted
    until: item.validTo, // "YYYY-MM-DD"
    loyalty: item.requiresCard, // true if only with loyalty card
  }));
}
