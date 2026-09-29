"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-client";

export default function Login() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const supabase = supabaseBrowser();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      setLoading(false);
      if (error) return setMsg(error.message);
      return setMsg("Account created! Check your email to confirm, then log in.");
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setMsg(error.message);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="text-3xl font-extrabold">
        {mode === "login" ? "Log in" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-zinc-400">
        {mode === "login" ? "Welcome back to ThoughtOut." : "Book faster and track your registrations."}
      </p>

      <div className="mt-6 flex rounded-lg border border-white/10 bg-white/5 p-1 text-sm">
        <button type="button" onClick={() => { setMode("login"); setMsg(""); }} className={`flex-1 rounded-md py-2 font-semibold ${mode === "login" ? "bg-yellow-400 text-black" : "text-zinc-400"}`}>Log in</button>
        <button type="button" onClick={() => { setMode("signup"); setMsg(""); }} className={`flex-1 rounded-md py-2 font-semibold ${mode === "signup" ? "bg-yellow-400 text-black" : "text-zinc-400"}`}>Sign up</button>
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-4">
        {mode === "signup" && (
          <input required placeholder="Full name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input required type="email" placeholder="Email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input required type="password" minLength={6} placeholder="Password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={loading} className="rounded-lg bg-red-600 py-3 font-bold hover:bg-red-500">
          {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
        </button>
        {msg && <p className="text-sm text-yellow-300">{msg}</p>}
      </form>
      <style>{`.input{background:#0b0b10;border:1px solid #ffffff22;border-radius:.5rem;padding:.65rem .8rem;width:100%;color:#f5f5f7}`}</style>
    </section>
  );
}
