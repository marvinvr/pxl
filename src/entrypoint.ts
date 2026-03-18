import { config } from "./config";
import { managementApp } from "./management/app";
import { trackerApp } from "./tracker/app";

// Run migrations on startup
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db } from "./db/client";

migrate(db, { migrationsFolder: "./drizzle" });

console.log(`[pxl] Starting...`);
console.log(`[pxl] Data directory: ${config.dataDir}`);
console.log(`[pxl] Base URL: ${config.baseUrl}`);

const mgmtServer = Bun.serve({
  port: config.mgmtPort,
  fetch: managementApp.fetch,
});

const trackerServer = Bun.serve({
  port: config.trackerPort,
  fetch: trackerApp.fetch,
});

console.log(`[pxl] Management UI: http://localhost:${mgmtServer.port}`);
console.log(`[pxl] Pixel server:  http://localhost:${trackerServer.port}`);
