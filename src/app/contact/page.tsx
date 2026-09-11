import type { Metadata } from "next";
import { BUSINESS } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";
import { ContactChannels } from "@/components/layout/ContactChannels";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact PhoneSell in Mira Road East, Thane. Call 7068867486 or email Phone0Sell@gmail.com.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 lg:px-6">
      <Reveal>
        <p className="kicker">Store</p>
        <h1 className="font-display mt-3 text-4xl text-navy">Contact PhoneSell</h1>
      </Reveal>
      <div className="mt-10 grid gap-6 overflow-hidden lg:grid-cols-2">
        <Reveal>
        <div className="panel rounded-[1.4rem] p-8">
          <p className="font-semibold text-navy">{BUSINESS.addressLine1}</p>
          <p className="mt-1 text-muted">{BUSINESS.addressLine2}</p>
          <a href={BUSINESS.telHref} className="mt-6 inline-block text-2xl font-semibold text-navy">
            {BUSINESS.phoneDisplay}
          </a>
          <ContactChannels />
          <p className="mt-2 text-sm text-muted">{BUSINESS.hours}</p>
          <a
            href={BUSINESS.telHref}
            className="btn-premium mt-8 inline-flex rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white"
          >
            Call the store
          </a>
        </div>
        </Reveal>
        <Reveal delay={80}>
        <iframe title="Map" src={BUSINESS.embedMaps} className="h-80 w-full rounded-[1.4rem] border-0" loading="lazy" />
        </Reveal>
      </div>
    </div>
  );
}
