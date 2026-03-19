import { Hono } from "hono";
import { db } from "../../db/client";
import { unmatchedRequests, ipAddresses } from "../../db/schema";
import { eq, lt } from "drizzle-orm";
import { UnmatchedDetailView } from "../views/unmatched/detail";

export const unmatchedRoutes = new Hono();

// Detail
unmatchedRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");

  const rows = await db
    .select({
      id: unmatchedRequests.id,
      timestamp: unmatchedRequests.timestamp,
      requestedPath: unmatchedRequests.requestedPath,
      ipAddressId: ipAddresses.id,
      ip: ipAddresses.ip,
      userAgent: unmatchedRequests.userAgent,
      referer: unmatchedRequests.referer,
      rawHeaders: unmatchedRequests.rawHeaders,
    })
    .from(unmatchedRequests)
    .leftJoin(ipAddresses, eq(unmatchedRequests.ipAddressId, ipAddresses.id))
    .where(eq(unmatchedRequests.id, id))
    .limit(1);

  if (rows.length === 0) return c.text("Not found", 404);

  return c.html(<UnmatchedDetailView request={rows[0]} />);
});

// Clear all
unmatchedRoutes.post("/clear-all", async (c) => {
  await db.delete(unmatchedRequests);
  return c.redirect("/");
});

// Clear older than 30 days
unmatchedRoutes.post("/clear-old", async (c) => {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  await db.delete(unmatchedRequests).where(lt(unmatchedRequests.timestamp, thirtyDaysAgo));
  return c.redirect("/");
});
