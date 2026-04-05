import type { Metadata } from "next";
import Link from "next/link";
import { Share_Tech_Mono } from "next/font/google";
import { LandingWaitlistForm } from "@/components/LandingWaitlistForm";
import { CHAT_ROUTE } from "@/lib/routes";
import { LEGAL_ROUTES } from "@/lib/legalRoutes";
import { WAITLIST_OVERLAY } from "@/lib/shellConfig";

const terminalFont = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Local-first AI assistant",
  description: WAITLIST_OVERLAY.tagline,
};

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 shrink-0 text-[#7aab8a]"
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

export default function LandingPage() {
  return (
    <div
      className={`${terminalFont.className} relative flex min-h-dvh flex-col overflow-x-hidden bg-[#080602] text-[#ffcc66] antialiased`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_50%_45%,transparent_40%,rgba(0,0,0,0.55)_100%),radial-gradient(ellipse_100%_60%_at_50%_50%,rgba(255,190,90,0.06),transparent_55%)]" />
      <div className="scanlines pointer-events-none absolute inset-0 opacity-20" />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <header className="border-b border-[#b8892e]">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
            <Link
              href="/"
              className="text-sm tracking-[0.25em] text-[#ffcc66] [text-shadow:0_0_10px_rgba(255,204,102,0.35)]"
            >
              GENTA
            </Link>
            <nav className="flex flex-wrap items-center justify-end gap-4 sm:gap-6">
              <Link href={LEGAL_ROUTES.privacyPolicy} className={linkMuted}>
                {WAITLIST_OVERLAY.privacyPolicyLinkText}
              </Link>
              <Link
                href={CHAT_ROUTE}
                className="border border-[#b8892e] bg-[#b8892e]/10 px-3 py-2 text-[0.65rem] font-normal uppercase tracking-[0.2em] text-[#ffcc66] transition hover:bg-[#b8892e]/20 sm:px-4 sm:text-xs"
              >
                {WAITLIST_OVERLAY.landingChatCtaLabel}
              </Link>
            </nav>
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
                {WAITLIST_OVERLAY.tagline}
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
                <Link
                  href={CHAT_ROUTE}
                  className="inline-flex w-full items-center justify-center border border-[#b8892e] bg-[#b8892e]/10 px-8 py-3.5 text-xs font-normal uppercase tracking-[0.2em] text-[#ffcc66] transition hover:bg-[#b8892e]/20 sm:w-auto"
                >
                  {WAITLIST_OVERLAY.landingChatCtaLabel}
                </Link>
                <a
                  href="#waitlist"
                  className="inline-flex w-full items-center justify-center border border-[#4a6b58] bg-[#0c0a06] px-8 py-3.5 text-xs font-normal uppercase tracking-[0.2em] text-[#ffcc66] transition hover:border-[#7aab8a] sm:w-auto"
                >
                  Join the waitlist
                </a>
              </div>
            </div>
          </section>

          <section className="border-t border-[#4a6b58]/60 bg-[#080602]/80 px-6 py-14 sm:px-10">
            <div className="mx-auto max-w-5xl">
              <ul className="grid gap-4 sm:grid-cols-2">
                {WAITLIST_OVERLAY.benefits.map((line) => (
                  <li
                    key={line}
                    className="flex gap-3 border border-[#4a6b58] bg-[#0c0a06]/90 p-5 text-left text-[0.88rem] leading-relaxed text-[#c9a85e]"
                  >
                    <CheckIcon />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section
            id="waitlist"
            className="border-t border-[#4a6b58]/60 px-6 py-14 sm:px-10 sm:py-20"
          >
            <div className="mx-auto max-w-xl">
              <h2 className="text-xl tracking-[0.1em] text-[#ffcc66] [text-shadow:0_0_12px_rgba(255,204,102,0.3)] sm:text-2xl">
                GET UPDATES
              </h2>
              <p className="mt-3 text-[0.85rem] leading-relaxed text-[#b8892e]/95 sm:text-[0.9rem]">
                We’ll email you when Genta is ready. No spam — same policy as on
                the terminal experience.
              </p>
              <LandingWaitlistForm />
            </div>
          </section>
        </main>

        <footer className="mt-auto border-t border-[#b8892e] px-6 py-8 sm:px-10">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-[0.7rem] tracking-[0.15em] text-[#b8892e]/90 sm:flex-row sm:text-xs">
            <span>© {new Date().getFullYear()} GENTA</span>
            <div className="flex gap-8">
              <Link href={LEGAL_ROUTES.privacyPolicy} className={linkMuted}>
                Privacy
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
