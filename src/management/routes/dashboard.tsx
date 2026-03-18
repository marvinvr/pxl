import { Hono } from "hono";
import { db } from "../../db/client";
import { pixels, opens, unmatchedRequests } from "../../db/schema";
import { count, gte, desc } from "drizzle-orm";
import { DashboardView } from "../views/dashboard";

export const dashboardRoutes = new Hono();

dashboardRoutes.get("/", async (c) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const dayStart = startOfDay.getTime();

  const [totalPixelsResult, opensTodayResult, opensAllTimeResult, unmatchedTodayResult, recentOpensRaw, recentUnmatched] =
    await Promise.all([
      db.select({ count: count() }).from(pixels),
      db.select({ count: count() }).from(opens).where(gte(opens.timestamp, dayStart)),
      db.select({ count: count() }).from(opens),
      db.select({ count: count() }).from(unmatchedRequests).where(gte(unmatchedRequests.timestamp, dayStart)),
      db
        .select({
          id: opens.id,
          timestamp: opens.timestamp,
          pixelId: opens.pixelId,
          ip: opens.ip,
          uaBrowser: opens.uaBrowser,
          uaOs: opens.uaOs,
        })
        .from(opens)
        .orderBy(desc(opens.timestamp))
        .limit(20),
      db
        .select({
          id: unmatchedRequests.id,
          timestamp: unmatchedRequests.timestamp,
          requestedPath: unmatchedRequests.requestedPath,
          ip: unmatchedRequests.ip,
          userAgent: unmatchedRequests.userAgent,
        })
        .from(unmatchedRequests)
        .orderBy(desc(unmatchedRequests.timestamp))
        .limit(50),
    ]);

  const pixelIds = [...new Set(recentOpensRaw.map((o) => o.pixelId))];
  const pixelMap = new Map<string, string>();
  if (pixelIds.length > 0) {
    const pixelRows = await db.select({ id: pixels.id, name: pixels.name }).from(pixels);
    for (const p of pixelRows) pixelMap.set(p.id, p.name);
  }

  const recentOpens = recentOpensRaw.map((o) => ({
    ...o,
    pixelName: pixelMap.get(o.pixelId) || "Unknown",
  }));

  return c.html(
    <DashboardView
      totalPixels={totalPixelsResult[0].count}
      opensToday={opensTodayResult[0].count}
      opensAllTime={opensAllTimeResult[0].count}
      unmatchedToday={unmatchedTodayResult[0].count}
      recentOpens={recentOpens}
      recentUnmatched={recentUnmatched}
    />
  );
});
