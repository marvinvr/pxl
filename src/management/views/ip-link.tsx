import type { FC } from "hono/jsx";

interface IpLinkProps {
  ipAddressId: number | null;
  ip: string | null;
  stopPropagation?: boolean;
}

export const IpLink: FC<IpLinkProps> = ({ ipAddressId, ip, stopPropagation = true }) => {
  if (!ipAddressId || !ip) {
    return <span>{ip || "\u2014"}</span>;
  }

  return (
    <a
      href={`/ips/${ipAddressId}`}
      class="hover:text-gray-900 transition-colors underline decoration-gray-300"
      onclick={stopPropagation ? "event.stopPropagation()" : undefined}
    >
      {ip}
    </a>
  );
};
