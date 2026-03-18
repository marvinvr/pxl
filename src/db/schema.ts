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

export const pixels = sqliteTable(
  "pixels",
  {
    id: text("id").primaryKey(),
    trackingId: text("tracking_id").notNull(),
    name: text("name").notNull(),
    providerId: text("provider_id").references(() => providers.id, { onDelete: "set null" }),
    recipientHint: text("recipient_hint"),
    notes: text("notes"),
    notifyOnEveryOpen: integer("notify_on_every_open").default(0),
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
    timestamp: integer("timestamp").notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    uaBrowser: text("ua_browser"),
    uaOs: text("ua_os"),
    uaDevice: text("ua_device"),
    referer: text("referer"),
    acceptLanguage: text("accept_language"),
    rawHeaders: text("raw_headers"),
    rawUrl: text("raw_url"),
    rawMethod: text("raw_method"),
    geoCountry: text("geo_country"),
    geoCity: text("geo_city"),
    geoRegion: text("geo_region"),
  },
  (table) => [
    index("opens_pixel_id_idx").on(table.pixelId),
    index("opens_timestamp_idx").on(table.timestamp),
  ]
);

export const unmatchedRequests = sqliteTable(
  "unmatched_requests",
  {
    id: text("id").primaryKey(),
    timestamp: integer("timestamp").notNull(),
    requestedPath: text("requested_path").notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    referer: text("referer"),
    rawHeaders: text("raw_headers"),
  },
  (table) => [
    index("unmatched_requests_timestamp_idx").on(table.timestamp),
  ]
);
