import { Hono } from "hono";
import { dashboardRoutes } from "./routes/dashboard";
import { pixelRoutes } from "./routes/pixels";
import { providerRoutes } from "./routes/providers";
import { openRoutes } from "./routes/opens";
import { unmatchedRoutes } from "./routes/unmatched";

export const managementApp = new Hono();

managementApp.route("/", dashboardRoutes);
managementApp.route("/pixels", pixelRoutes);
managementApp.route("/providers", providerRoutes);
managementApp.route("/opens", openRoutes);
managementApp.route("/unmatched", unmatchedRoutes);
