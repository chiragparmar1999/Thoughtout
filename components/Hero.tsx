import Link from "next/link";
import { EVENT } from "@/lib/data";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#ef444455,transparent_55%),radial-gradient(ellipse_at_bottom_right,#facc1540,transparent_50%),linear-gradient(#0b0b10,#15151f)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <span className="inline-block rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-black">
          Featured Live Event
        </span>
        <h1 className="mt-5 text-5xl font-black leading-tight sm:text-7xl">{EVENT.title}</h1>
        <p className="mt-4 max-w-xl text-lg text-zinc-300">
          An evening of poetry, music, comedy and storytelling by local voices. Come as an audience member or take the stage.
        </p>
        <div className="mt-6 flex flex-wrap gap-6 text-zinc-200">
          <span>📅 {EVENT.date}</span>
          <span>📍 {EVENT.venue}</span>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/tickets" className="rounded-lg bg-red-600 px-6 py-3 font-bold shadow-lg shadow-red-600/30 hover:bg-red-500">Book Audience Tickets</Link>
          <Link href="/perform" className="rounded-lg border border-yellow-400 px-6 py-3 font-bold text-yellow-400 hover:bg-yellow-400 hover:text-black">Register as Performer</Link>
        </div>
      </div>
    </section>
  );
}
