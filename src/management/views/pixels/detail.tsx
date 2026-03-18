import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import { config } from "../../../config";

interface PixelDetailProps {
  pixel: {
    id: string;
    trackingId: string;
    name: string;
    notes: string | null;
    notifyOnEveryOpen: number | null;
    createdAt: number;
    providerName: string | null;
  };
  opens: {
    id: string;
    timestamp: number;
    ip: string | null;
    uaBrowser: string | null;
    uaOs: string | null;
    uaDevice: string | null;
  }[];
}

export const PixelDetailView: FC<PixelDetailProps> = ({ pixel, opens }) => {
  const pixelUrl = `${config.baseUrl}/px/${pixel.trackingId}.png`;
  const imgTag = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none" />`;

  return (
    <Layout title={pixel.name}>
      <div class="mb-8">
        <a href="/pixels" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">&larr; Back to Pixels</a>
        <div class="flex items-center gap-3 mt-2">
          <h1 class="text-2xl font-bold">{pixel.name}</h1>
          <a
            href={`/pixels/${pixel.id}/edit`}
            class="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Edit
          </a>
        </div>
      </div>

      {/* Pixel Info */}
      <div class="bg-white border border-gray-200 rounded-md p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <div class="text-sm text-gray-500 mb-1">Provider</div>
            <div>{pixel.providerName || "None"}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">Notify</div>
            <div>{pixel.notifyOnEveryOpen ? "Every open" : "First open only"}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">Created</div>
            <div>{new Date(pixel.createdAt).toLocaleString()}</div>
          </div>
        </div>

        {pixel.notes && (
          <div class="mb-6">
            <div class="text-sm text-gray-500 mb-1">Notes</div>
            <div class="text-gray-600">{pixel.notes}</div>
          </div>
        )}

        <div class="space-y-3">
          <div>
            <div class="text-sm text-gray-500 mb-1">Tracking URL</div>
            <div class="flex items-center gap-2">
              <code class="text-sm bg-gray-100 px-3 py-1.5 rounded font-mono text-blue-700 flex-1 overflow-x-auto">
                {pixelUrl}
              </code>
              <button
                onclick={`navigator.clipboard.writeText('${pixelUrl}');this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)`}
                class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-sm rounded transition-colors shrink-0"
              >
                Copy
              </button>
            </div>
          </div>

          <div>
            <div class="text-sm text-gray-500 mb-1">HTML Snippet</div>
            <div class="flex items-center gap-2">
              <code class="text-sm bg-gray-100 px-3 py-1.5 rounded font-mono text-green-700 flex-1 overflow-x-auto">
                {imgTag}
              </code>
              <button
                onclick={`navigator.clipboard.writeText(\`${imgTag.replace(/`/g, "\\`")}\`);this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)`}
                class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-sm rounded transition-colors shrink-0"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Opens Table */}
      <div class="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold">Opens ({opens.length})</h2>
        </div>
        {opens.length === 0 ? (
          <div class="px-6 py-8 text-center text-gray-400">No opens yet</div>
        ) : (
          <table class="w-full">
            <thead>
              <tr class="text-left text-xs font-mono uppercase tracking-wider text-gray-400 border-b border-gray-200">
                <th class="px-6 py-3 font-medium">#</th>
                <th class="px-6 py-3 font-medium">Timestamp</th>
                <th class="px-6 py-3 font-medium">IP</th>
                <th class="px-6 py-3 font-medium">Browser</th>
                <th class="px-6 py-3 font-medium">OS</th>
                <th class="px-6 py-3 font-medium">Device</th>
              </tr>
            </thead>
            <tbody>
              {opens.map((o, idx) => (
                <tr class="border-b border-gray-100">
                  <td class="px-6 py-3 text-sm font-mono text-gray-400">{idx + 1}</td>
                  <td class="px-6 py-3 text-sm font-mono">
                    <a href={`/opens/${o.id}`} class="text-blue-600 hover:text-blue-800">
                      {new Date(o.timestamp).toLocaleString()}
                    </a>
                  </td>
                  <td class="px-6 py-3 text-sm font-mono text-gray-500">{o.ip || "—"}</td>
                  <td class="px-6 py-3 text-sm text-gray-500">{o.uaBrowser || "—"}</td>
                  <td class="px-6 py-3 text-sm text-gray-500">{o.uaOs || "—"}</td>
                  <td class="px-6 py-3 text-sm text-gray-500">{o.uaDevice || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};
