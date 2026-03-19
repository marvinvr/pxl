import type { FC } from "hono/jsx";

type EventType = "open" | "click" | "unmatched";

const styles: Record<EventType, string> = {
  open: "bg-teal-50 text-teal-800 border border-teal-200",
  click: "bg-purple-50 text-purple-700 border border-purple-200",
  unmatched: "bg-yellow-50 text-yellow-700 border border-yellow-200",
};

export const TypeBadge: FC<{ type: EventType }> = ({ type }) => (
  <span class={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${styles[type]}`}>
    {type}
  </span>
);
