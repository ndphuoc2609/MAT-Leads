import { FormEvent, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { setToken } from "@/lib/auth";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const baseUrl = (import.meta.env["VITE_API_BASE_URL"] || "http://localhost:8000").replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      if (!response.ok) throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
      const body = (await response.json()) as { access_token: string };
      setToken(body.access_token); await navigate({ to: "/" });
    } catch (err) { setError(err instanceof Error ? err.message : "Đăng nhập thất bại"); }
    finally { setLoading(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-background px-4"><form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-2xl border bg-card p-8 shadow-sm"><div><p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">MATGROUP</p><h1 className="mt-2 text-2xl font-bold">Đăng nhập</h1></div><label className="block text-sm">Tên đăng nhập<input className="mt-2 w-full rounded-lg border px-3 py-2" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" /></label><label className="block text-sm">Mật khẩu<input type="password" className="mt-2 w-full rounded-lg border px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>{error ? <p className="text-sm text-destructive">{error}</p> : null}<button disabled={loading} className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60">{loading ? "Đang đăng nhập..." : "Đăng nhập"}</button></form></main>;
}
