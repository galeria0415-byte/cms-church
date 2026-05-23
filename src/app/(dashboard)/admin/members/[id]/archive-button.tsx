"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function ArchiveButton({ id }: { id: string }) {
  const router = useRouter();
  const [isArchiving, setIsArchiving] = useState(false);

  async function handleArchive() {
    const confirmed = window.confirm("Archive this member record?");

    if (!confirmed) {
      return;
    }

    setIsArchiving(true);
    await fetch(`/api/members/${id}`, { method: "DELETE" });
    setIsArchiving(false);
    router.push("/admin/members");
    router.refresh();
  }

  return (
    <Button type="button" variant="danger" onClick={() => void handleArchive()} disabled={isArchiving}>
      {isArchiving ? "Archiving..." : "Archive member"}
    </Button>
  );
}