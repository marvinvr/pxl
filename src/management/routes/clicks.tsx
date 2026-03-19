import { Hono } from "hono";
import { db } from "../../db/client";
import { clicks, links, ipAddresses } from "../../db/schema";
import { eq, lte, count, and } from "drizzle-orm";
import { ClickDetailView } from "../views/clicks/detail";

export const clickRoutes = new Hono();

clickRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");

  const clickRows = await db
    .select({
      id: clicks.id,
      linkId: clicks.linkId,
      ipAddressId: clicks.ipAddressId,
      timestamp: clicks.timestamp,
      userAgent: clicks.userAgent,
      uaBrowser: clicks.uaBrowser,
      uaOs: clicks.uaOs,
      uaDevice: clicks.uaDevice,
      referer: clicks.referer,
      acceptLanguage: clicks.acceptLanguage,
      rawHeaders: clicks.rawHeaders,
      rawUrl: clicks.rawUrl,
      rawMethod: clicks.rawMethod,
      ip: ipAddresses.ip,
      ipId: ipAddresses.id,
      geoCountry: ipAddresses.geoCountry,
      geoCity: ipAddresses.geoCity,
      geoRegion: ipAddresses.geoRegion,
    })
    .from(clicks)
    .leftJoin(ipAddresses, eq(clicks.ipAddressId, ipAddresses.id))
    .where(eq(clicks.id, id))
    .limit(1);

  if (clickRows.length === 0) return c.text("Not found", 404);

  const click = clickRows[0];

  // Get link name
  const linkRows = await db
    .select({ name: links.name })
    .from(links)
    .where(eq(links.id, click.linkId))
    .limit(1);

  const linkName = linkRows.length > 0 ? linkRows[0].name : "Unknown";

  // Calculate click sequence number
  const clickNumberResult = await db
    .select({ count: count() })
    .from(clicks)
    .where(and(eq(clicks.linkId, click.linkId), lte(clicks.timestamp, click.timestamp)));

  const clickNumber = clickNumberResult[0]?.count || 1;

  return c.html(
    <ClickDetailView
      click={{ ...click, linkName }}
      clickNumber={clickNumber}
    />
  );
});
