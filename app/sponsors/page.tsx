import Link from "next/link";

export const metadata = {
  title: "Partner With ThoughtOut | Sponsorship & Brand Collaborations",
  description: "Partner with ThoughtOut for live events, artist communities, brand visibility and creative collaborations in Vadodara.",
};

const benefits = [
  ["🎯", "Targeted Local Reach", "Connect your brand with Vadodara's artists, creators and live-event audience."],
  ["📱", "Social Visibility", "Get featured across event creatives, stories, reels and promotional content."],
  ["🎤", "On-Stage Presence", "Brand mentions and partner visibility during ThoughtOut live events."],
  ["📸", "Content Opportunities", "Create authentic photo and video content around your brand and the event."],
  ["🤝", "Community Association", "Associate your brand with local talent, creativity and live experiences."],
  ["☕", "Custom Activations", "We can build a campaign, giveaway, sampling or audience engagement activity around your brand."],
];

export default function SponsorsPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#ef444455,transparent_55%),radial-gradient(ellipse_at_bottom_right,#facc1530,transparent_50%),linear-gradient(#0b0b10,#15151f)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <span className="inline-block rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-black">
            Brand Partnerships
          </span>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight sm:text-7xl">
            Partner with <span className="text-red-500">ThoughtOut.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            Put your brand in the middle of Vadodara's creative community.
            ThoughtOut brings artists, audiences and brands together through live experiences.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="mailto:info@thoughtoutmic.com?subject=ThoughtOut%20Brand%20Partnership"
              className="rounded-lg bg-red-600 px-6 py-3 font-bold shadow-lg shadow-red-600/30 hover:bg-red-500"
            >
              Discuss a Partnership
            </a>
            <Link
              href="/events"
              className="rounded-lg border border-yellow-400 px-6 py-3 font-bold text-yellow-400 hover:bg-yellow-400 hover:text-black"
            >
              View Events
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-yellow-400">Why partner with us?</p>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">More than a logo on a poster.</h2>
          <p className="mt-4 text-zinc-400">
            We build collaborations that give brands real visibility, audience interaction and content value.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(([icon, title, description]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-3xl">{icon}</div>
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl border border-yellow-400/20 bg-yellow-400/5 p-8 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-widest text-yellow-400">Custom collaboration</p>
          <h2 className="mt-2 text-3xl font-extrabold">Let's build a partnership around your brand.</h2>
          <p className="mt-4 max-w-3xl leading-7 text-zinc-300">
            Sponsorship can be tailored around your budget and goals — from event partnership and
            refreshments to social-media campaigns, giveaways, audience activities and title partnerships.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm text-zinc-300">
            <span className="rounded-full border border-white/10 px-4 py-2">Event Partner</span>
            <span className="rounded-full border border-white/10 px-4 py-2">Coffee / Refreshment Partner</span>
            <span className="rounded-full border border-white/10 px-4 py-2">Content Partner</span>
            <span className="rounded-full border border-white/10 px-4 py-2">Associate Partner</span>
            <span className="rounded-full border border-white/10 px-4 py-2">Title Partner</span>
          </div>
        </div>
      </section>
    </div>
  );
}
