import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";
import { AuthSplitLayout } from "@/components/forms/auth-split-layout";

export default function LoginPage() {
  return (
    <AuthSplitLayout title="Welcome Back" subtitle="Sign in to monitor your plant health and maintenance workflows.">
      <div className="space-y-4">
        <AuthForm mode="login" />
        <p className="text-center text-sm text-slate-600">
          New here? <Link href="/signup" className="text-cyan-700">Create an account</Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
