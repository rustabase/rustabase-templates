import { rb, esc, $, authBox } from "./rb.js";
const show = (m) => ($("#msg").innerHTML = m ? `<div class="notice">${esc(m)}</div>` : "");
async function draw() {
  show("");
  const u = rb.user();
  $("#in").hidden = !u;
  const { items: plans } = await rb.list("plans", { sort: "price_monthly" });
  $("#plans").innerHTML = plans.map((p) => `<div class="card"><h3>${esc(p.name)}</h3><p><b>$${p.price_monthly}</b>/month</p><p class="muted">${esc(p.features)}</p></div>`).join("");
  if (!u) return;
  const { items } = await rb.list("teams", { sort: "-created" });
  $("#teams").innerHTML = items.map((t) => `<div class="card"><h3>${esc(t.name)}</h3><p class="muted">${esc(t.slug)}</p></div>`).join("") || `<p class="muted">No teams yet — create your first one.</p>`;
}
$("#newTeam").onsubmit = async (e) => {
  e.preventDefault(); const name = e.target.name.value.trim();
  try {
    await rb.create("teams", { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), owner: rb.user().id });
    e.target.reset(); await draw();
  } catch (err) { show(err.message); }
};
authBox($("#auth"), () => draw().catch((e) => show(e.message)));
draw().catch((e) => show(e.message));
