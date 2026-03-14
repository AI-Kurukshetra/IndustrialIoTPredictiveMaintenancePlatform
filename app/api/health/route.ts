import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/utils/auth-api";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { calculateHealthScore } from "@/lib/services/predictive";

export async function POST() {
  const auth = await requireApiAuth("manager");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = await createServerSupabaseClient();
  const { data: equipment } = await supabase.from("equipment").select("id");

  const scores = await Promise.all((equipment ?? []).map((item) => calculateHealthScore(item.id)));
  return NextResponse.json({ evaluated: scores.length, scores });
}
