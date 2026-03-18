import type { FC } from "hono/jsx";
import { Layout } from "../layout";

interface ProviderListItem {
  id: string;
  name: string;
  type: string;
  enabled: number | null;
}

export const ProviderListView: FC<{ providers: ProviderListItem[] }> = ({ providers }) => {
  return (
    <Layout title="Providers">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold">Notification Providers</h1>
        <a
          href="/providers/new"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
        >
          New Provider
        </a>
      </div>

      <div class="bg-white border border-gray-200 rounded-md overflow-hidden">
        {providers.length === 0 ? (
          <div class="px-6 py-8 text-center text-gray-400">
            No providers yet. <a href="/providers/new" class="text-blue-600 hover:text-blue-800">Create one</a>.
          </div>
        ) : (
          <table class="w-full">
            <thead>
              <tr class="text-left text-xs font-mono uppercase tracking-wider text-gray-400 border-b border-gray-200">
                <th class="px-6 py-3 font-medium">Name</th>
                <th class="px-6 py-3 font-medium">Type</th>
                <th class="px-6 py-3 font-medium">Enabled</th>
                <th class="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr class="border-b border-gray-100">
                  <td class="px-6 py-3 text-sm font-medium">{p.name}</td>
                  <td class="px-6 py-3 text-sm">
                    <span class="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-600">{p.type}</span>
                  </td>
                  <td class="px-6 py-3 text-sm">
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
                  <td class="px-6 py-3 text-sm">
                    <div class="flex items-center gap-3">
                      <a href={`/providers/${p.id}/edit`} class="text-gray-500 hover:text-gray-900 transition-colors text-xs">
                        Edit
                      </a>
                      <form method="POST" action={`/providers/${p.id}/test`} class="m-0 p-0" hx-post={`/providers/${p.id}/test`} hx-target={`#test-result-${p.id}`} hx-swap="innerHTML">
                        <button type="submit" class="text-blue-600 hover:text-blue-800 transition-colors text-xs p-0 m-0 bg-transparent border-0 cursor-pointer">
                          Test
                        </button>
                      </form>
                      <span id={`test-result-${p.id}`} class="text-xs"></span>
                      <form method="POST" action={`/providers/${p.id}/delete`} class="m-0 p-0">
                        <button
                          type="submit"
                          onclick="return confirm('Delete this provider?')"
                          class="text-red-600 hover:text-red-800 transition-colors text-xs p-0 m-0 bg-transparent border-0 cursor-pointer"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};
