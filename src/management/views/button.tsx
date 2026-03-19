import type { FC } from "hono/jsx";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost" | "ghost-danger";
type ButtonSize = "sm" | "md";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: "button" | "submit";
  class?: string;
  onclick?: string;
  icon?: any;
  children: any;
}

const base = "font-mono tracking-wide transition-colors cursor-pointer";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-gray-900 hover:bg-gray-800 text-white",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300",
  outline: "bg-transparent hover:bg-gray-50 text-gray-700 border border-gray-300",
  danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
  ghost: "bg-transparent border-0 text-gray-500 hover:text-gray-900 p-0 m-0",
  "ghost-danger": "bg-transparent border-0 text-red-600 hover:text-red-800 p-0 m-0",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-xs rounded",
  md: "px-4 py-2 text-sm rounded",
};

export const Btn: FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  type = "button",
  class: className,
  onclick,
  icon,
  children,
}) => {
  const isGhost = variant === "ghost" || variant === "ghost-danger";
  const sizeClass = isGhost ? "text-xs" : sizes[size];
  const iconClass = icon ? "flex items-center gap-1.5" : "";
  const classes = `${base} ${variants[variant]} ${sizeClass} ${iconClass} ${className || ""}`.trim();

  return (
    <button type={type} class={classes} onclick={onclick}>
      {icon}
      {children}
    </button>
  );
};
