export type LiturgicalSeason =
  | "ADVENT"
  | "CHRISTMAS"
  | "LENT"
  | "EASTER"
  | "PENTECOST"
  | "ORDINARY_TIME";

export type LiturgicalTheme = {
  season: LiturgicalSeason;
  label: string;
  accent: string;
  accentSoft: string;
  glow: string;
  gradient: string[];
};

import { MANILA_TIME_ZONE, parseDateValue } from "@/lib/utils";

const LITURGICAL_THEMES: Record<LiturgicalSeason, LiturgicalTheme> = {
  ADVENT: {
    season: "ADVENT",
    label: "Advent",
    accent: "#5f4bb6",
    accentSoft: "#b7c7ff",
    glow: "rgba(183,199,255,0.34)",
    gradient: ["#12182f", "#22376d", "#5d4cb0"],
  },
  CHRISTMAS: {
    season: "CHRISTMAS",
    label: "Christmas",
    accent: "#d9b54a",
    accentSoft: "#fff4c7",
    glow: "rgba(255,244,199,0.38)",
    gradient: ["#1a2036", "#756427", "#f2e7b0"],
  },
  LENT: {
    season: "LENT",
    label: "Lent",
    accent: "#6d3fb2",
    accentSoft: "#d1c0fb",
    glow: "rgba(209,192,251,0.34)",
    gradient: ["#191324", "#34244d", "#624395"],
  },
  EASTER: {
    season: "EASTER",
    label: "Easter",
    accent: "#d7b24a",
    accentSoft: "#fff0c2",
    glow: "rgba(255,240,194,0.36)",
    gradient: ["#18243a", "#6d5b26", "#f4e7b5"],
  },
  PENTECOST: {
    season: "PENTECOST",
    label: "Pentecost",
    accent: "#d42d36",
    accentSoft: "#ffb7af",
    glow: "rgba(255,183,175,0.38)",
    gradient: ["#280f14", "#5b1824", "#a12a31"],
  },
  ORDINARY_TIME: {
    season: "ORDINARY_TIME",
    label: "Ordinary Time",
    accent: "#3f8c4f",
    accentSoft: "#caefc5",
    glow: "rgba(202,239,197,0.28)",
    gradient: ["#102017", "#1f4b2c", "#3d7649"],
  },
};

const EXACT_SEASON_RANGES: Partial<Record<number, Array<{ season: LiturgicalSeason; start: string; end: string }>>> = {
  2026: [
    { season: "LENT", start: "2026-02-18", end: "2026-04-04" },
    { season: "EASTER", start: "2026-04-05", end: "2026-05-23" },
    { season: "PENTECOST", start: "2026-05-24", end: "2026-05-24" },
    { season: "ORDINARY_TIME", start: "2026-05-25", end: "2026-11-28" },
    { season: "ADVENT", start: "2026-11-29", end: "2026-12-24" },
  ],
  2027: [
    { season: "LENT", start: "2027-02-10", end: "2027-03-27" },
    { season: "EASTER", start: "2027-03-28", end: "2027-05-15" },
    { season: "PENTECOST", start: "2027-05-16", end: "2027-05-16" },
    { season: "ORDINARY_TIME", start: "2027-05-17", end: "2027-11-27" },
    { season: "ADVENT", start: "2027-11-28", end: "2027-12-24" },
  ],
  2028: [
    { season: "LENT", start: "2028-03-01", end: "2028-04-15" },
    { season: "EASTER", start: "2028-04-16", end: "2028-06-03" },
    { season: "PENTECOST", start: "2028-06-04", end: "2028-06-04" },
    { season: "ORDINARY_TIME", start: "2028-06-05", end: "2028-12-02" },
    { season: "ADVENT", start: "2028-12-03", end: "2028-12-24" },
  ],
  2029: [
    { season: "LENT", start: "2029-02-14", end: "2029-03-31" },
    { season: "EASTER", start: "2029-04-01", end: "2029-05-19" },
    { season: "PENTECOST", start: "2029-05-20", end: "2029-05-20" },
    { season: "ORDINARY_TIME", start: "2029-05-21", end: "2029-12-01" },
    { season: "ADVENT", start: "2029-12-02", end: "2029-12-24" },
  ],
  2030: [
    { season: "LENT", start: "2030-03-06", end: "2030-04-20" },
    { season: "EASTER", start: "2030-04-21", end: "2030-06-08" },
    { season: "PENTECOST", start: "2030-06-09", end: "2030-06-09" },
    { season: "ORDINARY_TIME", start: "2030-06-10", end: "2030-11-30" },
    { season: "ADVENT", start: "2030-12-01", end: "2030-12-24" },
  ],
};

function normalizeDate(value?: Date | string | null) {
  const date = parseDateValue(value) ?? new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: MANILA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value ?? date.getFullYear());
  const month = Number(parts.find((part) => part.type === "month")?.value ?? date.getMonth() + 1);
  const day = Number(parts.find((part) => part.type === "day")?.value ?? date.getDate());

  return new Date(year, month - 1, day);
}

function isoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function getEasterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

function getAdventStart(year: number) {
  const christmas = new Date(year, 11, 25);
  const day = christmas.getDay();
  const fourthSundayBeforeChristmas = addDays(christmas, -(day === 0 ? 21 : day + 21));
  return fourthSundayBeforeChristmas;
}

function isBetween(date: Date, start: Date, end: Date) {
  return date >= start && date <= end;
}

export function getLiturgicalTheme(value?: Date | string | null): LiturgicalTheme {
  const date = normalizeDate(value);
  const year = date.getFullYear();
  const exactRanges = EXACT_SEASON_RANGES[year];

  if ((date.getMonth() === 11 && date.getDate() >= 25) || (date.getMonth() === 0 && date.getDate() <= 6)) {
    return LITURGICAL_THEMES.CHRISTMAS;
  }

  if (exactRanges) {
    const currentIsoDate = isoDate(date);
    const matched = exactRanges.find((range) => currentIsoDate >= range.start && currentIsoDate <= range.end);

    if (matched) {
      return LITURGICAL_THEMES[matched.season];
    }

    return LITURGICAL_THEMES.ORDINARY_TIME;
  }

  const easter = getEasterSunday(year);
  const ashWednesday = addDays(easter, -46);
  const pentecost = addDays(easter, 49);
  const advent = getAdventStart(year);
  const month = date.getMonth();
  const day = date.getDate();

  if (isBetween(date, advent, new Date(year, 11, 24))) {
    return LITURGICAL_THEMES.ADVENT;
  }

  if ((month === 11 && day >= 25) || (month === 0 && day <= 6)) {
    return LITURGICAL_THEMES.CHRISTMAS;
  }

  if (isBetween(date, ashWednesday, addDays(easter, -1))) {
    return LITURGICAL_THEMES.LENT;
  }

  if (isBetween(date, easter, addDays(pentecost, -1))) {
    return LITURGICAL_THEMES.EASTER;
  }

  if (+date === +pentecost) {
    return LITURGICAL_THEMES.PENTECOST;
  }

  if (date > pentecost || date < advent) {
    return LITURGICAL_THEMES.ORDINARY_TIME;
  }

  return LITURGICAL_THEMES.ORDINARY_TIME;
}