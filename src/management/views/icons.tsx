import type { FC } from "hono/jsx";
import { Bell, BellOff } from "lucide";

type IconNode = [string, Record<string, string>][];

interface IconProps {
  class?: string;
  size?: number;
}

function createIcon(nodes: IconNode): FC<IconProps> {
  return ({ class: className, size = 16 }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={String(size)}
      height={String(size)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class={className}
    >
      {(nodes as IconNode).map(([tag, attrs]) => {
        switch (tag) {
          case "path": return <path {...attrs} />;
          case "circle": return <circle {...attrs} />;
          case "line": return <line {...attrs} />;
          case "polyline": return <polyline {...attrs} />;
          case "polygon": return <polygon {...attrs} />;
          case "rect": return <rect {...attrs} />;
          case "ellipse": return <ellipse {...attrs} />;
          default: return null;
        }
      })}
    </svg>
  );
}

export const BellIcon = createIcon(Bell as IconNode);
export const BellOffIcon = createIcon(BellOff as IconNode);
