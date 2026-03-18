import { Hono } from "hono";
import { db } from "../../db/client";
import { opens, pixels } from "../../db/schema";
import { eq, lte, count, and } from "drizzle-orm";
import { OpenDetailView } from "../views/opens/detail";

export const openRoutes = new Hono();

openRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");

  const openRows = await db.select().from(opens).where(eq(opens.id, id)).limit(1);
  if (openRows.length === 0) return c.text("Not found", 404);

  const open = openRows[0];

  // Get pixel name
  const pixelRows = await db
    .select({ name: pixels.name })
    .from(pixels)
    .where(eq(pixels.id, open.pixelId))
    .limit(1);

  const pixelName = pixelRows.length > 0 ? pixelRows[0].name : "Unknown";

  // Calculate open sequence number (how many opens for this pixel up to and including this one)
  const openNumberResult = await db
    .select({ count: count() })
    .from(opens)
    .where(and(eq(opens.pixelId, open.pixelId), lte(opens.timestamp, open.timestamp)));

  const openNumber = openNumberResult[0]?.count || 1;

  return c.html(
    <OpenDetailView
      open={{ ...open, pixelName }}
      openNumber={openNumber}
    />
  );
});
