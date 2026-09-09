import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl">Page not found</h1>
      <p className="mt-3 text-muted">The page you requested is not available. You can still sell your phone or call us.</p>
      <Link href="/sell" className="mt-6 inline-block rounded-full bg-navy px-6 py-3 font-semibold text-white">
        Sell My Phone
      </Link>
    </div>
  );
}
