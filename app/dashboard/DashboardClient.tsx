"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase-client";

type Row = Record<string, any>;

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-green-500/20 text-green-400",
  pending: "bg-yellow-500/20 text-yellow-300",
  failed: "bg-red-500/20 text-red-400",
  refunded: "bg-zinc-500/20 text-zinc-300",
  enquiry: "bg-yellow-500/20 text-yellow-300",
  pending_payment: "bg-yellow-500/20 text-yellow-300",
  cancelled: "bg-zinc-500/20 text-zinc-300",
};

function Badge({ status }: { status: string }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[status] || "bg-white/10 text-zinc-300"}`}>{status.replace("_", " ")}</span>;
}

export default function Dashboard({ user: initialUser }: { user: User }) {
  const user = initialUser;
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Row[]>([]);
  const [registrations, setRegistrations] = useState<Row[]>([]);
  const [packages, setPackages] = useState<Row[]>([]);

  useEffect(() => {
    const supabase = supabaseBrowser();
    Promise.all([
      supabase.from("audience_tickets").select("*").order("created_at", { ascending: false }),
      supabase.from("performer_registrations").select("*").order("created_at", { ascending: false }),
      supabase.from("creator_packages").select("*").order("created_at", { ascending: false }),
    ]).then(([t, r, p]) => {
      setTickets(t.data || []);
      setRegistrations(r.data || []);
      setPackages(p.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-zinc-400">Loading your dashboard...</div>;
  }

  const totalSpend = [...tickets, ...registrations, ...packages]
    .filter((r) => r.payment_status === "paid" || r.status === "paid")
    .reduce((sum, r) => sum + (r.amount_inr || r.price_inr || 0), 0);

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-extrabold">My Dashboard</h1>
      <p className="mt-1 text-zinc-400">Signed in as {user?.email}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs text-zinc-400">Tickets booked</p>
          <p className="mt-1 text-2xl font-black text-yellow-400">{tickets.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs text-zinc-400">Performer registrations</p>
          <p className="mt-1 text-2xl font-black text-yellow-400">{registrations.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs text-zinc-400">Total paid</p>
          <p className="mt-1 text-2xl font-black text-yellow-400">₹{totalSpend.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-bold">🎟 My Tickets</h2>
      {tickets.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">No tickets booked yet. <a href="/tickets" className="text-yellow-400 hover:underline">Browse tickets →</a></p>
      ) : (
        <div className="mt-3 space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
              <div>
                <p className="font-semibold capitalize">{t.tier} pass</p>
                <p className="text-xs text-zinc-500">{new Date(t.created_at).toLocaleDateString("en-IN")}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-yellow-400">₹{t.amount_inr}</span>
                <Badge status={t.payment_status} />
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-10 text-xl font-bold">🎤 My Performer Registrations</h2>
      {registrations.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">No registrations yet. <a href="/perform" className="text-yellow-400 hover:underline">Register to perform →</a></p>
      ) : (
        <div className="mt-3 space-y-3">
          {registrations.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
              <div>
                <p className="font-semibold">{r.category}{r.video_upsell ? " · with portfolio video" : ""}</p>
                <p className="text-xs text-zinc-500">{new Date(r.created_at).toLocaleDateString("en-IN")}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-yellow-400">₹{r.amount_inr}</span>
                <Badge status={r.payment_status} />
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-10 text-xl font-bold">🎬 My Creator Packages</h2>
      {packages.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">No package enquiries yet. <a href="/creators" className="text-yellow-400 hover:underline">View the package →</a></p>
      ) : (
        <div className="mt-3 space-y-3">
          {packages.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
              <div>
                <p className="font-semibold">{p.package_name}</p>
                <p className="text-xs text-zinc-500">{new Date(p.created_at).toLocaleDateString("en-IN")}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-yellow-400">₹{p.price_inr.toLocaleString("en-IN")}</span>
                <Badge status={p.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
