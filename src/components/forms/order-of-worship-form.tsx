"use client";

import { ContentStatus } from "@prisma/client";
import { Copy, GripVertical, Plus, Printer, Presentation, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ContentDeleteButton } from "@/components/forms/content-delete-button";
import { FileUploadField } from "@/components/forms/file-upload-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { OrderOfWorshipDocument, WorshipHymnPart, WorshipListItem, WorshipResponsiveLine, WorshipSection, WorshipSectionType } from "@/lib/order-of-worship";
import { convertSectionType, createDefaultOrderOfWorship, createSectionTemplate, createWorshipId, WORSHIP_SPEAKERS } from "@/lib/order-of-worship";
import { formatDateInput, toSlug } from "@/lib/utils";

type FormValues = {
  id?: string;
  title: string;
  slug: string;
  worshipDate: string;
  serviceTime: string;
  status: ContentStatus;
  content: OrderOfWorshipDocument;
};

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function joinLines(value: string[]) {
  return value.join("\n");
}

function SectionEditor({
  section,
  index,
  onChange,
  onRemove,
  onDuplicate,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  section: WorshipSection;
  index: number;
  onChange: (section: WorshipSection) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
}) {
  const sectionLabel = useMemo(() => `${index + 1}. ${section.title || "Untitled section"}`, [index, section.title]);

  function updateResponsiveLine(lineId: string, updates: Partial<WorshipResponsiveLine>) {
    if (section.type !== "RESPONSIVE") {
      return;
    }

    onChange({
      ...section,
      lines: section.lines.map((line) => (line.id === lineId ? { ...line, ...updates } : line)),
    });
  }

  function updateHymnPart(partId: string, updates: Partial<WorshipHymnPart>) {
    if (section.type !== "HYMN") {
      return;
    }

    onChange({
      ...section,
      parts: section.parts.map((part) => (part.id === partId ? { ...part, ...updates } : part)),
    });
  }

  function updateListItem(itemId: string, updates: Partial<WorshipListItem>) {
    if (section.type !== "LIST") {
      return;
    }

    onChange({
      ...section,
      items: section.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
    });
  }

  return (
    <div draggable onDragStart={onDragStart} onDragOver={(event) => { event.preventDefault(); onDragOver(); }} onDrop={(event) => { event.preventDefault(); onDrop(); }} className="rounded-[28px] border border-[var(--line)] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-2xl border border-[var(--line)] bg-[var(--surface-subtle)] p-2 text-[var(--muted)]"><GripVertical className="h-4 w-4" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{section.type}</p>
            <p className="mt-1 text-base font-semibold text-[var(--ink)]">{sectionLabel}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" onClick={onDuplicate}><Copy className="mr-2 h-4 w-4" />Duplicate</Button>
          <Button type="button" variant="ghost" onClick={onRemove}><Trash2 className="mr-2 h-4 w-4" />Remove</Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-[var(--ink)]">
          <span>Section title</span>
          <Input value={section.title} onChange={(event) => onChange({ ...section, title: event.target.value })} />
        </label>
        <label className="space-y-2 text-sm font-medium text-[var(--ink)]">
          <span>Side note</span>
          <Input value={section.note ?? ""} onChange={(event) => onChange({ ...section, note: event.target.value })} placeholder="Optional note or reader cue" />
        </label>
      </div>

      <label className="mt-4 block space-y-2 text-sm font-medium text-[var(--ink)]">
        <span>Section type</span>
        <Select value={section.type} onChange={(event) => onChange(convertSectionType(section, event.target.value as WorshipSectionType))}>
          <option value="TEXT">TEXT</option>
          <option value="RESPONSIVE">RESPONSIVE</option>
          <option value="HYMN">HYMN</option>
          <option value="LIST">LIST</option>
        </Select>
      </label>

      <label className="mt-4 flex items-center gap-3 text-sm font-medium text-[var(--ink)]">
        <input type="checkbox" checked={section.stand} onChange={(event) => onChange({ ...section, stand: event.target.checked })} />
        Mark with * for congregation standing
      </label>

      {section.type === "TEXT" ? (
        <label className="mt-4 block space-y-2 text-sm font-medium text-[var(--ink)]">
          <span>Content</span>
          <Textarea rows={6} value={section.body} onChange={(event) => onChange({ ...section, body: event.target.value })} />
        </label>
      ) : null}

      {section.type === "RESPONSIVE" ? (
        <div className="mt-4 space-y-3">
          {section.lines.map((line) => (
            <div key={line.id} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-subtle)] p-3">
              <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)_auto]">
                <label className="space-y-2 text-sm font-medium text-[var(--ink)]">
                  <span>Reader</span>
                  <Select value={line.speaker} onChange={(event) => updateResponsiveLine(line.id, { speaker: event.target.value as WorshipResponsiveLine["speaker"] })}>
                    {WORSHIP_SPEAKERS.map((speaker) => <option key={speaker} value={speaker}>{speaker}</option>)}
                  </Select>
                </label>
                <label className="space-y-2 text-sm font-medium text-[var(--ink)]">
                  <span>Text</span>
                  <Textarea rows={3} value={line.text} onChange={(event) => updateResponsiveLine(line.id, { text: event.target.value })} />
                </label>
                <div className="flex items-end">
                  <Button type="button" variant="ghost" onClick={() => onChange({ ...section, lines: section.lines.filter((entry) => entry.id !== line.id) })}>Remove</Button>
                </div>
              </div>
              {line.speaker === "CUSTOM" ? <label className="mt-3 block space-y-2 text-sm font-medium text-[var(--ink)]"><span>Custom reader label</span><Input value={line.customSpeaker ?? ""} onChange={(event) => updateResponsiveLine(line.id, { customSpeaker: event.target.value })} placeholder="e.g. Pastor" /></label> : null}
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={() => onChange({ ...section, lines: [...section.lines, { id: createWorshipId("line"), speaker: "LITURGIST", text: "" }] })}><Plus className="mr-2 h-4 w-4" />Add line</Button>
        </div>
      ) : null}

      {section.type === "HYMN" ? (
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Hymn reference</span><Input value={section.hymnSource ?? ""} onChange={(event) => onChange({ ...section, hymnSource: event.target.value })} placeholder="HFJ No. 290" /></label>
            <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Song title</span><Input value={section.songTitle ?? ""} onChange={(event) => onChange({ ...section, songTitle: event.target.value })} placeholder="The Church's One Foundation" /></label>
          </div>
          {section.parts.map((part) => (
            <div key={part.id} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-subtle)] p-3">
              <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)_auto]">
                <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Part label</span><Input value={part.label} onChange={(event) => updateHymnPart(part.id, { label: event.target.value })} placeholder="Stanza 1" /></label>
                <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Lyrics</span><Textarea rows={4} value={part.text} onChange={(event) => updateHymnPart(part.id, { text: event.target.value })} /></label>
                <div className="flex items-end"><Button type="button" variant="ghost" onClick={() => onChange({ ...section, parts: section.parts.filter((entry) => entry.id !== part.id) })}>Remove</Button></div>
              </div>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={() => onChange({ ...section, parts: [...section.parts, { id: createWorshipId("part"), label: `Stanza ${section.parts.length + 1}`, text: "" }] })}><Plus className="mr-2 h-4 w-4" />Add stanza / chorus</Button>
        </div>
      ) : null}

      {section.type === "LIST" ? (
        <div className="mt-4 space-y-3">
          {section.items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-subtle)] p-3">
              <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)_auto]">
                <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Item title</span><Input value={item.title ?? ""} onChange={(event) => updateListItem(item.id, { title: event.target.value })} placeholder="Optional label" /></label>
                <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Text</span><Textarea rows={4} value={item.text} onChange={(event) => updateListItem(item.id, { text: event.target.value })} /></label>
                <div className="flex items-end"><Button type="button" variant="ghost" onClick={() => onChange({ ...section, items: section.items.filter((entry) => entry.id !== item.id) })}>Remove</Button></div>
              </div>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={() => onChange({ ...section, items: [...section.items, { id: createWorshipId("item"), title: "", text: "" }] })}><Plus className="mr-2 h-4 w-4" />Add item</Button>
        </div>
      ) : null}
    </div>
  );
}

export function OrderOfWorshipForm({ initialData }: { initialData?: Partial<FormValues> }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>({
    id: initialData?.id,
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    worshipDate: initialData?.worshipDate ?? "",
    serviceTime: initialData?.serviceTime ?? "",
    status: initialData?.status ?? ContentStatus.DRAFT,
    content: initialData?.content ?? createDefaultOrderOfWorship(),
  });

  function updateSection(sectionId: string, nextSection: WorshipSection) {
    setValues((current) => ({
      ...current,
      content: {
        ...current.content,
        sections: current.content.sections.map((section) => (section.id === sectionId ? nextSection : section)),
      },
    }));
  }

  function moveSection(dragId: string, dropId: string) {
    if (dragId === dropId) {
      return;
    }

    setValues((current) => {
      const sections = [...current.content.sections];
      const fromIndex = sections.findIndex((section) => section.id === dragId);
      const toIndex = sections.findIndex((section) => section.id === dropId);

      if (fromIndex === -1 || toIndex === -1) {
        return current;
      }

      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);

      return { ...current, content: { ...current.content, sections } };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const response = await fetch(values.id ? `/api/order-of-worship/${values.id}` : "/api/order-of-worship", {
      method: values.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        worshipDate: values.worshipDate || undefined,
      }),
    });

    setIsSaving(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Unable to save order of worship.");
      return;
    }

    const data = (await response.json()) as { order: { id: string } };
    router.push(`/admin/order-of-worship/${data.order.id}`);
    router.refresh();
  }

  return (
    <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)}>
      {error ? <p className="rounded-2xl bg-[#fff1ec] px-4 py-3 text-sm text-[#a53f2b]">{error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-6">
          <Card>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Maker</p>
                <h1 className="mt-2 text-xl font-semibold text-[var(--ink)]">Order of Worship Maker and Presenter</h1>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">Drag sections to reorder them, build responsive readings and hymns, then preview, print, or present the liturgy section by section.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Title</span><Input value={values.title} onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))} placeholder="Pentecost / UCCP Anniversary Month" /></label>
                <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Slug</span><div className="flex gap-2"><Input value={values.slug} onChange={(event) => setValues((current) => ({ ...current, slug: event.target.value }))} placeholder="pentecost-uccp-anniversary" /><Button type="button" variant="secondary" onClick={() => setValues((current) => ({ ...current, slug: toSlug(current.title) }))}>Generate</Button></div></label>
                <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Service date</span><Input type="date" value={values.worshipDate} onChange={(event) => setValues((current) => ({ ...current, worshipDate: event.target.value }))} /></label>
                <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Service time</span><Input value={values.serviceTime} onChange={(event) => setValues((current) => ({ ...current, serviceTime: event.target.value }))} placeholder="9:00 a.m." /></label>
                <label className="space-y-2 text-sm font-medium text-[var(--ink)] md:col-span-2"><span>Status</span><Select value={values.status} onChange={(event) => setValues((current) => ({ ...current, status: event.target.value as ContentStatus }))}>{Object.values(ContentStatus).map((option) => <option key={option} value={option}>{option}</option>)}</Select></label>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Header</p>
                <h2 className="mt-2 text-lg font-semibold text-[var(--ink)]">Worship bulletin header</h2>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <FileUploadField label="Left logo" value={values.content.header.leftLogoUrl} onUploaded={(value) => setValues((current) => ({ ...current, content: { ...current.content, header: { ...current.content.header, leftLogoUrl: value } } }))} previewMode="logo" />
                <FileUploadField label="Right logo" value={values.content.header.rightLogoUrl} onUploaded={(value) => setValues((current) => ({ ...current, content: { ...current.content, header: { ...current.content.header, rightLogoUrl: value } } }))} previewMode="logo" />
              </div>

              <label className="block space-y-2 text-sm font-medium text-[var(--ink)]"><span>Center text lines</span><Textarea rows={5} value={joinLines(values.content.header.centerLines)} onChange={(event) => setValues((current) => ({ ...current, content: { ...current.content, header: { ...current.content.header, centerLines: splitLines(event.target.value) } } }))} placeholder="One line per row" /></label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Month theme</span><Input value={values.content.header.monthTheme ?? ""} onChange={(event) => setValues((current) => ({ ...current, content: { ...current.content, header: { ...current.content.header, monthTheme: event.target.value } } }))} /></label>
                <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Sunday theme</span><Input value={values.content.header.sundayTheme ?? ""} onChange={(event) => setValues((current) => ({ ...current, content: { ...current.content, header: { ...current.content.header, sundayTheme: event.target.value } } }))} /></label>
                <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Main title</span><Input value={values.content.header.orderTitle ?? ""} onChange={(event) => setValues((current) => ({ ...current, content: { ...current.content, header: { ...current.content.header, orderTitle: event.target.value } } }))} /></label>
                <label className="space-y-2 text-sm font-medium text-[var(--ink)]"><span>Subtitle</span><Input value={values.content.header.orderSubtitle ?? ""} onChange={(event) => setValues((current) => ({ ...current, content: { ...current.content, header: { ...current.content.header, orderSubtitle: event.target.value } } }))} /></label>
                <label className="space-y-2 text-sm font-medium text-[var(--ink)] md:col-span-2"><span>Date and time text</span><Input value={values.content.header.serviceDateText ?? ""} onChange={(event) => setValues((current) => ({ ...current, content: { ...current.content, header: { ...current.content.header, serviceDateText: event.target.value } } }))} placeholder="17 May 2026, 9:00 a.m." /></label>
              </div>

              <label className="block space-y-2 text-sm font-medium text-[var(--ink)]"><span>Participant lines</span><Textarea rows={4} value={joinLines(values.content.header.participantLines)} onChange={(event) => setValues((current) => ({ ...current, content: { ...current.content, header: { ...current.content.header, participantLines: splitLines(event.target.value) } } }))} placeholder="One line per row, e.g. Preacher: Rev. ___" /></label>
            </div>
          </Card>

          <Card>
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Sections</p>
                  <h2 className="mt-2 text-lg font-semibold text-[var(--ink)]">Drag-and-drop worship flow</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["TEXT", "RESPONSIVE", "HYMN", "LIST"] as WorshipSectionType[]).map((type) => (
                    <Button key={type} type="button" variant="secondary" onClick={() => setValues((current) => ({ ...current, content: { ...current.content, sections: [...current.content.sections, createSectionTemplate(type)] } }))}>
                      <Plus className="mr-2 h-4 w-4" />Add {type.toLowerCase()}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {values.content.sections.map((section, index) => (
                  <SectionEditor
                    key={section.id}
                    section={section}
                    index={index}
                    onChange={(nextSection) => updateSection(section.id, nextSection)}
                    onRemove={() => setValues((current) => ({ ...current, content: { ...current.content, sections: current.content.sections.filter((entry) => entry.id !== section.id) } }))}
                    onDuplicate={() => setValues((current) => ({ ...current, content: { ...current.content, sections: current.content.sections.flatMap((entry) => entry.id === section.id ? [entry, { ...entry, id: createWorshipId("section") }] : [entry]) } }))}
                    onDragStart={() => setDraggedSectionId(section.id)}
                    onDragOver={() => undefined}
                    onDrop={() => {
                      if (draggedSectionId) {
                        moveSection(draggedSectionId, section.id);
                        setDraggedSectionId(null);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Output</p>
                <h2 className="mt-2 text-lg font-semibold text-[var(--ink)]">Preview and actions</h2>
              </div>
              <div className="grid gap-3">
                {values.id ? <Link href={`/admin/order-of-worship/${values.id}`} className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]">Preview bulletin</Link> : null}
                {values.id ? <Link href={`/present/order-of-worship/${values.id}`} className="inline-flex items-center justify-center rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--sand)]"><Presentation className="mr-2 h-4 w-4" />Present on screen</Link> : null}
                {values.id ? <Link href={`/print/order-of-worship/${values.id}`} className="inline-flex items-center justify-center rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--sand)]"><Printer className="mr-2 h-4 w-4" />Print layout</Link> : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : values.id ? "Update order of worship" : "Save order of worship"}</Button>
                {values.id ? <ContentDeleteButton endpoint={`/api/order-of-worship/${values.id}`} redirectTo="/admin/order-of-worship" /> : null}
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Builder notes</p>
              <ul className="space-y-2 text-sm leading-6 text-[var(--muted)]">
                <li>Use `TEXT` for prayers, meditations, and announcements.</li>
                <li>Use `RESPONSIVE` for liturgist/church/all spoken exchanges.</li>
                <li>Use `HYMN` for song titles with stanzas, refrain, or chorus.</li>
                <li>Use `LIST` for joys, concerns, readings, or grouped items.</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}

export function mapOrderOfWorshipToForm(order: {
  id: string;
  title: string;
  slug: string;
  worshipDate: Date | null;
  serviceTime: string | null;
  status: ContentStatus;
  content: OrderOfWorshipDocument;
}): FormValues {
  return {
    id: order.id,
    title: order.title,
    slug: order.slug,
    worshipDate: formatDateInput(order.worshipDate),
    serviceTime: order.serviceTime ?? "",
    status: order.status,
    content: order.content,
  };
}