import type { OrderOfWorshipDocument, WorshipHymnSection, WorshipListSection, WorshipResponsiveLine, WorshipResponsiveSection, WorshipSection, WorshipTextSection } from "@/lib/order-of-worship";
import { getResponsiveSpeakerTheme, getSpeakerLabel, isScriptureReadingSection } from "@/lib/order-of-worship";
import { cn } from "@/lib/utils";

function renderSectionNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

function RichText({ text, scripture = false, compact = false }: { text: string; scripture?: boolean; compact?: boolean }) {
  const lines = text.split("\n");

  return (
    <div className={cn("space-y-2", compact && "space-y-1")}>
      {lines.map((line, index) => {
        const match = line.match(/^(\d+[a-z]?)\s+(.*)$/i);

        if (scripture && match) {
          return (
            <p key={`${line}-${index}`} className={cn("flex items-start gap-2 leading-7 text-inherit", compact && "gap-1.5 leading-5")}>
              <span className={cn("mt-0.5 inline-flex min-w-7 items-center justify-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800", compact && "min-w-5 px-1.5 py-0 text-[9px]")}>{match[1]}</span>
              <span>{match[2]}</span>
            </p>
          );
        }

        return <p key={`${line}-${index}`} className="whitespace-pre-wrap text-inherit">{line || "\u00A0"}</p>;
      })}
    </div>
  );
}

function SectionText({ section, compact = false }: { section: WorshipTextSection; compact?: boolean }) {
  return <div className={cn("text-[15px] leading-7 text-slate-700", compact && "text-[12px] leading-[1.45] text-slate-800")}><RichText text={section.body} compact={compact} /></div>;
}

function ScriptureReadingLine({ line, compact = false }: { line: WorshipResponsiveLine; compact?: boolean }) {
  const theme = getResponsiveSpeakerTheme(line);

  return (
    <div className={cn("rounded-2xl border p-4", compact && "rounded-none border-0 border-l-2 bg-transparent p-0 pl-3")} style={{ backgroundColor: compact ? undefined : theme.soft, borderColor: compact ? theme.accent : theme.border }}>
      <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]", compact && "rounded-none bg-transparent px-0 py-0 text-[10px]")} style={{ backgroundColor: compact ? undefined : theme.border, color: theme.accent }}>
        {getSpeakerLabel(line)}
      </span>
      <div className={cn("mt-3 font-serif text-[17px] leading-8 text-slate-800", compact && "mt-1 text-[12px] leading-[1.5]")}>
        <RichText text={line.text} scripture compact={compact} />
      </div>
    </div>
  );
}

function SectionResponsive({ section, compact = false }: { section: WorshipResponsiveSection; compact?: boolean }) {
  if (isScriptureReadingSection(section)) {
    return (
      <div className={cn("space-y-4", compact && "space-y-2")}>
        {section.lines.map((line) => <ScriptureReadingLine key={line.id} line={line} compact={compact} />)}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {section.lines.map((line) => (
        <div key={line.id} className={cn("grid gap-1 rounded-2xl border p-4 md:grid-cols-[160px_minmax(0,1fr)] md:gap-4", compact && "rounded-none border-0 border-l-2 bg-transparent p-0 pl-3 md:grid-cols-[92px_minmax(0,1fr)] md:gap-2")} style={{ backgroundColor: compact ? undefined : getResponsiveSpeakerTheme(line).soft, borderColor: compact ? getResponsiveSpeakerTheme(line).accent : getResponsiveSpeakerTheme(line).border }}>
          <div className={cn("text-sm font-semibold uppercase tracking-[0.14em]", compact && "text-[10px] tracking-[0.12em]")} style={{ color: getResponsiveSpeakerTheme(line).accent }}>{getSpeakerLabel(line)}</div>
          <div className={cn("text-[15px] leading-7 text-slate-800", compact && "text-[12px] leading-[1.45]")}><RichText text={line.text} compact={compact} /></div>
        </div>
      ))}
    </div>
  );
}

function SectionHymn({ section, compact = false }: { section: WorshipHymnSection; compact?: boolean }) {
  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      {(section.hymnSource || section.songTitle) ? (
        <div className={cn("flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-3", compact && "gap-1 border-b-0 pb-0")}>
          <p className={cn("text-sm italic text-slate-500", compact && "text-[10px]")}>{section.hymnSource || "Hymn reference"}</p>
          <p className={cn("text-base font-semibold text-slate-800", compact && "text-[12px]")}>{section.songTitle || "Song title"}</p>
        </div>
      ) : null}
      <div className={cn("space-y-4", compact && "space-y-2")}>
        {section.parts.map((part) => (
          <div key={part.id}>
            <p className={cn("text-sm font-semibold text-slate-700", compact && "text-[11px]")}>{part.label}</p>
            <div className={cn("mt-1 text-[15px] leading-7 text-slate-700", compact && "mt-0.5 text-[12px] leading-[1.45] text-slate-800")}><RichText text={part.text} compact={compact} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionList({ section, compact = false }: { section: WorshipListSection; compact?: boolean }) {
  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      {section.items.map((item) => (
        <div key={item.id}>
          {item.title ? <p className={cn("text-sm font-semibold uppercase tracking-[0.08em] text-slate-600", compact && "text-[10px]")}>{item.title}</p> : null}
          <div className={cn("mt-1 text-[15px] leading-7 text-slate-700", compact && "mt-0.5 text-[12px] leading-[1.45] text-slate-800")}><RichText text={item.text} compact={compact} /></div>
        </div>
      ))}
    </div>
  );
}

function SectionBody({ section, compact = false }: { section: WorshipSection; compact?: boolean }) {
  if (section.type === "RESPONSIVE") {
    return <SectionResponsive section={section} compact={compact} />;
  }

  if (section.type === "HYMN") {
    return <SectionHymn section={section} compact={compact} />;
  }

  if (section.type === "LIST") {
    return <SectionList section={section} compact={compact} />;
  }

  return <SectionText section={section} compact={compact} />;
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
    <div className={cn("overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_35px_90px_-55px_rgba(15,23,42,0.45)]", printCompact && "relative min-h-[7.6in] before:absolute before:bottom-0 before:left-1/2 before:top-0 before:w-px before:-translate-x-1/2 before:bg-[linear-gradient(180deg,rgba(51,65,85,0),rgba(51,65,85,0.18),rgba(51,65,85,0))]", className)}>
      <div className={cn("relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(236,221,196,0.55),_rgba(255,255,255,0.96)_58%)] px-6 py-10 sm:px-10", printCompact && "border-b border-slate-300 bg-white px-6 py-5")}>
        <div className="grid gap-6 md:grid-cols-[120px_minmax(0,1fr)_120px] md:items-start">
          <div className="flex justify-center md:justify-start">
            {document.header.leftLogoUrl ? <img src={document.header.leftLogoUrl} alt="Left logo" className={cn("h-20 w-20 object-contain", printCompact && "h-14 w-14")} /> : <div className={cn("h-20 w-20 rounded-full border border-dashed border-slate-300", printCompact && "h-14 w-14")} />} 
          </div>
          <div className="text-center">
            {document.header.centerLines.map((line, index) => (
              <p key={`${line}-${index}`} className={cn("text-slate-800", index === 0 ? "text-lg font-semibold uppercase tracking-[0.08em]" : index === 2 ? "mt-1 text-xl font-bold" : "mt-1 text-sm font-medium uppercase tracking-[0.12em]", printCompact && (index === 0 ? "text-[12px] tracking-[0.06em]" : index === 2 ? "text-[17px]" : "text-[11px]"))}>{line}</p>
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
            {document.header.rightLogoUrl ? <img src={document.header.rightLogoUrl} alt="Right logo" className={cn("h-20 w-20 object-contain", printCompact && "h-14 w-14")} /> : <div className={cn("h-20 w-20 rounded-full border border-dashed border-slate-300", printCompact && "h-14 w-14")} />} 
          </div>
        </div>
      </div>

      <div className={cn("space-y-8 px-6 py-8 sm:px-10 sm:py-10", printCompact && "columns-2 gap-10 [column-fill:balance] [column-rule:1px_solid_rgba(148,163,184,0.35)] space-y-0 px-6 py-5 font-serif text-[13px] leading-5 print:h-[6.55in]")}>
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
              <SectionBody section={section} compact={printCompact} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}