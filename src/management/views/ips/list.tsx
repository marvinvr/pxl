import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import { DataTable } from "../data-table";

interface IpListProps {
  ips: {
    id: number;
    ip: string;
    geoCountry: string | null;
    geoCity: string | null;
    geoRegion: string | null;
    firstSeenAt: number;
    lastSeenAt: number;
    muted: number;
    openCount: number;
    clickCount: number;
    unmatchedCount: number;
  }[];
}

export const IpListView: FC<IpListProps> = ({ ips }) => {
  return (
    <Layout title="IP Addresses">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-2xl font-bold">IP Addresses</h1>
        <span class="text-sm text-gray-500">{ips.length} known</span>
      </div>
      <p class="text-sm text-gray-400 mb-8">All unique IPs seen across opens, clicks, and unmatched requests.</p>

      <div class="bg-white border border-gray-200 rounded-md overflow-hidden">
        <DataTable
          columns={["IP", "Location", "Opens", "Clicks", "First Seen", "Last Seen"]}
          empty="No IP addresses recorded yet"
        >
          {ips.map((ip) => {
            const location = [ip.geoCity, ip.geoRegion, ip.geoCountry].filter(Boolean).join(", ");
            return (
              <tr
                class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                hx-get={`/ips/${ip.id}`} hx-push-url="true" hx-target="body" hx-swap="innerHTML"
              >
                <td class="px-6 py-3 text-sm font-mono">
                  {ip.ip}
                  {ip.muted ? (
                    <span class="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded text-xs font-medium">muted</span>
                  ) : null}
                </td>
                <td class="px-6 py-3 text-sm text-gray-500">{location || "\u2014"}</td>
                <td class="px-6 py-3 text-sm font-mono text-gray-500">{ip.openCount}</td>
                <td class="px-6 py-3 text-sm font-mono text-gray-500">{ip.clickCount}</td>
                <td class="px-6 py-3 text-sm font-mono text-gray-500">
                  {new Date(ip.firstSeenAt).toLocaleString()}
                </td>
                <td class="px-6 py-3 text-sm font-mono text-gray-500">
                  {new Date(ip.lastSeenAt).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>
    </Layout>
  );
};
