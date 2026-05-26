"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { BIBLE_BOOKS, TRANSLATION_LABELS, fetchBibleChapter } from "@/lib/bible";
import type { BibleVerseData } from "@/lib/bible";

type TopicDef = { id: string; name: string; emoji: string; bg: string; book: number; chapter: number };

const TOPICS: TopicDef[] = [
  { id: "love",        name: "Love",           emoji: "❤️",  bg: "bg-rose-100 text-rose-700",    book: 46, chapter: 13 },
  { id: "repentance",  name: "Repentance",     emoji: "🙏",  bg: "bg-purple-100 text-purple-700", book: 19, chapter: 51 },
  { id: "sacrifice",   name: "Sacrifice",      emoji: "✝️",  bg: "bg-blue-100 text-blue-700",    book: 43, chapter: 3  },
  { id: "lent",        name: "Lent",           emoji: "🌿",  bg: "bg-lime-100 text-lime-700",    book: 40, chapter: 4  },
  { id: "sin",         name: "Sin",            emoji: "⚠️",  bg: "bg-yellow-100 text-yellow-700",book: 45, chapter: 3  },
  { id: "salvation",   name: "Salvation",      emoji: "🙌",  bg: "bg-orange-100 text-orange-700",book: 45, chapter: 10 },
  { id: "family",      name: "Family",         emoji: "👨‍👩‍👧", bg: "bg-green-100 text-green-700",  book: 19, chapter: 128},
  { id: "honesty",     name: "Honesty",        emoji: "⚖️",  bg: "bg-teal-100 text-teal-700",   book: 20, chapter: 12 },
  { id: "freedom",     name: "Freedom",        emoji: "🕊️",  bg: "bg-sky-100 text-sky-700",     book: 48, chapter: 5  },
  { id: "joy",         name: "Joy & Happiness",emoji: "😊",  bg: "bg-yellow-100 text-yellow-700",book: 50, chapter: 4  },
  { id: "forgiveness", name: "Forgiveness",    emoji: "💝",  bg: "bg-pink-100 text-pink-700",   book: 40, chapter: 18 },
  { id: "fear",        name: "Overcoming Fear",emoji: "🛡️",  bg: "bg-indigo-100 text-indigo-700",book: 19, chapter: 23 },
  { id: "faith",       name: "Faith",          emoji: "⛪",  bg: "bg-amber-100 text-amber-700", book: 58, chapter: 11 },
  { id: "hope",        name: "Hope",           emoji: "🌅",  bg: "bg-orange-100 text-orange-700",book: 45, chapter: 8  },
  { id: "peace",       name: "Peace",          emoji: "☮️",  bg: "bg-teal-100 text-teal-700",   book: 43, chapter: 14 },
  { id: "prayer",      name: "Prayer",         emoji: "🙏",  bg: "bg-violet-100 text-violet-700",book: 40, chapter: 6  },
  { id: "wisdom",      name: "Wisdom",         emoji: "📖",  bg: "bg-yellow-100 text-yellow-700",book: 20, chapter: 3  },
  { id: "gratitude",   name: "Gratitude",      emoji: "🌿",  bg: "bg-lime-100 text-lime-700",   book: 19, chapter: 100},
  { id: "patience",    name: "Patience",       emoji: "⏳",  bg: "bg-amber-100 text-amber-700", book: 59, chapter: 1  },
  { id: "healing",     name: "Healing",        emoji: "💊",  bg: "bg-red-100 text-red-700",     book: 19, chapter: 103},
  { id: "strength",    name: "Strength",       emoji: "💪",  bg: "bg-orange-100 text-orange-700",book: 19, chapter: 46 },
];

const TRANSLATION_OPTIONS = [
  { value: "web", label: "World English Bible" },
  { value: "kjv", label: "King James Version" },
];

export function BibleReader() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookNum = Math.max(1, Math.min(66, Number(searchParams.get("book")) || 43));
  const bookData = BIBLE_BOOKS.find((b) => b.number === bookNum) ?? BIBLE_BOOKS[42];
  const chapterNum = Math.max(1, Math.min(bookData.chapters, Number(searchParams.get("chapter")) || 1));

  const [activeTab, setActiveTab] = useState<"books" | "topics">("books");
  const [testamentFilter, setTestamentFilter] = useState<"OT" | "NT">("NT");
  const [selectedTranslation, setSelectedTranslation] = useState("web");
  const [actualTranslation, setActualTranslation] = useState("web");
  const [verses, setVerses] = useState<BibleVerseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [presentMode, setPresentMode] = useState(false);
  const [presentIndex, setPresentIndex] = useState(0);

  const go = useCallback(
    (book: number, chapter: number) => router.push(`/bible?book=${book}&chapter=${chapter}`),
    [router],
  );

  useEffect(() => {
    setLoading(true);
    setError(false);
    setVerses([]);
    fetchBibleChapter(bookNum, chapterNum, selectedTranslation).then((data) => {
      if (data) {
        setVerses(Object.values(data.verses).sort((a, b) => a.verse - b.verse));
        setActualTranslation(data.translation ?? selectedTranslation);
      } else {
        setError(true);
      }
      setLoading(false);
    });
  }, [bookNum, chapterNum, selectedTranslation]);

  const goPrev = () => {
    if (chapterNum > 1) go(bookNum, chapterNum - 1);
    else if (bookNum > 1) { const p = BIBLE_BOOKS[bookNum - 2]; go(p.number, p.chapters); }
  };
  const goNext = () => {
    if (chapterNum < bookData.chapters) go(bookNum, chapterNum + 1);
    else if (bookNum < 66) go(BIBLE_BOOKS[bookNum].number, 1);
  };
  const handleRandom = () => {
    const rb = Math.floor(Math.random() * 66) + 1;
    const b = BIBLE_BOOKS.find((x) => x.number === rb)!;
    go(rb, Math.floor(Math.random() * b.chapters) + 1);
  };

  const filteredBooks = BIBLE_BOOKS.filter((b) => b.testament === testamentFilter);
  const totalVerses = verses.length;

  // ── Present mode overlay ──────────────────────────────────────────
  if (presentMode) {
    const v = verses[presentIndex];
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: "linear-gradient(135deg,#1a3a5c 0%,#0d2540 50%,#102947 100%)" }}
      >
        <div className="flex shrink-0 items-center justify-between px-8 py-4 text-white/50">
          <span className="text-sm">
            {bookData.name} {chapterNum} &mdash;{" "}
            {TRANSLATION_LABELS[actualTranslation] ?? actualTranslation.toUpperCase()}
          </span>
          <div className="flex items-center gap-5">
            <button
              title="Toggle fullscreen"
              className="text-lg leading-none transition hover:text-white"
              onClick={() =>
                document.fullscreenElement
                  ? document.exitFullscreen().catch(() => {})
                  : document.documentElement.requestFullscreen().catch(() => {})
              }
            >
              ⛶
            </button>
            <button
              className="text-xl leading-none transition hover:text-white"
              onClick={() => { setPresentMode(false); setPresentIndex(0); }}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-10 text-center">
          {v && (
            <div className="max-w-4xl">
              <p className="font-serif text-[2.4rem] font-bold leading-[1.4] text-white md:text-[3rem]">
                {v.text.trim()}
              </p>
              <p className="mt-8 text-xl text-white/50">
                &mdash; {bookData.name} {chapterNum}:{v.verse}
              </p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-4 px-8 py-6">
          <button
            onClick={() => setPresentIndex((i) => Math.max(0, i - 1))}
            disabled={presentIndex === 0}
            className="text-sm font-medium text-white/60 transition hover:text-white disabled:opacity-25"
          >
            ‹ Previous
          </button>
          <div className="mx-auto flex flex-col items-center gap-2">
            <span className="text-xs text-white/40">{presentIndex + 1} / {totalVerses}</span>
            <div className="h-1 w-56 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-white/60 transition-all duration-300"
                style={{ width: `${totalVerses > 1 ? ((presentIndex + 1) / totalVerses) * 100 : 100}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => setPresentIndex((i) => Math.min(totalVerses - 1, i + 1))}
            disabled={presentIndex >= totalVerses - 1}
            className="text-sm font-medium text-white/60 transition hover:text-white disabled:opacity-25"
          >
            Next ›
          </button>
        </div>
      </div>
    );
  }

  // ── Normal layout ─────────────────────────────────────────────────
  return (
    <div className="flex h-full w-full overflow-hidden bg-white">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="flex h-full w-[270px] min-w-[270px] flex-col border-r border-[var(--line)] bg-white">

        {/* Tabs */}
        <div className="flex shrink-0 border-b border-[var(--line)]">
          {(["books", "topics"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition ${
                activeTab === tab
                  ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {tab === "books" ? "Books" : "Topics"}
            </button>
          ))}
        </div>

        {/* ── Books tab ── */}
        {activeTab === "books" && (
          <>
            {/* Translation dropdown */}
            <div className="shrink-0 border-b border-[var(--line)] px-3 py-2.5">
              <select
                value={selectedTranslation}
                onChange={(e) => setSelectedTranslation(e.target.value)}
                className="w-full cursor-pointer rounded-lg border border-[var(--line)] bg-white px-2 py-1.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              >
                {TRANSLATION_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* OT / NT toggle */}
            <div className="flex shrink-0 gap-2 border-b border-[var(--line)] px-3 py-2.5">
              {(["OT", "NT"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTestamentFilter(t)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                    testamentFilter === t
                      ? "bg-[var(--accent)] text-white"
                      : "border border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  }`}
                >
                  {t === "OT" ? "Old Testament" : "New Testament"}
                </button>
              ))}
            </div>

            {/* Book list */}
            <div className="flex-1 overflow-y-auto">
              {filteredBooks.map((b) => {
                const isActive = b.number === bookNum;
                return (
                  <div key={b.number}>
                    <button
                      onClick={() => go(b.number, 1)}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium transition ${
                        isActive
                          ? "bg-[var(--accent)] text-white"
                          : "text-[var(--ink)] hover:bg-[var(--surface-subtle)]"
                      }`}
                    >
                      <span className={`text-xs ${isActive ? "text-white/60" : "text-[var(--muted)]"}`}>📖</span>
                      <span className="flex-1">{b.name}</span>
                      {isActive && <span className="text-white/80">›</span>}
                    </button>
                    {isActive && (
                      <div className="grid grid-cols-5 gap-1.5 border-b border-[var(--line)] bg-slate-50 px-3 py-3">
                        {Array.from({ length: b.chapters }, (_, i) => i + 1).map((c) => (
                          <button
                            key={c}
                            onClick={() => go(b.number, c)}
                            className={`rounded-lg py-1.5 text-xs font-semibold transition ${
                              c === chapterNum
                                ? "bg-[var(--accent)] text-white shadow-sm"
                                : "border border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Topics tab ── */}
        {activeTab === "topics" && (
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-3 gap-2">
              {TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => {
                    go(topic.book, topic.chapter);
                    const testament = BIBLE_BOOKS.find((b) => b.number === topic.book)?.testament ?? "OT";
                    setTestamentFilter(testament);
                    setActiveTab("books");
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl p-2.5 text-center transition hover:opacity-80 ${topic.bg}`}
                >
                  <span className="text-2xl leading-none">{topic.emoji}</span>
                  <span className="text-[10px] font-semibold leading-tight">{topic.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Nav bar */}
        <div className="flex shrink-0 items-center gap-3 border-b border-[var(--line)] bg-white px-6 py-3">
          <button
            onClick={goPrev}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] text-lg text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            ‹
          </button>
          <h2 className="text-xl font-bold text-[var(--ink)]">{bookData.name} {chapterNum}</h2>
          <button
            onClick={goNext}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] text-lg text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            ›
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleRandom}
              className="flex items-center gap-1.5 rounded-full border border-[var(--line)] px-4 py-1.5 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              ⇄ Random
            </button>
            <button
              onClick={() => { setPresentIndex(0); setPresentMode(true); }}
              disabled={verses.length === 0}
              className="flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:opacity-50"
            >
              ▶ Present
            </button>
          </div>
        </div>

        {/* Reading area */}
        <div className="flex-1 overflow-y-auto px-10 py-6">
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
            <>
              <p className="mb-5 text-xs text-[var(--muted)]">
                {TRANSLATION_LABELS[actualTranslation] ?? actualTranslation.toUpperCase()}
              </p>
              <div className="space-y-3">
                {verses.map((v) => (
                  <p key={v.verse} className="text-[15px] leading-[1.85] text-[var(--ink)]">
                    <span className="mr-1.5 select-none text-xs font-bold text-[var(--accent)]">
                      {v.verse}
                    </span>
                    {v.text.trim()}
                  </p>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

