import { Hono } from "hono";
import { db } from "../../db/client";
import { providers } from "../../db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { ProviderListView } from "../views/providers/list";
import { ProviderFormView, ConfigFields } from "../views/providers/form";
import { sendTestNotification } from "../../services/notify";

export const providerRoutes = new Hono();

// List
providerRoutes.get("/", async (c) => {
  const providerList = await db.select().from(providers);
  return c.html(<ProviderListView providers={providerList} />);
});

// New form
providerRoutes.get("/new", (c) => {
  return c.html(<ProviderFormView />);
});

// Config fields (HTMX endpoint)
providerRoutes.get("/config-fields", (c) => {
  const type = c.req.query("type") || "telegram";
  return c.html(<ConfigFields type={type} />);
});

// Create provider
providerRoutes.post("/", async (c) => {
  const body = await c.req.parseBody();
  const name = String(body.name || "").trim();
  const type = String(body.type || "").trim();
  if (!name || !type) return c.redirect("/providers/new");

  const config = extractConfig(type, body);

  await db.insert(providers).values({
    id: nanoid(),
    name,
    type,
    config: JSON.stringify(config),
    enabled: body.enabled ? 1 : 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return c.redirect("/providers");
});

// Edit form
providerRoutes.get("/:id/edit", async (c) => {
  const id = c.req.param("id");
  const rows = await db.select().from(providers).where(eq(providers.id, id)).limit(1);
  if (rows.length === 0) return c.text("Not found", 404);

  const provider = rows[0];
  let parsedConfig: Record<string, any> = {};
  try {
    parsedConfig = JSON.parse(provider.config);
  } catch {}

  return c.html(
    <ProviderFormView
      editing={{
        id: provider.id,
        name: provider.name,
        type: provider.type,
        config: parsedConfig,
        enabled: provider.enabled,
      }}
    />
  );
});

// Update provider
providerRoutes.post("/:id/edit", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.parseBody();
  const name = String(body.name || "").trim();
  const type = String(body.type || "").trim();
  if (!name || !type) return c.redirect(`/providers/${id}/edit`);

  const config = extractConfig(type, body);

  await db
    .update(providers)
    .set({
      name,
      type,
      config: JSON.stringify(config),
      enabled: body.enabled ? 1 : 0,
      updatedAt: Date.now(),
    })
    .where(eq(providers.id, id));

  return c.redirect("/providers");
});

// Toggle enabled
providerRoutes.post("/:id/toggle", async (c) => {
  const id = c.req.param("id");
  const rows = await db.select().from(providers).where(eq(providers.id, id)).limit(1);
  if (rows.length === 0) return c.text("Not found", 404);

  await db
    .update(providers)
    .set({ enabled: rows[0].enabled ? 0 : 1, updatedAt: Date.now() })
    .where(eq(providers.id, id));

  return c.redirect("/providers");
});

// Test notification
providerRoutes.post("/:id/test", async (c) => {
  const id = c.req.param("id");
  const rows = await db.select().from(providers).where(eq(providers.id, id)).limit(1);
  if (rows.length === 0) return c.html(<span class="text-red-400">Not found</span>);

  const provider = rows[0];
  let parsedConfig: Record<string, any> = {};
  try {
    parsedConfig = JSON.parse(provider.config);
  } catch {}

  const result = await sendTestNotification(provider.type, parsedConfig);

  if (result.success) {
    return c.html(<span class="text-green-400">Sent!</span>);
  } else {
    return c.html(<span class="text-red-400">Failed: {result.error}</span>);
  }
});

// Delete
providerRoutes.post("/:id/delete", async (c) => {
  const id = c.req.param("id");
  await db.delete(providers).where(eq(providers.id, id));
  return c.redirect("/providers");
});

function extractConfig(type: string, body: Record<string, any>): Record<string, any> {
  switch (type) {
    case "telegram":
      return {
        bot_token: String(body.config_bot_token || ""),
        chat_id: String(body.config_chat_id || ""),
      };
    case "ntfy":
      return { url: String(body.config_url || "") };
    case "discord":
      return { webhook_url: String(body.config_webhook_url || "") };
    case "slack":
      return { webhook_url: String(body.config_webhook_url || "") };
    case "webhook": {
      let headers = {};
      try {
        if (body.config_headers) headers = JSON.parse(String(body.config_headers));
      } catch {}
      return {
        url: String(body.config_url || ""),
        method: String(body.config_method || "POST"),
        headers,
      };
    }
    default:
      return {};
  }
}
