import { connection } from "next/server";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/site-settings";

export async function SiteFooter() {
  await connection();
  const settings = await getSiteSettings();

  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface-strong)] text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1.2fr_0.9fr_0.9fr] lg:px-10">
        <div>
          <div className="flex items-center gap-4">
            {settings.logoUrl ? <img src={settings.logoUrl} alt={settings.name} className="h-11 w-11 rounded-2xl bg-white object-contain p-2" /> : null}
            <div>
              <h2 className="font-serif text-xl">{settings.name}</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/50">{settings.tagline}</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/72">{settings.description}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-white/50">Contact</p>
          <p className="mt-3 text-sm leading-7 text-white/80">{settings.address}</p>
          <p className="text-sm text-white/80">{settings.phone}</p>
          <p className="text-sm text-white/80">{settings.email}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-white/50">Office Hours</p>
          <p className="mt-3 text-sm text-white/80">Tuesday to Saturday, 9:00 AM to 5:00 PM</p>
          <p className="text-sm text-white/80">Sunday worship services at 9:00 AM and 5:00 PM</p>
          {settings.enableMemberRegistration ? (
            <Link href="/register/member" className={buttonStyles({ variant: "secondary", className: "mt-4 no-underline" })}>
              Member registration
            </Link>
          ) : null}
        </div>
      </div>
    </footer>
  );
}