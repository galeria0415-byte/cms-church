"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
      className="inline-flex items-center gap-1.5 rounded-full border border-[#fde8e8] bg-[#fff5f5] px-3 py-1.5 text-sm font-semibold text-[#b91c1c] transition hover:bg-[#fee2e2] disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {isDeleting ? "Deleting..." : label}
    </button>
  );
}
