import Link from "next/link";

import { BibleNav } from "@/components/bible/bible-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Card } from "@/components/ui/card";
import { BIBLE_BOOKS, fetchBibleChapter } from "@/lib/bible";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bible",
};

type SearchParams = Promise<{ book?: string; chapter?: string }>;

export default async function BiblePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const bookNumber = Math.max(1, Math.min(66, Number(params.book) || 43));
  const bookData = BIBLE_BOOKS.find((b) => b.number === bookNumber) ?? BIBLE_BOOKS[42];
  const chapterNumber = Math.max(1, Math.min(bookData.chapters, Number(params.chapter) || 1));

  const chapterData = await fetchBibleChapter(bookNumber, chapterNumber);
  const verses = chapterData
    ? Object.values(chapterData.verses).sort((a, b) => a.verse - b.verse)
    : [];

  const prevChapterNum = chapterNumber > 1 ? chapterNumber - 1 : null;
  const nextChapterNum = chapterNumber < bookData.chapters ? chapterNumber + 1 : null;
  const prevBookData = bookNumber > 1 ? BIBLE_BOOKS[bookNumber - 2] : null;
  const nextBookData = bookNumber < 66 ? BIBLE_BOOKS[bookNumber] : null;

  const prevHref = prevChapterNum
    ? `/bible?book=${bookNumber}&chapter=${prevChapterNum}`
    : prevBookData
      ? `/bible?book=${prevBookData.number}&chapter=${prevBookData.chapters}`
      : null;

  const nextHref = nextChapterNum
    ? `/bible?book=${bookNumber}&chapter=${nextChapterNum}`
    : nextBookData
      ? `/bible?book=${nextBookData.number}&chapter=1`
      : null;

  const prevLabel = prevChapterNum
    ? `← Ch. ${prevChapterNum}`
    : prevBookData
      ? `← ${prevBookData.name}`
      : null;

  const nextLabel = nextChapterNum
    ? `Ch. ${nextChapterNum} →`
    : nextBookData
      ? `${nextBookData.name} →`
      : null;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12 lg:px-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Holy Bible</p>
          <h1 className="mt-2 font-serif text-4xl text-[var(--ink)]">Good News Translation</h1>
        </div>

        <BibleNav bookNumber={bookNumber} chapterNumber={chapterNumber} />

        <Card className="mt-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="font-serif text-2xl text-[var(--ink)]">
              {bookData.name} {chapterNumber}
            </h2>
            <div className="flex items-center gap-2">
              {prevHref && (
                <Link
                  href={prevHref}
                  className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--ink)] transition hover:bg-[var(--surface-subtle)]"
                >
                  {prevLabel}
                </Link>
              )}
              {nextHref && (
                <Link
                  href={nextHref}
                  className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--accent)] transition hover:bg-[var(--surface-subtle)]"
                >
                  {nextLabel}
                </Link>
              )}
            </div>
          </div>

          {verses.length > 0 ? (
            <div className="space-y-0.5">
              {verses.map((v) => (
                <p key={v.verse} className="leading-9 text-[var(--ink)]">
                  <sup className="mr-1.5 select-none text-[10px] font-bold text-[var(--accent)]">
                    {v.verse}
                  </sup>
                  {v.text}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              Unable to load this chapter. Check your connection and try again.
            </p>
          )}
        </Card>

        {(prevHref ?? nextHref) && (
          <div className="mt-4 flex justify-between">
            <div>
              {prevHref && (
                <Link
                  href={prevHref}
                  className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--surface-subtle)]"
                >
                  {prevLabel}
                </Link>
              )}
            </div>
            <div>
              {nextHref && (
                <Link
                  href={nextHref}
                  className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--surface-subtle)]"
                >
                  {nextLabel}
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
