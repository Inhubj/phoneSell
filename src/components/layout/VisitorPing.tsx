"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function VisitorPing() {
  const path = usePathname();
  useEffect(() => {
    if (path.startsWith("/admin") || path.startsWith("/executive")) return;
    fetch("/api/analytics/ping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "PAGE_VIEW", path }),
    }).catch(() => {});
  }, [path]);
  return null;
}
