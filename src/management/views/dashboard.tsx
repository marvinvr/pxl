import type { FC } from "hono/jsx";
import { Layout } from "./layout";
import { Btn } from "./button";
import { TypeBadge } from "./type-badge";
import { IpLink } from "./ip-link";
import { DataTable } from "./data-table";

interface UnmatchedItem {
  id: string;
  timestamp: number;
  requestedPath: string;
  ipAddressId: number | null;
  ip: string | null;
  userAgent: string | null;
}

interface ActivityItem {
  type: "open" | "click";
  id: string;
  timestamp: number;
  name: string;
  ipAddressId: number | null;
  ip: string | null;
  uaBrowser: string | null;
  uaOs: string | null;
  geoCountry: string | null;
  geoCity: string | null;
}

interface DashboardProps {
  trackedItems: number;
  activityToday: number;
  activityAllTime: number;
  unmatchedTotal: number;
  recentActivity: ActivityItem[];
  recentUnmatched: UnmatchedItem[];
  providers: { id: string; name: string }[];
}

export const DashboardView: FC<DashboardProps> = (props) => {
  return (
    <Layout title="Dashboard">
      {/* Stats */}
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Tracked" value={props.trackedItems} />
        <StatCard label="Today" value={props.activityToday} />
        <StatCard label="All Time" value={props.activityAllTime} />
        <StatCard label="Unmatched" value={props.unmatchedTotal} />
      </div>

      {/* Quick Shorten */}
      <div class="bg-white border border-gray-200 rounded-md p-4 mb-8">
        <h2 class="text-lg font-semibold mb-3">Quick Shorten</h2>
        <form
          hx-post="/links/quick"
          hx-target="#quick-shorten-result"
          hx-swap="innerHTML"
        >
          {props.providers.length > 0 && (
            <input type="hidden" name="providerId" value={props.providers[0].id} />
          )}
          <input type="hidden" name="notifyOnEveryClick" value="1" />
          <div class="flex gap-3">
            <input
              type="url"
              name="targetUrl"
              required
              placeholder="Paste a URL to shorten"
              class="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Btn type="submit" class="shrink-0">Shorten</Btn>
          </div>
        </form>
        <div id="quick-shorten-result"></div>
      </div>

      {/* Recent Activity */}
      <div class="bg-white border border-gray-200 rounded-md overflow-hidden mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold">Recent Activity</h2>
        </div>
        <DataTable
          columns={["Time", "Type", "Name", "IP", "Location", "Browser", "OS"]}
          empty="No activity yet"
          pageSize={10}
        >
          {props.recentActivity.map((a) => {
            const location = [a.geoCity, a.geoCountry].filter(Boolean).join(", ");
            const detailUrl = a.type === "open" ? `/opens/${a.id}` : `/clicks/${a.id}`;
            return (
              <tr
                class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                hx-get={detailUrl} hx-push-url="true" hx-target="body" hx-swap="innerHTML"
              >
                <td class="px-6 py-3 text-sm font-mono">
                  {new Date(a.timestamp).toLocaleString()}
                </td>
                <td class="px-6 py-3 text-sm">
                  <TypeBadge type={a.type} />
                </td>
                <td class="px-6 py-3 text-sm">{a.name}</td>
                <td class="px-6 py-3 text-sm font-mono text-gray-500">
                  <IpLink ipAddressId={a.ipAddressId} ip={a.ip} />
                </td>
                <td class="px-6 py-3 text-sm text-gray-500">{location || "\u2014"}</td>
                <td class="px-6 py-3 text-sm text-gray-500">{a.uaBrowser || "\u2014"}</td>
                <td class="px-6 py-3 text-sm text-gray-500">{a.uaOs || "\u2014"}</td>
              </tr>
            );
          })}
        </DataTable>
      </div>

      {/* Unmatched Requests */}
      <div class="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-semibold">Unmatched Requests</h2>
            <span class="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded font-medium">
              Hits with no matching ID
            </span>
          </div>
          <div class="flex items-center gap-2">
            <form method="POST" action="/unmatched/clear-old">
              <Btn type="submit" variant="secondary" size="sm" onclick="return confirm('Clear requests older than 30 days?')">
                Clear &gt; 30d
              </Btn>
            </form>
            <form method="POST" action="/unmatched/clear-all">
              <Btn type="submit" variant="danger" size="sm" onclick="return confirm('Clear ALL unmatched requests?')">
                Clear All
              </Btn>
            </form>
          </div>
        </div>
        <DataTable
          columns={["Time", "Path", "IP", "User-Agent"]}
          empty="No unmatched requests"
          pageSize={5}
        >
          {props.recentUnmatched.map((r) => (
            <tr
              class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              hx-get={`/unmatched/${r.id}`} hx-push-url="true" hx-target="body" hx-swap="innerHTML"
            >
              <td class="px-6 py-3 text-sm font-mono">
                {new Date(r.timestamp).toLocaleString()}
              </td>
              <td class="px-6 py-3 text-sm font-mono text-gray-600">{r.requestedPath}</td>
              <td class="px-6 py-3 text-sm font-mono text-gray-500">
                <IpLink ipAddressId={r.ipAddressId} ip={r.ip} />
              </td>
              <td class="px-6 py-3 text-sm text-gray-500 max-w-xs truncate">{r.userAgent || "\u2014"}</td>
            </tr>
          ))}
        </DataTable>
      </div>
    </Layout>
  );
};

const StatCard: FC<{ label: string; value: number }> = ({ label, value }) => (
  <div class="bg-white border border-gray-200 rounded-md p-4">
    <div class="text-sm text-gray-500 mb-1">{label}</div>
    <div class="text-3xl font-bold font-mono">{value}</div>
  </div>
);
