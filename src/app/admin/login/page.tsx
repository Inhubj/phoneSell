import { LoginForm } from "@/components/auth/LoginForm";

export default function AdminLoginPage() {
  return (
    <LoginForm
      title="Admin sign in"
      hint="Username: admin  ·  Password: RoyalAdmin@2026  ·  Pickup staff should use /executive/login instead."
      executiveHref
    />
  );
}
