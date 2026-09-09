import { Suspense } from "react";
import type { Metadata } from "next";
import { CustomerLoginForm } from "@/components/auth/CustomerLoginForm";

export const metadata: Metadata = { title: "Customer Login" };

export default function LoginPage() {
  return (
    <div className="relative overflow-hidden px-4 py-14 lg:px-6">
      <span className="orb -left-16 top-10 h-40 w-40 bg-gold/20" />
      <span className="orb right-0 bottom-0 h-48 w-48 bg-royal/20" />
      <Suspense fallback={<div className="panel mx-auto max-w-md rounded-[1.4rem] p-10">Loading…</div>}>
        <CustomerLoginForm />
      </Suspense>
    </div>
  );
}
