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

  if (kind !== "baptism") {
    notFound();
  }

  const record = await getMemberRecord(id);
  if (!record) {
    notFound();
  }

  const settings = await getSiteSettings();
  const { member } = record;
  const birthDate = member.birthDate ? formatDate(member.birthDate) : "__________________";
  const baptismDate = member.baptizedDate ? formatDate(member.baptizedDate) : "__________________";
  const placeOfBirth = member.address || "____________________________";
  const churchName = settings.name || "UNITED CHURCH OF CHRIST IN THE PHILIPPINES";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 print:max-w-none print:px-0 print:py-0">
      <PrintToolbar />

      <div className="bg-white p-8 text-center text-slate-900 print:min-h-screen print:p-6" style={{ fontFamily: '"Times New Roman", serif' }}>
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-center justify-center gap-6">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.name} className="h-20 w-20 object-contain" />
            ) : null}
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em]">United Church of Christ in the Philippines</p>
            </div>
          </div>

          <h1 className="mt-8 text-6xl font-semibold leading-none">Certificate of Baptism</h1>
          <p className="mt-5 text-lg">This certifies that</p>

          <div className="mx-auto mt-6 max-w-4xl space-y-6 text-[22px] leading-10">
            <p className="border-b border-slate-500 pb-1 font-semibold">{fullName(member)}</p>
            <p>
              [ ] male &nbsp;&nbsp;[ ] female, child of {blank(member.fatherName)} and {blank(member.motherName)}
            </p>
            <p>
              born on {birthDate}, 20___ at {placeOfBirth}, was baptized at the age of __________
            </p>
            <p>
              according to the baptismal rites of the <span className="font-semibold uppercase">United Church of Christ in the Philippines</span>,
            </p>
            <p>in the name of GOD: FATHER, SON and HOLY SPIRIT.</p>
            <p>
              Baptized this __________ day of __________, 20___ at the <span className="font-semibold uppercase">{churchName}</span>,
            </p>
            <p className="border-b border-slate-500 pb-1">&nbsp;</p>
            <p>(Municipality/City)</p>
            <p className="border-b border-slate-500 pb-1">&nbsp;</p>
            <p>(Province)</p>
            <p>
              of the {blank(settings.address)}, Philippines.
            </p>
            <p>(Conference)</p>
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
            <div><div className="border-t border-slate-500 pt-2">Sponsor</div></div>
            <div><div className="border-t border-slate-500 pt-2">Sponsor</div></div>
            <div><div className="border-t border-slate-500 pt-2">Sponsor</div></div>
          </div>
          <div className="mt-14 grid gap-10 text-center md:grid-cols-3">
            <div><div className="border-t border-slate-500 pt-2">Sponsor</div></div>
            <div><div className="border-t border-slate-500 pt-2">Sponsor</div></div>
            <div><div className="border-t border-slate-500 pt-2">Sponsor</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}