import { NextRequest, NextResponse } from "next/server";
import { parseSearchQuery } from "@/shared";

export async function POST(req: NextRequest) {
  try {
    const { query, brands } = (await req.json()) as {
      query: string;
      brands: string[];
    };

    if (!query?.trim()) {
      return NextResponse.json({});
    }

    const result = await parseSearchQuery(query, brands);
    return NextResponse.json(result);
  } catch (e) {
    console.error("Smart search error:", e);
    return NextResponse.json({}, { status: 200 });
  }
}
