import { BUSINESS } from "@/lib/constants";

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.12.14 4.77 1.8 4.91 4.91.06 1.27.07 1.65.07 4.86s-.01 3.59-.07 4.86c-.14 3.1-1.8 4.77-4.91 4.91-1.27.06-1.64.07-4.85.07s-3.59-.01-4.86-.07c-3.12-.14-4.77-1.8-4.91-4.91-.06-1.27-.07-1.64-.07-4.86s.01-3.59.07-4.86C2.37 4.03 4.03 2.37 7.14 2.23 8.41 2.17 8.79 2.16 12 2.16m0-2.16C8.74 0 8.33.01 7.05.07 2.7.27.27 2.7.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.7 21.31.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zM12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4zm6.41-10.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44z" />
    </svg>
  );
}

export function ContactChannels({
  tone = "light",
}: {
  tone?: "light" | "dark";
}) {
  const link =
    tone === "dark"
      ? "mt-2 inline-flex items-center gap-2.5 text-sm text-white/65 transition hover:text-white"
      : "mt-3 inline-flex items-center gap-2.5 text-lg font-semibold text-navy";
  const ig =
    tone === "dark"
      ? "h-4 w-4 shrink-0 text-[#E1306C]"
      : "h-5 w-5 shrink-0 text-[#E1306C]";
  const mail =
    tone === "dark"
      ? "h-4 w-4 shrink-0 text-gold"
      : "h-5 w-5 shrink-0 text-royal";

  return (
    <div className={tone === "dark" ? "mt-4 flex flex-col" : "flex flex-col"}>
      <a href={BUSINESS.mailto} className={link}>
        <MailIcon className={mail} />
        <span>{BUSINESS.email}</span>
      </a>
      <a
        href={BUSINESS.social.instagram}
        target="_blank"
        rel="noreferrer"
        className={link}
      >
        <InstagramIcon className={ig} />
        <span>@{BUSINESS.social.instagramHandle}</span>
      </a>
    </div>
  );
}
