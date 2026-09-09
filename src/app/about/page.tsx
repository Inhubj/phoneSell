import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "About Us",
  description: "PhoneSell is a Mumbai-area buyer of used and damaged smartphones, based at Singapore Plaza, Mira Road East.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-6">
      <Reveal>
        <p className="kicker">Company</p>
        <h1 className="font-display mt-3 text-4xl text-navy">About PhoneSell</h1>
        <div className="panel mt-8 space-y-5 rounded-[1.4rem] p-8 leading-7 text-muted">
        <p>
          PhoneSell purchases used, old, refurbished, damaged and working smartphones directly from customers. We serve Mumbai, Mira Road, Bhayandar, Thane and surrounding areas with scheduled doorstep pickup.
        </p>
        <p>
          Every enquiry — model, variant, condition, photos, address and slot — is stored for our operations team so pricing and pickup stay traceable.
        </p>
        <p className="text-sm">
          {BUSINESS.addressLine1}, {BUSINESS.addressLine2}. Phone {BUSINESS.phoneDisplay}.
        </p>
      </div>
      </Reveal>
      <Link href="/sell" className="btn-premium mt-8 inline-flex rounded-full bg-navy px-6 py-3 font-semibold text-white">
        Sell your phone
      </Link>
    </div>
  );
}
