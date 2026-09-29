"use client";
import { useState } from "react";
import { CATEGORIES, PERFORMER_FEE, VIDEO_PACKAGE_FEE, VIDEO_INCLUDED_MINUTES, EXTRA_MINUTE_RATE } from "@/lib/data";
import { authedPost } from "@/lib/authed-fetch";
import { openRazorpay } from "@/components/RazorpayCheckout";

export default function PerformerForm() {
  const [f, setF] = useState({ name: "", contact_no: "", instagram_id: "", email: "", category: "" });
  const [video, setVideo] = useState(false);
  const [extraMins, setExtraMins] = useState(0);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const total = video ? VIDEO_PACKAGE_FEE + extraMins * EXTRA_MINUTE_RATE : PERFORMER_FEE;
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await authedPost("/api/performers", { ...f, video_upsell: video, video_extra_minutes: video ? extraMins : 0 });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setMsg(data.error || "Something went wrong.");
      return;
    }
    try {
      await openRazorpay({
        key: data.keyId, amount: Math.round(data.amount * 100), currency: "INR",
        name: "ThoughtOut", description: "Performer registration", order_id: data.orderId,
        prefill: { name: f.name, email: f.email, contact: f.contact_no },
        theme: { color: "#dc2626" },
        handler: async (payment) => {
          const verify = await authedPost("/api/payments/verify", { type: "performer_registration", recordId: data.id, ...payment });
          const result = await verify.json();
          setMsg(verify.ok ? "Payment successful! Performer registration is confirmed." : result.error || "Payment verification failed.");
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
    <section id="perform" className="border-y border-white/10 bg-white/[0.03]">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-3xl font-extrabold">Register as Performer</h2>
        <p className="mt-1 text-zinc-400">Take the stage at TOM WINTER. Registration fee: <b className="text-yellow-400">₹{PERFORMER_FEE}/-</b></p>

        <form onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-2">
          <input required placeholder="Name" className="input" value={f.name} onChange={set("name")} />
          <input required type="tel" placeholder="Contact No" className="input" value={f.contact_no} onChange={set("contact_no")} />
          <input required placeholder="Instagram ID (@handle)" className="input" value={f.instagram_id} onChange={set("instagram_id")} />
          <input required type="email" placeholder="Email ID" className="input" value={f.email} onChange={set("email")} />
          <select required className="input sm:col-span-2" value={f.category} onChange={set("category")}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>

          <label className="flex cursor-pointer gap-3 rounded-xl border-2 border-yellow-400 bg-yellow-400/10 p-4 sm:col-span-2">
            <input type="checkbox" className="mt-1 h-5 w-5 accent-red-600" checked={video} onChange={(e) => { setVideo(e.target.checked); if (!e.target.checked) setExtraMins(0); }} />
            <span>
              <b>Add a 5 to 6 minutes raw performance video for your portfolio (₹{VIDEO_PACKAGE_FEE})</b>
              <span className="mt-1 block text-sm text-zinc-300">
                ₹{VIDEO_PACKAGE_FEE} covers registration and up to {VIDEO_INCLUDED_MINUTES} minutes of raw footage, shot on a professional multi-cam setup — no extra charge within that time.
              </span>
            </span>
          </label>

          {video && (
            <div className="flex items-center gap-3 text-sm sm:col-span-2">
              <span className="text-zinc-400">Performing longer than {VIDEO_INCLUDED_MINUTES} min? Extra minutes at ₹{EXTRA_MINUTE_RATE} each:</span>
              <button type="button" onClick={() => setExtraMins((m) => Math.max(0, m - 1))} className="h-8 w-8 rounded-full border border-white/20 hover:bg-white/10">−</button>
              <span className="w-6 text-center font-bold">{extraMins}</span>
              <button type="button" onClick={() => setExtraMins((m) => m + 1)} className="h-8 w-8 rounded-full border border-white/20 hover:bg-white/10">+</button>
            </div>
          )}

          <div className="flex items-center justify-between sm:col-span-2">
            <span className="text-lg">Total: <b className="text-yellow-400">₹{total}/-</b></span>
            <button disabled={loading} className="rounded-lg bg-red-600 px-6 py-3 font-bold hover:bg-red-500">{loading ? "Please wait..." : "Register & Pay"}</button>
          </div>
          {msg && <p className="text-sm text-yellow-300 sm:col-span-2">{msg}</p>}
        </form>
      </div>
      <style>{`.input{background:#0b0b10;border:1px solid #ffffff22;border-radius:.5rem;padding:.65rem .8rem;width:100%}`}</style>
    </section>
  );
}
