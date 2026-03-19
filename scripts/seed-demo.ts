#!/usr/bin/env bun
/**
 * Seed script for demo data. Run from repo root:
 *   bun scripts/seed-demo.ts
 *
 * Wipes the entire DB and inserts screenshot-friendly demo data.
 * Uses RFC 5737 documentation IPs (192.0.2.x, 198.51.100.x, 203.0.113.x).
 */

import { Database } from "bun:sqlite";
import { nanoid } from "nanoid";

const DB_PATH = `${process.env.PXL_DATA_DIR || "./data"}/pxl.db`;
const db = new Database(DB_PATH);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const now = Date.now();
const hour = 3_600_000;
const day = 86_400_000;
const ago = (seconds: number) => now - seconds;

function id() {
  return nanoid();
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------
const userAgents: { full: string; browser: string; os: string; device: string }[] = [
  {
    full: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    browser: "Chrome 122", os: "macOS", device: "desktop",
  },
  {
    full: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    browser: "Chrome 122", os: "Windows 10", device: "desktop",
  },
  {
    full: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1",
    browser: "Safari 17.3", os: "iOS 17.3", device: "mobile",
  },
  {
    full: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
    browser: "Safari 17.3", os: "macOS", device: "desktop",
  },
  {
    full: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
    browser: "Chrome 122", os: "Android 14", device: "mobile",
  },
  {
    full: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
    browser: "Firefox 123", os: "Windows 10", device: "desktop",
  },
  {
    full: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    browser: "Chrome 122", os: "Linux", device: "desktop",
  },
  {
    full: "Mozilla/5.0 (iPad; CPU OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1",
    browser: "Safari 17.3", os: "iPadOS 17.3", device: "tablet",
  },
  {
    full: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Thunderbird/123.0",
    browser: "Thunderbird 123", os: "macOS", device: "desktop",
  },
  {
    full: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
    browser: "Edge 122", os: "Windows 10", device: "desktop",
  },
];

const languages = [
  "en-US,en;q=0.9", "en-GB,en;q=0.9", "de-DE,de;q=0.9,en;q=0.8",
  "fr-FR,fr;q=0.9,en;q=0.8", "ja-JP,ja;q=0.9,en;q=0.8",
  "es-ES,es;q=0.9,en;q=0.8", "nl-NL,nl;q=0.9,en;q=0.8",
  "pt-BR,pt;q=0.9,en;q=0.8", "ko-KR,ko;q=0.9,en;q=0.8",
];

// RFC 5737 documentation ranges — safe for screenshots
const ips: { ip: string; country: string; city: string; region: string }[] = [
  { ip: "192.0.2.10",  country: "US", city: "San Francisco",  region: "California" },
  { ip: "192.0.2.22",  country: "US", city: "New York",       region: "New York" },
  { ip: "192.0.2.35",  country: "US", city: "Austin",         region: "Texas" },
  { ip: "192.0.2.41",  country: "US", city: "Chicago",        region: "Illinois" },
  { ip: "192.0.2.58",  country: "US", city: "Seattle",        region: "Washington" },
  { ip: "192.0.2.67",  country: "CA", city: "Toronto",        region: "Ontario" },
  { ip: "198.51.100.3",  country: "GB", city: "London",       region: "England" },
  { ip: "198.51.100.17", country: "DE", city: "Berlin",       region: "Berlin" },
  { ip: "198.51.100.28", country: "FR", city: "Paris",        region: "Île-de-France" },
  { ip: "198.51.100.44", country: "NL", city: "Amsterdam",    region: "North Holland" },
  { ip: "198.51.100.60", country: "SE", city: "Stockholm",    region: "Stockholm" },
  { ip: "203.0.113.5",   country: "JP", city: "Tokyo",        region: "Tokyo" },
  { ip: "203.0.113.19",  country: "SG", city: "Singapore",    region: "Central" },
  { ip: "203.0.113.33",  country: "AU", city: "Sydney",       region: "New South Wales" },
  { ip: "203.0.113.47",  country: "KR", city: "Seoul",        region: "Seoul" },
  { ip: "203.0.113.62",  country: "BR", city: "São Paulo",    region: "São Paulo" },
];

// ---------------------------------------------------------------------------
// Wipe everything
// ---------------------------------------------------------------------------
console.log("Wiping database...");
db.exec("DELETE FROM opens");
db.exec("DELETE FROM clicks");
db.exec("DELETE FROM unmatched_requests");
db.exec("DELETE FROM pixels");
db.exec("DELETE FROM links");
db.exec("DELETE FROM providers");
db.exec("DELETE FROM ip_addresses");

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------
console.log("Inserting providers...");
const providerRows = [
  { id: id(), name: "Telegram Alerts", type: "telegram", config: JSON.stringify({ bot_token: "7012345678:AAH_demo_token_not_real", chat_id: "-1001234567890" }), enabled: 1, createdAt: ago(30 * day), updatedAt: ago(2 * day) },
  { id: id(), name: "Discord #tracking", type: "discord", config: JSON.stringify({ webhook_url: "https://discord.com/api/webhooks/000000000000000000/demo-token" }), enabled: 1, createdAt: ago(25 * day), updatedAt: ago(25 * day) },
  { id: id(), name: "Slack Workspace", type: "slack", config: JSON.stringify({ webhook_url: "https://hooks.slack.com/services/T00000000/B00000000/xxxxxxxxxxxxxxxxxxxx" }), enabled: 0, createdAt: ago(20 * day), updatedAt: ago(10 * day) },
];

const insertProvider = db.prepare(
  "INSERT INTO providers (id, name, type, config, enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
);
for (const p of providerRows) {
  insertProvider.run(p.id, p.name, p.type, p.config, p.enabled, p.createdAt, p.updatedAt);
}

// ---------------------------------------------------------------------------
// IP Addresses
// ---------------------------------------------------------------------------
console.log("Inserting IP addresses...");
const insertIp = db.prepare(
  "INSERT INTO ip_addresses (ip, geo_country, geo_city, geo_region, first_seen_at, last_seen_at, geo_looked_up_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
);
const ipIdMap: Record<string, number> = {};
for (const entry of ips) {
  const firstSeen = ago(randBetween(5 * day, 20 * day));
  const lastSeen = ago(randBetween(0, 4 * day));
  const result = insertIp.run(entry.ip, entry.country, entry.city, entry.region, firstSeen, lastSeen, lastSeen);
  ipIdMap[entry.ip] = Number(result.lastInsertRowid);
}

// ---------------------------------------------------------------------------
// Pixels
// ---------------------------------------------------------------------------
console.log("Inserting pixels...");
const pixelRows = [
  { id: id(), trackingId: nanoid(12), name: "Q1 Product Launch",          providerId: providerRows[0].id, recipientHint: "john@acme.co",       notes: "Announcement email for Q1 product launch to key accounts",  notifyOnEveryOpen: 1, createdAt: ago(18 * day) },
  { id: id(), trackingId: nanoid(12), name: "Investor Update — March",    providerId: providerRows[0].id, recipientHint: "sarah@ventures.io",   notes: "Monthly investor update with Q1 projections",               notifyOnEveryOpen: 0, createdAt: ago(14 * day) },
  { id: id(), trackingId: nanoid(12), name: "Partnership Proposal",       providerId: providerRows[1].id, recipientHint: "mike@techcorp.com",   notes: "Strategic partnership proposal for API integration",        notifyOnEveryOpen: 1, createdAt: ago(12 * day) },
  { id: id(), trackingId: nanoid(12), name: "Job Offer — Sr. Engineer",   providerId: providerRows[0].id, recipientHint: "alex@candidate.dev",  notes: null,                                                        notifyOnEveryOpen: 1, createdAt: ago(10 * day) },
  { id: id(), trackingId: nanoid(12), name: "Contract Renewal",           providerId: providerRows[1].id, recipientHint: "legal@bigco.org",     notes: "Annual SaaS contract renewal for enterprise tier",          notifyOnEveryOpen: 1, createdAt: ago(7 * day) },
  { id: id(), trackingId: nanoid(12), name: "Newsletter Issue #47",       providerId: null,                recipientHint: null,                   notes: "Weekly product newsletter — broad distribution",            notifyOnEveryOpen: 0, createdAt: ago(3 * day) },
  { id: id(), trackingId: nanoid(12), name: "Onboarding Welcome",         providerId: providerRows[0].id, recipientHint: "nina@startup.io",     notes: "Automated onboarding email for new trial users",            notifyOnEveryOpen: 0, createdAt: ago(5 * day) },
  { id: id(), trackingId: nanoid(12), name: "Board Deck Follow-up",       providerId: providerRows[0].id, recipientHint: "david@capital.vc",    notes: "Follow-up after board meeting with updated financials",     notifyOnEveryOpen: 1, createdAt: ago(2 * day) },
];

const insertPixel = db.prepare(
  "INSERT INTO pixels (id, tracking_id, name, provider_id, recipient_hint, notes, notify_on_every_open, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);
for (const p of pixelRows) {
  insertPixel.run(p.id, p.trackingId, p.name, p.providerId, p.recipientHint, p.notes, p.notifyOnEveryOpen, p.createdAt);
}

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------
console.log("Inserting links...");
const linkRows = [
  { id: id(), shortCode: "portfolio",  targetUrl: "https://myportfolio.dev",                   name: "Portfolio Website",      providerId: providerRows[0].id, notes: "Personal portfolio link shared in outreach emails", notifyOnEveryClick: 1, createdAt: ago(16 * day) },
  { id: id(), shortCode: "case-study", targetUrl: "https://docs.example.com/case-study-q1.pdf", name: "Q1 Case Study PDF",     providerId: providerRows[1].id, notes: "Case study attached to partnership proposals",      notifyOnEveryClick: 1, createdAt: ago(13 * day) },
  { id: id(), shortCode: "pricing",    targetUrl: "https://product.example.com/pricing",        name: "Pricing Page",           providerId: providerRows[0].id, notes: null,                                                notifyOnEveryClick: 0, createdAt: ago(11 * day) },
  { id: id(), shortCode: "demo",       targetUrl: "https://app.example.com/demo",               name: "Live Demo",              providerId: null,               notes: "Interactive product demo for prospects",            notifyOnEveryClick: 1, createdAt: ago(8 * day) },
  { id: id(), shortCode: "cal",        targetUrl: "https://cal.example.com/meeting/30min",       name: "Meeting Scheduler",      providerId: providerRows[0].id, notes: "30-minute meeting booking link",                    notifyOnEveryClick: 1, createdAt: ago(6 * day) },
  { id: id(), shortCode: "blog-ai",    targetUrl: "https://blog.example.com/ai-roadmap-2026",    name: "AI Roadmap Blog Post",   providerId: providerRows[1].id, notes: "Blog post shared on social media and newsletters",  notifyOnEveryClick: 0, createdAt: ago(4 * day) },
];

const insertLink = db.prepare(
  "INSERT INTO links (id, short_code, target_url, name, provider_id, notes, notify_on_every_click, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);
for (const l of linkRows) {
  insertLink.run(l.id, l.shortCode, l.targetUrl, l.name, l.providerId, l.notes, l.notifyOnEveryClick, l.createdAt);
}

// ---------------------------------------------------------------------------
// Opens — spread realistically over the last 3 weeks
// ---------------------------------------------------------------------------
console.log("Inserting opens...");
const insertOpen = db.prepare(
  `INSERT INTO opens (id, pixel_id, ip_address_id, timestamp, user_agent, ua_browser, ua_os, ua_device, referer, accept_language, raw_headers, raw_url, raw_method)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

const openPatterns: { pixelIdx: number; count: number; spreadDays: number }[] = [
  { pixelIdx: 0, count: 14, spreadDays: 17 },  // Q1 Launch — popular
  { pixelIdx: 1, count: 6,  spreadDays: 13 },   // Investor Update
  { pixelIdx: 2, count: 9,  spreadDays: 11 },   // Partnership
  { pixelIdx: 3, count: 4,  spreadDays: 9 },    // Job Offer
  { pixelIdx: 4, count: 7,  spreadDays: 6 },    // Contract Renewal
  { pixelIdx: 5, count: 22, spreadDays: 3 },    // Newsletter — lots of opens
  { pixelIdx: 6, count: 3,  spreadDays: 4 },    // Onboarding
  { pixelIdx: 7, count: 5,  spreadDays: 2 },    // Board Deck
];

for (const pattern of openPatterns) {
  const pixel = pixelRows[pattern.pixelIdx];
  for (let i = 0; i < pattern.count; i++) {
    const ua = pick(userAgents);
    const ipEntry = pick(ips);
    const ts = ago(randBetween(0, pattern.spreadDays * day));
    insertOpen.run(
      id(), pixel.id, ipIdMap[ipEntry.ip], ts,
      ua.full, ua.browser, ua.os, ua.device,
      i % 5 === 0 ? "https://mail.google.com/" : null,
      pick(languages), null, `/t/${pixel.trackingId}`, "GET"
    );
  }
}

// ---------------------------------------------------------------------------
// Clicks — spread over last 2 weeks
// ---------------------------------------------------------------------------
console.log("Inserting clicks...");
const insertClick = db.prepare(
  `INSERT INTO clicks (id, link_id, ip_address_id, timestamp, user_agent, ua_browser, ua_os, ua_device, referer, accept_language, raw_headers, raw_url, raw_method)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

const clickPatterns: { linkIdx: number; count: number; spreadDays: number }[] = [
  { linkIdx: 0, count: 11, spreadDays: 15 },  // Portfolio
  { linkIdx: 1, count: 7,  spreadDays: 12 },  // Case Study
  { linkIdx: 2, count: 16, spreadDays: 10 },  // Pricing — high interest
  { linkIdx: 3, count: 20, spreadDays: 7 },   // Live Demo — most clicked
  { linkIdx: 4, count: 8,  spreadDays: 5 },   // Meeting Scheduler
  { linkIdx: 5, count: 34, spreadDays: 4 },   // Blog Post — viral
];

const referers = [
  "https://mail.google.com/", "https://outlook.live.com/", "https://twitter.com/",
  "https://linkedin.com/feed", "https://news.ycombinator.com/", null, null, null,
];

for (const pattern of clickPatterns) {
  const link = linkRows[pattern.linkIdx];
  for (let i = 0; i < pattern.count; i++) {
    const ua = pick(userAgents);
    const ipEntry = pick(ips);
    const ts = ago(randBetween(0, pattern.spreadDays * day));
    insertClick.run(
      id(), link.id, ipIdMap[ipEntry.ip], ts,
      ua.full, ua.browser, ua.os, ua.device,
      pick(referers), pick(languages), null, `/l/${link.shortCode}`, "GET"
    );
  }
}

// ---------------------------------------------------------------------------
// Unmatched Requests — random noise / scanners
// ---------------------------------------------------------------------------
console.log("Inserting unmatched requests...");
const insertUnmatched = db.prepare(
  "INSERT INTO unmatched_requests (id, timestamp, requested_path, ip_address_id, user_agent, referer, raw_headers) VALUES (?, ?, ?, ?, ?, ?, ?)"
);

const unmatchedPaths = [
  "/wp-admin/login.php", "/robots.txt", "/.env", "/favicon.ico",
  "/api/v1/health", "/.well-known/security.txt", "/xmlrpc.php",
  "/admin", "/login", "/t/expired-pixel-id",
  "/l/old-link", "/phpmyadmin/", "/.git/config",
];

const scannerUAs = [
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
  "curl/8.4.0",
  "python-requests/2.31.0",
  "Go-http-client/2.0",
  "Mozilla/5.0 zgrab/0.x",
];

for (let i = 0; i < 18; i++) {
  const ipEntry = pick(ips);
  const ts = ago(randBetween(0, 14 * day));
  insertUnmatched.run(
    id(), ts, pick(unmatchedPaths), ipIdMap[ipEntry.ip],
    pick(scannerUAs), null, null
  );
}

// ---------------------------------------------------------------------------
// Update IP last_seen_at to reflect actual usage
// ---------------------------------------------------------------------------
db.exec(`
  UPDATE ip_addresses SET last_seen_at = COALESCE(
    (SELECT MAX(ts) FROM (
      SELECT timestamp AS ts FROM opens WHERE ip_address_id = ip_addresses.id
      UNION ALL
      SELECT timestamp AS ts FROM clicks WHERE ip_address_id = ip_addresses.id
      UNION ALL
      SELECT timestamp AS ts FROM unmatched_requests WHERE ip_address_id = ip_addresses.id
    )),
    last_seen_at
  )
`);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
const counts = {
  providers: db.query("SELECT COUNT(*) as c FROM providers").get() as any,
  ipAddresses: db.query("SELECT COUNT(*) as c FROM ip_addresses").get() as any,
  pixels: db.query("SELECT COUNT(*) as c FROM pixels").get() as any,
  opens: db.query("SELECT COUNT(*) as c FROM opens").get() as any,
  links: db.query("SELECT COUNT(*) as c FROM links").get() as any,
  clicks: db.query("SELECT COUNT(*) as c FROM clicks").get() as any,
  unmatched: db.query("SELECT COUNT(*) as c FROM unmatched_requests").get() as any,
};

console.log("\nDemo data seeded successfully!");
console.log("─".repeat(35));
console.log(`  Providers:       ${counts.providers.c}`);
console.log(`  IP Addresses:    ${counts.ipAddresses.c}`);
console.log(`  Pixels:          ${counts.pixels.c}`);
console.log(`  Opens:           ${counts.opens.c}`);
console.log(`  Links:           ${counts.links.c}`);
console.log(`  Clicks:          ${counts.clicks.c}`);
console.log(`  Unmatched:       ${counts.unmatched.c}`);
console.log("─".repeat(35));

db.close();
