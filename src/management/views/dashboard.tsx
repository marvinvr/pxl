import type { FC } from "hono/jsx";
import { Layout } from "./layout";

interface UnmatchedItem {
  id: string;
  timestamp: number;
  requestedPath: string;
  ip: string | null;
  userAgent: string | null;
}

interface DashboardProps {
  totalPixels: number;
  opensToday: number;
  opensAllTime: number;
  unmatchedToday: number;
  recentOpens: {
    id: string;
    timestamp: number;
    pixelName: string;
    ip: string | null;
    uaBrowser: string | null;
    uaOs: string | null;
    geoCountry: string | null;
    geoCity: string | null;
  }[];
  recentUnmatched: UnmatchedItem[];
}

export const DashboardView: FC<DashboardProps> = (props) => {
  return (
    <Layout title="Dashboard">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold">Dashboard</h1>
      </div>

      {/* Stats */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Pixels" value={props.totalPixels} />
        <StatCard label="Opens Today" value={props.opensToday} />
        <StatCard label="Opens All Time" value={props.opensAllTime} />
        <StatCard label="Unmatched Today" value={props.unmatchedToday} accent />
      </div>

      {/* Recent Opens */}
      <div class="bg-white border border-gray-200 rounded-md overflow-hidden mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold">Recent Opens</h2>
        </div>
        {props.recentOpens.length === 0 ? (
          <div class="px-6 py-8 text-center text-gray-400">No opens yet</div>
        ) : (
          <table class="w-full">
            <thead>
              <tr class="text-left text-xs font-mono uppercase tracking-wider text-gray-400 border-b border-gray-200">
                <th class="px-6 py-3 font-medium">Time</th>
                <th class="px-6 py-3 font-medium">Pixel</th>
                <th class="px-6 py-3 font-medium">IP</th>
                <th class="px-6 py-3 font-medium">Location</th>
                <th class="px-6 py-3 font-medium">Browser</th>
                <th class="px-6 py-3 font-medium">OS</th>
              </tr>
            </thead>
            <tbody>
              {props.recentOpens.map((o) => {
                const location = [o.geoCity, o.geoCountry].filter(Boolean).join(", ");
                return (
                  <tr class="border-b border-gray-100">
                    <td class="px-6 py-3 text-sm font-mono">
                      <a href={`/opens/${o.id}`} class="text-blue-600 hover:text-blue-800">
                        {new Date(o.timestamp).toLocaleString()}
                      </a>
                    </td>
                    <td class="px-6 py-3 text-sm">{o.pixelName}</td>
                    <td class="px-6 py-3 text-sm font-mono text-gray-500">{o.ip || "—"}</td>
                    <td class="px-6 py-3 text-sm text-gray-500">{location || "—"}</td>
                    <td class="px-6 py-3 text-sm text-gray-500">{o.uaBrowser || "—"}</td>
                    <td class="px-6 py-3 text-sm text-gray-500">{o.uaOs || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Unmatched Requests */}
      <div class="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-semibold">Unmatched Requests</h2>
            <span class="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded font-medium">
              Pixel hits with no matching tracking ID
            </span>
          </div>
          <div class="flex items-center gap-2">
            <form method="POST" action="/unmatched/clear-old">
              <button
                type="submit"
                onclick="return confirm('Clear requests older than 30 days?')"
                class="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-xs text-gray-600 rounded transition-colors"
              >
                Clear &gt; 30d
              </button>
            </form>
            <form method="POST" action="/unmatched/clear-all">
              <button
                type="submit"
                onclick="return confirm('Clear ALL unmatched requests?')"
                class="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-xs text-red-600 border border-red-200 rounded transition-colors"
              >
                Clear All
              </button>
            </form>
          </div>
        </div>
        {props.recentUnmatched.length === 0 ? (
          <div class="px-6 py-6 text-center text-gray-400 text-sm">No unmatched requests</div>
        ) : (
          <table class="w-full">
            <thead>
              <tr class="text-left text-xs font-mono uppercase tracking-wider text-gray-400 border-b border-gray-200">
                <th class="px-6 py-3 font-medium">Time</th>
                <th class="px-6 py-3 font-medium">Path</th>
                <th class="px-6 py-3 font-medium">IP</th>
                <th class="px-6 py-3 font-medium">User-Agent</th>
              </tr>
            </thead>
            <tbody>
              {props.recentUnmatched.map((r) => (
                <tr class="border-b border-gray-100">
                  <td class="px-6 py-3 text-sm font-mono">
                    <a href={`/unmatched/${r.id}`} class="text-yellow-700 hover:text-yellow-900">
                      {new Date(r.timestamp).toLocaleString()}
                    </a>
                  </td>
                  <td class="px-6 py-3 text-sm font-mono text-gray-600">{r.requestedPath}</td>
                  <td class="px-6 py-3 text-sm font-mono text-gray-500">{r.ip || "—"}</td>
                  <td class="px-6 py-3 text-sm text-gray-500 max-w-xs truncate">{r.userAgent || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

const StatCard: FC<{ label: string; value: number; accent?: boolean }> = ({ label, value, accent }) => (
  <div class={`bg-white border rounded-md p-4 ${accent && value > 0 ? "border-yellow-300" : "border-gray-200"}`}>
    <div class="text-sm text-gray-500 mb-1">{label}</div>
    <div class={`text-3xl font-bold font-mono ${accent && value > 0 ? "text-yellow-600" : ""}`}>{value}</div>
  </div>
);
