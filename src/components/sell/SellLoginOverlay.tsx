"use client";

import { CustomerLoginForm } from "@/components/auth/CustomerLoginForm";

export function SellLoginOverlay({
  open,
  reason,
  onClose,
  onSuccess,
}: {
  open: boolean;
  reason: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/70 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md">
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 right-0 z-10 rounded-full bg-white px-3 py-1 text-sm font-semibold text-navy shadow"
        >
          Close
        </button>
        <CustomerLoginForm reason={reason} onSuccess={onSuccess} />
      </div>
    </div>
  );
}
