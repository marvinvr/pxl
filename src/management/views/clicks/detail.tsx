import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import { IpLink } from "../ip-link";

interface ClickDetailProps {
  click: {
    id: string;
    linkId: string;
    linkName: string;
    timestamp: number;
    ipId: number | null;
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
    geoCountry: string | null;
    geoCity: string | null;
    geoRegion: string | null;
  };
  clickNumber: number;
}

export const ClickDetailView: FC<ClickDetailProps> = ({ click, clickNumber }) => {
  let parsedHeaders: Record<string, string> = {};
  try {
    if (click.rawHeaders) parsedHeaders = JSON.parse(click.rawHeaders);
  } catch {}

  return (
    <Layout title={`Click #${clickNumber}`}>
      <div class="mb-8">
        <a href={`/links/${click.linkId}`} class="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          &larr; Back to {click.linkName}
        </a>
        <h1 class="text-2xl font-bold mt-2">Click #{clickNumber}</h1>
        <p class="text-gray-500 mt-1">
          {click.linkName} &middot; {new Date(click.timestamp).toLocaleString()}
        </p>
      </div>

      <div class="space-y-6 max-w-3xl">
        {/* Context */}
        <Section title="Context">
          <InfoRow label="Link" value={click.linkName} />
          <InfoRow label="Timestamp" value={new Date(click.timestamp).toLocaleString()} />
          <InfoRow label="Click #" value={String(clickNumber)} />
        </Section>

        {/* Connection */}
        <Section title="Connection">
          <div class="flex flex-col sm:flex-row sm:items-start gap-1">
            <div class="text-sm font-mono text-gray-400 w-32 shrink-0">IP</div>
            <div class="text-sm font-mono text-gray-700">
              <IpLink ipAddressId={click.ipId} ip={click.ip} stopPropagation={false} />
            </div>
          </div>
          <InfoRow label="Location" value={[click.geoCity, click.geoRegion, click.geoCountry].filter(Boolean).join(", ") || null} />
          <InfoRow label="Referer" value={click.referer} />
        </Section>

        {/* Client */}
        <Section title="Client">
          <InfoRow label="Browser" value={click.uaBrowser} />
          <InfoRow label="OS" value={click.uaOs} />
          <InfoRow label="Device" value={click.uaDevice} />
          <InfoRow label="Accept-Language" value={click.acceptLanguage} />
          <InfoRow label="User-Agent" value={click.userAgent} mono small />
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
          <InfoRow label="Method" value={click.rawMethod} mono />
          <InfoRow label="URL" value={click.rawUrl} mono small />
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
      {value || "\u2014"}
    </div>
  </div>
);
