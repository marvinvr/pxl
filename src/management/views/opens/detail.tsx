import type { FC } from "hono/jsx";
import { Layout } from "../layout";

interface OpenDetailProps {
  open: {
    id: string;
    pixelId: string;
    pixelName: string;
    timestamp: number;
    ip: string | null;
    userAgent: string | null;
    uaBrowser: string | null;
    uaOs: string | null;
    uaDevice: string | null;
    referer: string | null;
    acceptLanguage: string | null;
    rawHeaders: string | null;
    rawUrl: string | null;
    rawMethod: string | null;
  };
  openNumber: number;
}

export const OpenDetailView: FC<OpenDetailProps> = ({ open, openNumber }) => {
  let parsedHeaders: Record<string, string> = {};
  try {
    if (open.rawHeaders) parsedHeaders = JSON.parse(open.rawHeaders);
  } catch {}

  return (
    <Layout title={`Open #${openNumber}`}>
      <div class="mb-8">
        <a href={`/pixels/${open.pixelId}`} class="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          &larr; Back to {open.pixelName}
        </a>
        <h1 class="text-2xl font-bold mt-2">Open #{openNumber}</h1>
        <p class="text-gray-500 mt-1">
          {open.pixelName} &middot; {new Date(open.timestamp).toLocaleString()}
        </p>
      </div>

      <div class="space-y-6 max-w-3xl">
        {/* Context */}
        <Section title="Context">
          <InfoRow label="Pixel" value={open.pixelName} />
          <InfoRow label="Timestamp" value={new Date(open.timestamp).toLocaleString()} />
          <InfoRow label="Open #" value={String(openNumber)} />
        </Section>

        {/* Connection */}
        <Section title="Connection">
          <InfoRow label="IP" value={open.ip} mono />
          <InfoRow label="Referer" value={open.referer} />
        </Section>

        {/* Client */}
        <Section title="Client">
          <InfoRow label="Browser" value={open.uaBrowser} />
          <InfoRow label="OS" value={open.uaOs} />
          <InfoRow label="Device" value={open.uaDevice} />
          <InfoRow label="Accept-Language" value={open.acceptLanguage} />
          <InfoRow label="User-Agent" value={open.userAgent} mono small />
        </Section>

        {/* Raw Headers */}
        <div class="bg-white border border-gray-200 rounded-md overflow-hidden">
          <details>
            <summary class="px-6 py-4 cursor-pointer text-xs font-semibold font-mono uppercase tracking-wider text-gray-400 hover:text-gray-900 transition-colors">
              Raw Headers
            </summary>
            <div class="px-6 pb-4">
              <pre class="text-xs font-mono text-gray-600 bg-gray-100 rounded-md p-4 overflow-x-auto">
                {JSON.stringify(parsedHeaders, null, 2)}
              </pre>
            </div>
          </details>
        </div>

        {/* Raw Request */}
        <Section title="Raw Request">
          <InfoRow label="Method" value={open.rawMethod} mono />
          <InfoRow label="URL" value={open.rawUrl} mono small />
        </Section>
      </div>
    </Layout>
  );
};

const Section: FC<{ title: string; children: any }> = ({ title, children }) => (
  <div class="bg-white border border-gray-200 rounded-md p-4">
    <h2 class="text-xs font-semibold font-mono uppercase tracking-wider text-gray-400 mb-4">{title}</h2>
    <div class="space-y-3">{children}</div>
  </div>
);

const InfoRow: FC<{ label: string; value: string | null | undefined; mono?: boolean; small?: boolean }> = ({
  label,
  value,
  mono,
  small,
}) => (
  <div class="flex flex-col sm:flex-row sm:items-start gap-1">
    <div class="text-sm font-mono text-gray-400 w-32 shrink-0">{label}</div>
    <div
      class={`text-sm ${mono ? "font-mono" : ""} ${small ? "text-xs" : ""} text-gray-700 break-all`}
    >
      {value || "—"}
    </div>
  </div>
);
