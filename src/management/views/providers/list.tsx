import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import { Btn } from "../button";
import { DataTable } from "../data-table";

interface ProviderListItem {
  id: string;
  name: string;
  type: string;
  enabled: number | null;
}

export const ProviderListView: FC<{ providers: ProviderListItem[] }> = ({ providers }) => {
  return (
    <Layout title="Providers">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-2xl font-bold">Notification Providers</h1>
        <a href="/providers/new" class="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-mono tracking-wide rounded transition-colors">
          New Provider
        </a>
      </div>
      <p class="text-sm text-gray-400 mb-8">Services that receive alerts when pixels are opened or links are clicked.</p>

      <div class="bg-white border border-gray-200 rounded-md overflow-hidden">
        <DataTable
          columns={["Name", "Type", "Enabled", "Actions"]}
          empty="No providers yet."
        >
          {providers.map((p) => (
            <tr
              class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              hx-get={`/providers/${p.id}/edit`} hx-push-url="true" hx-target="body" hx-swap="innerHTML"
            >
              <td class="px-6 py-3 text-sm font-medium">{p.name}</td>
              <td class="px-6 py-3 text-sm">
                <span class="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-600">{p.type}</span>
              </td>
              <td class="px-6 py-3 text-sm" onclick="event.stopPropagation()">
                <form method="POST" action={`/providers/${p.id}/toggle`} class="inline">
                  <button
                    type="submit"
                    class={`px-2 py-0.5 rounded text-xs font-medium ${
                      p.enabled ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {p.enabled ? "Enabled" : "Disabled"}
                  </button>
                </form>
              </td>
              <td class="px-6 py-3 text-sm" onclick="event.stopPropagation()">
                <div class="flex items-center gap-3">
                  <form method="POST" action={`/providers/${p.id}/test`} class="m-0 p-0" hx-post={`/providers/${p.id}/test`} hx-target={`#test-result-${p.id}`} hx-swap="innerHTML">
                    <Btn type="submit" variant="ghost">Test</Btn>
                  </form>
                  <span id={`test-result-${p.id}`} class="text-xs"></span>
                  <form method="POST" action={`/providers/${p.id}/delete`} class="m-0 p-0">
                    <Btn type="submit" variant="ghost-danger" onclick="return confirm('Delete this provider?')">
                      Delete
                    </Btn>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </Layout>
  );
};
