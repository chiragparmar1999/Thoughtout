"use client";
import { useState } from "react";
import { EVENT, TICKETS } from "@/lib/data";
import { authedPost } from "@/lib/authed-fetch";
import { openRazorpay } from "@/components/RazorpayCheckout";

function tLabel(id: string | null) { return TICKETS.find((t) => t.id === id)?.name || "Audience"; }

export default function Tickets() {
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await authedPost("/api/tickets", { tier: selected, ...form });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setMsg(data.error || "Something went wrong.");
      return;
    }
    try {
      await openRazorpay({
        key: data.keyId, amount: Math.round(data.amount * 100), currency: "INR",
        name: "ThoughtOut", description: `${tLabel(selected)} ticket`, order_id: data.orderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#dc2626" },
        handler: async (payment) => {
          const verify = await authedPost("/api/payments/verify", { type: "audience_ticket", recordId: data.id, ...payment });
          const result = await verify.json();
          setMsg(verify.ok ? "Payment successful! Your ticket is confirmed." : result.error || "Payment verification failed.");
        },
        modal: { ondismiss: () => setMsg("Payment window closed. You can try again.") },
      });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Unable to open payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="tickets" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-3xl font-extrabold">Audience Tickets</h2>
      <p className="mt-1 text-zinc-400">{EVENT.title} · {EVENT.date} · {EVENT.venue}</p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {TICKETS.map((t) => (
          <div key={t.id} className={`rounded-xl border p-6 transition ${selected === t.id ? "border-red-500 bg-white/10" : "border-white/10 bg-white/5 hover:border-yellow-400"}`}>
            <h3 className="text-xl font-bold">{t.name}</h3>
            <p className="mt-1 text-sm text-zinc-400">{t.desc}</p>
            <p className="mt-4 text-4xl font-black text-yellow-400">₹{t.price}<span className="text-base font-normal text-zinc-400">/-</span></p>
            <p className="mt-1 text-xs text-zinc-500">Admits {t.seats}</p>
            <button onClick={() => { setSelected(t.id); setMsg(""); }} className="mt-5 w-full rounded-lg bg-red-600 py-2.5 font-bold hover:bg-red-500">Buy Now</button>
          </div>
        ))}
      </div>

      {selected && (
        <form onSubmit={submit} className="mt-8 grid gap-4 rounded-xl border border-white/10 bg-white/5 p-6 md:grid-cols-3">
          <input required placeholder="Full name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required type="email" placeholder="Email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required type="tel" placeholder="Phone" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <button disabled={loading} className="rounded-lg bg-yellow-400 py-2.5 font-bold text-black md:col-span-3">
            {loading ? "Please wait..." : "Continue to Payment"}
          </button>
          {msg && <p className="text-sm text-yellow-300 md:col-span-3">{msg}</p>}
        </form>
      )}
      <style>{`.input{background:#0b0b10;border:1px solid #ffffff22;border-radius:.5rem;padding:.65rem .8rem;width:100%}`}</style>
    </section>
  );
}
