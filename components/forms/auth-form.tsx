"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authSchema, signupSchema } from "@/lib/validations/schemas";
import { useSupabase } from "@/hooks/use-supabase";
import type { UserRole } from "@/types/domain";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const supabase = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("operator");
  const [facilityCode, setFacilityCode] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [facilityLocation, setFacilityLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const title = mode === "login" ? "Sign In" : "Create Account";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    setLoading(true);

    if (mode === "login") {
      const parsed = authSchema.safeParse({ email, password });
      if (!parsed.success) {
        setLoading(false);
        setError(parsed.error.errors[0]?.message ?? "Invalid input");
        return;
      }

      const result = await supabase.auth.signInWithPassword(parsed.data);
      setLoading(false);

      if (result.error) {
        setError(result.error.message);
        return;
      }
    } else {
      const parsed = signupSchema.safeParse({
        email,
        password,
        role,
        facilityCode,
        facilityName,
        facilityLocation
      });
      if (!parsed.success) {
        setLoading(false);
        setError(parsed.error.errors[0]?.message ?? "Invalid input");
        return;
      }

      const result = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: {
            role: parsed.data.role,
            facility_code: parsed.data.facilityCode,
            facility_name: parsed.data.facilityName,
            facility_location: parsed.data.facilityLocation
          }
        }
      });
      setLoading(false);

      if (result.error) {
        setError(result.error.message);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm text-slate-600">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-cyan-500 focus:outline-none"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm text-slate-600">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-cyan-500 focus:outline-none"
          required
        />
      </div>
      {mode === "signup" ? (
        <>
          <div>
            <label htmlFor="role" className="mb-1 block text-sm text-slate-600">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-cyan-500 focus:outline-none"
            >
              <option value="operator">Operator</option>
              <option value="technician">Technician</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {role === "admin" ? (
            <>
              <div>
                <label htmlFor="facilityCode" className="mb-1 block text-sm text-slate-600">
                  Facility Code
                </label>
                <input
                  id="facilityCode"
                  type="text"
                  value={facilityCode}
                  onChange={(e) => setFacilityCode(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="facilityName" className="mb-1 block text-sm text-slate-600">
                  Facility Name
                </label>
                <input
                  id="facilityName"
                  type="text"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="facilityLocation" className="mb-1 block text-sm text-slate-600">
                  Facility Location
                </label>
                <input
                  id="facilityLocation"
                  type="text"
                  value={facilityLocation}
                  onChange={(e) => setFacilityLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="facilityCode" className="mb-1 block text-sm text-slate-600">
                Facility Code
              </label>
              <input
                id="facilityCode"
                type="text"
                value={facilityCode}
                onChange={(e) => setFacilityCode(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
          )}
        </>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-cyan-700 px-4 py-2 font-medium text-white hover:bg-cyan-600 disabled:opacity-60"
      >
        {loading ? "Submitting..." : title}
      </button>
    </form>
  );
}
