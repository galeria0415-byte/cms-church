import type { OrderOfWorshipDocument, WorshipHymnSection, WorshipListSection, WorshipResponsiveSection, WorshipSection, WorshipTextSection } from "@/lib/order-of-worship";
import { getSpeakerLabel } from "@/lib/order-of-worship";
import { cn } from "@/lib/utils";

function renderSectionNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

function SectionText({ section }: { section: WorshipTextSection }) {
  return <p className="whitespace-pre-wrap text-[15px] leading-7 text-slate-700">{section.body}</p>;
}

function SectionResponsive({ section }: { section: WorshipResponsiveSection }) {
  return (
    <div className="space-y-3">
      {section.lines.map((line) => (
        <div key={line.id} className="grid gap-1 md:grid-cols-[160px_minmax(0,1fr)] md:gap-4">
          <div className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">{getSpeakerLabel(line)}</div>
          <div className="whitespace-pre-wrap text-[15px] leading-7 text-slate-800">{line.text}</div>
        </div>
      ))}
    </div>
  );
}

function SectionHymn({ section }: { section: WorshipHymnSection }) {
  return (
    <div className="space-y-4">
      {(section.hymnSource || section.songTitle) ? (
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-3">
          <p className="text-sm italic text-slate-500">{section.hymnSource || "Hymn reference"}</p>
          <p className="text-base font-semibold text-slate-800">{section.songTitle || "Song title"}</p>
        </div>
      ) : null}
      <div className="space-y-4">
        {section.parts.map((part) => (
          <div key={part.id}>
            <p className="text-sm font-semibold text-slate-700">{part.label}</p>
            <p className="mt-1 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">{part.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionList({ section }: { section: WorshipListSection }) {
  return (
    <div className="space-y-4">
      {section.items.map((item) => (
        <div key={item.id}>
          {item.title ? <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">{item.title}</p> : null}
          <p className="mt-1 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">{item.text}</p>
        </div>
      ))}
    </div>
  );
}

function SectionBody({ section }: { section: WorshipSection }) {
  if (section.type === "RESPONSIVE") {
    return <SectionResponsive section={section} />;
  }

  if (section.type === "HYMN") {
    return <SectionHymn section={section} />;
  }

  if (section.type === "LIST") {
    return <SectionList section={section} />;
  }

  return <SectionText section={section} />;
}

export function OrderOfWorshipDocumentView({
  title,
  document,
  className,
}: {
  title?: string;
  document: OrderOfWorshipDocument;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_35px_90px_-55px_rgba(15,23,42,0.45)]", className)}>
      <div className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(236,221,196,0.55),_rgba(255,255,255,0.96)_58%)] px-6 py-10 sm:px-10">
        <div className="grid gap-6 md:grid-cols-[120px_minmax(0,1fr)_120px] md:items-start">
          <div className="flex justify-center md:justify-start">
            {document.header.leftLogoUrl ? <img src={document.header.leftLogoUrl} alt="Left logo" className="h-20 w-20 object-contain" /> : <div className="h-20 w-20 rounded-full border border-dashed border-slate-300" />} 
          </div>
          <div className="text-center">
            {document.header.centerLines.map((line, index) => (
              <p key={`${line}-${index}`} className={cn("text-slate-800", index === 0 ? "text-lg font-semibold uppercase tracking-[0.08em]" : index === 2 ? "mt-1 text-xl font-bold" : "mt-1 text-sm font-medium uppercase tracking-[0.12em]")}>{line}</p>
            ))}
            {document.header.monthTheme ? <p className="mt-5 text-lg font-semibold text-slate-700">{document.header.monthTheme}</p> : null}
            {document.header.orderTitle ? <p className="mt-6 text-2xl font-bold uppercase tracking-[0.08em] text-slate-900">{document.header.orderTitle}</p> : null}
            {document.header.orderSubtitle ? <p className="mt-1 text-lg font-semibold text-slate-700">{document.header.orderSubtitle}</p> : null}
            {document.header.sundayTheme ? <p className="mt-4 text-lg font-semibold text-slate-800">{document.header.sundayTheme}</p> : null}
            {document.header.serviceDateText ? <p className="mt-1 text-base text-slate-600">{document.header.serviceDateText}</p> : null}
            {title ? <p className="mt-6 text-sm uppercase tracking-[0.24em] text-slate-500">{title}</p> : null}
            {document.header.participantLines.length ? (
              <div className="mt-6 space-y-1 text-base text-slate-700">
                {document.header.participantLines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}
              </div>
            ) : null}
          </div>
          <div className="flex justify-center md:justify-end">
            {document.header.rightLogoUrl ? <img src={document.header.rightLogoUrl} alt="Right logo" className="h-20 w-20 object-contain" /> : <div className="h-20 w-20 rounded-full border border-dashed border-slate-300" />} 
          </div>
        </div>
      </div>

      <div className="space-y-8 px-6 py-8 sm:px-10 sm:py-10">
        {document.sections.map((section, index) => (
          <section key={section.id} className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,1),_rgba(248,245,240,0.9))] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Section {renderSectionNumber(index)}</p>
                <h2 className="text-xl font-semibold uppercase text-slate-900">{section.stand ? "* " : ""}{section.title}</h2>
              </div>
              {section.note ? <p className="max-w-sm text-right text-sm italic text-slate-500">{section.note}</p> : null}
            </div>
            <div className="mt-5">
              <SectionBody section={section} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}