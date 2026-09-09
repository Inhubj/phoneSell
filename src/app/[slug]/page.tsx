import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SEO_PAGES } from "@/lib/seo-pages";
import { BUSINESS, PRICE_DISCLAIMER } from "@/lib/constants";
import { FAQS } from "@/lib/faqs";

export function generateStaticParams() {
  return SEO_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = SEO_PAGES.find((p) => p.slug === slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: { title: page.headline, description: page.description },
    keywords: [page.keyword, "sell old phone near me", "used mobile buyer Mumbai"],
  };
}

export default async function SeoLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = SEO_PAGES.find((p) => p.slug === slug);
  if (!page) notFound();

  const crumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: process.env.APP_URL || "http://localhost:3000" },
      { "@type": "ListItem", position: 2, name: page.headline, item: `${process.env.APP_URL || "http://localhost:3000"}/${page.slug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 lg:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumb) }} />
      <nav className="text-sm text-muted">
        <Link href="/">Home</Link> / <span>{page.headline}</span>
      </nav>
      <h1 className="font-display mt-4 text-4xl md:text-5xl">{page.headline}</h1>
      <p className="mt-2 text-lg text-gold">{page.keyword}</p>
      <p className="mt-5 max-w-3xl leading-7 text-muted">{page.intro}</p>
      <p className="mt-4 max-w-3xl text-sm text-muted">Get an estimated value in minutes. Doorstep pickup from {BUSINESS.addressLine1}, covering Mumbai and nearby areas.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href={page.ctaHref} className="rounded-full bg-navy px-7 py-3.5 text-center font-semibold text-white">
          {page.cta}
        </Link>
        <a href={BUSINESS.telHref} className="rounded-full border px-7 py-3.5 text-center font-semibold">
          Call {BUSINESS.phoneDisplay}
        </a>
      </div>
      <p className="mt-4 text-sm">
        Share:{" "}
        <a className="text-royal" href={`https://wa.me/?text=${encodeURIComponent(page.headline + " " + (process.env.APP_URL || "") + "/" + page.slug)}`}>WhatsApp</a>
        {" · "}
        <a className="text-royal" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent((process.env.APP_URL || "") + "/" + page.slug)}`}>Facebook</a>
      </p>
      <p className="mt-6 text-xs text-muted">{PRICE_DISCLAIMER}</p>
      <section className="mt-12">
        <h2 className="font-display text-3xl">Questions about {page.keyword}</h2>
        <div className="mt-5 space-y-4">
          {[...page.faqs, ...FAQS.slice(0, 4)].map((f) => (
            <article key={f.q} className="rounded-2xl bg-white p-5">
              <h3 className="font-semibold">{f.q}</h3>
              <p className="mt-2 text-sm text-muted">{f.a}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
