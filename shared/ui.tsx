import { useState, type FormEvent, type ReactNode } from "react";
import { LogOut, X } from "lucide-react";
import { rustabase, text, type RecordRow } from "./rustabase";

export function AppShell({ brand, eyebrow, children, auth, theme, onAuthChange }: { brand: string; eyebrow: string; children: ReactNode; auth?: boolean; theme: string; onAuthChange?: (user: RecordRow | null) => void }) {
  return (
    <div className={`app theme-${theme}`}>
      <header className="site-header">
        <a className="brand" href="/"><span className="brand-mark">R</span><span><small>{eyebrow}</small>{brand}</span></a>
        {auth ? <AuthControl onChange={onAuthChange} /> : <a className="quiet-link" href="https://rustabase.com">Built on RustaBase</a>}
      </header>
      <main>{children}</main>
      <footer><span>Powered by</span> <a href="https://rustabase.com">RustaBase</a></footer>
    </div>
  );
}

export function Button({ variant = "primary", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" }) {
  return <button {...props} className={`button button-${variant} ${className}`.trim()} />;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <article className={`card ${className}`.trim()}>{children}</article>;
}

export function Notice({ children, tone = "info", onClose }: { children: ReactNode; tone?: "info" | "success" | "danger"; onClose?: () => void }) {
  return <div className={`notice notice-${tone}`} role={tone === "danger" ? "alert" : "status"}><span>{children}</span>{onClose ? <Button variant="quiet" aria-label="Dismiss" onClick={onClose}><X size={16} /></Button> : null}</div>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

export function Empty({ title, detail }: { title: string; detail: string }) {
  return <div className="empty"><h3>{title}</h3><p>{detail}</p></div>;
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return <div className="loading" role="status"><span className="spinner" />{label}</div>;
}

export function ErrorState({ error, retry }: { error: unknown; retry?: () => void }) {
  return <Notice tone="danger"><strong>Something went wrong.</strong> {error instanceof Error ? error.message : "Please try again."}{retry ? <Button variant="secondary" onClick={retry}>Try again</Button> : null}</Notice>;
}

export function AuthControl({ onChange }: { onChange?: (user: RecordRow | null) => void }) {
  const [user, setUser] = useState<RecordRow | null>(() => rustabase.session()?.record ?? null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = text(data.get("email"));
    const password = text(data.get("password"));
    setBusy(true); setError("");
    try {
      const next = mode === "signin" ? await rustabase.signIn(email, password) : await rustabase.signUp(email, password);
      setUser(next); setOpen(false); onChange?.(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign in failed.");
    } finally { setBusy(false); }
  };

  if (user) return <div className="auth-user"><span>{text(user.email)}</span><Button variant="quiet" aria-label="Sign out" onClick={() => { rustabase.signOut(); setUser(null); onChange?.(null); }}><LogOut size={17} /></Button></div>;
  return <div className="auth-wrap"><Button variant="secondary" onClick={() => setOpen(!open)}>Sign in</Button>{open ? <form className="auth-popover" onSubmit={submit}><h2>{mode === "signin" ? "Welcome back" : "Create an account"}</h2><Field label="Email"><input name="email" type="email" autoComplete="email" required /></Field><Field label="Password"><input name="password" type="password" minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"} required /></Field>{error ? <Notice tone="danger">{error}</Notice> : null}<Button disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</Button><Button type="button" variant="quiet" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>{mode === "signin" ? "Need an account?" : "Already have an account?"}</Button></form> : null}</div>;
}
