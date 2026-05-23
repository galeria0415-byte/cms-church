"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function ContentDeleteButton({ endpoint, redirectTo }: { endpoint: string; redirectTo: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm("Delete this record?");

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    await fetch(endpoint, { method: "DELETE" });
    setIsDeleting(false);
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Button type="button" variant="danger" onClick={() => void handleDelete()} disabled={isDeleting}>
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}