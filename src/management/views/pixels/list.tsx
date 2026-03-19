import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import { Btn } from "../button";
import { DataTable } from "../data-table";
import { config } from "../../../config";

interface PixelListItem {
  id: string;
  trackingId: string;
  name: string;
  openCount: number;
  firstOpen: number | null;
  lastOpen: number | null;
  createdAt: number;
}

export const PixelListView: FC<{ pixels: PixelListItem[] }> = ({ pixels }) => {
  return (
    <Layout title="Pixels">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-2xl font-bold">Pixels</h1>
        <a href="/pixels/new" class="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-mono tracking-wide rounded transition-colors">
          New Pixel
        </a>
      </div>
      <p class="text-sm text-gray-400 mb-8">Tracking pixels embedded in emails to detect when recipients open them.</p>

      <div class="bg-white border border-gray-200 rounded-md overflow-hidden">
        <DataTable
          columns={["Name", "Opens", "First Open", "Last Open", "Created", "Actions"]}
          empty="No pixels yet."
        >
          {pixels.map((p) => {
            const pixelUrl = `${config.baseUrl}/px/${p.trackingId}.png`;
            return (
              <tr
                class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                hx-get={`/pixels/${p.id}`} hx-push-url="true" hx-target="body" hx-swap="innerHTML"
              >
                <td class="px-6 py-3 text-sm font-medium">{p.name}</td>
                <td class="px-6 py-3 text-sm font-mono">{p.openCount}</td>
                <td class="px-6 py-3 text-sm font-mono text-gray-500">
                  {p.firstOpen ? new Date(p.firstOpen).toLocaleString() : "\u2014"}
                </td>
                <td class="px-6 py-3 text-sm font-mono text-gray-500">
                  {p.lastOpen ? new Date(p.lastOpen).toLocaleString() : "\u2014"}
                </td>
                <td class="px-6 py-3 text-sm font-mono text-gray-500">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
                <td class="px-6 py-3 text-sm" onclick="event.stopPropagation()">
                  <div class="flex items-center gap-3">
                    <Btn variant="ghost" onclick={`navigator.clipboard.writeText('${pixelUrl}');this.textContent='Copied!';setTimeout(()=>this.textContent='Copy URL',1500)`}>
                      Copy URL
                    </Btn>
                    <a href={`/pixels/${p.id}/edit`} class="text-gray-500 hover:text-gray-900 transition-colors text-xs">
                      Edit
                    </a>
                    <form method="POST" action={`/pixels/${p.id}/delete`} class="m-0 p-0">
                      <Btn type="submit" variant="ghost-danger" onclick="return confirm('Delete this pixel and all its opens?')">
                        Delete
                      </Btn>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>
    </Layout>
  );
};
