(() => {
  const data = window.OFFERS_DATA;
  const stores = Object.fromEntries(data.stores.map((s) => [s.id, s]));
  const $ = (id) => document.getElementById(id);
  const eur = (n) => n.toFixed(2).replace(".", ",") + " €";
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  const state = {
    tab: "offers",
    q: "",
    category: "",
    sort: "discount",
    stores: new Set(data.stores.map((s) => s.id)),
    basket: store.get("basket", {}), // productId -> qty
  };

  // ---------- helpers ----------
  const cheapest = (p, only) => {
    let best = null;
    for (const [sid, e] of Object.entries(p.prices)) {
      if (only && !only.has(sid)) continue;
      if (!best || e.price < best.price) best = { sid, ...e };
    }
    return best;
  };
  const matches = (p) =>
    (!state.category || p.category === state.category) &&
    (!state.q || (p.name + " " + p.nameEt).toLowerCase().includes(state.q));

  const fmtUntil = (d) => (d ? "until " + new Date(d + "T00:00").toLocaleDateString("et-EE", { day: "numeric", month: "numeric" }) : "");

  // ---------- offers ----------
  function renderOffers() {
    const offers = [];
    for (const p of data.products) {
      if (!matches(p)) continue;
      for (const [sid, e] of Object.entries(p.prices)) {
        if (!e.regular || !state.stores.has(sid)) continue;
        offers.push({ p, sid, e, pct: Math.round((1 - e.price / e.regular) * 100) });
      }
    }
    const sorters = {
      discount: (a, b) => b.pct - a.pct,
      price: (a, b) => a.e.price - b.e.price,
      name: (a, b) => a.p.name.localeCompare(b.p.name),
    };
    offers.sort(sorters[state.sort]);

    $("offers").innerHTML = offers.length
      ? offers.map(({ p, sid, e, pct }) => {
          const s = stores[sid];
          const best = cheapest(p);
          const others = Object.entries(p.prices).filter(([id]) => id !== sid);
          let verdict;
          if (!others.length) verdict = `<div class="verdict">Only sold at ${esc(s.name)}</div>`;
          else if (best.sid === sid || best.price === e.price) {
            const next = Math.min(...others.map(([, o]) => o.price));
            verdict = `<div class="verdict">✓ Cheapest everywhere · next best ${eur(next)}</div>`;
          } else {
            verdict = `<div class="verdict worse">Cheaper at ${esc(stores[best.sid].name)}: ${eur(best.price)}</div>`;
          }
          return `<article class="card">
            <div class="card-head"><span class="store" style="background:${s.color}">${esc(s.name)}</span><span class="pct">−${pct}%</span></div>
            <h3>${esc(p.name)}</h3>
            <div class="sub">${esc(p.nameEt)} · ${esc(p.unit)}</div>
            <div class="price">${eur(e.price)}<span class="old">${eur(e.regular)}</span>${e.loyalty ? '<span class="tag">Card</span>' : ""}</div>
            ${verdict}
            <div class="card-foot"><span class="sub">${fmtUntil(e.until)}</span>${addBtn(p.id)}</div>
          </article>`;
        }).join("")
      : `<p class="empty">No offers match your filters.</p>`;
  }

  const addBtn = (id) =>
    state.basket[id]
      ? `<button class="add in" data-add="${id}">✓ In basket</button>`
      : `<button class="add" data-add="${id}">+ Basket</button>`;

  // ---------- compare ----------
  function renderCompare() {
    const cols = data.stores.filter((s) => state.stores.has(s.id));
    const rows = data.products.filter(matches).sort((a, b) => a.name.localeCompare(b.name));
    const head = `<thead><tr><th>Product</th>${cols.map((s) => `<th>${esc(s.name)}</th>`).join("")}<th></th></tr></thead>`;
    const body = rows.map((p) => {
      const best = cheapest(p, state.stores);
      const cells = cols.map((s) => {
        const e = p.prices[s.id];
        if (!e) return `<td class="na">–</td>`;
        const isBest = best && e.price === best.price;
        const deal = e.regular ? ` <span class="deal" title="Offer, regular ${eur(e.regular)}">%</span>` : "";
        return `<td class="${isBest ? "best" : ""}">${eur(e.price)}${deal}</td>`;
      }).join("");
      return `<tr><td>${esc(p.name)}<div class="sub">${esc(p.nameEt)} · ${esc(p.unit)}</div></td>${cells}<td>${addBtn(p.id)}</td></tr>`;
    }).join("");
    $("compare").innerHTML = rows.length ? head + `<tbody>${body}</tbody>` : `<tr><td class="empty">No products match.</td></tr>`;
  }

  // ---------- basket ----------
  function renderBasket() {
    const items = Object.entries(state.basket)
      .map(([id, qty]) => ({ p: data.products.find((x) => x.id === id), qty }))
      .filter((x) => x.p);
    if (!items.length) {
      $("basket").innerHTML = `<p class="empty">Your basket is empty. Add products from the offers or compare tabs to see which store is cheapest for your whole shop.</p>`;
      return;
    }
    const list = items.map(({ p, qty }) => {
      const best = cheapest(p, state.stores);
      return `<div class="basket-row">
        <div><b>${esc(p.name)}</b> <span class="sub">${esc(p.unit)}</span>
          <div class="sub">${best ? `Cheapest: ${esc(stores[best.sid].name)} ${eur(best.price)}` : "Not in selected stores"}</div></div>
        <div class="qty"><button data-qty="${p.id}" data-d="-1" aria-label="Fewer">−</button>${qty}<button data-qty="${p.id}" data-d="1" aria-label="More">+</button></div>
      </div>`;
    }).join("");

    const totals = data.stores.filter((s) => state.stores.has(s.id)).map((s) => {
      let sum = 0, missing = 0;
      for (const { p, qty } of items) p.prices[s.id] ? (sum += p.prices[s.id].price * qty) : missing++;
      return { s, sum, missing };
    }).sort((a, b) => a.missing - b.missing || a.sum - b.sum);

    let split = 0;
    for (const { p, qty } of items) { const b = cheapest(p, state.stores); if (b) split += b.price * qty; }
    const bestStore = totals.find((t) => !t.missing);

    $("basket").innerHTML = `<div class="basket-list">${list}</div>
      <h3>Total per store</h3>
      <div class="totals">
        ${totals.map((t) => `<div class="total ${t === bestStore ? "best" : ""}">
          <span class="sub">${esc(t.s.name)}${t === bestStore ? " · cheapest" : ""}</span>
          <b>${eur(t.sum)}</b>
          <span class="sub">${t.missing ? `${t.missing} item(s) not sold here` : "All items available"}</span>
        </div>`).join("")}
        <div class="total"><span class="sub">Cheapest of each, mixed stores</span><b>${eur(split)}</b>
          <span class="sub">${bestStore ? `Saves ${eur(bestStore.sum - split)} vs one store` : ""}</span></div>
      </div>`;
  }

  // ---------- wiring ----------
  function render() {
    for (const b of document.querySelectorAll(".tabs button")) b.setAttribute("aria-selected", b.dataset.tab === state.tab);
    for (const t of ["offers", "compare", "basket"]) $("tab-" + t).hidden = state.tab !== t;
    $("sort").hidden = state.tab !== "offers";
    $("basket-count").textContent = Object.keys(state.basket).length;
    ({ offers: renderOffers, compare: renderCompare, basket: renderBasket })[state.tab]();
  }

  $("updated").textContent = "Updated " + new Date(data.updated).toLocaleString("et-EE", { dateStyle: "medium", timeStyle: "short" }) + ` · ${data.stores.length} stores · ${data.products.length} products`;
  $("sample-banner").hidden = !data.sample;

  for (const c of [...new Set(data.products.map((p) => p.category))].sort())
    $("category").insertAdjacentHTML("beforeend", `<option>${esc(c)}</option>`);

  $("store-chips").innerHTML = data.stores.map((s) =>
    `<button class="chip" aria-pressed="true" data-store="${s.id}"><span class="dot" style="background:${s.color}"></span>${esc(s.name)}</button>`).join("");

  document.addEventListener("click", (ev) => {
    const t = ev.target.closest("button");
    if (!t) return;
    if (t.dataset.tab) state.tab = t.dataset.tab;
    else if (t.dataset.store) {
      const id = t.dataset.store;
      state.stores.has(id) ? state.stores.delete(id) : state.stores.add(id);
      t.setAttribute("aria-pressed", state.stores.has(id));
    } else if (t.dataset.add) {
      const id = t.dataset.add;
      state.basket[id] ? delete state.basket[id] : (state.basket[id] = 1);
      store.set("basket", state.basket);
    } else if (t.dataset.qty) {
      const id = t.dataset.qty, q = (state.basket[id] || 0) + Number(t.dataset.d);
      q > 0 ? (state.basket[id] = q) : delete state.basket[id];
      store.set("basket", state.basket);
    } else return;
    render();
  });
  $("search").addEventListener("input", (e) => { state.q = e.target.value.trim().toLowerCase(); render(); });
  $("category").addEventListener("change", (e) => { state.category = e.target.value; render(); });
  $("sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });

  render();
})();
