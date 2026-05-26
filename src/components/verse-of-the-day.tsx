"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import {
  DAILY_VERSE_REFS,
  TRANSLATION_LABELS,
  fetchBibleChapter,
} from "@/lib/bible";

export function VerseOfTheDayCard() {
  const [verse, setVerse] = useState<{ text: string; ref: string; translation: string } | null>(
    undefined as unknown as null,
  );

  useEffect(() => {
    const dayIndex = (new Date().getDate() - 1) % DAILY_VERSE_REFS.length;
    const { book, chapter, verse: verseNum, ref } = DAILY_VERSE_REFS[dayIndex];
    fetchBibleChapter(book, chapter).then((data) => {
      if (data) {
        const v = data.verses[String(verseNum)];
        const translation = (data as Record<string, unknown>).translation as string ?? "web";
        if (v) setVerse({ text: v.text.trim(), ref, translation });
        else setVerse(null);
      } else {
        setVerse(null);
      }
    });
  }, []);

  // Still loading — show skeleton
  if (verse === (undefined as unknown as null)) {
    return (
      <Card className="flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Verse of the Day</p>
        <div className="h-6 w-3/4 animate-pulse rounded-lg bg-[var(--surface-subtle)]" />
        <div className="h-6 w-full animate-pulse rounded-lg bg-[var(--surface-subtle)]" />
        <div className="h-6 w-2/3 animate-pulse rounded-lg bg-[var(--surface-subtle)]" />
      </Card>
    );
  }

  // Failed to load
  if (!verse) {
    return (
      <Card className="flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Verse of the Day</p>
        <p className="text-sm text-[var(--muted)]">Could not load today&apos;s verse.</p>
      </Card>
    );
  }

  const label = TRANSLATION_LABELS[verse.translation] ?? verse.translation.toUpperCase();

  return (
    <Card className="flex flex-col gap-4">
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
        Verse of the Day &middot; {label}
      </p>
      <blockquote className="font-serif text-xl italic leading-8 text-[var(--ink)]">
        &ldquo;{verse.text}&rdquo;
      </blockquote>
      <p className="text-sm font-semibold text-[var(--accent)]">{verse.ref}</p>
    </Card>
  );
}
