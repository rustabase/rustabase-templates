import { rb, esc, $ } from "./rb.js";
const show = (m, ok) => ($("#msg").innerHTML = m ? `<div class="notice"${ok ? ' style="background:#ecfdf5;border-color:#a7f3d0"' : ""}>${esc(m)}</div>` : "");
let slot = null;
async function pickService(id) {
  const { items } = await rb.list("slots", { filter: `service="${id}" && available=true && starts_at>="${new Date().toISOString().replace("T", " ")}"`, sort: "starts_at" });
  $("#step2").hidden = false; $("#step3").hidden = true;
  $("#slots").innerHTML = items.map((s) => `<button class="ghost" data-slot="${esc(s.id)}">${esc(new Date(s.starts_at.replace(" ", "T")).toLocaleString())}</button>`).join("") || `<p class="muted">No open times for this service yet.</p>`;
  document.querySelectorAll("[data-slot]").forEach((b) => (b.onclick = () => {
    document.querySelectorAll("[data-slot]").forEach((x) => x.classList.add("ghost")); b.classList.remove("ghost");
    slot = b.dataset.slot; $("#step3").hidden = false;
  }));
}
$("#step3").onsubmit = async (e) => {
  e.preventDefault(); const f = e.target;
  try {
    const c = await rb.create("customers", { name: f.name.value, email: f.email.value, phone: f.phone.value });
    await rb.create("bookings", { slot, customer: c.id, status: "pending" });
    f.reset(); f.hidden = true; $("#step2").hidden = true; show("Booking requested — we'll confirm by email.", true);
  } catch (err) { show(err.message); }
};
try {
  const { items } = await rb.list("services", { sort: "price" });
  $("#services").innerHTML = items.map((s) => `<div class="card"><h3>${esc(s.name)}</h3><p class="muted">${esc(s.description)}</p>
    <div class="row" style="justify-content:space-between"><span>${s.duration_minutes} min · ${s.price ? "$" + s.price : "Free"}</span><button data-svc="${esc(s.id)}">Choose</button></div></div>`).join("");
  document.querySelectorAll("[data-svc]").forEach((b) => (b.onclick = () => pickService(b.dataset.svc).catch((e) => show(e.message))));
} catch (e) { show(e.message); }
