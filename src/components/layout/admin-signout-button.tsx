"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function AdminSignOutButton() {
  return (
    <Button type="button" variant="ghost" className="w-full justify-start" onClick={() => void signOut({ callbackUrl: "/login" })}>
      <LogOut className="mr-2 h-4 w-4" />
      Sign out
    </Button>
  );
}