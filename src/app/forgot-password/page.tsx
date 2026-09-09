import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="px-4 py-14">
      <ForgotPasswordForm kind="customer" loginHref="/login" />
    </div>
  );
}
