export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <p className="mt-1 text-sm text-zinc-500">Last updated: {new Date().toLocaleDateString("en-IN")}</p>
      <div className="mt-8 space-y-4 leading-relaxed text-zinc-300 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white">{children}</div>
    </article>
  );
}
