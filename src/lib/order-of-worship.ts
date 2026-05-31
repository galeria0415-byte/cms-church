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
      centerLines: [
        "UNITED CHURCH OF CHRIST IN THE PHILIPPINES",
        "NATIONAL CITY UNITED CHURCH",
        "Transforming individuals, Church, and Society",
      ],
      monthTheme: "May 2026 Theme: Life in Christ",
      orderTitle: "ORDER OF WORSHIP",
      orderSubtitle: "PENTECOST/UCCP ANNIVERSARY MONTH",
      sundayTheme: "Seventh Sunday of Resurrection\nTheme this Sunday: \"Life in Community\"",
      serviceDateText: "17 May 2026, 9:00 a.m.",
      participantLines: [
        "Preacher: Rev. Pauline Mae S. Capacete",
        "Liturgist: Dick Micah Galeria",
        "Church at Prayer: James Mante",
        "Anthem: NCUC Chancel Choir",
      ],
    },
    sections: [
      createTextSection("Ringing of the Church Bell", false, "(At the sound of the bell, please be silent. We ring the Church Bell before we start our corporate worship as a testimony to the Church and the community around us that God is present among us.)"),
      createTextSection("Prelude/ Silent Meditation", false, "Celinda Larracas, Pianist"),
      createTextSection("Introit", true, '"Fill in the House"\nNCUC Chancel Choir'),
      createHymnSection("Opening Hymn", true, "HCW No. 290", "The Church's One Foundation", [
        { id: createWorshipId("part"), label: "Stanza 1", text: "The Church's one foundation is Jesus Christ her Lord;\nShe is his new creation by water and the word;\nFrom heaven he came and sought her to be his holy bride;\nWith his own blood he bought her, and for her life he died." },
        { id: createWorshipId("part"), label: "Stanza 2", text: "Elect from every nation, yet one o'er all the earth,\nHer charter of salvation, one Lord, one faith, one birth,\nOne holy name she blesses, partakes one holy food,\nAnd to one hope she presses, with every grace endued." },
      ]),
      createTextSection("Lighting of the Altar Candles", true, "Lighting of the altar candles."),
      createResponsiveSection("Call to Worship", true, [
        { id: createWorshipId("line"), speaker: "LITURGIST", text: "The foundation of our faith community is the unity of the Three in One." },
        { id: createWorshipId("line"), speaker: "CHURCH", text: "Make us one, Lord, just as You are one." },
        { id: createWorshipId("line"), speaker: "LITURGIST", text: "The identity of our faith community is based on our shared identity in Christ." },
        { id: createWorshipId("line"), speaker: "CHURCH", text: "Make us one, rooted in Your truth and love." },
        { id: createWorshipId("line"), speaker: "ALL", text: "Bind us together as one body in Christ, living for Your glory!" },
      ]),
      createTextSection("Prayer of Approach", false, "Holy God, we come today as one seeking to be further united, not by uniformity, but in our shared life in You. As we sit beside each other, may we look to You to strengthen our bond and rekindle our commitment to participate in the shared mission You have called us to. Prepare us to receive Your word that will deepen the integrity of our unity, reflecting Your love, grace, and justice to the world. In Christ's name we pray, Amen."),
      createHymnSection("Song Response", false, "HFJ No. 81", "Glory to the Creator", [
        { id: createWorshipId("part"), label: "Response", text: "Glory to the Creator, the Christ, the Holy Spirit, Three in One;\nAs it was in the beginning, is now, and ever shall be,\nWorld without end, Amen, Amen." },
      ]),
      createTextSection("Call to Confession", false, "Liturgist"),
      createTextSection("Prayer of Confession", false, "Oh Lord, by Your Spirit, You have enabled and empowered us to be one. But the truth is, sometimes, we do not understand what this means. There are times we thought that to be united meant to be completely similar and, because of this, we have excluded those who do not conform to us. There are also times when we thought unity meant protecting the community even if it compromises our integrity. Forgive us, dear Lord. Teach us true unity that is found in You. Amen."),
      createResponsiveSection("Assurance of Pardon", false, [
        { id: createWorshipId("line"), speaker: "PREACHER", text: "1 John 1:9 says, 'But if we confess our sins to God, he will keep his promise and do what is right: he will forgive us our sins and purify us from all our wrongdoing.' Arise, NCUC faith community, you have been forgiven." },
        { id: createWorshipId("line"), speaker: "CHURCH", text: "Thank You, Lord, for Your forgiveness!" },
      ]),
      createHymnSection("Song Response", true, "HFJ No. 85", "Hear Our Prayer", [
        { id: createWorshipId("part"), label: "Response", text: "Hear our prayer, O God, hear our prayer, O God;\nIncline your ear to us, and grant us your peace." },
      ]),
      createListSection("Our Joys and Concerns", false, [
        { id: createWorshipId("item"), title: "Leader", text: "Rev. Melvin Jacinto" },
        { id: createWorshipId("item"), title: "Church Workers' Appreciation", text: "Share joys and concerns before the congregation." },
      ]),
      createHymnSection("Fellowship Song", true, "", "Halle, Halle, Hallelujah!", [
        { id: createWorshipId("part"), label: "Song", text: "Halle, halle, hallelujah! Halle, halle, hallelujah!\nHalle, halle, hallelujah! Hallelujah! Hallelujah!" },
      ]),
      createTextSection("Church at Prayer", false, "James Mante"),
      createHymnSection("Song Response", false, "HFJ No. 83", "O Hear Our Prayer, Almighty God", [
        { id: createWorshipId("part"), label: "Response", text: "O hear our pray'r, Almighty God, in faith and trust we make our plea!\nO hear our pray'r, O Loving God.\nAs is your will, so let it be. So let it be." },
      ]),
      createResponsiveSection("Scripture Reading", false, [
        { id: createWorshipId("line"), speaker: "CUSTOM", customSpeaker: "Old Testament", text: "Psalm 68:1-10, 32-35" },
        { id: createWorshipId("line"), speaker: "CUSTOM", customSpeaker: "Song Response", text: '"Open Our Eyes, Lord"\nOpen our eyes, Lord, we want to see Jesus\nTo reach out and touch Him and say that we love Him.' },
        { id: createWorshipId("line"), speaker: "CUSTOM", customSpeaker: "New Testament", text: "John 17:1-11" },
      ]),
      createTextSection("Anthem", false, '"Walk in Love"\nNCUC Chancel Choir'),
      createTextSection("Message", false, '"This We Pray"\nRev. Pauline Mae Capacete'),
      createTextSection("Call to Offertory", false, "Liturgist"),
      createTextSection("Gathering of Tithes, Pledges, and Gifts/Offertory Music", false, "Gathering of tithes, pledges, and gifts/offertory music."),
      createHymnSection("Song Response", false, "HFJ No. 94 verse 2", "Praise God From Whom All Blessings Flow", [
        { id: createWorshipId("part"), label: "Response", text: "Praise God the Source of life and birth; Praise God the Son who came to earth;\nPraise God the Spirit, Holy Flame; All glory, honor to God's name." },
      ]),
      createTextSection("Prayer of Dedication", true, "Generous God, we are eternally grateful for being united with You and being united in You. Bless these gifts we offer, that they may be used to further strengthen this faith community, and to send us out into the world that all may be reconciled to You and to each other. In the precious name of Jesus, we pray, Amen."),
      createHymnSection("Closing Hymn", true, "HFJ No. 268", "Blessed Be the Tie That Binds", [
        { id: createWorshipId("part"), label: "Stanza 1", text: "Blest be the tie that binds\nOur hearts in Christian love;\nThe sharing of a common life\nIs like to that above." },
      ]),
      createTextSection("Closing Prayer and Benediction", true, "Rev. Pauline Capacete"),
      createTextSection("Extroit", true, '"Fairest Lord Jesus"\nNCUC Chancel Choir'),
    ],
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