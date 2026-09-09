import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PremiumCta({
  href,
  children,
  variant = "navy",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "navy" | "gold" | "ghost";
  className?: string;
}) {
  const styles =
    variant === "gold"
      ? "bg-gold text-navy"
      : variant === "ghost"
        ? "border border-white/30 text-white"
        : "bg-navy text-white";
  return (
    <Link href={href} className={`btn-premium rounded-full px-7 py-3.5 text-center font-semibold ${styles} ${className}`}>
      {children}
      <ArrowRight className="btn-arrow h-4 w-4" aria-hidden />
    </Link>
  );
}

export function PremiumButton({
  children,
  className = "",
  variant = "navy",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "navy" | "gold" }) {
  return (
    <button
      className={`btn-premium rounded-full px-6 py-3 font-semibold ${variant === "gold" ? "bg-gold text-navy" : "bg-navy text-white"} ${className}`}
      {...props}
    >
      {children}
      <span className="btn-arrow" aria-hidden>
        →
      </span>
    </button>
  );
}
