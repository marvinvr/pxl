export interface NotifyPayload {
  pixelName: string;
  recipientHint: string | null;
  ip: string;
  location: string | null;
  browser: string;
  os: string;
  totalOpens: number;
  timestamp: string;
}

type ProviderSender = (config: Record<string, any>, payload: NotifyPayload) => Promise<void>;

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatMessage(payload: NotifyPayload): string {
  const lines = [
    `📬 PXL Alert: ${payload.pixelName}`,
    `IP: ${payload.ip}`,
  ];
  if (payload.location) lines.push(`Location: ${payload.location}`);
  lines.push(
    `Time: ${formatTime(payload.timestamp)}`,
    `OS: ${payload.os}`,
    `Opens: ${payload.totalOpens}`,
  );
  return lines.join("\n");
}

const senders: Record<string, ProviderSender> = {
  telegram: async (config, payload) => {
    const message = formatMessage(payload);
    await fetch(`https://api.telegram.org/bot${config.bot_token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chat_id,
        text: message,
        parse_mode: "HTML",
      }),
    });
  },

  ntfy: async (config, payload) => {
    const message = formatMessage(payload);
    await fetch(config.url, {
      method: "POST",
      headers: { Title: `PXL Alert: ${payload.pixelName}` },
      body: message,
    });
  },

  discord: async (config, payload) => {
    const message = formatMessage(payload);
    await fetch(config.webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
  },

  slack: async (config, payload) => {
    const message = formatMessage(payload);
    await fetch(config.webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });
  },

  webhook: async (config, payload) => {
    await fetch(config.url, {
      method: config.method || "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.headers || {}),
      },
      body: JSON.stringify(payload),
    });
  },
};

export async function sendNotification(
  providerType: string,
  providerConfig: Record<string, any>,
  payload: NotifyPayload
): Promise<void> {
  const sender = senders[providerType];
  if (!sender) {
    console.error(`Unknown provider type: ${providerType}`);
    return;
  }
  try {
    await sender(providerConfig, payload);
  } catch (err) {
    console.error(`Notification failed (${providerType}):`, err);
  }
}

export async function sendTestNotification(
  providerType: string,
  providerConfig: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  const testPayload: NotifyPayload = {
    pixelName: "Test Pixel",
    recipientHint: "test@example.com",
    ip: "127.0.0.1",
    location: "Test City, Test Country",
    browser: "Test Browser",
    os: "Test OS",
    totalOpens: 1,
    timestamp: new Date().toISOString(),
  };
  try {
    const sender = senders[providerType];
    if (!sender) return { success: false, error: `Unknown provider type: ${providerType}` };
    await sender(providerConfig, testPayload);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}
