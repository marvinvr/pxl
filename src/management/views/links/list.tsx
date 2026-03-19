import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import { Btn } from "../button";
import { DataTable } from "../data-table";
import { config } from "../../../config";

interface LinkListItem {
  id: string;
  shortCode: string;
  targetUrl: string;
  name: string;
  clickCount: number;
  lastClick: number | null;
  createdAt: number;
}

export const LinkListView: FC<{ links: LinkListItem[] }> = ({ links }) => {
  return (
    <Layout title="Links">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-2xl font-bold">Links</h1>
        <a href="/links/new" class="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-mono tracking-wide rounded transition-colors">
          New Link
        </a>
      </div>
      <p class="text-sm text-gray-400 mb-8">Shortened redirect URLs that track every click with full attribution.</p>

      <div class="bg-white border border-gray-200 rounded-md overflow-hidden">
        <DataTable
          columns={["Name", "Target", "Clicks", "Last Click", "Created", "Actions"]}
          empty="No links yet."
        >
          {links.map((l) => {
            const shortUrl = `${config.baseUrl}/l/${l.shortCode}`;
            let displayTarget = l.targetUrl;
            try {
              const u = new URL(l.targetUrl);
              displayTarget = u.hostname + (u.pathname !== "/" ? u.pathname : "");
            } catch {}
            return (
              <tr
                class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                hx-get={`/links/${l.id}`} hx-push-url="true" hx-target="body" hx-swap="innerHTML"
              >
                <td class="px-6 py-3 text-sm font-medium">{l.name}</td>
                <td class="px-6 py-3 text-sm text-gray-500 max-w-xs truncate" title={l.targetUrl}>
                  {displayTarget}
                </td>
                <td class="px-6 py-3 text-sm font-mono">{l.clickCount}</td>
                <td class="px-6 py-3 text-sm font-mono text-gray-500">
                  {l.lastClick ? new Date(l.lastClick).toLocaleString() : "\u2014"}
                </td>
                <td class="px-6 py-3 text-sm font-mono text-gray-500">
                  {new Date(l.createdAt).toLocaleDateString()}
                </td>
                <td class="px-6 py-3 text-sm" onclick="event.stopPropagation()">
                  <div class="flex items-center gap-3">
                    <Btn variant="ghost" onclick={`navigator.clipboard.writeText('${shortUrl}');this.textContent='Copied!';setTimeout(()=>this.textContent='Copy URL',1500)`}>
                      Copy URL
                    </Btn>
                    <a href={`/links/${l.id}/edit`} class="text-gray-500 hover:text-gray-900 transition-colors text-xs">
                      Edit
                    </a>
                    <form method="POST" action={`/links/${l.id}/delete`} class="m-0 p-0">
                      <Btn type="submit" variant="ghost-danger" onclick="return confirm('Delete this link and all its clicks?')">
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
