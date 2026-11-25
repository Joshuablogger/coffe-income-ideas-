import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dataDir = join(dirname(fileURLToPath(import.meta.url)), "..", "data");

// Writes the data both as JSON (for other tools) and as a JS file, so the
// website also works when index.html is opened directly from disk.
export function writeOutput(data) {
  mkdirSync(dataDir, { recursive: true });
  const json = JSON.stringify(data, null, 1);
  writeFileSync(join(dataDir, "offers.json"), json + "\n");
  writeFileSync(join(dataDir, "offers.js"), `window.OFFERS_DATA = ${json};\n`);
  console.log(`Wrote ${data.products.length} products for ${data.stores.length} stores to ${dataDir}`);
}
