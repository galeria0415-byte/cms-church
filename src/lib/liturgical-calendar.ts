export type LiturgicalSeason =
  | "ADVENT"
  | "CHRISTMAS"
  | "EPIPHANY"
  | "LENT"
  | "HOLY_WEEK"
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

function normalizeDate(value?: Date | string | null) {
  const date = value ? new Date(value) : new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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
  const easter = getEasterSunday(year);
  const ashWednesday = addDays(easter, -46);
  const palmSunday = addDays(easter, -7);
  const pentecost = addDays(easter, 49);
  const christmasStart = new Date(year, 11, 25);
  const christmasEnd = new Date(year + 1, 0, 5);
  const epiphanyStart = new Date(year, 0, 6);
  const ordinaryAfterPentecost = addDays(pentecost, 1);
  const advent = getAdventStart(year);

  if (isBetween(date, advent, addDays(christmasStart, -1))) {
    return {
      season: "ADVENT",
      label: "Advent",
      accent: "#6d3fb2",
      accentSoft: "#c9a6ff",
      glow: "rgba(201,166,255,0.4)",
      gradient: ["#130f2e", "#2d235b", "#5b2d91"],
    };
  }

  if (isBetween(date, christmasStart, christmasEnd)) {
    return {
      season: "CHRISTMAS",
      label: "Christmas",
      accent: "#e7c66b",
      accentSoft: "#fff1b8",
      glow: "rgba(255,241,184,0.38)",
      gradient: ["#1b233c", "#3e4e7a", "#967c2d"],
    };
  }

  if (isBetween(date, ashWednesday, addDays(palmSunday, -1))) {
    return {
      season: "LENT",
      label: "Lent",
      accent: "#6d3fb2",
      accentSoft: "#cbb2f7",
      glow: "rgba(203,178,247,0.35)",
      gradient: ["#181321", "#2f2446", "#5a3f88"],
    };
  }

  if (isBetween(date, palmSunday, addDays(easter, -1))) {
    return {
      season: "HOLY_WEEK",
      label: "Holy Week",
      accent: "#b3212b",
      accentSoft: "#ffb2bf",
      glow: "rgba(255,178,191,0.32)",
      gradient: ["#1f0d12", "#40101a", "#7a1f29"],
    };
  }

  if (isBetween(date, easter, addDays(pentecost, -1))) {
    return {
      season: "EASTER",
      label: "Easter",
      accent: "#e4c15e",
      accentSoft: "#fff0b0",
      glow: "rgba(255,240,176,0.36)",
      gradient: ["#132238", "#214f72", "#b69535"],
    };
  }

  if (+date === +pentecost) {
    return {
      season: "PENTECOST",
      label: "Pentecost",
      accent: "#d42d36",
      accentSoft: "#ffb7af",
      glow: "rgba(255,183,175,0.38)",
      gradient: ["#280f14", "#5b1824", "#a12a31"],
    };
  }

  if (isBetween(date, epiphanyStart, addDays(ashWednesday, -1))) {
    return {
      season: "EPIPHANY",
      label: "Epiphany Season",
      accent: "#3e7e3d",
      accentSoft: "#bfe6b2",
      glow: "rgba(191,230,178,0.3)",
      gradient: ["#0f1e17", "#1f4c39", "#356c39"],
    };
  }

  if (date > pentecost || date < advent) {
    return {
      season: "ORDINARY_TIME",
      label: "Ordinary Time",
      accent: "#3f8c4f",
      accentSoft: "#caefc5",
      glow: "rgba(202,239,197,0.28)",
      gradient: ["#102017", "#1f4b2c", "#325e39"],
    };
  }

  return {
    season: "ORDINARY_TIME",
    label: "Ordinary Time",
    accent: "#3f8c4f",
    accentSoft: "#caefc5",
    glow: "rgba(202,239,197,0.28)",
    gradient: ["#102017", "#1f4b2c", "#325e39"],
  };
}