import { MemberRegistrationForm } from "@/components/forms/member-registration-form";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getNextMemberId } from "@/lib/member-id";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function MemberRegistrationPage() {
  const settings = await getSiteSettings();
  const nextMemberId = settings.enableMemberRegistration ? await getNextMemberId(settings.memberIdPrefix) : "";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--background),#f8fbfd)]">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
        {settings.enableMemberRegistration ? (
          <MemberRegistrationForm nextMemberId={nextMemberId} memberIdPrefix={settings.memberIdPrefix} />
        ) : (
          <div className="rounded-xl border border-[var(--line)] bg-white p-8 text-center text-[var(--muted)]">
            Member registration is currently unavailable. Please contact the church office.
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
