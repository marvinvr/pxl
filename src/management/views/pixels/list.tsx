import type { FC } from "hono/jsx";
import { Layout } from "../layout";
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
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold">Pixels</h1>
        <a
          href="/pixels/new"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
        >
          New Pixel
        </a>
      </div>

      <div class="bg-white border border-gray-200 rounded-md overflow-hidden">
        {pixels.length === 0 ? (
          <div class="px-6 py-8 text-center text-gray-400">
            No pixels yet. <a href="/pixels/new" class="text-blue-600 hover:text-blue-800">Create one</a>.
          </div>
        ) : (
          <table class="w-full">
            <thead>
              <tr class="text-left text-xs font-mono uppercase tracking-wider text-gray-400 border-b border-gray-200">
                <th class="px-6 py-3 font-medium">Name</th>
                <th class="px-6 py-3 font-medium">Opens</th>
                <th class="px-6 py-3 font-medium">First Open</th>
                <th class="px-6 py-3 font-medium">Last Open</th>
                <th class="px-6 py-3 font-medium">Created</th>
                <th class="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pixels.map((p) => {
                const pixelUrl = `${config.baseUrl}/px/${p.trackingId}.png`;
                return (
                  <tr class="border-b border-gray-100">
                    <td class="px-6 py-3 text-sm">
                      <a href={`/pixels/${p.id}`} class="text-blue-600 hover:text-blue-800 font-medium">
                        {p.name}
                      </a>
                    </td>
                    <td class="px-6 py-3 text-sm font-mono">{p.openCount}</td>
                    <td class="px-6 py-3 text-sm font-mono text-gray-500">
                      {p.firstOpen ? new Date(p.firstOpen).toLocaleString() : "—"}
                    </td>
                    <td class="px-6 py-3 text-sm font-mono text-gray-500">
                      {p.lastOpen ? new Date(p.lastOpen).toLocaleString() : "—"}
                    </td>
                    <td class="px-6 py-3 text-sm font-mono text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-3 text-sm">
                      <div class="flex items-center gap-3">
                        <button
                          onclick={`navigator.clipboard.writeText('${pixelUrl}');this.textContent='Copied!';setTimeout(()=>this.textContent='Copy URL',1500)`}
                          class="text-gray-500 hover:text-gray-900 transition-colors text-xs p-0 m-0 bg-transparent border-0 cursor-pointer"
                        >
                          Copy URL
                        </button>
                        <a href={`/pixels/${p.id}/edit`} class="text-gray-500 hover:text-gray-900 transition-colors text-xs">
                          Edit
                        </a>
                        <form method="POST" action={`/pixels/${p.id}/delete`} class="m-0 p-0">
                          <button
                            type="submit"
                            onclick="return confirm('Delete this pixel and all its opens?')"
                            class="text-red-600 hover:text-red-800 transition-colors text-xs p-0 m-0 bg-transparent border-0 cursor-pointer"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};
