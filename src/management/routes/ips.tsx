import { Hono } from "hono";
import { db } from "../../db/client";
import { ipAddresses, opens, clicks, unmatchedRequests, pixels, links } from "../../db/schema";
import { eq, desc, count } from "drizzle-orm";
import { IpListView } from "../views/ips/list";
import { IpDetailView, MuteButton } from "../views/ips/detail";

export const ipRoutes = new Hono();

// List all IPs
ipRoutes.get("/", async (c) => {
  const ipRows = await db
    .select()
    .from(ipAddresses)
    .orderBy(desc(ipAddresses.lastSeenAt));

  const ipList = await Promise.all(
    ipRows.map(async (ip) => {
      const [openCount, clickCount, unmatchedCount] = await Promise.all([
        db.select({ count: count() }).from(opens).where(eq(opens.ipAddressId, ip.id)),
        db.select({ count: count() }).from(clicks).where(eq(clicks.ipAddressId, ip.id)),
        db.select({ count: count() }).from(unmatchedRequests).where(eq(unmatchedRequests.ipAddressId, ip.id)),
      ]);

      return {
        ...ip,
        openCount: openCount[0]?.count || 0,
        clickCount: clickCount[0]?.count || 0,
        unmatchedCount: unmatchedCount[0]?.count || 0,
      };
    })
  );

  return c.html(<IpListView ips={ipList} />);
});

// IP detail
ipRoutes.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Not found", 404);

  const ipRows = await db
    .select()
    .from(ipAddresses)
    .where(eq(ipAddresses.id, id))
    .limit(1);

  if (ipRows.length === 0) return c.text("Not found", 404);
  const ip = ipRows[0];

  // Get all opens for this IP
  const opensList = await db
    .select({
      id: opens.id,
      timestamp: opens.timestamp,
      pixelId: opens.pixelId,
      uaBrowser: opens.uaBrowser,
      uaOs: opens.uaOs,
    })
    .from(opens)
    .where(eq(opens.ipAddressId, id))
    .orderBy(desc(opens.timestamp));

  // Get all clicks for this IP
  const clicksList = await db
    .select({
      id: clicks.id,
      timestamp: clicks.timestamp,
      linkId: clicks.linkId,
      uaBrowser: clicks.uaBrowser,
      uaOs: clicks.uaOs,
    })
    .from(clicks)
    .where(eq(clicks.ipAddressId, id))
    .orderBy(desc(clicks.timestamp));

  // Get all unmatched for this IP
  const unmatchedList = await db
    .select({
      id: unmatchedRequests.id,
      timestamp: unmatchedRequests.timestamp,
      requestedPath: unmatchedRequests.requestedPath,
    })
    .from(unmatchedRequests)
    .where(eq(unmatchedRequests.ipAddressId, id))
    .orderBy(desc(unmatchedRequests.timestamp));

  // Resolve pixel names
  const pixelIds = [...new Set(opensList.map((o) => o.pixelId))];
  const pixelMap = new Map<string, string>();
  if (pixelIds.length > 0) {
    const pixelRows = await db.select({ id: pixels.id, name: pixels.name }).from(pixels);
    for (const p of pixelRows) pixelMap.set(p.id, p.name);
  }

  // Resolve link names
  const linkIds = [...new Set(clicksList.map((cl) => cl.linkId))];
  const linkMap = new Map<string, string>();
  if (linkIds.length > 0) {
    const linkRows = await db.select({ id: links.id, name: links.name }).from(links);
    for (const l of linkRows) linkMap.set(l.id, l.name);
  }

  // Build combined activity timeline
  type ActivityItem = {
    type: "open" | "click" | "unmatched";
    id: string;
    timestamp: number;
    name: string;
    uaBrowser: string | null;
    uaOs: string | null;
  };

  const activity: ActivityItem[] = [
    ...opensList.map((o) => ({
      type: "open" as const,
      id: o.id,
      timestamp: o.timestamp,
      name: pixelMap.get(o.pixelId) || "Unknown",
      uaBrowser: o.uaBrowser,
      uaOs: o.uaOs,
    })),
    ...clicksList.map((cl) => ({
      type: "click" as const,
      id: cl.id,
      timestamp: cl.timestamp,
      name: linkMap.get(cl.linkId) || "Unknown",
      uaBrowser: cl.uaBrowser,
      uaOs: cl.uaOs,
    })),
    ...unmatchedList.map((u) => ({
      type: "unmatched" as const,
      id: u.id,
      timestamp: u.timestamp,
      name: u.requestedPath,
      uaBrowser: null,
      uaOs: null,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  return c.html(
    <IpDetailView
      ip={ip}
      activity={activity}
    />
  );
});

// Toggle mute
ipRoutes.post("/:id/mute", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Not found", 404);

  const rows = await db
    .select({ muted: ipAddresses.muted })
    .from(ipAddresses)
    .where(eq(ipAddresses.id, id))
    .limit(1);

  if (rows.length === 0) return c.text("Not found", 404);

  const newMuted = rows[0].muted ? 0 : 1;

  await db
    .update(ipAddresses)
    .set({ muted: newMuted })
    .where(eq(ipAddresses.id, id));

  return c.html(<MuteButton ipId={id} muted={newMuted} />);
});
