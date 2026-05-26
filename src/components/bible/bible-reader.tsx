"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { BIBLE_BOOKS, TRANSLATION_LABELS, fetchBibleChapter } from "@/lib/bible";
import type { BibleVerseData } from "@/lib/bible";

type VerseRef = { book: number; chapter: number; verse: number };
type TopicDef = { id: string; name: string; emoji: string; bg: string; verses: VerseRef[] };
type TopicCard = { book: number; chapter: number; verse: number; ref: string; text: string };

const TOPICS: TopicDef[] = [
  {
    id: "love", name: "Love", emoji: "❤️", bg: "bg-rose-100 text-rose-700",
    verses: [
      { book: 46, chapter: 16, verse: 14 },  // 1 Cor 16:14
      { book: 46, chapter: 13, verse: 4 },   // 1 Cor 13:4
      { book: 51, chapter: 3, verse: 14 },   // Col 3:14
      { book: 46, chapter: 13, verse: 13 },  // 1 Cor 13:13
      { book: 43, chapter: 15, verse: 13 },  // John 15:13
      { book: 43, chapter: 3, verse: 16 },   // John 3:16
      { book: 62, chapter: 4, verse: 7 },    // 1 John 4:7
      { book: 60, chapter: 4, verse: 8 },    // 1 Pet 4:8
      { book: 43, chapter: 14, verse: 15 },  // John 14:15
      { book: 62, chapter: 4, verse: 19 },   // 1 John 4:19
    ],
  },
  {
    id: "repentance", name: "Repentance", emoji: "🙏", bg: "bg-purple-100 text-purple-700",
    verses: [
      { book: 19, chapter: 51, verse: 10 },  // Ps 51:10
      { book: 44, chapter: 3, verse: 19 },   // Acts 3:19
      { book: 47, chapter: 7, verse: 10 },   // 2 Cor 7:10
      { book: 62, chapter: 1, verse: 9 },    // 1 John 1:9
      { book: 41, chapter: 1, verse: 15 },   // Mark 1:15
      { book: 23, chapter: 55, verse: 7 },   // Isa 55:7
      { book: 42, chapter: 15, verse: 7 },   // Luke 15:7
    ],
  },
  {
    id: "inspirational", name: "Inspirational", emoji: "🌟", bg: "bg-yellow-100 text-yellow-700",
    verses: [
      { book: 24, chapter: 29, verse: 11 },  // Jer 29:11
      { book: 45, chapter: 8, verse: 28 },   // Rom 8:28
      { book: 6, chapter: 1, verse: 9 },     // Josh 1:9
      { book: 50, chapter: 4, verse: 13 },   // Phil 4:13
      { book: 23, chapter: 41, verse: 10 },  // Isa 41:10
      { book: 45, chapter: 15, verse: 13 },  // Rom 15:13
      { book: 19, chapter: 37, verse: 4 },   // Ps 37:4
      { book: 43, chapter: 16, verse: 33 },  // John 16:33
      { book: 40, chapter: 11, verse: 28 },  // Matt 11:28
      { book: 19, chapter: 34, verse: 8 },   // Ps 34:8
    ],
  },
  {
    id: "worry", name: "Worry & Anxiety", emoji: "😟", bg: "bg-blue-100 text-blue-700",
    verses: [
      { book: 50, chapter: 4, verse: 6 },    // Phil 4:6
      { book: 50, chapter: 4, verse: 7 },    // Phil 4:7
      { book: 60, chapter: 5, verse: 7 },    // 1 Pet 5:7
      { book: 43, chapter: 14, verse: 27 },  // John 14:27
      { book: 55, chapter: 1, verse: 7 },    // 2 Tim 1:7
      { book: 19, chapter: 55, verse: 22 },  // Ps 55:22
      { book: 6, chapter: 1, verse: 9 },     // Josh 1:9
      { book: 40, chapter: 6, verse: 34 },   // Matt 6:34
      { book: 19, chapter: 94, verse: 19 },  // Ps 94:19
      { book: 40, chapter: 11, verse: 28 },  // Matt 11:28
      { book: 19, chapter: 56, verse: 3 },   // Ps 56:3
    ],
  },
  {
    id: "salvation", name: "Salvation", emoji: "🙌", bg: "bg-orange-100 text-orange-700",
    verses: [
      { book: 43, chapter: 3, verse: 16 },   // John 3:16
      { book: 45, chapter: 10, verse: 9 },   // Rom 10:9
      { book: 49, chapter: 2, verse: 8 },    // Eph 2:8
      { book: 43, chapter: 14, verse: 6 },   // John 14:6
      { book: 44, chapter: 4, verse: 12 },   // Acts 4:12
      { book: 45, chapter: 8, verse: 1 },    // Rom 8:1
      { book: 56, chapter: 3, verse: 5 },    // Titus 3:5
    ],
  },
  {
    id: "family", name: "Family", emoji: "👨‍👩‍👧", bg: "bg-green-100 text-green-700",
    verses: [
      { book: 19, chapter: 128, verse: 3 },  // Ps 128:3
      { book: 20, chapter: 22, verse: 6 },   // Prov 22:6
      { book: 49, chapter: 6, verse: 4 },    // Eph 6:4
      { book: 49, chapter: 6, verse: 1 },    // Eph 6:1
      { book: 51, chapter: 3, verse: 20 },   // Col 3:20
      { book: 6, chapter: 24, verse: 15 },   // Josh 24:15
    ],
  },
  {
    id: "grief", name: "Grief", emoji: "😢", bg: "bg-indigo-100 text-indigo-700",
    verses: [
      { book: 19, chapter: 34, verse: 18 },  // Ps 34:18
      { book: 40, chapter: 5, verse: 4 },    // Matt 5:4
      { book: 66, chapter: 21, verse: 4 },   // Rev 21:4
      { book: 43, chapter: 11, verse: 35 },  // John 11:35
      { book: 19, chapter: 147, verse: 3 },  // Ps 147:3
      { book: 47, chapter: 1, verse: 3 },    // 2 Cor 1:3
      { book: 47, chapter: 1, verse: 4 },    // 2 Cor 1:4
      { book: 45, chapter: 8, verse: 18 },   // Rom 8:18
      { book: 19, chapter: 73, verse: 26 },  // Ps 73:26
    ],
  },
  {
    id: "comfort", name: "Comfort", emoji: "🕊️", bg: "bg-sky-100 text-sky-700",
    verses: [
      { book: 47, chapter: 1, verse: 3 },    // 2 Cor 1:3
      { book: 47, chapter: 1, verse: 4 },    // 2 Cor 1:4
      { book: 19, chapter: 23, verse: 4 },   // Ps 23:4
      { book: 43, chapter: 14, verse: 27 },  // John 14:27
      { book: 40, chapter: 11, verse: 28 },  // Matt 11:28
      { book: 23, chapter: 40, verse: 1 },   // Isa 40:1
      { book: 50, chapter: 4, verse: 7 },    // Phil 4:7
      { book: 19, chapter: 34, verse: 18 },  // Ps 34:18
      { book: 45, chapter: 8, verse: 38 },   // Rom 8:38
    ],
  },
  {
    id: "friendship", name: "Friendship", emoji: "🤝", bg: "bg-emerald-100 text-emerald-700",
    verses: [
      { book: 20, chapter: 17, verse: 17 },  // Prov 17:17
      { book: 20, chapter: 18, verse: 24 },  // Prov 18:24
      { book: 43, chapter: 15, verse: 13 },  // John 15:13
      { book: 20, chapter: 27, verse: 9 },   // Prov 27:9
      { book: 20, chapter: 27, verse: 17 },  // Prov 27:17
      { book: 52, chapter: 5, verse: 11 },   // 1 Thess 5:11
      { book: 21, chapter: 4, verse: 9 },    // Eccl 4:9
      { book: 43, chapter: 15, verse: 15 },  // John 15:15
    ],
  },
  {
    id: "joy", name: "Joy", emoji: "😊", bg: "bg-yellow-100 text-yellow-700",
    verses: [
      { book: 50, chapter: 4, verse: 4 },    // Phil 4:4
      { book: 19, chapter: 16, verse: 11 },  // Ps 16:11
      { book: 16, chapter: 8, verse: 10 },   // Neh 8:10
      { book: 43, chapter: 15, verse: 11 },  // John 15:11
      { book: 48, chapter: 5, verse: 22 },   // Gal 5:22
      { book: 19, chapter: 30, verse: 5 },   // Ps 30:5
      { book: 45, chapter: 15, verse: 13 },  // Rom 15:13
    ],
  },
  {
    id: "forgiveness", name: "Forgiveness", emoji: "💝", bg: "bg-pink-100 text-pink-700",
    verses: [
      { book: 49, chapter: 4, verse: 32 },   // Eph 4:32
      { book: 41, chapter: 11, verse: 25 },  // Mark 11:25
      { book: 62, chapter: 1, verse: 9 },    // 1 John 1:9
      { book: 40, chapter: 18, verse: 21 },  // Matt 18:21
      { book: 40, chapter: 6, verse: 14 },   // Matt 6:14
      { book: 51, chapter: 3, verse: 13 },   // Col 3:13
      { book: 19, chapter: 103, verse: 12 }, // Ps 103:12
      { book: 42, chapter: 23, verse: 34 },  // Luke 23:34
      { book: 23, chapter: 1, verse: 18 },   // Isa 1:18
      { book: 47, chapter: 5, verse: 17 },   // 2 Cor 5:17
      { book: 33, chapter: 7, verse: 18 },   // Micah 7:18
    ],
  },
  {
    id: "encouragement", name: "Encouragement", emoji: "✨", bg: "bg-teal-100 text-teal-700",
    verses: [
      { book: 43, chapter: 16, verse: 33 },  // John 16:33
      { book: 52, chapter: 5, verse: 11 },   // 1 Thess 5:11
      { book: 58, chapter: 10, verse: 23 },  // Heb 10:23
      { book: 55, chapter: 1, verse: 7 },    // 2 Tim 1:7
      { book: 19, chapter: 34, verse: 4 },   // Ps 34:4
      { book: 45, chapter: 8, verse: 28 },   // Rom 8:28
      { book: 23, chapter: 43, verse: 2 },   // Isa 43:2
      { book: 19, chapter: 28, verse: 7 },   // Ps 28:7
      { book: 46, chapter: 15, verse: 58 },  // 1 Cor 15:58
    ],
  },
  {
    id: "faith", name: "Faith", emoji: "⛪", bg: "bg-amber-100 text-amber-700",
    verses: [
      { book: 58, chapter: 11, verse: 1 },   // Heb 11:1
      { book: 49, chapter: 2, verse: 8 },    // Eph 2:8
      { book: 45, chapter: 10, verse: 17 },  // Rom 10:17
      { book: 41, chapter: 11, verse: 24 },  // Mark 11:24
      { book: 59, chapter: 2, verse: 17 },   // James 2:17
      { book: 40, chapter: 17, verse: 20 },  // Matt 17:20
    ],
  },
  {
    id: "hope", name: "Hope", emoji: "🌅", bg: "bg-orange-100 text-orange-700",
    verses: [
      { book: 24, chapter: 29, verse: 11 },  // Jer 29:11
      { book: 45, chapter: 15, verse: 13 },  // Rom 15:13
      { book: 60, chapter: 5, verse: 10 },   // 1 Pet 5:10
      { book: 58, chapter: 10, verse: 23 },  // Heb 10:23
      { book: 45, chapter: 5, verse: 5 },    // Rom 5:5
      { book: 50, chapter: 1, verse: 6 },    // Phil 1:6
      { book: 19, chapter: 130, verse: 5 },  // Ps 130:5
      { book: 25, chapter: 3, verse: 22 },   // Lam 3:22
      { book: 25, chapter: 3, verse: 23 },   // Lam 3:23
    ],
  },
  {
    id: "peace", name: "Peace", emoji: "☮️", bg: "bg-teal-100 text-teal-700",
    verses: [
      { book: 43, chapter: 14, verse: 27 },  // John 14:27
      { book: 50, chapter: 4, verse: 7 },    // Phil 4:7
      { book: 23, chapter: 26, verse: 3 },   // Isa 26:3
      { book: 43, chapter: 16, verse: 33 },  // John 16:33
      { book: 45, chapter: 5, verse: 1 },    // Rom 5:1
      { book: 19, chapter: 29, verse: 11 },  // Ps 29:11
    ],
  },
  {
    id: "prayer", name: "Prayer", emoji: "🙏", bg: "bg-violet-100 text-violet-700",
    verses: [
      { book: 50, chapter: 4, verse: 6 },    // Phil 4:6
      { book: 52, chapter: 5, verse: 17 },   // 1 Thess 5:17
      { book: 41, chapter: 11, verse: 24 },  // Mark 11:24
      { book: 59, chapter: 5, verse: 16 },   // James 5:16
      { book: 40, chapter: 7, verse: 7 },    // Matt 7:7
      { book: 62, chapter: 5, verse: 14 },   // 1 John 5:14
    ],
  },
  {
    id: "wisdom", name: "Wisdom", emoji: "📖", bg: "bg-amber-100 text-amber-700",
    verses: [
      { book: 20, chapter: 3, verse: 5 },    // Prov 3:5
      { book: 59, chapter: 1, verse: 5 },    // James 1:5
      { book: 20, chapter: 9, verse: 10 },   // Prov 9:10
      { book: 20, chapter: 2, verse: 6 },    // Prov 2:6
      { book: 19, chapter: 111, verse: 10 }, // Ps 111:10
      { book: 51, chapter: 3, verse: 16 },   // Col 3:16
    ],
  },
  {
    id: "gratitude", name: "Gratitude", emoji: "🌿", bg: "bg-lime-100 text-lime-700",
    verses: [
      { book: 19, chapter: 100, verse: 4 },  // Ps 100:4
      { book: 52, chapter: 5, verse: 18 },   // 1 Thess 5:18
      { book: 51, chapter: 3, verse: 17 },   // Col 3:17
      { book: 50, chapter: 4, verse: 6 },    // Phil 4:6
      { book: 19, chapter: 107, verse: 1 },  // Ps 107:1
      { book: 58, chapter: 12, verse: 28 },  // Heb 12:28
    ],
  },
  {
    id: "healing", name: "Healing", emoji: "💊", bg: "bg-red-100 text-red-700",
    verses: [
      { book: 60, chapter: 2, verse: 24 },   // 1 Pet 2:24
      { book: 23, chapter: 40, verse: 29 },  // Isa 40:29
      { book: 19, chapter: 147, verse: 3 },  // Ps 147:3
      { book: 59, chapter: 5, verse: 14 },   // James 5:14
      { book: 24, chapter: 17, verse: 14 },  // Jer 17:14
      { book: 19, chapter: 103, verse: 2 },  // Ps 103:2
      { book: 23, chapter: 53, verse: 5 },   // Isa 53:5
      { book: 64, chapter: 1, verse: 2 },    // 3 John 1:2
      { book: 19, chapter: 30, verse: 2 },   // Ps 30:2
      { book: 24, chapter: 30, verse: 17 },  // Jer 30:17
      { book: 20, chapter: 17, verse: 22 },  // Prov 17:22
    ],
  },
  {
    id: "strength", name: "Strength", emoji: "💪", bg: "bg-orange-100 text-orange-700",
    verses: [
      { book: 50, chapter: 4, verse: 13 },   // Phil 4:13
      { book: 23, chapter: 40, verse: 31 },  // Isa 40:31
      { book: 23, chapter: 41, verse: 10 },  // Isa 41:10
      { book: 47, chapter: 12, verse: 9 },   // 2 Cor 12:9
      { book: 19, chapter: 46, verse: 1 },   // Ps 46:1
      { book: 49, chapter: 6, verse: 10 },   // Eph 6:10
      { book: 6, chapter: 1, verse: 9 },     // Josh 1:9
      { book: 19, chapter: 73, verse: 26 },  // Ps 73:26
      { book: 16, chapter: 8, verse: 10 },   // Neh 8:10
      { book: 5, chapter: 31, verse: 6 },    // Deut 31:6
      { book: 19, chapter: 27, verse: 1 },   // Ps 27:1
    ],
  },
  {
    id: "gods-promises", name: "God's Promises", emoji: "🌈", bg: "bg-purple-100 text-purple-700",
    verses: [
      { book: 24, chapter: 29, verse: 11 },  // Jer 29:11
      { book: 50, chapter: 4, verse: 19 },   // Phil 4:19
      { book: 58, chapter: 10, verse: 23 },  // Heb 10:23
      { book: 47, chapter: 1, verse: 20 },   // 2 Cor 1:20
      { book: 40, chapter: 28, verse: 20 },  // Matt 28:20
      { book: 45, chapter: 8, verse: 28 },   // Rom 8:28
      { book: 19, chapter: 34, verse: 8 },   // Ps 34:8
      { book: 58, chapter: 13, verse: 5 },   // Heb 13:5
      { book: 61, chapter: 1, verse: 4 },    // 2 Pet 1:4
    ],
  },
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
  const [selectedTopic, setSelectedTopic] = useState<TopicDef | null>(null);
  const [topicCards, setTopicCards] = useState<TopicCard[]>([]);
  const [topicLoading, setTopicLoading] = useState(false);
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);

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

  useEffect(() => {
    if (!highlightedVerse || verses.length === 0) return;
    const timer = setTimeout(() => {
      document.getElementById(`verse-${highlightedVerse}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    return () => clearTimeout(timer);
  }, [verses, highlightedVerse]);

  useEffect(() => {
    if (!selectedTopic) { setTopicCards([]); return; }
    setTopicLoading(true);
    setTopicCards([]);
    const grouped = new Map<string, { book: number; chapter: number; verses: number[] }>();
    for (const ref of selectedTopic.verses) {
      const key = `${ref.book}-${ref.chapter}`;
      if (!grouped.has(key)) grouped.set(key, { book: ref.book, chapter: ref.chapter, verses: [] });
      grouped.get(key)!.verses.push(ref.verse);
    }
    Promise.all(
      Array.from(grouped.values()).map(async (g) => {
        const data = await fetchBibleChapter(g.book, g.chapter, selectedTranslation);
        if (!data) return [] as TopicCard[];
        const bookName = BIBLE_BOOKS.find((b) => b.number === g.book)?.name ?? "?";
        return g.verses.map((v) => ({
          book: g.book,
          chapter: g.chapter,
          verse: v,
          ref: `${bookName} ${g.chapter}:${v}`,
          text: data.verses[String(v)]?.text ?? "",
        }));
      }),
    ).then((results) => {
      const flat = results.flat();
      const order = selectedTopic.verses.map((r) => `${r.book}-${r.chapter}-${r.verse}`);
      flat.sort(
        (a, b) =>
          order.indexOf(`${a.book}-${a.chapter}-${a.verse}`) -
          order.indexOf(`${b.book}-${b.chapter}-${b.verse}`),
      );
      setTopicCards(flat);
      setTopicLoading(false);
    });
  }, [selectedTopic, selectedTranslation]);

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
          <div className="flex flex-1 flex-col overflow-hidden">
            {!selectedTopic ? (
              <div className="flex-1 overflow-y-auto p-3">
                <div className="grid grid-cols-3 gap-2">
                  {TOPICS.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl p-2.5 text-center transition hover:opacity-80 ${topic.bg}`}
                    >
                      <span className="text-2xl leading-none">{topic.emoji}</span>
                      <span className="text-[10px] font-semibold leading-tight">{topic.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex shrink-0 items-center gap-2 border-b border-[var(--line)] px-3 py-2.5">
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line)] text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    ←
                  </button>
                  <span className="text-base">{selectedTopic.emoji}</span>
                  <span className="text-sm font-semibold text-[var(--ink)]">{selectedTopic.name}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {topicLoading && (
                    <div className="flex justify-center gap-2 py-8">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)]" />
                    </div>
                  )}
                  {!topicLoading && topicCards.length === 0 && (
                    <p className="py-8 text-center text-xs text-[var(--muted)]">No verses found.</p>
                  )}
                  {!topicLoading &&
                    topicCards.map((card) => (
                      <button
                        key={`${card.book}-${card.chapter}-${card.verse}`}
                        onClick={() => {
                          setHighlightedVerse(card.verse);
                          go(card.book, card.chapter);
                          setActiveTab("books");
                          setTestamentFilter(
                            BIBLE_BOOKS.find((b) => b.number === card.book)?.testament ?? "NT",
                          );
                        }}
                        className="mb-2 w-full rounded-xl border border-[var(--line)] bg-white p-3 text-left transition hover:border-[var(--accent)] hover:bg-[var(--surface-subtle)]"
                      >
                        <p className="mb-1 text-xs font-bold text-red-500">{card.ref}</p>
                        <p className="line-clamp-3 text-xs leading-snug text-[var(--ink)]">
                          &ldquo;{card.text.trim()}&rdquo;
                        </p>
                      </button>
                    ))}
                </div>
              </>
            )}
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
                  <p
                    key={v.verse}
                    id={`verse-${v.verse}`}
                    className={`scroll-mt-6 text-[15px] leading-[1.85] text-[var(--ink)] transition-colors duration-500 ${
                      highlightedVerse === v.verse ? "-mx-2 rounded-lg bg-amber-100 px-2 ring-1 ring-amber-300" : ""
                    }`}
                  >
                    <span className="mr-1.5 select-none text-xs font-bold text-red-500">
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

