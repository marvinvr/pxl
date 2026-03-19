import { Hono } from "hono";
import { db } from "../../db/client";
import { links, clicks, providers, ipAddresses } from "../../db/schema";
import { eq, count, max, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { LinkListView } from "../views/links/list";
import { CreateLinkView } from "../views/links/create";
import { LinkDetailView } from "../views/links/detail";
import { EditLinkView } from "../views/links/edit";
import { config } from "../../config";

export const linkRoutes = new Hono();

// List all links
linkRoutes.get("/", async (c) => {
  const linkRows = await db
    .select({
      id: links.id,
      shortCode: links.shortCode,
      targetUrl: links.targetUrl,
      name: links.name,
      createdAt: links.createdAt,
    })
    .from(links)
    .orderBy(desc(links.createdAt));

  const linkList = await Promise.all(
    linkRows.map(async (l) => {
      const stats = await db
        .select({
          count: count(),
          lastClick: max(clicks.timestamp),
        })
        .from(clicks)
        .where(eq(clicks.linkId, l.id));

      return {
        ...l,
        clickCount: stats[0]?.count || 0,
        lastClick: stats[0]?.lastClick || null,
      };
    })
  );

  return c.html(<LinkListView links={linkList} />);
});

// New link form
linkRoutes.get("/new", async (c) => {
  const providerList = await db
    .select({ id: providers.id, name: providers.name })
    .from(providers)
    .where(eq(providers.enabled, 1));

  return c.html(<CreateLinkView providers={providerList} />);
});

// Create link
linkRoutes.post("/", async (c) => {
  const body = await c.req.parseBody();
  const targetUrl = String(body.targetUrl || "").trim();
  if (!targetUrl) return c.redirect("/links/new");

  let name = String(body.name || "").trim();
  if (!name) {
    try {
      const u = new URL(targetUrl);
      name = u.hostname + (u.pathname !== "/" ? u.pathname : "");
    } catch {
      name = targetUrl;
    }
  }

  const id = nanoid();
  const shortCode = nanoid(7);
  const now = Date.now();

  await db.insert(links).values({
    id,
    shortCode,
    targetUrl,
    name,
    providerId: body.providerId ? String(body.providerId) : null,
    notes: body.notes ? String(body.notes) : null,
    notifyOnEveryClick: body.notifyOnEveryClick ? 1 : 0,
    createdAt: now,
  });

  return c.redirect(`/links/${id}`);
});

// Quick shorten (HTMX endpoint from dashboard)
linkRoutes.post("/quick", async (c) => {
  const body = await c.req.parseBody();
  const targetUrl = String(body.targetUrl || "").trim();
  if (!targetUrl) {
    return c.html(
      <div class="text-red-600 text-sm mt-2">Please enter a URL</div>
    );
  }

  let name = String(body.name || "").trim();
  if (!name) {
    try {
      const u = new URL(targetUrl);
      name = u.hostname + (u.pathname !== "/" ? u.pathname : "");
    } catch {
      name = targetUrl;
    }
  }

  const id = nanoid();
  const shortCode = nanoid(7);
  const now = Date.now();

  await db.insert(links).values({
    id,
    shortCode,
    targetUrl,
    name,
    providerId: body.providerId ? String(body.providerId) : null,
    notes: null,
    notifyOnEveryClick: body.notifyOnEveryClick ? 1 : 0,
    createdAt: now,
  });

  const shortUrl = `${config.baseUrl}/l/${shortCode}`;

  return c.html(
    <div class="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
      <div class="flex items-center gap-2">
        <code class="text-sm font-mono text-gray-800 flex-1">{shortUrl}</code>
        <button
          onclick={`navigator.clipboard.writeText('${shortUrl}');this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)`}
          class="px-2.5 py-1 text-xs font-mono tracking-wide transition-colors cursor-pointer bg-gray-900 hover:bg-gray-800 text-white rounded shrink-0"
        >
          Copy
        </button>
        <a href={`/links/${id}`} class="text-xs font-mono text-gray-500 hover:text-gray-900 transition-colors shrink-0">
          View
        </a>
      </div>
    </div>
  );
});

// Edit form
linkRoutes.get("/:id/edit", async (c) => {
  const id = c.req.param("id");
  const linkRows = await db.select().from(links).where(eq(links.id, id)).limit(1);
  if (linkRows.length === 0) return c.text("Not found", 404);

  const providerList = await db
    .select({ id: providers.id, name: providers.name })
    .from(providers)
    .where(eq(providers.enabled, 1));

  return c.html(<EditLinkView link={linkRows[0]} providers={providerList} />);
});

// Update link
linkRoutes.post("/:id/edit", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.parseBody();
  const targetUrl = String(body.targetUrl || "").trim();
  const name = String(body.name || "").trim();
  if (!targetUrl || !name) return c.redirect(`/links/${id}/edit`);

  await db
    .update(links)
    .set({
      targetUrl,
      name,
      providerId: body.providerId ? String(body.providerId) : null,
      notes: body.notes ? String(body.notes) : null,
      notifyOnEveryClick: body.notifyOnEveryClick ? 1 : 0,
    })
    .where(eq(links.id, id));

  return c.redirect(`/links/${id}`);
});

// Link detail
linkRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");

  const linkRows = await db.select().from(links).where(eq(links.id, id)).limit(1);
  if (linkRows.length === 0) return c.text("Not found", 404);

  const link = linkRows[0];

  let providerName: string | null = null;
  if (link.providerId) {
    const providerRows = await db
      .select({ name: providers.name })
      .from(providers)
      .where(eq(providers.id, link.providerId))
      .limit(1);
    if (providerRows.length > 0) providerName = providerRows[0].name;
  }

  const clicksList = await db
    .select({
      id: clicks.id,
      timestamp: clicks.timestamp,
      ipAddressId: ipAddresses.id,
      ip: ipAddresses.ip,
      uaBrowser: clicks.uaBrowser,
      uaOs: clicks.uaOs,
      uaDevice: clicks.uaDevice,
      geoCountry: ipAddresses.geoCountry,
      geoCity: ipAddresses.geoCity,
    })
    .from(clicks)
    .leftJoin(ipAddresses, eq(clicks.ipAddressId, ipAddresses.id))
    .where(eq(clicks.linkId, id))
    .orderBy(desc(clicks.timestamp));

  return c.html(
    <LinkDetailView
      link={{ ...link, providerName }}
      clicks={clicksList}
    />
  );
});

// Delete link
linkRoutes.post("/:id/delete", async (c) => {
  const id = c.req.param("id");
  await db.delete(links).where(eq(links.id, id));
  return c.redirect("/links");
});
