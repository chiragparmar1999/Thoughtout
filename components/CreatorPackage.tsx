"use client";
import { useState } from "react";
import { PACKAGE } from "@/lib/data";
import { authedPost } from "@/lib/authed-fetch";
import { openRazorpay } from "@/components/RazorpayCheckout";

export default function CreatorPackage() {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", email: "", phone: "", instagram_id: "" });
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await authedPost("/api/packages", f);
    const data = await res.json();
    if (!res.ok) { setMsg(data.error || "Something went wrong."); return; }
    try {
      await openRazorpay({
        key: data.keyId, amount: Math.round(data.amount * 100), currency: "INR",
        name: "ThoughtOut", description: PACKAGE.name, order_id: data.orderId,
        prefill: { name: f.name, email: f.email, contact: f.phone },
        theme: { color: "#dc2626" },
        handler: async (payment) => {
          const verify = await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "creator_package", recordId: data.id, ...payment }) });
          const result = await verify.json();
          setMsg(verify.ok ? "Payment successful! Your creator package is confirmed." : result.error || "Payment verification failed.");
        },
        modal: { ondismiss: () => setMsg("Payment window closed. You can try again.") },
      });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Unable to open payment.");
    }
  }

  return (
    <section id="creators" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-3xl font-extrabold">Creator Services & Store</h2>
      <div className="mt-8 overflow-hidden rounded-2xl border border-yellow-400/40 bg-gradient-to-br from-red-600/20 via-[#15151f] to-yellow-400/10 p-8">
        <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase">For Local Artists</span>
        <h3 className="mt-4 text-3xl font-black">{PACKAGE.name}</h3>
        <p className="mt-2 text-4xl font-black text-yellow-400">₹{PACKAGE.price.toLocaleString("en-IN")}/-</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {PACKAGE.deliverables.map((d) => (
            <li key={d} className="flex gap-2 text-zinc-200"><span className="text-yellow-400">✔</span>{d}</li>
          ))}
        </ul>
        <button onClick={() => setOpen(!open)} className="mt-8 rounded-lg bg-red-600 px-6 py-3 font-bold hover:bg-red-500">Get This Package</button>

        {open && (
          <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
            <input required placeholder="Name" className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            <input required type="email" placeholder="Email" className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            <input required type="tel" placeholder="Phone" className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            <input placeholder="Instagram ID" className="input" value={f.instagram_id} onChange={(e) => setF({ ...f, instagram_id: e.target.value })} />
            <button className="rounded-lg bg-yellow-400 py-2.5 font-bold text-black sm:col-span-2">Pay ₹{PACKAGE.price.toLocaleString("en-IN")}</button>
            {msg && <p className="text-sm text-yellow-300 sm:col-span-2">{msg}</p>}
          </form>
        )}
      </div>
      <style>{`.input{background:#0b0b10;border:1px solid #ffffff22;border-radius:.5rem;padding:.65rem .8rem;width:100%}`}</style>
    </section>
  );
}
