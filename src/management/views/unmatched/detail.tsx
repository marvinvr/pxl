import type { FC } from "hono/jsx";
import { Layout } from "../layout";
import { IpLink } from "../ip-link";

interface UnmatchedDetailProps {
  request: {
    id: string;
    timestamp: number;
    requestedPath: string;
    ipAddressId: number | null;
    ip: string | null;
    userAgent: string | null;
    referer: string | null;
    rawHeaders: string | null;
  };
}

export const UnmatchedDetailView: FC<UnmatchedDetailProps> = ({ request }) => {
  let parsedHeaders: Record<string, string> = {};
  try {
    if (request.rawHeaders) parsedHeaders = JSON.parse(request.rawHeaders);
  } catch {}

  return (
    <Layout title="Unmatched Request">
      <div class="mb-8">
        <a href="/" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          &larr; Back to Dashboard
        </a>
        <h1 class="text-2xl font-bold mt-2">Unmatched Request</h1>
        <p class="text-gray-500 mt-1">{new Date(request.timestamp).toLocaleString()}</p>
      </div>

      <div class="space-y-6 max-w-3xl">
        <div class="bg-white border border-gray-200 rounded-md p-4">
          <div class="space-y-3">
            <InfoRow label="Path" value={request.requestedPath} mono />
            <div class="flex flex-col sm:flex-row sm:items-start gap-1">
              <div class="text-sm font-mono text-gray-400 w-32 shrink-0">IP</div>
              <div class="text-sm font-mono text-gray-700">
                <IpLink ipAddressId={request.ipAddressId} ip={request.ip} stopPropagation={false} />
              </div>
            </div>
            <InfoRow label="User-Agent" value={request.userAgent} mono small />
            <InfoRow label="Referer" value={request.referer} />
          </div>
        </div>

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
      </div>
    </Layout>
  );
};

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
