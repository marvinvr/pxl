import { Hono } from "hono";
import { db } from "../../db/client";
import { pixels, opens, providers } from "../../db/schema";
import { eq, count, min, max, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { PixelListView } from "../views/pixels/list";
import { CreatePixelView } from "../views/pixels/create";
import { PixelDetailView } from "../views/pixels/detail";
import { EditPixelView } from "../views/pixels/edit";

export const pixelRoutes = new Hono();

// List all pixels
pixelRoutes.get("/", async (c) => {
  const pixelRows = await db
    .select({
      id: pixels.id,
      trackingId: pixels.trackingId,
      name: pixels.name,
      createdAt: pixels.createdAt,
    })
    .from(pixels)
    .orderBy(desc(pixels.createdAt));

  const pixelList = await Promise.all(
    pixelRows.map(async (p) => {
      const stats = await db
        .select({
          count: count(),
          firstOpen: min(opens.timestamp),
          lastOpen: max(opens.timestamp),
        })
        .from(opens)
        .where(eq(opens.pixelId, p.id));

      return {
        ...p,
        openCount: stats[0]?.count || 0,
        firstOpen: stats[0]?.firstOpen || null,
        lastOpen: stats[0]?.lastOpen || null,
      };
    })
  );

  return c.html(<PixelListView pixels={pixelList} />);
});

// New pixel form
pixelRoutes.get("/new", async (c) => {
  const providerList = await db
    .select({ id: providers.id, name: providers.name })
    .from(providers)
    .where(eq(providers.enabled, 1));

  return c.html(<CreatePixelView providers={providerList} />);
});

// Create pixel
pixelRoutes.post("/", async (c) => {
  const body = await c.req.parseBody();
  const name = String(body.name || "").trim();
  if (!name) return c.redirect("/pixels/new");

  const id = nanoid();
  const trackingId = nanoid(5);
  const now = Date.now();

  await db.insert(pixels).values({
    id,
    trackingId,
    name,
    providerId: body.providerId ? String(body.providerId) : null,
    notes: body.notes ? String(body.notes) : null,
    notifyOnEveryOpen: body.notifyOnEveryOpen ? 1 : 0,
    createdAt: now,
  });

  return c.redirect(`/pixels/${id}`);
});

// Edit form
pixelRoutes.get("/:id/edit", async (c) => {
  const id = c.req.param("id");
  const pixelRows = await db.select().from(pixels).where(eq(pixels.id, id)).limit(1);
  if (pixelRows.length === 0) return c.text("Not found", 404);

  const providerList = await db
    .select({ id: providers.id, name: providers.name })
    .from(providers)
    .where(eq(providers.enabled, 1));

  return c.html(<EditPixelView pixel={pixelRows[0]} providers={providerList} />);
});

// Update pixel
pixelRoutes.post("/:id/edit", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.parseBody();
  const name = String(body.name || "").trim();
  if (!name) return c.redirect(`/pixels/${id}/edit`);

  await db
    .update(pixels)
    .set({
      name,
      providerId: body.providerId ? String(body.providerId) : null,
      notes: body.notes ? String(body.notes) : null,
      notifyOnEveryOpen: body.notifyOnEveryOpen ? 1 : 0,
    })
    .where(eq(pixels.id, id));

  return c.redirect(`/pixels/${id}`);
});

// Pixel detail
pixelRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");

  const pixelRows = await db.select().from(pixels).where(eq(pixels.id, id)).limit(1);
  if (pixelRows.length === 0) return c.text("Not found", 404);

  const pixel = pixelRows[0];

  let providerName: string | null = null;
  if (pixel.providerId) {
    const providerRows = await db
      .select({ name: providers.name })
      .from(providers)
      .where(eq(providers.id, pixel.providerId))
      .limit(1);
    if (providerRows.length > 0) providerName = providerRows[0].name;
  }

  const opensList = await db
    .select({
      id: opens.id,
      timestamp: opens.timestamp,
      ip: opens.ip,
      uaBrowser: opens.uaBrowser,
      uaOs: opens.uaOs,
      uaDevice: opens.uaDevice,
    })
    .from(opens)
    .where(eq(opens.pixelId, id))
    .orderBy(desc(opens.timestamp));

  return c.html(
    <PixelDetailView
      pixel={{ ...pixel, providerName }}
      opens={opensList}
    />
  );
});

// Delete pixel
pixelRoutes.post("/:id/delete", async (c) => {
  const id = c.req.param("id");
  await db.delete(pixels).where(eq(pixels.id, id));
  return c.redirect("/pixels");
});
