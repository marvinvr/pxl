import { Hono } from "hono";
import { db } from "../../db/client";
import { pixels, opens, links, clicks, unmatchedRequests, providers, ipAddresses } from "../../db/schema";
import { count, gte, desc, eq } from "drizzle-orm";
import { DashboardView } from "../views/dashboard";

export const dashboardRoutes = new Hono();

dashboardRoutes.get("/", async (c) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const dayStart = startOfDay.getTime();

  const [
    totalPixelsResult,
    totalLinksResult,
    opensTodayResult,
    clicksTodayResult,
    opensAllTimeResult,
    clicksAllTimeResult,
    unmatchedAllTimeResult,
    recentOpensRaw,
    recentClicksRaw,
    recentUnmatched,
    providerList,
  ] = await Promise.all([
    db.select({ count: count() }).from(pixels),
    db.select({ count: count() }).from(links),
    db.select({ count: count() }).from(opens).where(gte(opens.timestamp, dayStart)),
    db.select({ count: count() }).from(clicks).where(gte(clicks.timestamp, dayStart)),
    db.select({ count: count() }).from(opens),
    db.select({ count: count() }).from(clicks),
    db.select({ count: count() }).from(unmatchedRequests),
    db
      .select({
        id: opens.id,
        timestamp: opens.timestamp,
        pixelId: opens.pixelId,
        ipAddressId: ipAddresses.id,
        ip: ipAddresses.ip,
        uaBrowser: opens.uaBrowser,
        uaOs: opens.uaOs,
        geoCountry: ipAddresses.geoCountry,
        geoCity: ipAddresses.geoCity,
      })
      .from(opens)
      .leftJoin(ipAddresses, eq(opens.ipAddressId, ipAddresses.id))
      .where(eq(ipAddresses.muted, 0))
      .orderBy(desc(opens.timestamp))
      .limit(100),
    db
      .select({
        id: clicks.id,
        timestamp: clicks.timestamp,
        linkId: clicks.linkId,
        ipAddressId: ipAddresses.id,
        ip: ipAddresses.ip,
        uaBrowser: clicks.uaBrowser,
        uaOs: clicks.uaOs,
        geoCountry: ipAddresses.geoCountry,
        geoCity: ipAddresses.geoCity,
      })
      .from(clicks)
      .leftJoin(ipAddresses, eq(clicks.ipAddressId, ipAddresses.id))
      .where(eq(ipAddresses.muted, 0))
      .orderBy(desc(clicks.timestamp))
      .limit(100),
    db
      .select({
        id: unmatchedRequests.id,
        timestamp: unmatchedRequests.timestamp,
        requestedPath: unmatchedRequests.requestedPath,
        ipAddressId: ipAddresses.id,
        ip: ipAddresses.ip,
        userAgent: unmatchedRequests.userAgent,
      })
      .from(unmatchedRequests)
      .leftJoin(ipAddresses, eq(unmatchedRequests.ipAddressId, ipAddresses.id))
      .where(eq(ipAddresses.muted, 0))
      .orderBy(desc(unmatchedRequests.timestamp))
      .limit(200),
    db
      .select({ id: providers.id, name: providers.name })
      .from(providers)
      .where(eq(providers.enabled, 1)),
  ]);

  // Resolve pixel names
  const pixelIds = [...new Set(recentOpensRaw.map((o) => o.pixelId))];
  const pixelMap = new Map<string, string>();
  if (pixelIds.length > 0) {
    const pixelRows = await db.select({ id: pixels.id, name: pixels.name }).from(pixels);
    for (const p of pixelRows) pixelMap.set(p.id, p.name);
  }

  // Resolve link names
  const linkIds = [...new Set(recentClicksRaw.map((cl) => cl.linkId))];
  const linkMap = new Map<string, string>();
  if (linkIds.length > 0) {
    const linkRows = await db.select({ id: links.id, name: links.name }).from(links);
    for (const l of linkRows) linkMap.set(l.id, l.name);
  }

  // Merge opens and clicks into a single activity feed
  type ActivityItem = {
    type: "open" | "click";
    id: string;
    timestamp: number;
    name: string;
    ipAddressId: number | null;
    ip: string | null;
    uaBrowser: string | null;
    uaOs: string | null;
    geoCountry: string | null;
    geoCity: string | null;
  };

  const activity: ActivityItem[] = [
    ...recentOpensRaw.map((o) => ({
      type: "open" as const,
      id: o.id,
      timestamp: o.timestamp,
      name: pixelMap.get(o.pixelId) || "Unknown",
      ipAddressId: o.ipAddressId,
      ip: o.ip,
      uaBrowser: o.uaBrowser,
      uaOs: o.uaOs,
      geoCountry: o.geoCountry,
      geoCity: o.geoCity,
    })),
    ...recentClicksRaw.map((cl) => ({
      type: "click" as const,
      id: cl.id,
      timestamp: cl.timestamp,
      name: linkMap.get(cl.linkId) || "Unknown",
      ipAddressId: cl.ipAddressId,
      ip: cl.ip,
      uaBrowser: cl.uaBrowser,
      uaOs: cl.uaOs,
      geoCountry: cl.geoCountry,
      geoCity: cl.geoCity,
    })),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 200);

  return c.html(
    <DashboardView
      trackedItems={totalPixelsResult[0].count + totalLinksResult[0].count}
      activityToday={opensTodayResult[0].count + clicksTodayResult[0].count}
      activityAllTime={opensAllTimeResult[0].count + clicksAllTimeResult[0].count}
      unmatchedTotal={unmatchedAllTimeResult[0].count}
      recentActivity={activity}
      recentUnmatched={recentUnmatched}
      providers={providerList}
    />
  );
});
