import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "sm" | "icon";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "border-[color:color-mix(in_oklab,var(--accent)_18%,transparent)] bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]",
  secondary:
    "border-[var(--line)] bg-white/78 text-[var(--ink)] hover:bg-white",
  ghost: "border-transparent bg-transparent text-[var(--ink)] hover:bg-[var(--sand)]",
  danger: "border-[#efc1b7] bg-[#fff1ec] text-[#a53f2b] hover:bg-[#ffe7df]",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  md: "h-11 px-5",
  sm: "h-9 px-4 text-sm",
  icon: "h-11 w-11 px-0",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: NonNullable<ButtonProps["variant"]>;
  size?: NonNullable<ButtonProps["size"]>;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-2xl border text-sm font-semibold tracking-[0.01em] backdrop-blur-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-60",
    sizes[size],
    variants[variant],
    className,
  );
}

export function Button({ className, variant = "primary", size = "md", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      {...props}
    />
  );
}