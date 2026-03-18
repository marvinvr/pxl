import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { config } from "../config";
import * as schema from "./schema";
import { mkdirSync } from "fs";

mkdirSync(config.dataDir, { recursive: true });

const sqlite = new Database(`${config.dataDir}/pxl.db`);
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.exec("PRAGMA foreign_keys = ON;");

export const db = drizzle(sqlite, { schema });
