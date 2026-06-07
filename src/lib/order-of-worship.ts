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

export type ResponsiveSpeakerTheme = {
  label: string;
  accent: string;
  soft: string;
  border: string;
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

export function getResponsiveSpeakerTheme(line: Pick<WorshipResponsiveLine, "speaker" | "customSpeaker">): ResponsiveSpeakerTheme {
  if (line.speaker === "PREACHER") {
    return { label: getSpeakerLabel(line), accent: "#7c2d12", soft: "#fff1e8", border: "#fdba74" };
  }

  if (line.speaker === "CHURCH") {
    return { label: getSpeakerLabel(line), accent: "#14532d", soft: "#ecfdf3", border: "#86efac" };
  }

  if (line.speaker === "ALL") {
    return { label: getSpeakerLabel(line), accent: "#5b21b6", soft: "#f3e8ff", border: "#c4b5fd" };
  }

  if (line.speaker === "CUSTOM") {
    return { label: getSpeakerLabel(line), accent: "#0f766e", soft: "#ecfeff", border: "#67e8f9" };
  }

  return { label: getSpeakerLabel(line), accent: "#1d4ed8", soft: "#eff6ff", border: "#93c5fd" };
}

export function isScriptureReadingSection(section: Pick<WorshipSection, "title" | "type">) {
  return section.type === "RESPONSIVE" && section.title.trim().toLowerCase() === "scripture reading";
}

function extractSectionText(section: WorshipSection) {
  if (section.type === "TEXT") {
    return section.body;
  }

  if (section.type === "RESPONSIVE") {
    return section.lines.map((line) => line.text).filter(Boolean).join("\n\n");
  }

  if (section.type === "HYMN") {
    return section.parts.map((part) => part.text).filter(Boolean).join("\n\n");
  }

  return section.items.map((item) => item.text).filter(Boolean).join("\n\n");
}

export function createSectionTemplate(type: WorshipSectionType): WorshipSection {
  if (type === "RESPONSIVE") {
    return {
      id: createWorshipId("section"),
      type,
      title: "Call to Worship",
      stand: true,
      lines: [
        { id: createWorshipId("line"), speaker: "LITURGIST", text: "" },
        { id: createWorshipId("line"), speaker: "CHURCH", text: "" },
      ],
    };
  }

  if (type === "HYMN") {
    return {
      id: createWorshipId("section"),
      type,
      title: "Opening Hymn",
      stand: true,
      hymnSource: "",
      songTitle: "",
      parts: [
        { id: createWorshipId("part"), label: "Stanza 1", text: "" },
      ],
    };
  }

  if (type === "LIST") {
    return {
      id: createWorshipId("section"),
      type,
      title: "Our Joys and Concerns",
      stand: false,
      items: [{ id: createWorshipId("item"), title: "", text: "" }],
    };
  }

  return {
    id: createWorshipId("section"),
    type: "TEXT",
    title: "Prelude / Silent Meditation",
    stand: false,
    body: "",
  };
}

export function convertSectionType(section: WorshipSection, nextType: WorshipSectionType): WorshipSection {
  if (section.type === nextType) {
    return section;
  }

  const title = section.title;
  const stand = section.stand;
  const note = section.note;
  const copiedText = extractSectionText(section);

  if (nextType === "TEXT") {
    return {
      id: section.id,
      type: "TEXT",
      title,
      stand,
      note,
      body: copiedText,
    };
  }

  if (nextType === "RESPONSIVE") {
    return {
      id: section.id,
      type: "RESPONSIVE",
      title,
      stand,
      note,
      lines: section.type === "RESPONSIVE"
        ? section.lines
        : [{ id: createWorshipId("line"), speaker: "LITURGIST", text: copiedText }],
    };
  }

  if (nextType === "HYMN") {
    return {
      id: section.id,
      type: "HYMN",
      title,
      stand,
      note,
      hymnSource: section.type === "HYMN" ? section.hymnSource : "",
      songTitle: section.type === "HYMN" ? section.songTitle : "",
      parts: section.type === "HYMN"
        ? section.parts
        : [{ id: createWorshipId("part"), label: "Stanza 1", text: copiedText }],
    };
  }

  return {
    id: section.id,
    type: "LIST",
    title,
    stand,
    note,
    items: section.type === "LIST"
      ? section.items
      : [{ id: createWorshipId("item"), title: "", text: copiedText }],
  };
}

function createTextSection(title: string, stand = false, body = ""): WorshipTextSection {
  return {
    id: createWorshipId("section"),
    type: "TEXT",
    title,
    stand,
    body,
  };
}

function createResponsiveSection(title: string, stand = false, lines?: WorshipResponsiveLine[]): WorshipResponsiveSection {
  return {
    id: createWorshipId("section"),
    type: "RESPONSIVE",
    title,
    stand,
    lines: lines ?? [
      { id: createWorshipId("line"), speaker: "LITURGIST", text: "" },
      { id: createWorshipId("line"), speaker: "CHURCH", text: "" },
    ],
  };
}

function createHymnSection(title: string, stand = false, hymnSource = "", songTitle = "", parts?: WorshipHymnPart[]): WorshipHymnSection {
  return {
    id: createWorshipId("section"),
    type: "HYMN",
    title,
    stand,
    hymnSource,
    songTitle,
    parts: parts ?? [{ id: createWorshipId("part"), label: "Stanza 1", text: "" }],
  };
}

function createListSection(title: string, stand = false, items?: WorshipListItem[]): WorshipListSection {
  return {
    id: createWorshipId("section"),
    type: "LIST",
    title,
    stand,
    items: items ?? [{ id: createWorshipId("item"), title: "", text: "" }],
  };
}

export function createDefaultOrderOfWorship(): OrderOfWorshipDocument {
  return {
    header: {
      leftLogoUrl: "",
      rightLogoUrl: "",
      centerLines: [],
      monthTheme: "",
      orderTitle: "",
      orderSubtitle: "",
      sundayTheme: "",
      serviceDateText: "",
      participantLines: [],
    },
    sections: [],
  };
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeResponsiveLine(value: unknown): WorshipResponsiveLine {
  const source = (value && typeof value === "object") ? value as Partial<WorshipResponsiveLine> : {};
  const speaker = WORSHIP_SPEAKERS.includes(source.speaker as WorshipSpeaker)
    ? source.speaker as WorshipSpeaker
    : "LITURGIST";

  return {
    id: asString(source.id) || createWorshipId("line"),
    speaker,
    customSpeaker: asString(source.customSpeaker) || undefined,
    text: asString(source.text),
  };
}

function normalizeHymnPart(value: unknown, index: number): WorshipHymnPart {
  const source = (value && typeof value === "object") ? value as Partial<WorshipHymnPart> : {};

  return {
    id: asString(source.id) || createWorshipId("part"),
    label: asString(source.label) || `Stanza ${index + 1}`,
    text: asString(source.text),
  };
}

function normalizeListItem(value: unknown): WorshipListItem {
  const source = (value && typeof value === "object") ? value as Partial<WorshipListItem> : {};

  return {
    id: asString(source.id) || createWorshipId("item"),
    title: asString(source.title) || undefined,
    text: asString(source.text),
  };
}

function normalizeSection(value: unknown, fallbackSection?: WorshipSection): WorshipSection {
  const fallback = fallbackSection ?? createSectionTemplate("TEXT");
  const source = (value && typeof value === "object") ? value as Partial<WorshipSection> : {};
  const type = WORSHIP_SECTION_TYPES.includes(source.type as WorshipSectionType)
    ? source.type as WorshipSectionType
    : fallback.type;
  const title = asString(source.title) || fallback.title;
  const note = asString(source.note) || undefined;
  const id = asString(source.id) || createWorshipId("section");
  const stand = asBoolean(source.stand, fallback.stand);

  if (type === "RESPONSIVE") {
    const sourceLines = (source as Partial<WorshipResponsiveSection>).lines;
    const fallbackLines = fallback.type === "RESPONSIVE"
      ? fallback.lines
      : [{ id: createWorshipId("line"), speaker: "LITURGIST", text: "" }];
    const linesSource: unknown[] = Array.isArray(sourceLines)
      ? sourceLines
      : fallbackLines;

    return {
      id,
      type,
      title,
      stand,
      note,
      lines: linesSource.map((line) => normalizeResponsiveLine(line)),
    };
  }

  if (type === "HYMN") {
    const sourceParts = (source as Partial<WorshipHymnSection>).parts;
    const fallbackParts = fallback.type === "HYMN"
      ? fallback.parts
      : [{ id: createWorshipId("part"), label: "Stanza 1", text: "" }];
    const partsSource: unknown[] = Array.isArray(sourceParts)
      ? sourceParts
      : fallbackParts;

    return {
      id,
      type,
      title,
      stand,
      note,
      hymnSource: asString((source as Partial<WorshipHymnSection>).hymnSource),
      songTitle: asString((source as Partial<WorshipHymnSection>).songTitle),
      parts: partsSource.map((part, index) => normalizeHymnPart(part, index)),
    };
  }

  if (type === "LIST") {
    const sourceItems = (source as Partial<WorshipListSection>).items;
    const fallbackItems = fallback.type === "LIST"
      ? fallback.items
      : [{ id: createWorshipId("item"), title: "", text: "" }];
    const itemsSource: unknown[] = Array.isArray(sourceItems)
      ? sourceItems
      : fallbackItems;

    return {
      id,
      type,
      title,
      stand,
      note,
      items: itemsSource.map((item) => normalizeListItem(item)),
    };
  }

  return {
    id,
    type: "TEXT",
    title,
    stand,
    note,
    body: asString((source as Partial<WorshipTextSection>).body),
  };
}

function normalizeDocument(value: unknown): OrderOfWorshipDocument {
  const fallback = createDefaultOrderOfWorship();
  const source = (value && typeof value === "object") ? value as Partial<OrderOfWorshipDocument> : {};
  const sourceHeader = (source.header && typeof source.header === "object") ? source.header as Partial<WorshipHeader> : {};
  const sourceSections = Array.isArray(source.sections) ? source.sections : [];

  return {
    header: {
      leftLogoUrl: asString(sourceHeader.leftLogoUrl),
      rightLogoUrl: asString(sourceHeader.rightLogoUrl),
      centerLines: Array.isArray(sourceHeader.centerLines)
        ? sourceHeader.centerLines.map((line) => asString(line)).filter((line) => line.length > 0)
        : fallback.header.centerLines,
      monthTheme: asString(sourceHeader.monthTheme),
      orderTitle: asString(sourceHeader.orderTitle) || fallback.header.orderTitle,
      orderSubtitle: asString(sourceHeader.orderSubtitle),
      sundayTheme: asString(sourceHeader.sundayTheme),
      serviceDateText: asString(sourceHeader.serviceDateText),
      participantLines: Array.isArray(sourceHeader.participantLines)
        ? sourceHeader.participantLines.map((line) => asString(line)).filter((line) => line.length > 0)
        : [],
    },
    sections: (sourceSections.length ? sourceSections : fallback.sections).map((section, index) => normalizeSection(section, fallback.sections[index])),
  };
}

export function parseOrderOfWorshipDocument(value?: string | null): OrderOfWorshipDocument {
  if (!value) {
    return createDefaultOrderOfWorship();
  }

  try {
    return normalizeDocument(JSON.parse(value));
  } catch {
    return createDefaultOrderOfWorship();
  }
}