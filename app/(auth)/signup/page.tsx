import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";
import { AuthSplitLayout } from "@/components/forms/auth-split-layout";

export default function SignupPage() {
  return (
    <AuthSplitLayout title="Create Account" subtitle="Set up access for your facility monitoring workspace.">
      <div className="space-y-4">
        <AuthForm mode="signup" />
        <p className="text-center text-sm text-slate-600">
          Already have an account? <Link href="/login" className="text-cyan-700">Sign in</Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
