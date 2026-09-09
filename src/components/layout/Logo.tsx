import Image from "next/image";
import Link from "next/link";
import { BUSINESS } from "@/lib/constants";

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5 sm:gap-3 group">
      <Image
        src="/phonesell-logo.jpg"
        alt=""
        width={56}
        height={56}
        className={`rounded-xl object-cover object-[center_18%] ${compact ? "h-10 w-10" : "h-11 w-11 sm:h-12 sm:w-12"} ${
          light ? "ring-1 ring-white/15" : "ring-1 ring-navy/10"
        }`}
        priority
      />
      <span
        className={`font-display leading-none tracking-tight ${compact ? "text-lg" : "text-[1.15rem] sm:text-xl"} ${
          light ? "text-white" : "text-navy"
        }`}
      >
        Phone
        <span className="bg-gradient-to-b from-[#00AEEF] to-[#0072BC] bg-clip-text text-transparent">Sell</span>
      </span>
      <span className="sr-only">{BUSINESS.name} home</span>
    </Link>
  );
}
