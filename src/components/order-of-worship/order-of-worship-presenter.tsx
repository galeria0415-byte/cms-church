"use client";

import { ChevronLeft, ChevronRight, Cross, Maximize, Minimize, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { LiturgicalAnimatedBackground } from "@/components/order-of-worship/liturgical-animated-background";
import { getLiturgicalTheme } from "@/lib/liturgical-calendar";
import type { OrderOfWorshipDocument, WorshipResponsiveLine, WorshipSection } from "@/lib/order-of-worship";
import { getResponsiveSpeakerTheme, getSpeakerLabel, isScriptureReadingSection } from "@/lib/order-of-worship";

type Slide =
  | { id: string; kind: "HEADER"; title: string }
  | { id: string; kind: "SECTION"; title: string; section: WorshipSection };

const MANILA_TIME_ZONE = "Asia/Manila";

function formatManilaDateTime(value: Date) {
  const date = new Intl.DateTimeFormat("en-PH", {
    timeZone: MANILA_TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(value);
  const time = new Intl.DateTimeFormat("en-PH", {
    timeZone: MANILA_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(value);

  return { date, time };
}

function PresenterRichText({ text, scripture = false }: { text: string; scripture?: boolean }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-3">
      {lines.map((line, index) => {
        const match = line.match(/^(\d+[a-z]?)\s+(.*)$/i);

        if (scripture && match) {
          return (
            <p key={`${line}-${index}`} className="flex items-start gap-3 leading-[1.75] text-inherit">
              <span className="mt-1 inline-flex min-w-9 items-center justify-center rounded-full bg-[#f0d6a4] px-2 py-0.5 text-sm font-bold text-slate-900">{match[1]}</span>
              <span>{match[2]}</span>
            </p>
          );
        }

        return <p key={`${line}-${index}`} className="whitespace-pre-wrap text-inherit">{line || "\u00A0"}</p>;
      })}
    </div>
  );
}

function HeaderSlide({ worshipDocument }: { worshipDocument: OrderOfWorshipDocument }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-1 flex-col text-center text-white">
      <div className="flex items-start justify-between gap-6">
        <div className="flex min-h-24 min-w-24 items-start justify-start">{worshipDocument.header.leftLogoUrl ? <img src={worshipDocument.header.leftLogoUrl} alt="Left logo" className="h-24 w-24 object-contain" /> : null}</div>
        <div className="flex min-h-24 min-w-24 items-start justify-end">{worshipDocument.header.rightLogoUrl ? <img src={worshipDocument.header.rightLogoUrl} alt="Right logo" className="h-24 w-24 object-contain" /> : null}</div>
      </div>
      <div className="mt-6">
          {worshipDocument.header.centerLines.map((line, index) => <p key={`${line}-${index}`} className={index === 2 ? "mt-2 text-4xl font-semibold" : index === 0 ? "text-2xl font-semibold uppercase tracking-[0.12em] text-white/90" : "mt-2 text-xl uppercase tracking-[0.18em] text-white/75"}>{line}</p>)}
          {worshipDocument.header.monthTheme ? <p className="mt-8 text-2xl font-semibold text-[#f0d6a4]">{worshipDocument.header.monthTheme}</p> : null}
          {worshipDocument.header.orderTitle ? <p className="mt-8 text-5xl font-bold uppercase tracking-[0.12em]">{worshipDocument.header.orderTitle}</p> : null}
          {worshipDocument.header.orderSubtitle ? <p className="mt-3 text-3xl text-white/88">{worshipDocument.header.orderSubtitle}</p> : null}
          {worshipDocument.header.sundayTheme ? <p className="mt-6 text-3xl font-medium whitespace-pre-wrap">{worshipDocument.header.sundayTheme}</p> : null}
          {worshipDocument.header.serviceDateText ? <p className="mt-3 text-2xl text-white/78">{worshipDocument.header.serviceDateText}</p> : null}
          {worshipDocument.header.participantLines.length ? <div className="mt-10 space-y-2 text-xl text-white/78">{worshipDocument.header.participantLines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}</div> : null}
      </div>
    </div>
  );
}

function StandingCrossIcon({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="relative inline-flex h-full w-full items-center justify-center rounded-full border border-white/30 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.26),rgba(255,255,255,0.04)_72%)] text-white shadow-[0_0_28px_rgba(255,255,255,0.62)] before:absolute before:inset-0 before:animate-pulse before:rounded-full before:border before:border-white/25 before:content-['']">
        <Cross className="relative h-7 w-7" />
      </div>
    </div>
  );
}

function ScriptureLine({ line }: { line: WorshipResponsiveLine }) {
  const theme = getResponsiveSpeakerTheme(line);

  return (
    <div className="rounded-[28px] border p-5 md:p-6" style={{ backgroundColor: `${theme.accent}22`, borderColor: `${theme.border}99` }}>
      <div className="mb-4 inline-flex rounded-full px-3 py-1 text-sm font-bold uppercase tracking-[0.16em]" style={{ backgroundColor: theme.border, color: theme.accent }}>
        {getSpeakerLabel(line)}
      </div>
      <div className="font-serif text-[30px] leading-[1.8] text-white/94 md:text-[34px]">
        <PresenterRichText text={line.text} scripture />
      </div>
    </div>
  );
}

function SectionSlide({ section }: { section: WorshipSection }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-1 flex-col justify-center text-white">
      {!section.stand ? <p className="text-sm uppercase tracking-[0.35em] text-[#f0d6a4]">Order of Worship</p> : null}
      <div className="mt-4 flex items-center gap-4">
        {section.stand ? (
          <StandingCrossIcon className="h-16 w-16 shrink-0" />
        ) : null}
        <h1 className="text-5xl font-semibold uppercase leading-tight md:text-7xl">{section.title}</h1>
      </div>
      {section.note && section.type !== "TEXT" ? <p className="mt-4 text-xl italic text-white/72">{section.note}</p> : null}
      <div className={section.stand ? "mt-10 rounded-[32px] border border-[#f6d28a]/28 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.08))] p-8 shadow-[0_40px_120px_-70px_rgba(0,0,0,0.85)] backdrop-blur-md md:p-10" : "mt-10 rounded-[32px] border border-white/12 bg-white/8 p-8 shadow-[0_40px_120px_-70px_rgba(0,0,0,0.85)] backdrop-blur-md md:p-10"}>
        {section.type === "TEXT" ? (
          <div className="space-y-6">
            {(section.note || section.body) ? (
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/12 pb-4">
                <p className="text-2xl italic text-white/70">{section.note || " "}</p>
                <p className="text-3xl font-semibold text-[#f0d6a4] md:text-4xl">{section.body}</p>
              </div>
            ) : null}
            <div className="hidden text-2xl leading-[1.8] text-white/92 md:text-3xl"><PresenterRichText text={section.body} /></div>
          </div>
        ) : null}
        {section.type === "RESPONSIVE" ? (
          isScriptureReadingSection(section) ? (
            <div className="space-y-5">{section.lines.map((line) => <ScriptureLine key={line.id} line={line} />)}</div>
          ) : (
            <div className="space-y-5">
              {section.lines.map((line) => {
                const theme = getResponsiveSpeakerTheme(line);
                return (
                  <div key={line.id} className="grid gap-3 rounded-[28px] border p-5 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8 md:p-6" style={{ backgroundColor: `${theme.accent}18`, borderColor: `${theme.border}80` }}>
                    <p className="text-xl font-semibold uppercase tracking-[0.14em] md:text-2xl" style={{ color: theme.border }}>{getSpeakerLabel(line)}</p>
                    <div className="text-2xl leading-[1.7] text-white/92 md:text-3xl"><PresenterRichText text={line.text} /></div>
                  </div>
                );
              })}
            </div>
          )
        ) : null}
        {section.type === "HYMN" ? <div className="space-y-6">{(section.hymnSource || section.songTitle) ? <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/12 pb-4"><p className="text-2xl italic text-white/70">{section.hymnSource}</p><p className="text-3xl font-semibold text-[#f0d6a4]">{section.songTitle}</p></div> : null}{section.parts.map((part) => <div key={part.id}><p className="text-xl font-semibold uppercase tracking-[0.1em] text-[#f0d6a4]">{part.label}</p><div className="mt-2 text-2xl leading-[1.8] text-white/92 md:text-3xl"><PresenterRichText text={part.text} /></div></div>)}</div> : null}
        {section.type === "LIST" ? <div className="space-y-6">{section.items.map((item) => <div key={item.id}>{item.title ? <p className="text-xl font-semibold uppercase tracking-[0.1em] text-[#f0d6a4]">{item.title}</p> : null}<div className="mt-2 text-2xl leading-[1.8] text-white/92 md:text-3xl"><PresenterRichText text={item.text} /></div></div>)}</div> : null}
      </div>
    </div>
  );
}

function SlideContent({ slide, worshipDocument }: { slide: Slide; worshipDocument: OrderOfWorshipDocument }) {
  if (slide.kind === "HEADER") {
    return <HeaderSlide worshipDocument={worshipDocument} />;
  }

  return <SectionSlide section={slide.section} />;
}

export function OrderOfWorshipPresenter({ document: worshipDocument, title, referenceDate }: { document: OrderOfWorshipDocument; title: string; referenceDate?: Date | string | null }) {
  const router = useRouter();
  const slides = useMemo<Slide[]>(() => [{ id: "header", kind: "HEADER", title }, ...worshipDocument.sections.map((section) => ({ id: section.id, kind: "SECTION" as const, title: section.title, section }))], [worshipDocument, title]);
  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const theme = useMemo(() => getLiturgicalTheme(referenceDate), [referenceDate]);
  const currentSlide = slides[index];
  const nextSlides = slides.slice(index + 1, index + 4);
  const currentDateTime = useMemo(() => formatManilaDateTime(now), [now]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight" || event.key === " ") {
        setIndex((current) => Math.min(slides.length - 1, current + 1));
      }

      if (event.key === "ArrowLeft") {
        setIndex((current) => Math.max(0, current - 1));
      }

      if (event.key === "Escape") {
        router.back();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, slides.length]);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      return;
    }

    await document.exitFullscreen();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#09131f] text-white">
      <LiturgicalAnimatedBackground theme={theme} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_38%),linear-gradient(180deg,rgba(6,10,18,0.28),rgba(6,10,18,0.62))]" />

      <div className="relative z-10 flex min-h-screen flex-col px-6 py-5 md:px-10">
        <div className="flex items-center justify-between text-white/70">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.22em]">
              <span>{currentDateTime.date}</span>
              <span className="text-white/38">•</span>
              <span className="text-white/72">{currentDateTime.time}</span>
            </div>
            <p className="mt-1 text-xs uppercase tracking-[0.22em]" style={{ color: theme.accentSoft }}>{theme.label}</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => void toggleFullscreen()} className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-sm transition hover:bg-white/10">
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            </button>
            <button type="button" onClick={() => router.back()} className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-sm transition hover:bg-white/10">
              <X className="h-4 w-4" /> Exit
            </button>
          </div>
        </div>

        <div className="flex flex-1 items-center">
          <SlideContent slide={currentSlide} worshipDocument={worshipDocument} />
        </div>

        <div className="mt-8 rounded-[28px] border border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] px-4 py-3 shadow-[0_24px_60px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setIndex((current) => Math.max(0, current - 1))} disabled={index === 0} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/8 transition hover:bg-white/14 disabled:opacity-40">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => setIndex((current) => Math.min(slides.length - 1, current + 1))} disabled={index === slides.length - 1} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/8 transition hover:bg-white/14 disabled:opacity-40">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="min-w-[180px] rounded-full border border-white/12 bg-white/8 px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#f0d6a4]">Now</p>
              <p className="mt-1 truncate text-sm font-semibold uppercase text-white">{currentSlide.kind === "HEADER" ? "Header" : currentSlide.title}</p>
            </div>

            <div className="flex min-w-[260px] flex-1 items-center gap-2 overflow-x-auto rounded-full border border-white/10 bg-white/6 px-3 py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <span className="shrink-0 text-[10px] uppercase tracking-[0.22em] text-white/55">Up next</span>
              {nextSlides.length ? nextSlides.map((slide, slideIndex) => (
                <button key={slide.id} type="button" onClick={() => setIndex(index + slideIndex + 1)} className="shrink-0 rounded-full border border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] text-white/78 transition hover:bg-white/12">
                  {slide.kind === "HEADER" ? "Header" : slide.title}
                </button>
              )) : <span className="text-xs text-white/40">No more sections</span>}
            </div>

            <div className="ml-auto rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.16em] text-white/55">
              Slide {index + 1} / {slides.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}