interface GeoResult {
  country: string | null;
  city: string | null;
  region: string | null;
}

const EMPTY: GeoResult = { country: null, city: null, region: null };
const cache = new Map<string, GeoResult>();

export async function lookupIp(ip: string): Promise<GeoResult> {
  if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1") {
    return EMPTY;
  }

  const cached = cache.get(ip);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    const data = await res.json() as any;

    const result: GeoResult =
      data.status === "success"
        ? { country: data.country || null, city: data.city || null, region: data.regionName || null }
        : EMPTY;

    cache.set(ip, result);
    return result;
  } catch {
    return EMPTY;
  }
}
