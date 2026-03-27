import { NextResponse } from "next/server";
import { supabase } from "@/shared";

export async function GET() {
  const { data } = await supabase.from("cars").select("brand").order("brand");
  const brands = [...new Set((data ?? []).map((r: { brand: string }) => r.brand))]
    .filter(Boolean).sort();
  return NextResponse.json({ brands });
}
