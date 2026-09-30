import { rb, esc, $, authBox } from "./rb.js";
const cart = new Map();
const show = (m, ok) => ($("#msg").innerHTML = m ? `<div class="notice"${ok ? ' style="background:#ecfdf5;border-color:#a7f3d0"' : ""}>${esc(m)}</div>` : "");
let products = [];
function drawCart() {
  const lines = [...cart].map(([id, n]) => ({ p: products.find((x) => x.id === id), n }));
  const total = lines.reduce((s, l) => s + l.p.price * l.n, 0);
  $("#cart").innerHTML = lines.length
    ? lines.map((l) => `<p class="row" style="justify-content:space-between">${esc(l.p.name)} × ${l.n}<span>$${(l.p.price * l.n).toFixed(2)}</span></p>`).join("") +
      `<p><b>Total $${total.toFixed(2)}</b></p>${rb.user() ? `<button id="pay">Place order</button>` : `<p class="muted">Sign in above to check out.</p>`}`
    : `<p class="muted">Your cart is empty.</p>`;
  $("#pay")?.addEventListener("click", async () => {
    try {
      const u = rb.user();
      const found = await rb.list("customers", { filter: `email="${u.email}"` });
      const customer = found.items[0] || (await rb.create("customers", { name: u.email.split("@")[0], email: u.email }));
      await rb.create("orders", { customer: customer.id, total, status: "open", note: lines.map((l) => `${l.p.name} × ${l.n}`).join(", ") });
      cart.clear(); drawCart(); show("Thanks! Your order was placed.", true);
    } catch (e) { show(e.message); }
  });
}
try {
  authBox($("#auth"), drawCart);
  ({ items: products } = await rb.list("products", { filter: "active=true", sort: "name", expand: "category" }));
  $("#products").innerHTML = products.map((p) => `<div class="card">${p.image ? `<img class="cover" src="${rb.file(p, p.image)}" alt="">` : ""}
    <p class="muted">${esc(p.expand?.category?.name || "")}</p><h3>${esc(p.name)}</h3>
    <div class="row" style="justify-content:space-between"><b>$${Number(p.price).toFixed(2)}</b><button data-add="${esc(p.id)}">Add</button></div></div>`).join("") || "<p>No products yet.</p>";
  document.querySelectorAll("[data-add]").forEach((b) => (b.onclick = () => { cart.set(b.dataset.add, (cart.get(b.dataset.add) || 0) + 1); drawCart(); }));
  drawCart();
} catch (e) { show(e.message); }
