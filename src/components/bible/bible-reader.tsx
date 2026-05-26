"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { BIBLE_BOOKS, TRANSLATION_LABELS, fetchBibleChapter } from "@/lib/bible";
import type { BibleVerseData } from "@/lib/bible";

export function BibleReader() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookNum = Math.max(1, Math.min(66, Number(searchParams.get("book")) || 43));
  const bookData = BIBLE_BOOKS.find((b) => b.number === bookNum) ?? BIBLE_BOOKS[42];
  const chapterNum = Math.max(1, Math.min(bookData.chapters, Number(searchParams.get("chapter")) || 1));

  const [verses, setVerses] = useState<BibleVerseData[]>([]);
  const [translation, setTranslation] = useState("web");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setVerses([]);
    fetchBibleChapter(bookNum, chapterNum).then((data) => {
      if (data) {
        setVerses(Object.values(data.verses).sort((a, b) => a.verse - b.verse));
        setTranslation((data as Record<string, unknown>).translation as string ?? "web");
      } else {
        setError(true);
      }
      setLoading(false);
    });
  }, [bookNum, chapterNum]);

  const go = (book: number, chapter: number) => {
    router.push(`/bible?book=${book}&chapter=${chapter}`);
  };

  const goPrev = () => {
    if (chapterNum > 1) {
      go(bookNum, chapterNum - 1);
    } else if (bookNum > 1) {
      const prev = BIBLE_BOOKS[bookNum - 2];
      go(prev.number, prev.chapters);
    }
  };

  const goNext = () => {
    if (chapterNum < bookData.chapters) {
      go(bookNum, chapterNum + 1);
    } else if (bookNum < 66) {
      go(BIBLE_BOOKS[bookNum].number, 1);
    }
  };

  const hasPrev = chapterNum > 1 || bookNum > 1;
  const hasNext = chapterNum < bookData.chapters || bookNum < 66;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Top navigation bar */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <select
          value={bookNum}
          onChange={(e) => go(Number(e.target.value), 1)}
          className="cursor-pointer rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium text-[var(--ink)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
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
          value={chapterNum}
          onChange={(e) => go(bookNum, Number(e.target.value))}
          className="cursor-pointer rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium text-[var(--ink)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          {Array.from({ length: bookData.chapters }, (_, i) => i + 1).map((c) => (
            <option key={c} value={c}>
              Chapter {c}
            </option>
          ))}
        </select>

        <span className="ml-auto rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--muted)] shadow-sm">
          {TRANSLATION_LABELS[translation] ?? translation.toUpperCase()}
        </span>
      </div>

      {/* Reading area */}
      <div className="rounded-3xl border border-[var(--line)] bg-white px-8 py-10 shadow-sm lg:px-16 lg:py-14">
        <h2 className="mb-8 text-center text-sm font-bold uppercase tracking-[0.2em] text-[var(--ink)]">
          {bookData.name} {chapterNum}
        </h2>

        {loading && (
          <div className="flex justify-center gap-2 py-20">
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:-0.3s]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:-0.15s]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[var(--accent)]" />
          </div>
        )}

        {error && !loading && (
          <p className="py-20 text-center text-sm text-[var(--muted)]">
            Unable to load this chapter. Please check your internet connection and try again.
          </p>
        )}

        {!loading && !error && (
          <p className="text-[17px] leading-[2] text-[var(--ink)]">
            {verses.map((v) => (
              <span key={v.verse}>
                <sup className="mr-0.5 select-none text-[9px] font-bold text-[var(--accent)]">
                  {v.verse}
                </sup>
                {v.text.trim()}{" "}
              </span>
            ))}
          </p>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          onClick={goPrev}
          disabled={!hasPrev}
          className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--ink)] shadow-sm transition hover:bg-[var(--surface-subtle)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Previous chapter
        </button>
        <button
          onClick={goNext}
          disabled={!hasNext}
          className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(24,63,84,0.6)] transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next chapter →
        </button>
      </div>
    </div>
  );
}
