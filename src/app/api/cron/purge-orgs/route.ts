import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RateLimiter } from "@/lib/rate-limit";

const cronRateLimiter = new RateLimiter({ limit: 2, windowMs: 60 * 1000 });

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown-ip";
  if (!cronRateLimiter.check(ip).success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const orgsToPurge = await prisma.organization.findMany({
      where: { deletedAt: { lt: thirtyDaysAgo } },
      select: { id: true, name: true },
    });

    let purged = 0;
    for (const org of orgsToPurge) {
      await prisma.organization.delete({ where: { id: org.id } });
      purged++;
    }

    return NextResponse.json({ success: true, purged });
  } catch (error) {
    console.error("Purge orgs cron failed:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
