import { db } from "../db/client";
import { ipAddresses } from "../db/schema";
import { eq } from "drizzle-orm";

export type IpAddressRow = typeof ipAddresses.$inferSelect;

export function upsertIp(ip: string): IpAddressRow {
  const now = Date.now();

  // Atomic upsert: insert new IP or update lastSeenAt if it already exists
  const result = db
    .insert(ipAddresses)
    .values({ ip, firstSeenAt: now, lastSeenAt: now })
    .onConflictDoUpdate({
      target: ipAddresses.ip,
      set: { lastSeenAt: now },
    })
    .returning()
    .get();

  return result;
}

export interface GeoResult {
  country: string | null;
  city: string | null;
  region: string | null;
}

const EMPTY: GeoResult = { country: null, city: null, region: null };

export async function resolveGeo(ipRow: IpAddressRow): Promise<GeoResult> {
  // Already have geo data cached in DB
  if (ipRow.geoCountry || ipRow.geoCity || ipRow.geoRegion) {
    return { country: ipRow.geoCountry, city: ipRow.geoCity, region: ipRow.geoRegion };
  }

  // Skip local/unknown IPs
  if (!ipRow.ip || ipRow.ip === "unknown" || ipRow.ip === "127.0.0.1" || ipRow.ip === "::1") {
    return EMPTY;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ipRow.ip)}?fields=status,country,regionName,city`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    const data = (await res.json()) as any;

    if (data.status === "success") {
      const geo: GeoResult = {
        country: data.country || null,
        city: data.city || null,
        region: data.regionName || null,
      };

      // Persist geo into the DB row
      db.update(ipAddresses)
        .set({
          geoCountry: geo.country,
          geoCity: geo.city,
          geoRegion: geo.region,
          geoLookedUpAt: Date.now(),
        })
        .where(eq(ipAddresses.id, ipRow.id))
        .run();

      return geo;
    }
  } catch {
    // Geo lookup failed — that's fine, notification still fires without location
  }

  return EMPTY;
}
