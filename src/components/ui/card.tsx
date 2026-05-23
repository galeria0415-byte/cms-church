import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-[var(--line)] bg-white/90 p-6 shadow-[0_20px_80px_-40px_rgba(80,62,44,0.35)] backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}