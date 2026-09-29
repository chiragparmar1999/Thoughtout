import Link from "next/link";
import { EVENT } from "@/lib/data";

export const metadata = { title: "Events | ThoughtOut" };

export default function EventsPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-extrabold">Upcoming Events</h1>
      <p className="mt-1 text-zinc-400">Live open-mic and showcase events from ThoughtOut.</p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
        <div className="relative p-8" style={{ background: "radial-gradient(ellipse at top left,#ef444455,transparent 55%),radial-gradient(ellipse at bottom right,#facc1540,transparent 50%),linear-gradient(#0b0b10,#15151f)" }}>
          <span className="inline-block rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold uppercase text-black">Featured</span>
          <h2 className="mt-4 text-4xl font-black">{EVENT.title}</h2>
          <div className="mt-3 flex flex-wrap gap-6 text-zinc-200">
            <span>📅 {EVENT.date}</span>
            <span>📍 {EVENT.venue}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link href="/tickets" className="rounded-lg bg-red-600 px-6 py-3 font-bold hover:bg-red-500">Book Tickets</Link>
            <Link href="/perform" className="rounded-lg border border-yellow-400 px-6 py-3 font-bold text-yellow-400 hover:bg-yellow-400 hover:text-black">Register as Performer</Link>
          </div>
        </div>
      </div>

      <p className="mt-8 text-sm text-zinc-500">More events will be listed here as they're announced.</p>
    </section>
  );
}
