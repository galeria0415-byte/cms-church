"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function PrintToolbar() {
  const router = useRouter();

  return (
    <div className="mb-6 flex gap-3 print:hidden">
      <Button type="button" onClick={() => window.print()}>
        Print
      </Button>
      <Button type="button" variant="secondary" onClick={() => router.back()}>
        Back
      </Button>
    </div>
  );
}