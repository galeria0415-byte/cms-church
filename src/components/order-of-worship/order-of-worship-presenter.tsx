"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { OrderOfWorshipDocument, WorshipSection } from "@/lib/order-of-worship";
import { getSpeakerLabel } from "@/lib/order-of-worship";

type Slide =
  | { id: string; kind: "HEADER"; title: string }
  | { id: string; kind: "SECTION"; title: string; section: WorshipSection };

function SlideContent({ slide, document }: { slide: Slide; document: OrderOfWorshipDocument }) {
  if (slide.kind === "HEADER") {
    return (
      <div className="mx-auto max-w-5xl text-center text-white">
        <div className="grid items-center gap-6 md:grid-cols-[120px_minmax(0,1fr)_120px]">
          <div className="flex justify-center md:justify-start">{document.header.leftLogoUrl ? <img src={document.header.leftLogoUrl} alt="Left logo" className="h-24 w-24 object-contain" /> : null}</div>
          <div>
            {document.header.centerLines.map((line, index) => <p key={`${line}-${index}`} className={index === 2 ? "mt-2 text-4xl font-semibold" : index === 0 ? "text-2xl font-semibold uppercase tracking-[0.12em] text-white/90" : "mt-2 text-xl uppercase tracking-[0.18em] text-white/75"}>{line}</p>)}
            {document.header.monthTheme ? <p className="mt-8 text-2xl font-semibold text-[#f0d6a4]">{document.header.monthTheme}</p> : null}
            {document.header.orderTitle ? <p className="mt-8 text-5xl font-bold uppercase tracking-[0.12em]">{document.header.orderTitle}</p> : null}
            {document.header.orderSubtitle ? <p className="mt-3 text-3xl text-white/88">{document.header.orderSubtitle}</p> : null}
            {document.header.sundayTheme ? <p className="mt-6 text-3xl font-medium">{document.header.sundayTheme}</p> : null}
            {document.header.serviceDateText ? <p className="mt-3 text-2xl text-white/78">{document.header.serviceDateText}</p> : null}
            {document.header.participantLines.length ? <div className="mt-10 space-y-2 text-xl text-white/78">{document.header.participantLines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}</div> : null}
          </div>
          <div className="flex justify-center md:justify-end">{document.header.rightLogoUrl ? <img src={document.header.rightLogoUrl} alt="Right logo" className="h-24 w-24 object-contain" /> : null}</div>
        </div>
      </div>
    );
  }

  const { section } = slide;

  return (
    <div className="mx-auto flex max-w-6xl flex-1 flex-col justify-center text-white">
      <p className="text-sm uppercase tracking-[0.35em] text-[#f0d6a4]">{section.stand ? "Congregation stands" : "Order of Worship"}</p>
      <h1 className="mt-4 text-5xl font-semibold uppercase leading-tight md:text-7xl">{section.stand ? "* " : ""}{section.title}</h1>
      {section.note ? <p className="mt-4 text-xl italic text-white/72">{section.note}</p> : null}
      <div className="mt-10 rounded-[32px] border border-white/12 bg-white/8 p-8 shadow-[0_40px_120px_-70px_rgba(0,0,0,0.85)] backdrop-blur-md md:p-10">
        {section.type === "TEXT" ? <p className="whitespace-pre-wrap text-2xl leading-[1.8] text-white/92 md:text-3xl">{section.body}</p> : null}
        {section.type === "RESPONSIVE" ? <div className="space-y-5">{section.lines.map((line) => <div key={line.id} className="grid gap-2 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8"><p className="text-xl font-semibold uppercase tracking-[0.14em] text-[#f0d6a4] md:text-2xl">{getSpeakerLabel(line)}</p><p className="whitespace-pre-wrap text-2xl leading-[1.7] text-white/92 md:text-3xl">{line.text}</p></div>)}</div> : null}
        {section.type === "HYMN" ? <div className="space-y-6">{(section.hymnSource || section.songTitle) ? <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/12 pb-4"><p className="text-2xl italic text-white/70">{section.hymnSource}</p><p className="text-3xl font-semibold text-[#f0d6a4]">{section.songTitle}</p></div> : null}{section.parts.map((part) => <div key={part.id}><p className="text-xl font-semibold uppercase tracking-[0.1em] text-[#f0d6a4]">{part.label}</p><p className="mt-2 whitespace-pre-wrap text-2xl leading-[1.8] text-white/92 md:text-3xl">{part.text}</p></div>)}</div> : null}
        {section.type === "LIST" ? <div className="space-y-6">{section.items.map((item) => <div key={item.id}>{item.title ? <p className="text-xl font-semibold uppercase tracking-[0.1em] text-[#f0d6a4]">{item.title}</p> : null}<p className="mt-2 whitespace-pre-wrap text-2xl leading-[1.8] text-white/92 md:text-3xl">{item.text}</p></div>)}</div> : null}
      </div>
    </div>
  );
}

export function OrderOfWorshipPresenter({ document, title }: { document: OrderOfWorshipDocument; title: string }) {
  const router = useRouter();
  const slides = useMemo<Slide[]>(() => [{ id: "header", kind: "HEADER", title }, ...document.sections.map((section) => ({ id: section.id, kind: "SECTION" as const, title: section.title, section }))], [document, title]);
  const [index, setIndex] = useState(0);

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#09131f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,215,160,0.18),transparent_35%),radial-gradient(circle_at_80%_15%,rgba(155,213,255,0.2),transparent_28%),radial-gradient(circle_at_50%_85%,rgba(130,84,255,0.15),transparent_32%),linear-gradient(135deg,#09131f_0%,#10233e_48%,#132b24_100%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.22)_0,transparent_8%),radial-gradient(circle_at_center,rgba(255,255,255,0.16)_0,transparent_5%)] [background-size:260px_260px,180px_180px] animate-[pulse_12s_ease-in-out_infinite]" />

      <div className="relative z-10 flex min-h-screen flex-col px-6 py-5 md:px-10">
        <div className="flex items-center justify-between text-white/70">
          <p className="text-sm uppercase tracking-[0.28em]">Order of Worship Presenter</p>
          <button type="button" onClick={() => router.back()} className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-sm transition hover:bg-white/10">
            <X className="h-4 w-4" /> Exit
          </button>
        </div>

        <div className="flex flex-1 items-center">
          <SlideContent slide={slides[index]} document={document} />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setIndex((current) => Math.max(0, current - 1))} disabled={index === 0} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/8 transition hover:bg-white/14 disabled:opacity-40">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => setIndex((current) => Math.min(slides.length - 1, current + 1))} disabled={index === slides.length - 1} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/8 transition hover:bg-white/14 disabled:opacity-40">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {slides.map((slide, slideIndex) => (
              <button key={slide.id} type="button" onClick={() => setIndex(slideIndex)} className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.12em] transition ${slideIndex === index ? "bg-[#f0d6a4] text-slate-900" : "bg-white/8 text-white/72 hover:bg-white/14"}`}>
                {slideIndex === 0 ? "Header" : slide.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}