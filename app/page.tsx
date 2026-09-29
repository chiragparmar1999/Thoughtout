import Hero from "@/components/Hero";
import Link from "next/link";
import { TICKETS, PERFORMER_FEE, PACKAGE } from "@/lib/data";

export default function Home() {
  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-extrabold">Three ways to be part of it</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Link href="/tickets" className="card rounded-xl border border-white/10 bg-white/5 p-6 transition hover:border-red-500 hover:bg-white/10">
            <h3 className="text-xl font-bold">🎟 Audience Tickets</h3>
            <p className="mt-2 text-sm text-zinc-400">Adult, Couple, or Group of 4 passes.</p>
            <p className="mt-4 text-2xl font-black text-yellow-400">from ₹{Math.min(...TICKETS.map((t) => t.price))}/-</p>
            <span className="mt-4 inline-block font-semibold text-red-500">Book tickets →</span>
          </Link>
          <Link href="/perform" className="card rounded-xl border border-white/10 bg-white/5 p-6 transition hover:border-red-500 hover:bg-white/10">
            <h3 className="text-xl font-bold">🎤 Register as Performer</h3>
            <p className="mt-2 text-sm text-zinc-400">Poetry, comedy, music, and more — take the stage.</p>
            <p className="mt-4 text-2xl font-black text-yellow-400">from ₹{PERFORMER_FEE}/-</p>
            <span className="mt-4 inline-block font-semibold text-red-500">Register now →</span>
          </Link>
          <Link href="/creators" className="card rounded-xl border border-white/10 bg-white/5 p-6 transition hover:border-red-500 hover:bg-white/10">
            <h3 className="text-xl font-bold">🎬 Creator Store</h3>
            <p className="mt-2 text-sm text-zinc-400">{PACKAGE.name}, built for local artists.</p>
            <p className="mt-4 text-2xl font-black text-yellow-400">₹{PACKAGE.price.toLocaleString("en-IN")}/-</p>
            <span className="mt-4 inline-block font-semibold text-red-500">View package →</span>
          </Link>
        </div>
      </section>
    </>
  );
}
