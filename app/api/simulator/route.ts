import { NextResponse } from "next/server";
import { simulatorSchema } from "@/lib/validations/schemas";
import { requireApiAuth } from "@/lib/utils/auth-api";
import { generateSensorReadings } from "@/lib/services/simulator";

export async function POST(request: Request) {
  const auth = await requireApiAuth("technician");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const payload = await request.json().catch(() => ({}));
  const parsed = simulatorSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await generateSensorReadings(parsed.data.count, parsed.data.equipmentId);
  return NextResponse.json(result);
}
