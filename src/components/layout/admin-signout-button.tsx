"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function AdminSignOutButton({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={collapsed ? "h-10 w-10 rounded-xl border border-white/10 px-0 text-white/82 hover:bg-white/10 hover:text-white" : "w-full justify-center rounded-2xl border border-white/10 bg-white/6 text-white/82 hover:bg-white/10 hover:text-white"}
      onClick={() => void signOut({ callbackUrl: "/login" })}
      aria-label="Sign out"
      title={collapsed ? "Sign out" : undefined}
    >
      <LogOut className={collapsed ? "h-4 w-4" : "mr-2 h-4 w-4"} />
      {!collapsed ? "Sign out" : null}
    </Button>
  );
}