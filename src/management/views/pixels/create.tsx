import type { FC } from "hono/jsx";
import { Layout } from "../layout";

interface CreatePixelProps {
  providers: { id: string; name: string }[];
}

export const CreatePixelView: FC<CreatePixelProps> = ({ providers }) => {
  return (
    <Layout title="New Pixel">
      <div class="mb-8">
        <a href="/pixels" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">&larr; Back to Pixels</a>
        <h1 class="text-2xl font-bold mt-2">New Pixel</h1>
      </div>

      <div class="bg-white border border-gray-200 rounded-md p-4 max-w-2xl">
        <form method="POST" action="/pixels" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="Follow-up to John"
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Optional notes about this pixel"
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notification Provider</label>
            <select
              name="providerId"
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {providers.map((p) => (
                <option value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              name="notifyOnEveryOpen"
              id="notifyOnEveryOpen"
              value="1"
              class="rounded bg-white border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label for="notifyOnEveryOpen" class="text-sm text-gray-600">
              Notify on every open (not just the first)
            </label>
          </div>

          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            Create Pixel
          </button>
        </form>
      </div>
    </Layout>
  );
};
