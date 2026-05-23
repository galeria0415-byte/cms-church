import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[120px] w-full rounded-3xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] shadow-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--accent)_20%,white)]",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";