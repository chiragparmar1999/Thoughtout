"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase-client";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabaseBrowser().auth.signOut();
    setUser(null);
    router.replace("/");
    router.refresh();
  }

  const links = [
    ["Events", "/events"],
    ["Tickets", "/tickets"],
    ["Perform", "/perform"],
    ["Creator Store", "/creators"],
    ["Sponsors", "/sponsors"],
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0b10]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          Thought<span className="text-red-500">Out</span>
        </Link>

        <div className="hidden gap-6 text-sm text-zinc-300 md:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="hover:text-yellow-400">{label}</Link>
          ))}
          {user && <Link href="/dashboard" className="hover:text-yellow-400">Dashboard</Link>}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-zinc-400">{user.email}</span>
              <button onClick={logout} className="rounded-md border border-white/20 px-3 py-2 text-sm font-semibold hover:bg-white/10">Log out</button>
            </>
          ) : (
            <Link href="/login" className="rounded-md border border-white/20 px-3 py-2 text-sm font-semibold hover:bg-white/10">Log in</Link>
          )}
          <Link href="/tickets" className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-500">Book Now</Link>
        </div>

        <button onClick={() => setOpen(!open)} className="text-2xl md:hidden" aria-label="Menu">☰</button>
      </nav>

      {open && (
        <div className="border-t border-white/10 px-4 py-4 text-sm md:hidden">
          <div className="flex flex-col gap-3 text-zinc-300">
            {links.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
            ))}
            {user && <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>}
            {user ? (
              <button onClick={logout} className="text-left text-red-400">Log out ({user.email})</button>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)}>Log in</Link>
            )}
            <Link href="/tickets" onClick={() => setOpen(false)} className="mt-1 w-fit rounded-md bg-red-600 px-4 py-2 font-semibold">Book Now</Link>
          </div>
        </div>
      )}
    </header>
  );
}
