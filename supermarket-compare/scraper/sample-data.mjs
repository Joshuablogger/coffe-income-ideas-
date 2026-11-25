// Generates realistic-looking SAMPLE data so the website can be developed and
// demoed before real store adapters are connected. Prices are NOT real.
// Usage: node scraper/sample-data.mjs   (writes data/offers.js)

import { writeOutput } from "./write-output.mjs";

const stores = [
  { id: "rimi", name: "Rimi", color: "#d7171f", factor: 1.04 },
  { id: "selver", name: "Selver", color: "#e30613", factor: 1.03 },
  { id: "prisma", name: "Prisma", color: "#00843d", factor: 0.98 },
  { id: "maxima", name: "Maxima", color: "#ed1c24", factor: 0.97 },
  { id: "coop", name: "Coop", color: "#0058a3", factor: 1.06 },
  { id: "lidl", name: "Lidl", color: "#0050aa", factor: 0.92 },
];

// [id, English name, Estonian name, category, unit, base price €]
const catalog = [
  ["milk-25", "Milk 2.5%", "Piim 2,5%", "Dairy", "1 L", 1.15],
  ["kefir", "Kefir", "Keefir", "Dairy", "1 L", 1.29],
  ["butter", "Butter 82%", "Või 82%", "Dairy", "200 g", 2.89],
  ["eggs", "Eggs M", "Munad M", "Dairy", "10 pcs", 2.79],
  ["cottage", "Cottage cheese", "Kodujuust", "Dairy", "380 g", 2.19],
  ["cheese-edam", "Edam cheese", "Eesti juust", "Dairy", "500 g", 5.49],
  ["kohuke", "Curd snack", "Kohuke", "Dairy", "38 g", 0.49],
  ["rye-bread", "Rye bread", "Rukkileib", "Bakery", "500 g", 1.89],
  ["white-bread", "White toast bread", "Röstsai", "Bakery", "500 g", 1.39],
  ["croissant", "Croissant", "Croissant", "Bakery", "1 pc", 0.69],
  ["chicken-fillet", "Chicken breast fillet", "Kanafilee", "Meat & fish", "1 kg", 9.49],
  ["minced-pork", "Minced pork & beef", "Sea-veisehakkliha", "Meat & fish", "500 g", 3.99],
  ["sausages", "Wiener sausages", "Viinerid", "Meat & fish", "400 g", 3.29],
  ["salmon", "Salmon fillet", "Lõhefilee", "Meat & fish", "1 kg", 21.9],
  ["sprats", "Baltic sprats in oil", "Kilud õlis", "Meat & fish", "240 g", 1.79],
  ["bananas", "Bananas", "Banaanid", "Fruit & veg", "1 kg", 1.49],
  ["apples", "Apples", "Õunad", "Fruit & veg", "1 kg", 1.99],
  ["tomatoes", "Tomatoes", "Tomatid", "Fruit & veg", "1 kg", 3.49],
  ["cucumbers", "Cucumbers", "Kurgid", "Fruit & veg", "1 kg", 2.99],
  ["potatoes", "Potatoes", "Kartulid", "Fruit & veg", "2 kg", 1.69],
  ["onions", "Onions", "Sibulad", "Fruit & veg", "1 kg", 0.99],
  ["pasta", "Spaghetti", "Spagetid", "Pantry", "500 g", 1.19],
  ["rice", "Long grain rice", "Pikateraline riis", "Pantry", "1 kg", 2.29],
  ["buckwheat", "Buckwheat", "Tatar", "Pantry", "800 g", 2.49],
  ["sunflower-oil", "Sunflower oil", "Päevalilleõli", "Pantry", "1 L", 2.69],
  ["coffee", "Ground coffee", "Jahvatatud kohv", "Pantry", "500 g", 7.99],
  ["sugar", "Sugar", "Suhkur", "Pantry", "1 kg", 1.29],
  ["chocolate", "Milk chocolate", "Piimašokolaad", "Snacks & drinks", "100 g", 1.69],
  ["chips", "Potato chips", "Kartulikrõpsud", "Snacks & drinks", "150 g", 2.19],
  ["water", "Mineral water", "Mineraalvesi", "Snacks & drinks", "1.5 L", 0.89],
  ["juice", "Orange juice", "Apelsinimahl", "Snacks & drinks", "1 L", 1.99],
  ["kali", "Kali (kvass)", "Kali", "Snacks & drinks", "1.5 L", 1.59],
  ["toilet-paper", "Toilet paper", "Tualettpaber", "Household", "8 rolls", 3.99],
  ["detergent", "Laundry detergent", "Pesupulber", "Household", "2 kg", 8.99],
  ["dish-soap", "Dish soap", "Nõudepesuvahend", "Household", "500 ml", 1.89],
];

// Small seeded RNG so the sample data is stable between runs.
let seed = 20261125;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const round = (n) => Math.round(n * 100) / 100;

const today = new Date();
const plusDays = (d) => new Date(today.getTime() + d * 864e5).toISOString().slice(0, 10);

const products = catalog.map(([id, name, nameEt, category, unit, base]) => {
  const prices = {};
  for (const s of stores) {
    if (s.id === "lidl" && rand() < 0.2) continue; // Lidl carries a smaller range
    const regular = round(base * s.factor * (0.94 + rand() * 0.12));
    const entry = { price: regular };
    if (rand() < 0.22) {
      const discount = 0.12 + rand() * 0.3;
      entry.price = round(regular * (1 - discount));
      entry.regular = regular;
      entry.until = plusDays(1 + Math.floor(rand() * 7));
      if (rand() < 0.3) entry.loyalty = true; // loyalty-card-only price
    }
    prices[s.id] = entry;
  }
  return { id, name, nameEt, category, unit, prices };
});

writeOutput({
  sample: true,
  updated: new Date().toISOString(),
  stores: stores.map(({ id, name, color }) => ({ id, name, color })),
  products,
});
