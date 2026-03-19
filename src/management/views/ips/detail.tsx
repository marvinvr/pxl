import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import { Btn } from "../button";
import { TypeBadge } from "../type-badge";
import { DataTable } from "../data-table";
import { BellIcon, BellOffIcon } from "../icons";

interface ActivityItem {
  type: "open" | "click" | "unmatched";
  id: string;
  timestamp: number;
  name: string;
  uaBrowser: string | null;
  uaOs: string | null;
}

interface IpDetailProps {
  ip: {
    id: number;
    ip: string;
    geoCountry: string | null;
    geoCity: string | null;
    geoRegion: string | null;
    firstSeenAt: number;
    lastSeenAt: number;
    geoLookedUpAt: number | null;
    muted: number;
  };
  activity: ActivityItem[];
}

export const IpDetailView: FC<IpDetailProps> = ({ ip, activity }) => {
  const location = [ip.geoCity, ip.geoRegion, ip.geoCountry].filter(Boolean).join(", ");

  return (
    <Layout title={ip.ip}>
      <div class="mb-8">
        <a href="/ips" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">&larr; Back to IPs</a>
        <div class="flex items-center justify-between mt-2">
          <div>
            <h1 class="text-2xl font-bold font-mono">{ip.ip}</h1>
            {location && <p class="text-gray-500 mt-1">{location}</p>}
          </div>
          <MuteButton ipId={ip.id} muted={ip.muted} />
        </div>
      </div>

      {/* IP Info */}
      <div class="bg-white border border-gray-200 rounded-md p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div class="text-sm text-gray-500 mb-1">Location</div>
            <div>{location || "\u2014"}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">First Seen</div>
            <div class="text-sm font-mono">{new Date(ip.firstSeenAt).toLocaleString()}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">Last Seen</div>
            <div class="text-sm font-mono">{new Date(ip.lastSeenAt).toLocaleString()}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">Total Activity</div>
            <div class="text-sm font-mono">{activity.length} events</div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div class="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold">Activity</h2>
        </div>
        <DataTable
          columns={["Time", "Type", "Name", "Browser", "OS"]}
          empty="No activity recorded"
          pageSize={10}
        >
          {activity.map((a) => {
            const detailUrl =
              a.type === "open"
                ? `/opens/${a.id}`
                : a.type === "click"
                ? `/clicks/${a.id}`
                : `/unmatched/${a.id}`;
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
                <td class="px-6 py-3 text-sm text-gray-500">{a.uaBrowser || "\u2014"}</td>
                <td class="px-6 py-3 text-sm text-gray-500">{a.uaOs || "\u2014"}</td>
              </tr>
            );
          })}
        </DataTable>
      </div>
    </Layout>
  );
};

export const MuteButton: FC<{ ipId: number; muted: number }> = ({ ipId, muted }) => (
  <div id="mute-btn">
    <Btn
      type="button"
      variant="outline"
      size="sm"
      icon={muted ? <BellOffIcon size={14} /> : <BellIcon size={14} />}
      onclick={`htmx.ajax('POST', '/ips/${ipId}/mute', {target:'#mute-btn', swap:'outerHTML'})`}
    >
      {muted ? "Unmute" : "Mute"}
    </Btn>
  </div>
);
