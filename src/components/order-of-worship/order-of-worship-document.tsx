import type { OrderOfWorshipDocument, WorshipHymnSection, WorshipListSection, WorshipResponsiveLine, WorshipResponsiveSection, WorshipSection, WorshipTextSection } from "@/lib/order-of-worship";
import { getResponsiveSpeakerTheme, getSpeakerLabel, isScriptureReadingSection } from "@/lib/order-of-worship";
import { cn } from "@/lib/utils";

function renderSectionNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

function RichText({ text, scripture = false }: { text: string; scripture?: boolean }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const match = line.match(/^(\d+[a-z]?)\s+(.*)$/i);

        if (scripture && match) {
          return (
            <p key={`${line}-${index}`} className="flex items-start gap-2 leading-7 text-inherit">
              <span className="mt-0.5 inline-flex min-w-7 items-center justify-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">{match[1]}</span>
              <span>{match[2]}</span>
            </p>
          );
        }

        return <p key={`${line}-${index}`} className="whitespace-pre-wrap text-inherit">{line || "\u00A0"}</p>;
      })}
    </div>
  );
}

function SectionText({ section }: { section: WorshipTextSection }) {
  return <div className="text-[15px] leading-7 text-slate-700"><RichText text={section.body} /></div>;
}

function ScriptureReadingLine({ line }: { line: WorshipResponsiveLine }) {
  const theme = getResponsiveSpeakerTheme(line);

  return (
    <div className="rounded-2xl border p-4" style={{ backgroundColor: theme.soft, borderColor: theme.border }}>
      <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ backgroundColor: theme.border, color: theme.accent }}>
        {getSpeakerLabel(line)}
      </span>
      <div className="mt-3 font-serif text-[17px] leading-8 text-slate-800">
        <RichText text={line.text} scripture />
      </div>
    </div>
  );
}

function SectionResponsive({ section }: { section: WorshipResponsiveSection }) {
  if (isScriptureReadingSection(section)) {
    return (
      <div className="space-y-4">
        {section.lines.map((line) => <ScriptureReadingLine key={line.id} line={line} />)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {section.lines.map((line) => (
        <div key={line.id} className="grid gap-1 rounded-2xl border p-4 md:grid-cols-[160px_minmax(0,1fr)] md:gap-4" style={{ backgroundColor: getResponsiveSpeakerTheme(line).soft, borderColor: getResponsiveSpeakerTheme(line).border }}>
          <div className="text-sm font-semibold uppercase tracking-[0.14em]" style={{ color: getResponsiveSpeakerTheme(line).accent }}>{getSpeakerLabel(line)}</div>
          <div className="text-[15px] leading-7 text-slate-800"><RichText text={line.text} /></div>
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
            <div className="mt-1 text-[15px] leading-7 text-slate-700"><RichText text={part.text} /></div>
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
          <div className="mt-1 text-[15px] leading-7 text-slate-700"><RichText text={item.text} /></div>
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
  printCompact = false,
}: {
  title?: string;
  document: OrderOfWorshipDocument;
  className?: string;
  printCompact?: boolean;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_35px_90px_-55px_rgba(15,23,42,0.45)]", className)}>
      <div className={cn("relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(236,221,196,0.55),_rgba(255,255,255,0.96)_58%)] px-6 py-10 sm:px-10", printCompact && "border-b-0 bg-white px-4 py-4")}>
        <div className="grid gap-6 md:grid-cols-[120px_minmax(0,1fr)_120px] md:items-start">
          <div className="flex justify-center md:justify-start">
            {document.header.leftLogoUrl ? <img src={document.header.leftLogoUrl} alt="Left logo" className="h-20 w-20 object-contain" /> : <div className="h-20 w-20 rounded-full border border-dashed border-slate-300" />} 
          </div>
          <div className="text-center">
            {document.header.centerLines.map((line, index) => (
              <p key={`${line}-${index}`} className={cn("text-slate-800", index === 0 ? "text-lg font-semibold uppercase tracking-[0.08em]" : index === 2 ? "mt-1 text-xl font-bold" : "mt-1 text-sm font-medium uppercase tracking-[0.12em]")}>{line}</p>
            ))}
            {document.header.monthTheme ? <p className={cn("mt-5 text-lg font-semibold text-slate-700", printCompact && "mt-3 text-sm")}>{document.header.monthTheme}</p> : null}
            {document.header.orderTitle ? <p className={cn("mt-6 text-2xl font-bold uppercase tracking-[0.08em] text-slate-900", printCompact && "mt-3 text-xl")}>{document.header.orderTitle}</p> : null}
            {document.header.orderSubtitle ? <p className={cn("mt-1 text-lg font-semibold text-slate-700", printCompact && "text-base")}>{document.header.orderSubtitle}</p> : null}
            {document.header.sundayTheme ? <p className={cn("mt-4 text-lg font-semibold text-slate-800", printCompact && "mt-2 text-base whitespace-pre-wrap")}>{document.header.sundayTheme}</p> : null}
            {document.header.serviceDateText ? <p className={cn("mt-1 text-base text-slate-600", printCompact && "text-sm")}>{document.header.serviceDateText}</p> : null}
            {title && !printCompact ? <p className="mt-6 text-sm uppercase tracking-[0.24em] text-slate-500">{title}</p> : null}
            {document.header.participantLines.length ? (
              <div className={cn("mt-6 space-y-1 text-base text-slate-700", printCompact && "mt-3 text-sm leading-5")}>
                {document.header.participantLines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}
              </div>
            ) : null}
          </div>
          <div className="flex justify-center md:justify-end">
            {document.header.rightLogoUrl ? <img src={document.header.rightLogoUrl} alt="Right logo" className="h-20 w-20 object-contain" /> : <div className="h-20 w-20 rounded-full border border-dashed border-slate-300" />} 
          </div>
        </div>
      </div>

      <div className={cn("space-y-8 px-6 py-8 sm:px-10 sm:py-10", printCompact && "columns-2 gap-6 space-y-0 px-4 py-2 text-[13px] leading-5")}>
        {document.sections.map((section, index) => (
          <section key={section.id} className={cn("rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,1),_rgba(248,245,240,0.9))] p-5 sm:p-6", printCompact && "mb-4 break-inside-avoid-column rounded-none border-0 bg-transparent p-0 shadow-none")}>
            <div className={cn("flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4", printCompact && "border-b-0 pb-1")}>
              <div className="space-y-1">
                {!printCompact ? <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Section {renderSectionNumber(index)}</p> : null}
                <h2 className={cn("text-xl font-semibold uppercase text-slate-900", printCompact && "text-[15px] leading-5")}>{section.stand ? "* " : ""}{section.title}</h2>
              </div>
              {section.note ? <p className={cn("max-w-sm text-right text-sm italic text-slate-500", printCompact && "max-w-none text-left text-[11px]")}>{section.note}</p> : null}
            </div>
            <div className={cn("mt-5", printCompact && "mt-1")}>
              <SectionBody section={section} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}