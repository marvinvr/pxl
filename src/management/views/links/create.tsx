import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import { Btn } from "../button";

interface CreateLinkProps {
  providers: { id: string; name: string }[];
}

export const CreateLinkView: FC<CreateLinkProps> = ({ providers }) => {
  return (
    <Layout title="New Link">
      <div class="mb-8">
        <a href="/links" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">&larr; Back to Links</a>
        <h1 class="text-2xl font-bold mt-2">New Link</h1>
      </div>

      <div class="bg-white border border-gray-200 rounded-md p-4 max-w-2xl">
        <form method="POST" action="/links" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Target URL *</label>
            <input
              type="url"
              name="targetUrl"
              required
              placeholder="https://example.com/page"
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Auto-generated from URL if empty"
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Optional notes about this link"
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
              name="notifyOnEveryClick"
              id="notifyOnEveryClick"
              value="1"
              checked
              class="rounded bg-white border-gray-300 text-gray-900 focus:ring-gray-500"
            />
            <label for="notifyOnEveryClick" class="text-sm text-gray-600">
              Notify on every click (not just the first)
            </label>
          </div>

          <div>
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                name="hidePreviewMetadata"
                id="hidePreviewMetadata"
                value="1"
                class="rounded bg-white border-gray-300 text-gray-900 focus:ring-gray-500"
              />
              <label for="hidePreviewMetadata" class="text-sm text-gray-600">
                Hide target preview metadata
              </label>
            </div>
            <p class="mt-1 text-xs text-gray-500">
              Known unfurl bots get a neutral page instead of the target title, description, and OG image.
            </p>
          </div>

          <Btn type="submit">Create Link</Btn>
        </form>
      </div>
    </Layout>
  );
};
