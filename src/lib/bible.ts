export type BibleBook = {
  number: number;
  name: string;
  chapters: number;
  testament: "OT" | "NT";
};

export const BIBLE_BOOKS: BibleBook[] = [
  { number: 1, name: "Genesis", chapters: 50, testament: "OT" },
  { number: 2, name: "Exodus", chapters: 40, testament: "OT" },
  { number: 3, name: "Leviticus", chapters: 27, testament: "OT" },
  { number: 4, name: "Numbers", chapters: 36, testament: "OT" },
  { number: 5, name: "Deuteronomy", chapters: 34, testament: "OT" },
  { number: 6, name: "Joshua", chapters: 24, testament: "OT" },
  { number: 7, name: "Judges", chapters: 21, testament: "OT" },
  { number: 8, name: "Ruth", chapters: 4, testament: "OT" },
  { number: 9, name: "1 Samuel", chapters: 31, testament: "OT" },
  { number: 10, name: "2 Samuel", chapters: 24, testament: "OT" },
  { number: 11, name: "1 Kings", chapters: 22, testament: "OT" },
  { number: 12, name: "2 Kings", chapters: 25, testament: "OT" },
  { number: 13, name: "1 Chronicles", chapters: 29, testament: "OT" },
  { number: 14, name: "2 Chronicles", chapters: 36, testament: "OT" },
  { number: 15, name: "Ezra", chapters: 10, testament: "OT" },
  { number: 16, name: "Nehemiah", chapters: 13, testament: "OT" },
  { number: 17, name: "Esther", chapters: 10, testament: "OT" },
  { number: 18, name: "Job", chapters: 42, testament: "OT" },
  { number: 19, name: "Psalms", chapters: 150, testament: "OT" },
  { number: 20, name: "Proverbs", chapters: 31, testament: "OT" },
  { number: 21, name: "Ecclesiastes", chapters: 12, testament: "OT" },
  { number: 22, name: "Song of Solomon", chapters: 8, testament: "OT" },
  { number: 23, name: "Isaiah", chapters: 66, testament: "OT" },
  { number: 24, name: "Jeremiah", chapters: 52, testament: "OT" },
  { number: 25, name: "Lamentations", chapters: 5, testament: "OT" },
  { number: 26, name: "Ezekiel", chapters: 48, testament: "OT" },
  { number: 27, name: "Daniel", chapters: 12, testament: "OT" },
  { number: 28, name: "Hosea", chapters: 14, testament: "OT" },
  { number: 29, name: "Joel", chapters: 3, testament: "OT" },
  { number: 30, name: "Amos", chapters: 9, testament: "OT" },
  { number: 31, name: "Obadiah", chapters: 1, testament: "OT" },
  { number: 32, name: "Jonah", chapters: 4, testament: "OT" },
  { number: 33, name: "Micah", chapters: 7, testament: "OT" },
  { number: 34, name: "Nahum", chapters: 3, testament: "OT" },
  { number: 35, name: "Habakkuk", chapters: 3, testament: "OT" },
  { number: 36, name: "Zephaniah", chapters: 3, testament: "OT" },
  { number: 37, name: "Haggai", chapters: 2, testament: "OT" },
  { number: 38, name: "Zechariah", chapters: 14, testament: "OT" },
  { number: 39, name: "Malachi", chapters: 4, testament: "OT" },
  { number: 40, name: "Matthew", chapters: 28, testament: "NT" },
  { number: 41, name: "Mark", chapters: 16, testament: "NT" },
  { number: 42, name: "Luke", chapters: 24, testament: "NT" },
  { number: 43, name: "John", chapters: 21, testament: "NT" },
  { number: 44, name: "Acts", chapters: 28, testament: "NT" },
  { number: 45, name: "Romans", chapters: 16, testament: "NT" },
  { number: 46, name: "1 Corinthians", chapters: 16, testament: "NT" },
  { number: 47, name: "2 Corinthians", chapters: 13, testament: "NT" },
  { number: 48, name: "Galatians", chapters: 6, testament: "NT" },
  { number: 49, name: "Ephesians", chapters: 6, testament: "NT" },
  { number: 50, name: "Philippians", chapters: 4, testament: "NT" },
  { number: 51, name: "Colossians", chapters: 4, testament: "NT" },
  { number: 52, name: "1 Thessalonians", chapters: 5, testament: "NT" },
  { number: 53, name: "2 Thessalonians", chapters: 3, testament: "NT" },
  { number: 54, name: "1 Timothy", chapters: 6, testament: "NT" },
  { number: 55, name: "2 Timothy", chapters: 4, testament: "NT" },
  { number: 56, name: "Titus", chapters: 3, testament: "NT" },
  { number: 57, name: "Philemon", chapters: 1, testament: "NT" },
  { number: 58, name: "Hebrews", chapters: 13, testament: "NT" },
  { number: 59, name: "James", chapters: 5, testament: "NT" },
  { number: 60, name: "1 Peter", chapters: 5, testament: "NT" },
  { number: 61, name: "2 Peter", chapters: 3, testament: "NT" },
  { number: 62, name: "1 John", chapters: 5, testament: "NT" },
  { number: 63, name: "2 John", chapters: 1, testament: "NT" },
  { number: 64, name: "3 John", chapters: 1, testament: "NT" },
  { number: 65, name: "Jude", chapters: 1, testament: "NT" },
  { number: 66, name: "Revelation", chapters: 22, testament: "NT" },
];

export type BibleVerseData = { chapter: number; verse: number; text: string };

export type BibleChapterData = {
  book_name: string;
  book_nr: number;
  chapter_nr: number;
  verses: Record<string, BibleVerseData>;
};

export async function fetchBibleChapter(
  bookNumber: number,
  chapterNumber: number,
): Promise<BibleChapterData | null> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(
      `https://api.getbible.net/v2/gnt/${bookNumber}/${chapterNumber}.json`,
      { next: { revalidate: 86400 * 30 }, signal: controller.signal },
    );
    clearTimeout(id);
    if (!res.ok) return null;
    return (await res.json()) as BibleChapterData;
  } catch {
    return null;
  }
}

// 31 popular verses cycling by day-of-month for the homepage VOTD (GNT)
const DAILY_VERSE_REFS: Array<{ book: number; chapter: number; verse: number; ref: string }> = [
  { book: 43, chapter: 3, verse: 16, ref: "John 3:16" },
  { book: 19, chapter: 23, verse: 1, ref: "Psalm 23:1" },
  { book: 50, chapter: 4, verse: 13, ref: "Philippians 4:13" },
  { book: 45, chapter: 8, verse: 28, ref: "Romans 8:28" },
  { book: 23, chapter: 40, verse: 31, ref: "Isaiah 40:31" },
  { book: 20, chapter: 3, verse: 5, ref: "Proverbs 3:5" },
  { book: 24, chapter: 29, verse: 11, ref: "Jeremiah 29:11" },
  { book: 40, chapter: 6, verse: 33, ref: "Matthew 6:33" },
  { book: 19, chapter: 46, verse: 1, ref: "Psalm 46:1" },
  { book: 58, chapter: 11, verse: 1, ref: "Hebrews 11:1" },
  { book: 46, chapter: 13, verse: 13, ref: "1 Corinthians 13:13" },
  { book: 43, chapter: 14, verse: 6, ref: "John 14:6" },
  { book: 49, chapter: 2, verse: 8, ref: "Ephesians 2:8" },
  { book: 45, chapter: 3, verse: 23, ref: "Romans 3:23" },
  { book: 19, chapter: 119, verse: 105, ref: "Psalm 119:105" },
  { book: 40, chapter: 5, verse: 3, ref: "Matthew 5:3" },
  { book: 48, chapter: 5, verse: 22, ref: "Galatians 5:22" },
  { book: 62, chapter: 4, verse: 8, ref: "1 John 4:8" },
  { book: 66, chapter: 21, verse: 4, ref: "Revelation 21:4" },
  { book: 43, chapter: 11, verse: 25, ref: "John 11:25" },
  { book: 55, chapter: 3, verse: 16, ref: "2 Timothy 3:16" },
  { book: 40, chapter: 28, verse: 19, ref: "Matthew 28:19" },
  { book: 60, chapter: 5, verse: 7, ref: "1 Peter 5:7" },
  { book: 49, chapter: 6, verse: 10, ref: "Ephesians 6:10" },
  { book: 42, chapter: 6, verse: 31, ref: "Luke 6:31" },
  { book: 41, chapter: 16, verse: 15, ref: "Mark 16:15" },
  { book: 43, chapter: 10, verse: 10, ref: "John 10:10" },
  { book: 19, chapter: 37, verse: 4, ref: "Psalm 37:4" },
  { book: 59, chapter: 1, verse: 2, ref: "James 1:2" },
  { book: 40, chapter: 11, verse: 28, ref: "Matthew 11:28" },
  { book: 51, chapter: 3, verse: 17, ref: "Colossians 3:17" },
];

export type DailyVerse = { text: string; ref: string };

export async function getDailyVerseGNT(): Promise<DailyVerse | null> {
  const dayIndex = (new Date().getDate() - 1) % DAILY_VERSE_REFS.length;
  const { book, chapter, verse, ref } = DAILY_VERSE_REFS[dayIndex];
  const data = await fetchBibleChapter(book, chapter);
  if (!data) return null;
  const verseData = data.verses[String(verse)];
  if (!verseData) return null;
  return { text: verseData.text.trim(), ref };
}
