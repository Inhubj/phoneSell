import { BUSINESS } from "@/lib/constants";
import { FAQS } from "@/lib/faqs";

export function JsonLd() {
  const org = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "MobilePhoneStore"],
    name: BUSINESS.name,
    slogan: BUSINESS.tagline,
    logo: "/phonesell-logo.jpg",
    image: ["/phonesell-logo.jpg", "/opengraph-image"],
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    url: process.env.APP_URL || "http://localhost:3000",
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.addressLine1,
      addressLocality: "Mira Road East",
      addressRegion: BUSINESS.state,
      postalCode: BUSINESS.pincode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.geo.lat,
      longitude: BUSINESS.geo.lng,
    },
    openingHours: "Mo-Su 09:00-21:00",
    areaServed: ["Mumbai", "Thane", "Mira Road", "Bhayandar", "Navi Mumbai"],
    priceRange: "₹₹",
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
    </>
  );
}
