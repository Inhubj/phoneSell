import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ExecutiveForgotPage() {
  return (
    <div className="flex min-h-screen items-center bg-navy px-4">
      <ForgotPasswordForm kind="executive" loginHref="/executive/login" />
    </div>
  );
}
