import type { Metadata } from "next";
import Link from "next/link";
import { Share_Tech_Mono } from "next/font/google";
import { LandingWaitlistForm } from "@/components/LandingWaitlistForm";
import { WaitlistTaglineInline } from "@/components/WaitlistTaglineInline";
import { MothershipCountdown } from "@/components/MothershipCountdown";
import { CHAT_ROUTE } from "@/lib/routes";
import { LEGAL_ROUTES } from "@/lib/legalRoutes";
import { LandingHeaderNav } from "@/components/LandingHeaderNav";
import { LandingJsonLd } from "@/components/LandingJsonLd";
import { LAUNCH_COUNTDOWN, WAITLIST_OVERLAY } from "@/lib/shellConfig";

const terminalFont = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Local-first AI assistant",
  description: WAITLIST_OVERLAY.tagline,
  openGraph: {
    title: "Local-first AI assistant · Genta",
    description: WAITLIST_OVERLAY.tagline,
    url: "/",
  },
  twitter: {
    title: "Local-first AI assistant · Genta",
    description: WAITLIST_OVERLAY.tagline,
  },
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "mt-0.5 h-5 w-5 shrink-0 text-[#7aab8a]"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

const linkMuted =
  "text-[0.75rem] tracking-[0.2em] text-[#7aab8a] underline decoration-[#4a6b58] underline-offset-4 transition hover:text-[#9fcbad] sm:text-xs";

type LandingSearchParams = Promise<{
  waitlist?: string | string[];
  waitlist_error?: string | string[];
}>;

function waitlistUrlFlash(sp: {
  waitlist?: string | string[];
  waitlist_error?: string | string[];
}): "success" | "email" | "privacy" | "store" | "webhook" | null {
  const ws = Array.isArray(sp.waitlist) ? sp.waitlist[0] : sp.waitlist;
  if (ws === "success") {
    return "success";
  }
  const e = Array.isArray(sp.waitlist_error) ? sp.waitlist_error[0] : sp.waitlist_error;
  if (e === "email" || e === "privacy" || e === "store" || e === "webhook") {
    return e;
  }
  return null;
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: LandingSearchParams;
}) {
  const sp = await searchParams;
  const urlFlash = waitlistUrlFlash(sp);

  return (
    <div
      className={`${terminalFont.className} relative flex min-h-dvh flex-col overflow-x-hidden bg-[#080602] text-[#ffcc66] antialiased`}
    >
      <LandingJsonLd />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_50%_45%,transparent_40%,rgba(0,0,0,0.55)_100%),radial-gradient(ellipse_100%_60%_at_50%_50%,rgba(255,190,90,0.06),transparent_55%)]" />
      <div className="scanlines pointer-events-none absolute inset-0 opacity-20" />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <header className="border-b border-[#b8892e]">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
            <Link
              href="/"
              className="text-base tracking-[0.25em] text-[#ffcc66] [text-shadow:0_0_10px_rgba(255,204,102,0.35)] transition hover:text-[#ffe08a] hover:[text-shadow:0_0_14px_rgba(255,204,102,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8892e]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080602]"
            >
              GENTA
            </Link>
            <LandingHeaderNav />
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          <section className="relative px-6 pb-16 pt-12 sm:px-10 sm:pb-24 sm:pt-16">
            <div className="relative mx-auto max-w-3xl text-center">
              <p className="text-[0.65rem] tracking-[0.35em] text-[#7aab8a]">
                COMING SOON
              </p>
              <h1 className="mt-4 text-3xl tracking-[0.08em] text-[#ffcc66] [text-shadow:0_0_14px_rgba(255,204,102,0.4)] sm:text-4xl md:text-5xl">
                {WAITLIST_OVERLAY.title}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-[0.95rem] leading-relaxed text-[#e8c266]/95 sm:text-lg [text-shadow:0_0_8px_rgba(255,204,102,0.25)]">
                <WaitlistTaglineInline />
              </p>
              {/* Mothership T-minus: set `LAUNCH_COUNTDOWN.enabled` to true in `shellConfig` when the timeline is public-ready. */}
              {LAUNCH_COUNTDOWN.enabled ? <MothershipCountdown /> : null}
              <div
                id="waitlist"
                className="mx-auto mt-8 w-full max-w-xl scroll-mt-24"
              >
                <LandingWaitlistForm variant="hero" urlFlash={urlFlash} />
              </div>
            </div>
          </section>

          <section className="border-t border-[#4a6b58]/60 bg-[#080602]/80 px-6 py-14 sm:px-10">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-10 text-center text-xl tracking-[0.1em] text-[#ffcc66] [text-shadow:0_0_12px_rgba(255,204,102,0.3)] sm:mb-12 sm:text-2xl">
                {WAITLIST_OVERLAY.featuresSectionTitle}
              </h2>
              <ul className="mx-auto flex max-w-2xl flex-col gap-5 sm:gap-6">
                {WAITLIST_OVERLAY.benefits.map((item) => (
                  <li
                    key={item.headline}
                    className="flex gap-4 border border-[#4a6b58]/90 bg-[#0c0a06]/95 px-5 py-5 text-left sm:gap-5 sm:px-7 sm:py-6"
                  >
                    <CheckIcon className="mt-1.5 h-6 w-6 shrink-0 text-[#7aab8a] sm:h-7 sm:w-7" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="text-lg font-bold leading-snug tracking-[0.04em] text-[#ffcc66] [text-shadow:0_0_10px_rgba(255,204,102,0.2)] sm:text-xl md:text-2xl">
                        {item.headline}
                      </p>
                      <p className="text-[0.95rem] leading-relaxed text-[#e8c266]/90 sm:text-base md:text-lg">
                        {item.supporting}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="border-t border-[#4a6b58]/60 bg-[#080602]/80 px-6 py-14 sm:px-10 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-xl tracking-[0.1em] text-[#ffcc66] [text-shadow:0_0_12px_rgba(255,204,102,0.3)] sm:text-2xl">
                {WAITLIST_OVERLAY.landingChatSectionTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-[0.9rem] leading-relaxed text-[#c9a85e] sm:text-[0.95rem]">
                {WAITLIST_OVERLAY.landingChatSectionBlurb}
              </p>
              <Link
                href={CHAT_ROUTE}
                className="mt-8 inline-flex w-full items-center justify-center border border-[#b8892e] bg-[#b8892e]/10 px-8 py-3.5 text-xs font-normal uppercase tracking-[0.2em] text-[#ffcc66] transition hover:bg-[#b8892e]/20 sm:w-auto"
              >
                {WAITLIST_OVERLAY.landingChatCtaLabel}
              </Link>
            </div>
          </section>
        </main>

        <footer className="mt-auto border-t border-[#b8892e] px-6 py-8 sm:px-10">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-[0.7rem] tracking-[0.15em] text-[#b8892e]/90 sm:flex-row sm:text-xs">
            <span>© {new Date().getFullYear()} GENTA</span>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 sm:justify-end">
              <Link href={LEGAL_ROUTES.privacyPolicy} className={linkMuted}>
                Privacy
              </Link>
              <Link href={LEGAL_ROUTES.contact} className={linkMuted}>
                Contact
              </Link>
              <Link href={CHAT_ROUTE} className={linkMuted}>
                Terminal chat
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
