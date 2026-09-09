import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function AdminForgotPage() {
  return (
    <div className="flex min-h-screen items-center bg-navy px-4">
      <ForgotPasswordForm kind="admin" loginHref="/admin/login" />
    </div>
  );
}
