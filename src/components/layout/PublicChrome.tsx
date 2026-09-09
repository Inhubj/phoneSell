"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppButton } from "./WhatsAppButton";
import { MobileStickyCta } from "./MobileStickyCta";
import { VisitorPing } from "./VisitorPing";
import { Splash } from "./Splash";

export function PublicChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isApp =
    path.startsWith("/admin") ||
    path.startsWith("/executive") ||
    path.startsWith("/staff");

  if (isApp) {
    return <>{children}</>;
  }

  return (
    <>
      <Splash />
      <Header />
      <VisitorPing />
      <main key={path} className={`page-enter flex-1 pb-20 md:pb-0 ${path === "/" ? "" : "pt-[4.5rem]"}`}>{children}</main>
      <Footer />
      <WhatsAppButton />
      <MobileStickyCta />
    </>
  );
}
