import { Hono } from "hono";
import { dashboardRoutes } from "./routes/dashboard";
import { pixelRoutes } from "./routes/pixels";
import { linkRoutes } from "./routes/links";
import { providerRoutes } from "./routes/providers";
import { openRoutes } from "./routes/opens";
import { clickRoutes } from "./routes/clicks";
import { unmatchedRoutes } from "./routes/unmatched";
import { ipRoutes } from "./routes/ips";

export const managementApp = new Hono();

managementApp.route("/", dashboardRoutes);
managementApp.route("/pixels", pixelRoutes);
managementApp.route("/links", linkRoutes);
managementApp.route("/providers", providerRoutes);
managementApp.route("/opens", openRoutes);
managementApp.route("/clicks", clickRoutes);
managementApp.route("/unmatched", unmatchedRoutes);
managementApp.route("/ips", ipRoutes);
