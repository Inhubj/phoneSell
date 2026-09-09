import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import { PublicChrome } from "@/components/layout/PublicChrome";
import { JsonLd } from "@/components/seo/JsonLd";
import { BUSINESS } from "@/lib/constants";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const appUrl = process.env.APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Sell Old Phone in Mumbai | PhoneSell",
    template: "%s | PhoneSell",
  },
  description:
    "Sell your old, used or damaged smartphone in Mumbai. Get an estimated value online and schedule free doorstep pickup across Mira Road, Bhayandar, Thane and nearby areas.",
  keywords: [
    "sell old phone in Mumbai",
    "sell used phone Mumbai",
    "sell mobile phone Mumbai",
    "sell old iPhone Mumbai",
    "sell Samsung phone Mumbai",
    "old mobile buyer near me",
    "doorstep phone pickup Mumbai",
    "sell old phone Mira Road",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: BUSINESS.name,
    title: "Sell Your Phone, Get the Best Value",
    description:
      "Turn your old smartphone into instant value with doorstep pickup across Mumbai and nearby areas.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sell Your Phone, Get the Best Value",
    description: "Online estimate and doorstep pickup from PhoneSell, Mira Road East.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/phonesell-logo.jpg",
    apple: "/phonesell-logo.jpg",
  },
  alternates: { canonical: appUrl },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <JsonLd />
        <PublicChrome>{children}</PublicChrome>
      </body>
    </html>
  );
}
