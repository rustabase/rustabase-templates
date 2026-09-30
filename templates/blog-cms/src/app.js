import { rb, esc, $ } from "./rb.js";
const show = (m) => ($("#msg").innerHTML = m ? `<div class="notice">${esc(m)}</div>` : "");
async function list() {
  const cat = $("#cat").value;
  const { items } = await rb.list("posts", { sort: "-created", expand: "author,category", ...(cat ? { filter: `category="${cat}"` } : {}) });
  $("#post").hidden = true; $("#list").hidden = false;
  $("#list").innerHTML = items.map((p) => `<a class="card" href="#${esc(p.slug || p.id)}" style="text-decoration:none;color:inherit">
    ${p.cover ? `<img class="cover" src="${rb.file(p, p.cover)}" alt="">` : ""}
    <p class="muted">${esc(p.expand?.category?.name || "")}</p><h2>${esc(p.title)}</h2>
    <p class="muted">By ${esc(p.expand?.author?.name || "Staff")}</p></a>`).join("") || "<p>No posts yet.</p>";
  return items;
}
async function route() {
  const slug = decodeURIComponent(location.hash.slice(1));
  if (!slug) return list();
  const { items } = await rb.list("posts", { filter: `slug="${slug.replace(/"/g, "")}"`, expand: "author" });
  const p = items[0]; if (!p) return list();
  $("#list").hidden = true; $("#post").hidden = false;
  // Post content is written by the site owner in the backend's editor.
  $("#post").innerHTML = `<a href="#">← All posts</a><h1>${esc(p.title)}</h1><p class="muted">By ${esc(p.expand?.author?.name || "Staff")}</p>${p.content || ""}`;
}
try {
  const { items } = await rb.list("categories", { sort: "name" });
  $("#cat").innerHTML += items.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
  $("#cat").onchange = () => { location.hash = ""; list(); };
  addEventListener("hashchange", () => route().catch((e) => show(e.message)));
  await route();
} catch (e) { show(e.message); }
