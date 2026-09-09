import Link from "next/link";
import { BUSINESS } from "@/lib/constants";

export function MobileStickyCta() {
  return (
    <div className="sticky-cta fixed inset-x-0 bottom-0 z-30 flex gap-2 bg-cream/95 p-3 backdrop-blur md:hidden">
      <a
        href={BUSINESS.telHref}
        className="flex-1 rounded-full border border-navy/20 py-3 text-center text-sm font-semibold"
      >
        Call {BUSINESS.phoneDisplay}
      </a>
      <Link
        href="/sell"
        className="btn-premium flex-[1.3] rounded-full bg-navy py-3 text-center text-sm font-semibold text-white"
      >
        Sell My Phone
        <span className="btn-arrow" aria-hidden> →</span>
      </Link>
    </div>
  );
}
