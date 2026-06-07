import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]",
  secondary:
    "bg-white text-[var(--ink)] ring-1 ring-[var(--line)] hover:bg-[var(--sand)]",
  ghost: "bg-transparent text-[var(--ink)] hover:bg-[var(--sand)]",
  danger: "bg-[#a53f2b] text-white hover:bg-[#8d3423]",
};

export function Button({ className, variant = "primary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-9 items-center justify-center whitespace-nowrap rounded-lg px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}