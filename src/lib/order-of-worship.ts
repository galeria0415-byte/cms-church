export const WORSHIP_SECTION_TYPES = ["TEXT", "RESPONSIVE", "HYMN", "LIST"] as const;

export const WORSHIP_SPEAKERS = ["LITURGIST", "PREACHER", "CHURCH", "ALL", "CUSTOM"] as const;

export type WorshipSectionType = (typeof WORSHIP_SECTION_TYPES)[number];
export type WorshipSpeaker = (typeof WORSHIP_SPEAKERS)[number];

export type WorshipResponsiveLine = {
  id: string;
  speaker: WorshipSpeaker;
  customSpeaker?: string;
  text: string;
};

export type WorshipHymnPart = {
  id: string;
  label: string;
  text: string;
};

export type WorshipListItem = {
  id: string;
  title?: string;
  text: string;
};

type WorshipSectionBase = {
  id: string;
  type: WorshipSectionType;
  title: string;
  stand: boolean;
  note?: string;
};

export type WorshipTextSection = WorshipSectionBase & {
  type: "TEXT";
  body: string;
};

export type WorshipResponsiveSection = WorshipSectionBase & {
  type: "RESPONSIVE";
  lines: WorshipResponsiveLine[];
};

export type WorshipHymnSection = WorshipSectionBase & {
  type: "HYMN";
  hymnSource?: string;
  songTitle?: string;
  parts: WorshipHymnPart[];
};

export type WorshipListSection = WorshipSectionBase & {
  type: "LIST";
  items: WorshipListItem[];
};

export type WorshipSection =
  | WorshipTextSection
  | WorshipResponsiveSection
  | WorshipHymnSection
  | WorshipListSection;

export type WorshipHeader = {
  leftLogoUrl?: string;
  rightLogoUrl?: string;
  centerLines: string[];
  monthTheme?: string;
  orderTitle?: string;
  orderSubtitle?: string;
  sundayTheme?: string;
  serviceDateText?: string;
  participantLines: string[];
};

export type OrderOfWorshipDocument = {
  header: WorshipHeader;
  sections: WorshipSection[];
};

export function createWorshipId(prefix: string) {
  const uuid = typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);

  return `${prefix}-${uuid}`;
}

export function getSpeakerLabel(line: Pick<WorshipResponsiveLine, "speaker" | "customSpeaker">) {
  if (line.speaker === "CUSTOM") {
    return line.customSpeaker?.trim() || "Leader";
  }

  return {
    LITURGIST: "Liturgist",
    PREACHER: "Preacher",
    CHURCH: "Church",
    ALL: "All",
  }[line.speaker];
}

export function createSectionTemplate(type: WorshipSectionType): WorshipSection {
  if (type === "RESPONSIVE") {
    return {
      id: createWorshipId("section"),
      type,
      title: "Call to Worship",
      stand: true,
      lines: [
        { id: createWorshipId("line"), speaker: "LITURGIST", text: "Add the opening line here." },
        { id: createWorshipId("line"), speaker: "CHURCH", text: "Add the congregational response here." },
      ],
    };
  }

  if (type === "HYMN") {
    return {
      id: createWorshipId("section"),
      type,
      title: "Opening Hymn",
      stand: true,
      hymnSource: "HFJ No. ___",
      songTitle: "Song title",
      parts: [
        { id: createWorshipId("part"), label: "Stanza 1", text: "Enter lyrics here." },
      ],
    };
  }

  if (type === "LIST") {
    return {
      id: createWorshipId("section"),
      type,
      title: "Our Joys and Concerns",
      stand: false,
      items: [{ id: createWorshipId("item"), title: "Prayer item", text: "Enter the item text here." }],
    };
  }

  return {
    id: createWorshipId("section"),
    type: "TEXT",
    title: "Prelude / Silent Meditation",
    stand: false,
    body: "Enter the content for this section.",
  };
}

export function createDefaultOrderOfWorship(): OrderOfWorshipDocument {
  return {
    header: {
      leftLogoUrl: "",
      rightLogoUrl: "",
      centerLines: [
        "UNITED CHURCH OF CHRIST IN THE PHILIPPINES",
        "Jurisdiction / Conference",
        "Local Church Name",
      ],
      monthTheme: "Month Theme: Life in Christ",
      orderTitle: "ORDER OF WORSHIP",
      orderSubtitle: "Sunday Service",
      sundayTheme: "Theme this Sunday: \"Life in Community\"",
      serviceDateText: "17 May 2026, 9:00 a.m.",
      participantLines: [
        "Preacher: Rev. __________",
        "Liturgist: __________",
        "Church at Prayer: __________",
      ],
    },
    sections: [
      { id: createWorshipId("section"), type: "TEXT", title: "Ringing of the Church Bell", stand: false, body: "(At the sound of the bell, please be silent.)" },
      { id: createWorshipId("section"), type: "TEXT", title: "Prelude / Silent Meditation", stand: false, body: "Instrumental preparation or silent meditation." },
      { id: createWorshipId("section"), type: "TEXT", title: "Introit", stand: true, body: "Opening choral or congregational call into worship." },
      { id: createWorshipId("section"), type: "HYMN", title: "Opening Hymn", stand: true, hymnSource: "HFJ No. ___", songTitle: "The Church's One Foundation", parts: [{ id: createWorshipId("part"), label: "Stanza 1", text: "Enter stanza text here." }] },
      { id: createWorshipId("section"), type: "TEXT", title: "Lighting of the Altar Candles", stand: true, body: "Lighting of the altar candles." },
      { id: createWorshipId("section"), type: "RESPONSIVE", title: "Call to Worship", stand: true, lines: [{ id: createWorshipId("line"), speaker: "LITURGIST", text: "The foundation of our faith community is the unity of the Three in One." }, { id: createWorshipId("line"), speaker: "CHURCH", text: "Make us one, Lord, just as You are one." }] },
      { id: createWorshipId("section"), type: "TEXT", title: "Prayer of Approach", stand: false, body: "Holy God, we come today..." },
      { id: createWorshipId("section"), type: "HYMN", title: "Song of Response", stand: false, hymnSource: "HFJ No. ___", songTitle: "Glory to the Creator", parts: [{ id: createWorshipId("part"), label: "Response", text: "Enter the response lyrics here." }] },
      { id: createWorshipId("section"), type: "TEXT", title: "Call to Confession", stand: false, body: "Call to confession text." },
      { id: createWorshipId("section"), type: "TEXT", title: "Prayer of Confession", stand: false, body: "Prayer of confession text." },
      { id: createWorshipId("section"), type: "RESPONSIVE", title: "Assurance of Pardon", stand: false, lines: [{ id: createWorshipId("line"), speaker: "PREACHER", text: "Scriptural assurance text." }, { id: createWorshipId("line"), speaker: "CHURCH", text: "Thank You, Lord, for Your forgiveness!" }] },
      { id: createWorshipId("section"), type: "HYMN", title: "Song Response", stand: false, hymnSource: "HFJ No. ___", songTitle: "Hear Our Prayer", parts: [{ id: createWorshipId("part"), label: "Response", text: "Enter the song response here." }] },
      { id: createWorshipId("section"), type: "LIST", title: "Our Joys and Concerns", stand: false, items: [{ id: createWorshipId("item"), title: "Joy", text: "Add a thanksgiving item." }, { id: createWorshipId("item"), title: "Concern", text: "Add a prayer concern." }] },
      { id: createWorshipId("section"), type: "HYMN", title: "Fellowship Song", stand: false, hymnSource: "HFJ No. ___", songTitle: "Halle, Halle, Hallelujah!", parts: [{ id: createWorshipId("part"), label: "Song", text: "Enter fellowship song lyrics here." }] },
      { id: createWorshipId("section"), type: "TEXT", title: "Church at Prayer", stand: false, body: "Prayer text or prayer lead instructions." },
    ],
  };
}

export function parseOrderOfWorshipDocument(value?: string | null): OrderOfWorshipDocument {
  if (!value) {
    return createDefaultOrderOfWorship();
  }

  try {
    return JSON.parse(value) as OrderOfWorshipDocument;
  } catch {
    return createDefaultOrderOfWorship();
  }
}