import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/shared";
import type { SortOption } from "@/entities/car";

export async function GET(req: NextRequest) {
  const p = new URL(req.url).searchParams;
  const brand  = p.get("brand")  ?? "";
  const fuel   = p.get("fuel")   ?? "";
  const sort   = (p.get("sort")  ?? "default") as SortOption;
  const q      = p.get("q")      ?? "";
  const limit  = parseInt(p.get("limit") ?? "96");
  const page   = parseInt(p.get("page")  ?? "1");
  const offset = (page - 1) * limit;

  let query = supabase.from("cars").select("*", { count: "exact" });
  if (brand) query = query.eq("brand", brand);
  if (fuel)  query = query.eq("fuel",  fuel);
  if (q)     query = query.ilike("title", `%${q}%`);

  const orderMap: Record<SortOption, { col: string; asc: boolean }> = {
    default:     { col: "scraped_at", asc: false },
    price_asc:   { col: "price_krw",  asc: true  },
    price_desc:  { col: "price_krw",  asc: false },
    year_desc:   { col: "year",       asc: false },
    mileage_asc: { col: "mileage",    asc: true  },
  };
  const { col, asc } = orderMap[sort] ?? orderMap.default;
  query = query.order(col, { ascending: asc }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: log } = await supabase
    .from("scrape_log").select("ran_at").eq("id", 1).single();

  return NextResponse.json({
    cars: data ?? [],
    count: count ?? 0,
    updatedAt: log?.ran_at ?? null,
  });
}
