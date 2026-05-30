import { notFound } from "next/navigation";

import { PrintToolbar } from "@/components/print/print-toolbar";
import { requireRole } from "@/lib/auth";
import { getMemberRecord } from "@/lib/member-record";
import { DASHBOARD_ROLES } from "@/lib/permissions";
import { getSiteSettings } from "@/lib/site-settings";
import { formatDate, fullName } from "@/lib/utils";

type Params = Promise<{ id: string; kind: string }>;

function blank(value?: string | null) {
  return value && value.trim() ? value : "____________________________";
}

export default async function MemberCertificatePage({ params }: { params: Params }) {
  await requireRole(DASHBOARD_ROLES);
  const { id, kind } = await params;

  if (kind !== "baptism" && kind !== "confirmation") {
    notFound();
  }

  const record = await getMemberRecord(id);
  if (!record) {
    notFound();
  }

  const settings = await getSiteSettings();
  const { member } = record;
  const certificateTitle = kind === "baptism" ? "Certificate of Baptism" : "Certificate of Confirmation";
  const riteDate = kind === "baptism" ? member.baptizedDate : member.confirmationDate;
  const riteLabel = kind === "baptism" ? "baptized" : "confirmed";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 print:max-w-none print:px-0 print:py-0">
      <PrintToolbar />

      <div className="bg-white p-8 text-center text-slate-900 print:min-h-screen print:p-10" style={{ fontFamily: '"Times New Roman", serif' }}>
        <div className="mx-auto max-w-5xl border border-slate-300 px-8 py-10">
          <div className="flex items-center justify-center gap-6">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.name} className="h-20 w-20 object-contain" />
            ) : null}
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{settings.name}</p>
              <p className="mt-2 text-sm text-slate-500">{blank(settings.address)}</p>
            </div>
          </div>

          <h1 className="mt-8 text-6xl font-semibold leading-none">{certificateTitle}</h1>
          <p className="mt-6 text-lg">This certifies that</p>

          <p className="mt-6 text-3xl font-semibold underline decoration-1 underline-offset-8">
            {fullName(member)}
          </p>

          <div className="mx-auto mt-8 max-w-4xl space-y-5 text-lg leading-9">
            <p>
              child of {blank(member.fatherName)} and {blank(member.motherName)}, born on {blank(formatDate(member.birthDate))}
              , was {riteLabel} on {blank(formatDate(riteDate))} at {blank(settings.name)}.
            </p>
            <p>
              This certificate is issued upon the request of the member for official church record and reference.
            </p>
          </div>

          <div className="mt-16 grid gap-10 text-center md:grid-cols-2">
            <div>
              <div className="border-t border-slate-500 pt-2 text-lg">Officiating Minister</div>
            </div>
            <div>
              <div className="border-t border-slate-500 pt-2 text-lg">Local Church</div>
            </div>
          </div>

          <div className="mt-16 grid gap-10 text-center md:grid-cols-3">
            <div>
              <div className="border-t border-slate-500 pt-2">Sponsor</div>
            </div>
            <div>
              <div className="border-t border-slate-500 pt-2">Sponsor</div>
            </div>
            <div>
              <div className="border-t border-slate-500 pt-2">Sponsor</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}