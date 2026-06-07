import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "sm" | "icon";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "border-transparent bg-[linear-gradient(180deg,var(--accent),var(--accent-strong))] text-white hover:brightness-[1.04]",
  secondary:
    "border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,250,0.96))] text-[var(--ink)] hover:bg-[var(--sand)]",
  ghost: "border-transparent bg-transparent text-[var(--ink)] hover:bg-[var(--sand)]",
  danger: "border-[#8d3423] bg-[linear-gradient(180deg,#b84a34,#8d3423)] text-white hover:brightness-[1.03]",
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
    "inline-flex items-center justify-center whitespace-nowrap rounded-full border text-sm font-semibold tracking-[0.01em] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_16px_34px_-24px_rgba(15,23,42,0.45)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-60",
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