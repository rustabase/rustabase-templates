// Tiny RustaBase client shared by every template (no dependencies).
const base = (window.RUSTABASE_URL || new URLSearchParams(location.search).get("backend") || "").replace(/\/+$/, "");
const KEY = "rb_session";
const session = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } };

async function call(path, init = {}) {
  if (!base) throw new Error("This site isn't connected to a backend yet.");
  const s = session();
  const res = await fetch(base + path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(s?.token ? { Authorization: s.token } : {}), ...(init.headers || {}) },
  });
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.message || `Request failed (${res.status})`);
  return body;
}

export const rb = {
  base,
  list: (col, q = {}) => call(`/api/collections/${col}/records?` + new URLSearchParams({ perPage: "100", ...q })),
  get: (col, id, q = {}) => call(`/api/collections/${col}/records/${encodeURIComponent(id)}?` + new URLSearchParams(q)),
  create: (col, data) => call(`/api/collections/${col}/records`, { method: "POST", body: JSON.stringify(data) }),
  file: (rec, name) => (name ? `${base}/api/files/${rec.collectionId}/${rec.id}/${name}` : ""),
  user: () => session()?.record || null,
  async signIn(email, password) {
    const r = await call("/api/collections/users/auth-with-password", { method: "POST", body: JSON.stringify({ identity: email, password }) });
    localStorage.setItem(KEY, JSON.stringify({ token: r.token, record: r.record }));
    return r.record;
  },
  async signUp(email, password) {
    await call("/api/collections/users/records", { method: "POST", body: JSON.stringify({ email, password, passwordConfirm: password }) });
    return rb.signIn(email, password);
  },
  signOut: () => localStorage.removeItem(KEY),
};

export const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
export const $ = (s) => document.querySelector(s);
export function authBox(el, onChange) {
  const draw = () => {
    const u = rb.user();
    el.innerHTML = u
      ? `<span class="muted">${esc(u.email)}</span> <button class="ghost" data-out>Sign out</button>`
      : `<form data-in class="row"><input name="e" type="email" placeholder="Email" required><input name="p" type="password" placeholder="Password (8+)" minlength="8" required><button>Sign in</button><button type="button" class="ghost" data-up>Create account</button></form>`;
    el.querySelector("[data-out]")?.addEventListener("click", () => { rb.signOut(); draw(); onChange?.(); });
    const f = el.querySelector("form");
    const go = async (fn) => { try { await fn(f.e.value, f.p.value); draw(); onChange?.(); } catch (e) { alert(e.message); } };
    f?.addEventListener("submit", (e) => { e.preventDefault(); go(rb.signIn); });
    el.querySelector("[data-up]")?.addEventListener("click", () => f.reportValidity() && go(rb.signUp));
  };
  draw();
}
