import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import { Btn } from "../button";

interface ProviderFormProps {
  editing?: {
    id: string;
    name: string;
    type: string;
    config: Record<string, any>;
    enabled: number | null;
  };
}

const PROVIDER_TYPES = ["telegram", "ntfy", "discord", "slack", "webhook"] as const;

export const ProviderFormView: FC<ProviderFormProps> = ({ editing }) => {
  const isEdit = !!editing;
  const title = isEdit ? `Edit ${editing!.name}` : "New Provider";
  const action = isEdit ? `/providers/${editing!.id}/edit` : "/providers";

  return (
    <Layout title={title}>
      <div class="mb-8">
        <a href="/providers" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">&larr; Back to Providers</a>
        <h1 class="text-2xl font-bold mt-2">{title}</h1>
      </div>

      <div class="bg-white border border-gray-200 rounded-md p-4 max-w-2xl">
        <form method="POST" action={action} class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              name="name"
              required
              value={editing?.name || ""}
              placeholder="My Telegram"
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              name="type"
              required
              hx-get="/providers/config-fields"
              hx-target="#config-fields"
              hx-swap="innerHTML"
              hx-include="[name='type']"
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PROVIDER_TYPES.map((t) => (
                <option value={t} selected={editing?.type === t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div id="config-fields">
            <ConfigFields type={editing?.type || "telegram"} config={editing?.config} />
          </div>

          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              name="enabled"
              id="enabled"
              value="1"
              checked={editing ? !!editing.enabled : true}
              class="rounded bg-white border-gray-300 text-gray-900 focus:ring-gray-500"
            />
            <label for="enabled" class="text-sm text-gray-600">Enabled</label>
          </div>

          <Btn type="submit">{isEdit ? "Save Changes" : "Create Provider"}</Btn>
        </form>
      </div>
    </Layout>
  );
};

export const ConfigFields: FC<{ type: string; config?: Record<string, any> }> = ({ type, config }) => {
  switch (type) {
    case "telegram":
      return (
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Bot Token *</label>
            <input
              type="text"
              name="config_bot_token"
              required
              value={config?.bot_token || ""}
              placeholder="123456:ABC-DEF..."
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Chat ID *</label>
            <input
              type="text"
              name="config_chat_id"
              required
              value={config?.chat_id || ""}
              placeholder="-100123456789"
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      );
    case "ntfy":
      return (
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Topic URL *</label>
          <input
            type="url"
            name="config_url"
            required
            value={config?.url || ""}
            placeholder="https://ntfy.sh/your-topic"
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      );
    case "discord":
      return (
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Webhook URL *</label>
          <input
            type="url"
            name="config_webhook_url"
            required
            value={config?.webhook_url || ""}
            placeholder="https://discord.com/api/webhooks/..."
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      );
    case "slack":
      return (
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Webhook URL *</label>
          <input
            type="url"
            name="config_webhook_url"
            required
            value={config?.webhook_url || ""}
            placeholder="https://hooks.slack.com/services/..."
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      );
    case "webhook":
      return (
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">URL *</label>
            <input
              type="url"
              name="config_url"
              required
              value={config?.url || ""}
              placeholder="https://example.com/webhook"
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Method</label>
            <select
              name="config_method"
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="POST" selected={!config?.method || config?.method === "POST"}>POST</option>
              <option value="PUT" selected={config?.method === "PUT"}>PUT</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Headers (JSON)</label>
            <textarea
              name="config_headers"
              rows={3}
              placeholder='{"Authorization": "Bearer ..."}'
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            >
              {config?.headers ? JSON.stringify(config.headers, null, 2) : ""}
            </textarea>
          </div>
        </div>
      );
    default:
      return <div class="text-gray-400 text-sm">Select a provider type</div>;
  }
};
