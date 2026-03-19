import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const providers = sqliteTable("providers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  config: text("config").notNull(),
  enabled: integer("enabled").default(1),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const ipAddresses = sqliteTable(
  "ip_addresses",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ip: text("ip").notNull(),
    geoCountry: text("geo_country"),
    geoCity: text("geo_city"),
    geoRegion: text("geo_region"),
    firstSeenAt: integer("first_seen_at").notNull(),
    lastSeenAt: integer("last_seen_at").notNull(),
    geoLookedUpAt: integer("geo_looked_up_at"),
    muted: integer("muted").notNull().default(0),
  },
  (table) => [
    uniqueIndex("ip_addresses_ip_idx").on(table.ip),
  ]
);

export const pixels = sqliteTable(
  "pixels",
  {
    id: text("id").primaryKey(),
    trackingId: text("tracking_id").notNull(),
    name: text("name").notNull(),
    providerId: text("provider_id").references(() => providers.id, { onDelete: "set null" }),
    recipientHint: text("recipient_hint"),
    notes: text("notes"),
    notifyOnEveryOpen: integer("notify_on_every_open").default(1),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("pixels_tracking_id_idx").on(table.trackingId),
  ]
);

export const opens = sqliteTable(
  "opens",
  {
    id: text("id").primaryKey(),
    pixelId: text("pixel_id")
      .notNull()
      .references(() => pixels.id, { onDelete: "cascade" }),
    ipAddressId: integer("ip_address_id").references(() => ipAddresses.id),
    timestamp: integer("timestamp").notNull(),
    userAgent: text("user_agent"),
    uaBrowser: text("ua_browser"),
    uaOs: text("ua_os"),
    uaDevice: text("ua_device"),
    referer: text("referer"),
    acceptLanguage: text("accept_language"),
    rawHeaders: text("raw_headers"),
    rawUrl: text("raw_url"),
    rawMethod: text("raw_method"),
  },
  (table) => [
    index("opens_pixel_id_idx").on(table.pixelId),
    index("opens_timestamp_idx").on(table.timestamp),
    index("opens_ip_address_id_idx").on(table.ipAddressId),
  ]
);

export const links = sqliteTable(
  "links",
  {
    id: text("id").primaryKey(),
    shortCode: text("short_code").notNull(),
    targetUrl: text("target_url").notNull(),
    name: text("name").notNull(),
    providerId: text("provider_id").references(() => providers.id, { onDelete: "set null" }),
    notes: text("notes"),
    notifyOnEveryClick: integer("notify_on_every_click").default(1),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("links_short_code_idx").on(table.shortCode),
  ]
);

export const clicks = sqliteTable(
  "clicks",
  {
    id: text("id").primaryKey(),
    linkId: text("link_id")
      .notNull()
      .references(() => links.id, { onDelete: "cascade" }),
    ipAddressId: integer("ip_address_id").references(() => ipAddresses.id),
    timestamp: integer("timestamp").notNull(),
    userAgent: text("user_agent"),
    uaBrowser: text("ua_browser"),
    uaOs: text("ua_os"),
    uaDevice: text("ua_device"),
    referer: text("referer"),
    acceptLanguage: text("accept_language"),
    rawHeaders: text("raw_headers"),
    rawUrl: text("raw_url"),
    rawMethod: text("raw_method"),
  },
  (table) => [
    index("clicks_link_id_idx").on(table.linkId),
    index("clicks_timestamp_idx").on(table.timestamp),
    index("clicks_ip_address_id_idx").on(table.ipAddressId),
  ]
);

export const unmatchedRequests = sqliteTable(
  "unmatched_requests",
  {
    id: text("id").primaryKey(),
    timestamp: integer("timestamp").notNull(),
    requestedPath: text("requested_path").notNull(),
    ipAddressId: integer("ip_address_id").references(() => ipAddresses.id),
    userAgent: text("user_agent"),
    referer: text("referer"),
    rawHeaders: text("raw_headers"),
  },
  (table) => [
    index("unmatched_requests_timestamp_idx").on(table.timestamp),
  ]
);
