import { NextRequest, NextResponse } from "next/server";
import { runScrape } from "@/shared";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  if (!isVercelCron && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ ok: true, ...(await runScrape()) });
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-scrape-secret");
  if (process.env.SCRAPE_SECRET && secret !== process.env.SCRAPE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, ...(await runScrape()) });
}
