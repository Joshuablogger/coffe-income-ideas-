// Collects real offers from every store adapter and merges them into one file.
// Usage: node scraper/run.mjs
//
// Each adapter in ./adapters exports:
//   export const store = { id, name, color };
//   export async function fetchProducts() -> [{ key, name, nameEt?, category, unit, price, regular?, until?, loyalty? }]
// `key` is a normalised product identity (e.g. EAN barcode) used to match the
// same product across stores. EAN is the most reliable key when a store exposes it.

import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { writeOutput } from "./write-output.mjs";

const dir = join(dirname(fileURLToPath(import.meta.url)), "adapters");
const files = readdirSync(dir).filter((f) => f.endsWith(".mjs") && !f.startsWith("_"));

const stores = [];
const byKey = new Map();

for (const file of files) {
  const adapter = await import(pathToFileURL(join(dir, file)));
  try {
    const items = await adapter.fetchProducts();
    stores.push(adapter.store);
    for (const it of items) {
      const p = byKey.get(it.key) ?? {
        id: it.key, name: it.name, nameEt: it.nameEt ?? it.name,
        category: it.category ?? "Other", unit: it.unit ?? "", prices: {},
      };
      p.prices[adapter.store.id] = {
        price: it.price,
        ...(it.regular > it.price && { regular: it.regular }),
        ...(it.until && { until: it.until }),
        ...(it.loyalty && { loyalty: true }),
      };
      byKey.set(it.key, p);
    }
    console.log(`${adapter.store.name}: ${items.length} products`);
  } catch (err) {
    console.error(`${file} failed: ${err.message}`);
  }
}

if (!stores.length) {
  console.error("No adapter succeeded; keeping the existing data file.");
  process.exit(1);
}

writeOutput({ sample: false, updated: new Date().toISOString(), stores, products: [...byKey.values()] });
