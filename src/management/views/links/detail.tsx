import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import { Btn } from "../button";
import { IpLink } from "../ip-link";
import { DataTable } from "../data-table";
import { config } from "../../../config";

interface LinkDetailProps {
  link: {
    id: string;
    shortCode: string;
    targetUrl: string;
    name: string;
    notes: string | null;
    notifyOnEveryClick: number | null;
    createdAt: number;
    providerName: string | null;
  };
  clicks: {
    id: string;
    timestamp: number;
    ipAddressId: number | null;
    ip: string | null;
    uaBrowser: string | null;
    uaOs: string | null;
    uaDevice: string | null;
    geoCountry: string | null;
    geoCity: string | null;
  }[];
}

export const LinkDetailView: FC<LinkDetailProps> = ({ link, clicks }) => {
  const shortUrl = `${config.baseUrl}/l/${link.shortCode}`;

  return (
    <Layout title={link.name}>
      <div class="mb-8">
        <a href="/links" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">&larr; Back to Links</a>
        <div class="flex items-center gap-3 mt-2">
          <h1 class="text-2xl font-bold">{link.name}</h1>
          <a
            href={`/links/${link.id}/edit`}
            class="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Edit
          </a>
        </div>
      </div>

      {/* Link Info */}
      <div class="bg-white border border-gray-200 rounded-md p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <div class="text-sm text-gray-500 mb-1">Provider</div>
            <div>{link.providerName || "None"}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">Notify</div>
            <div>{link.notifyOnEveryClick ? "Every click" : "First click only"}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">Created</div>
            <div>{new Date(link.createdAt).toLocaleString()}</div>
          </div>
        </div>

        {link.notes && (
          <div class="mb-6">
            <div class="text-sm text-gray-500 mb-1">Notes</div>
            <div class="text-gray-600">{link.notes}</div>
          </div>
        )}

        <div class="space-y-3">
          <div>
            <div class="text-sm text-gray-500 mb-1">Target URL</div>
            <div class="flex items-center gap-2">
              <code class="text-sm bg-gray-100 border border-gray-200 px-3 py-1.5 rounded font-mono text-gray-900 flex-1 overflow-x-auto">
                {link.targetUrl}
              </code>
            </div>
          </div>

          <div>
            <div class="text-sm text-gray-500 mb-1">Short URL</div>
            <div class="flex items-center gap-2">
              <code class="text-sm bg-gray-100 border border-gray-200 px-3 py-1.5 rounded font-mono text-gray-900 flex-1 overflow-x-auto">
                {shortUrl}
              </code>
              <Btn variant="secondary" size="sm" class="shrink-0" onclick={`navigator.clipboard.writeText('${shortUrl}');this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)`}>
                Copy
              </Btn>
            </div>
          </div>
        </div>
      </div>

      {/* Clicks Table */}
      <div class="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold">Clicks ({clicks.length})</h2>
        </div>
        <DataTable
          columns={["#", "Timestamp", "IP", "Location", "Browser", "OS", "Device"]}
          empty="No clicks yet"
          pageSize={10}
        >
          {clicks.map((cl, idx) => {
            const location = [cl.geoCity, cl.geoCountry].filter(Boolean).join(", ");
            return (
              <tr
                class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                hx-get={`/clicks/${cl.id}`} hx-push-url="true" hx-target="body" hx-swap="innerHTML"
              >
                <td class="px-6 py-3 text-sm font-mono text-gray-400">{idx + 1}</td>
                <td class="px-6 py-3 text-sm font-mono">
                  {new Date(cl.timestamp).toLocaleString()}
                </td>
                <td class="px-6 py-3 text-sm font-mono text-gray-500">
                  <IpLink ipAddressId={cl.ipAddressId} ip={cl.ip} />
                </td>
                <td class="px-6 py-3 text-sm text-gray-500">{location || "\u2014"}</td>
                <td class="px-6 py-3 text-sm text-gray-500">{cl.uaBrowser || "\u2014"}</td>
                <td class="px-6 py-3 text-sm text-gray-500">{cl.uaOs || "\u2014"}</td>
                <td class="px-6 py-3 text-sm text-gray-500">{cl.uaDevice || "\u2014"}</td>
              </tr>
            );
          })}
        </DataTable>
      </div>
    </Layout>
  );
};
