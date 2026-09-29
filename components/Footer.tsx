import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} ThoughtOut. All rights reserved.</p>
        <div className="flex flex-wrap gap-5">
          <Link href="/terms" className="hover:text-yellow-400">Terms & Conditions</Link>
          <Link href="/privacy" className="hover:text-yellow-400">Privacy Policy</Link>
          <Link href="/refund-policy" className="hover:text-yellow-400">Refund / Cancellation</Link>
          <Link href="/contact" className="hover:text-yellow-400">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
}
