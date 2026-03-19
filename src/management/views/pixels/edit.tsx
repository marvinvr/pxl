import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import { Btn } from "../button";

interface EditPixelProps {
  pixel: {
    id: string;
    name: string;
    notes: string | null;
    providerId: string | null;
    notifyOnEveryOpen: number | null;
  };
  providers: { id: string; name: string }[];
}

export const EditPixelView: FC<EditPixelProps> = ({ pixel, providers }) => {
  return (
    <Layout title={`Edit ${pixel.name}`}>
      <div class="mb-8">
        <a href={`/pixels/${pixel.id}`} class="text-sm text-gray-500 hover:text-gray-900 transition-colors">&larr; Back to Pixel</a>
        <h1 class="text-2xl font-bold mt-2">Edit Pixel</h1>
      </div>

      <div class="bg-white border border-gray-200 rounded-md p-4 max-w-2xl">
        <form method="POST" action={`/pixels/${pixel.id}/edit`} class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              name="name"
              required
              value={pixel.name}
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
            >
              {pixel.notes || ""}
            </textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notification Provider</label>
            <select
              name="providerId"
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {providers.map((p) => (
                <option value={p.id} selected={pixel.providerId === p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              name="notifyOnEveryOpen"
              id="notifyOnEveryOpen"
              value="1"
              checked={!!pixel.notifyOnEveryOpen}
              class="rounded bg-white border-gray-300 text-gray-900 focus:ring-gray-500"
            />
            <label for="notifyOnEveryOpen" class="text-sm text-gray-600">
              Notify on every open (not just the first)
            </label>
          </div>

          <Btn type="submit">Save Changes</Btn>
        </form>
      </div>
    </Layout>
  );
};
