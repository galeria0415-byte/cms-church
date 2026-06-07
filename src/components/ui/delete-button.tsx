"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { buttonStyles } from "@/components/ui/button";

interface DeleteButtonProps {
  apiPath: string;
  label?: string;
  confirmMessage?: string;
  redirectTo?: string;
}

export function DeleteButton({
  apiPath,
  label = "Delete",
  confirmMessage = "Are you sure you want to permanently delete this item? This cannot be undone.",
  redirectTo,
}: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    const res = await fetch(apiPath, { method: "DELETE" });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert((data as { error?: string }).error ?? "Failed to delete.");
      setIsDeleting(false);
      return;
    }

    if (redirectTo) {
      router.push(redirectTo);
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void handleDelete()}
      disabled={isDeleting}
      className={buttonStyles({ variant: "danger", size: "sm", className: "gap-1.5" })}
    >
      <Trash2 className="h-3.5 w-3.5" />
      {isDeleting ? "Deleting..." : label}
    </button>
  );
}
