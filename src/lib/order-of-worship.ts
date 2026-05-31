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

function createTextSection(title: string, stand = false): WorshipTextSection {
  return {
    id: createWorshipId("section"),
    type: "TEXT",
    title,
    stand,
    body: "",
  };
}

function createResponsiveSection(title: string, stand = false): WorshipResponsiveSection {
  return {
    id: createWorshipId("section"),
    type: "RESPONSIVE",
    title,
    stand,
    lines: [
      { id: createWorshipId("line"), speaker: "LITURGIST", text: "" },
      { id: createWorshipId("line"), speaker: "CHURCH", text: "" },
    ],
  };
}

function createHymnSection(title: string, stand = false): WorshipHymnSection {
  return {
    id: createWorshipId("section"),
    type: "HYMN",
    title,
    stand,
    hymnSource: "",
    songTitle: "",
    parts: [{ id: createWorshipId("part"), label: "Stanza 1", text: "" }],
  };
}

function createListSection(title: string, stand = false): WorshipListSection {
  return {
    id: createWorshipId("section"),
    type: "LIST",
    title,
    stand,
    items: [{ id: createWorshipId("item"), title: "", text: "" }],
  };
}

export function createDefaultOrderOfWorship(): OrderOfWorshipDocument {
  return {
    header: {
      leftLogoUrl: "",
      rightLogoUrl: "",
      centerLines: [""],
      monthTheme: "",
      orderTitle: "ORDER OF WORSHIP",
      orderSubtitle: "",
      sundayTheme: "",
      serviceDateText: "",
      participantLines: [],
    },
    sections: [
      createTextSection("Ringing of the Church Bell"),
      createTextSection("Prelude/ Silent Meditation"),
      createTextSection("Introit", true),
      createHymnSection("Opening Hymn", true),
      createTextSection("Lighting of the Altar Candles", true),
      createResponsiveSection("Call to Worship", true),
      createTextSection("Prayer of Approach"),
      createHymnSection("Song Response"),
      createTextSection("Call to Confession"),
      createTextSection("Prayer of Confession"),
      createResponsiveSection("Assurance of Pardon"),
      createHymnSection("Song Response", true),
      createListSection("Our Joys and Concerns"),
      createHymnSection("Fellowship Song", true),
      createTextSection("Church at Prayer"),
      createHymnSection("Song Response"),
      createListSection("Scripture Reading"),
      createTextSection("Anthem"),
      createTextSection("Message"),
      createTextSection("Call to Offertory"),
      createTextSection("Prayer of Dedication", true),
      createHymnSection("Closing Hymn", true),
      createTextSection("Closing Prayer and Benediction", true),
      createTextSection("Extroit", true),
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