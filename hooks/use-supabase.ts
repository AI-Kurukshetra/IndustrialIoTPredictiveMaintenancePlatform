"use client";

import { useMemo } from "react";
import { createClientSupabaseClient } from "@/lib/supabase/client";

export function useSupabase() {
  return useMemo(() => createClientSupabaseClient(), []);
}
