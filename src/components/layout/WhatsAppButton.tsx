import { BUSINESS, WHATSAPP_MESSAGE } from "@/lib/constants";

export function WhatsAppButton() {
  const href = `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="site-float fixed right-4 bottom-24 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg md:bottom-6"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
        <path d="M20.5 3.5A11 11 0 0 0 2.1 17.8L1 23l5.3-1.1A11 11 0 0 0 21 12a10.9 10.9 0 0 0-.5-8.5zM12 20.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3.1.7.7-3-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.7-5.5c-.3-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.5l.4-.4.2-.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1 2.6 11.6 11.6 0 0 0 4.4 4 14 14 0 0 0 1.4.5 3.4 3.4 0 0 0 1.6.1 2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c-.1-.1-.3-.2-.6-.3z" />
      </svg>
    </a>
  );
}
