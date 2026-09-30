export type RecordRow = Record<string, unknown> & { id: string; collectionId?: string; expand?: Record<string, unknown> };
type ListResult<T> = { items: T[]; page?: number; totalItems?: number };
type Session = { token: string; record: RecordRow };

const backendUrl = (import.meta.env.VITE_RUSTABASE_URL || "").trim().replace(/\/+$/, "");
const sessionKey = "rustabase_marketplace_session";

function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(sessionKey);
    return value ? (JSON.parse(value) as Session) : null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!backendUrl) throw new Error("This application is not connected to a RustaBase backend.");
  const session = readSession();
  const response = await fetch(backendUrl + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(session?.token ? { Authorization: session.token } : {}),
      ...init.headers,
    },
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === "object" && "message" in body ? String(body.message) : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return body as T;
}

export const rustabase = {
  backendUrl,
  session: readSession,
  list: <T extends RecordRow>(collection: string, query: Record<string, string> = {}) =>
    request<ListResult<T>>(`/api/collections/${collection}/records?${new URLSearchParams({ perPage: "100", ...query })}`),
  create: <T extends RecordRow>(collection: string, data: Record<string, unknown>) =>
    request<T>(`/api/collections/${collection}/records`, { method: "POST", body: JSON.stringify(data) }),
  file: (record: RecordRow, name: unknown) =>
    typeof name === "string" && name ? `${backendUrl}/api/files/${record.collectionId}/${record.id}/${name}` : "",
  async signIn(email: string, password: string) {
    const result = await request<{ token: string; record: RecordRow }>("/api/collections/users/auth-with-password", {
      method: "POST",
      body: JSON.stringify({ identity: email, password }),
    });
    window.localStorage.setItem(sessionKey, JSON.stringify(result));
    return result.record;
  },
  async signUp(email: string, password: string) {
    await request("/api/collections/users/records", {
      method: "POST",
      body: JSON.stringify({ email, password, passwordConfirm: password }),
    });
    return this.signIn(email, password);
  },
  signOut() {
    if (typeof window !== "undefined") window.localStorage.removeItem(sessionKey);
  },
};

export function text(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

export function expanded(record: RecordRow, key: string): RecordRow | undefined {
  const value = record.expand?.[key];
  return value && typeof value === "object" && !Array.isArray(value) ? (value as RecordRow) : undefined;
}
