import { Hono } from "hono";
import { nanoid } from "nanoid";
import { db } from "../db/client";
import { pixels, opens, unmatchedRequests } from "../db/schema";
import { eq, count } from "drizzle-orm";
import { parseUA } from "../services/ua";
import { sendNotification, type NotifyPayload } from "../services/notify";
import { providers } from "../db/schema";
import type { Server } from "bun";

// 1x1 transparent PNG (68 bytes)
const TRANSPARENT_PIXEL = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
  0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x62, 0x00, 0x00, 0x00, 0x02,
  0x00, 0x01, 0xe2, 0x21, 0xbc, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
  0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

const PIXEL_HEADERS = {
  "Content-Type": "image/png",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

// Simple TTL cache for tracking ID -> pixel lookups
type PixelRow = typeof pixels.$inferSelect;
const pixelCache = new Map<string, { pixel: PixelRow; expiry: number }>();
const CACHE_TTL = 60_000; // 1 minute

function getCachedPixel(trackingId: string): PixelRow | null {
  const cached = pixelCache.get(trackingId);
  if (cached && cached.expiry > Date.now()) {
    return cached.pixel;
  }
  if (cached) pixelCache.delete(trackingId);
  return null;
}

function setCachedPixel(trackingId: string, pixel: PixelRow): void {
  pixelCache.set(trackingId, { pixel, expiry: Date.now() + CACHE_TTL });
  setTimeout(() => pixelCache.delete(trackingId), CACHE_TTL);
}

function getConnectionInfo(c: any): { address: string; family: string; port: number } | null {
  try {
    const server = c.env as Server;
    return server?.requestIP?.(c.req.raw) || null;
  } catch {
    return null;
  }
}

// Try every common proxy/CDN header, fall back to socket IP
function extractIp(c: any): string {
  const h = (name: string) => c.req.header(name);
  // Cloudflare
  const cfIp = h("cf-connecting-ip");
  if (cfIp) return cfIp;
  // Akamai / Cloudflare enterprise
  const trueClient = h("true-client-ip");
  if (trueClient) return trueClient;
  // Standard proxy
  const xff = h("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  // nginx
  const xri = h("x-real-ip");
  if (xri) return xri;
  // Less common
  const xci = h("x-client-ip");
  if (xci) return xci;
  // RFC 7239
  const fwd = h("forwarded");
  if (fwd) {
    const match = fwd.match(/for="?([^";,\s]+)"?/i);
    if (match) return match[1];
  }
  // Socket IP
  return getConnectionInfo(c)?.address || "unknown";
}

function collectRequestData(c: any) {
  const headers: Record<string, string> = {};
  c.req.raw.headers.forEach((value: string, key: string) => {
    headers[key] = value;
  });
  // Inject connection-level metadata (not in HTTP headers)
  const conn = getConnectionInfo(c);
  if (conn) {
    headers["_socket_ip"] = conn.address;
    headers["_socket_family"] = conn.family;
    headers["_socket_port"] = String(conn.port);
  }
  return {
    ip: extractIp(c),
    userAgent: c.req.header("user-agent") || null,
    referer: c.req.header("referer") || null,
    acceptLanguage: c.req.header("accept-language") || null,
    rawHeaders: JSON.stringify(headers),
    rawUrl: c.req.url,
    rawMethod: c.req.method,
  };
}

export const trackerApp = new Hono();

// Match /px/<anything> — parse trackingId ourselves to avoid Hono suffix quirks
trackerApp.get("/px/:filename", (c) => {
  const filename = c.req.param("filename");

  // Only handle .png requests
  if (!filename.endsWith(".png")) {
    return c.text("Not Found", 404);
  }

  const trackingId = filename.slice(0, -4); // strip .png
  if (!trackingId) {
    return c.text("Not Found", 404);
  }

  // Grab everything we can about this request right now
  const req = collectRequestData(c);

  // Fire and forget
  (async () => {
    try {
      let pixel = getCachedPixel(trackingId);
      if (!pixel) {
        const rows = await db
          .select()
          .from(pixels)
          .where(eq(pixels.trackingId, trackingId))
          .limit(1);
        if (rows.length > 0) {
          pixel = rows[0];
          setCachedPixel(trackingId, pixel);
        }
      }

      if (pixel) {
        const ua = parseUA(req.userAgent);
        const now = Date.now();

        await db.insert(opens).values({
          id: nanoid(),
          pixelId: pixel.id,
          timestamp: now,
          ip: req.ip,
          userAgent: req.userAgent,
          uaBrowser: ua.browser,
          uaOs: ua.os,
          uaDevice: ua.device,
          referer: req.referer,
          acceptLanguage: req.acceptLanguage,
          rawHeaders: req.rawHeaders,
          rawUrl: req.rawUrl,
          rawMethod: req.rawMethod,
        });

        // Check if notification should fire
        if (pixel.providerId) {
          const providerRows = await db
            .select()
            .from(providers)
            .where(eq(providers.id, pixel.providerId))
            .limit(1);

          if (providerRows.length > 0 && providerRows[0].enabled) {
            const provider = providerRows[0];

            const openCount = await db
              .select({ count: count() })
              .from(opens)
              .where(eq(opens.pixelId, pixel.id));

            const totalOpens = openCount[0]?.count || 1;
            const isFirstOpen = totalOpens === 1;

            if (isFirstOpen || pixel.notifyOnEveryOpen) {
              const payload: NotifyPayload = {
                pixelName: pixel.name,
                recipientHint: pixel.recipientHint,
                ip: req.ip,
                browser: ua.browser || "Unknown",
                os: ua.os || "Unknown",
                totalOpens,
                timestamp: new Date(now).toISOString(),
              };

              await sendNotification(
                provider.type,
                JSON.parse(provider.config),
                payload
              );
            }
          }
        }
      } else {
        await db.insert(unmatchedRequests).values({
          id: nanoid(),
          timestamp: Date.now(),
          requestedPath: `/px/${trackingId}.png`,
          ip: req.ip,
          userAgent: req.userAgent,
          referer: req.referer,
          rawHeaders: req.rawHeaders,
        });
      }
    } catch (err) {
      console.error("Tracker error:", err);
    }
  })();

  return c.body(TRANSPARENT_PIXEL, 200, PIXEL_HEADERS);
});

// Catch-all: 404 everything else, no logging
trackerApp.all("*", (c) => {
  return c.text("Not Found", 404);
});
