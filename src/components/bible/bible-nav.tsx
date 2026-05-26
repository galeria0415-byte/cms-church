"use client";

import { useRouter } from "next/navigation";

import { BIBLE_BOOKS } from "@/lib/bible";

export function BibleNav({
  bookNumber,
  chapterNumber,
}: {
  bookNumber: number;
  chapterNumber: number;
}) {
  const router = useRouter();
  const bookData = BIBLE_BOOKS.find((b) => b.number === bookNumber) ?? BIBLE_BOOKS[42];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={bookNumber}
        onChange={(e) => router.push(`/bible?book=${e.target.value}&chapter=1`)}
        className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      >
        <optgroup label="Old Testament">
          {BIBLE_BOOKS.filter((b) => b.testament === "OT").map((b) => (
            <option key={b.number} value={b.number}>
              {b.name}
            </option>
          ))}
        </optgroup>
        <optgroup label="New Testament">
          {BIBLE_BOOKS.filter((b) => b.testament === "NT").map((b) => (
            <option key={b.number} value={b.number}>
              {b.name}
            </option>
          ))}
        </optgroup>
      </select>

      <select
        value={chapterNumber}
        onChange={(e) => router.push(`/bible?book=${bookNumber}&chapter=${e.target.value}`)}
        className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      >
        {Array.from({ length: bookData.chapters }, (_, i) => i + 1).map((c) => (
          <option key={c} value={c}>
            Chapter {c}
          </option>
        ))}
      </select>
    </div>
  );
}
