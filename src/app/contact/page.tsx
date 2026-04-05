import type { Metadata } from "next";
import Link from "next/link";
import { Share_Tech_Mono } from "next/font/google";
import { ContactForm } from "@/components/ContactForm";
import { LEGAL_ROUTES } from "@/lib/legalRoutes";
import { CHAT_ROUTE } from "@/lib/routes";

const terminalFont = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
});

const linkClass =
  "text-[#7aab8a] underline decoration-[#4a6b58] underline-offset-4 transition hover:text-[#9fcbad]";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a message to the Genta team — trygenta.com.",
};

export default function ContactPage() {
  return (
    <div
      className={`${terminalFont.className} relative min-h-dvh overflow-x-hidden bg-[#080602] text-[#ffcc66]`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_50%_45%,transparent_40%,rgba(0,0,0,0.55)_100%),radial-gradient(ellipse_100%_60%_at_50%_50%,rgba(255,190,90,0.06),transparent_55%)]" />
      <div className="scanlines pointer-events-none absolute inset-0 opacity-20" />

      <div className="relative z-10 mx-auto max-w-xl px-6 py-8 pb-20 sm:px-10 sm:py-10">
        <header className="mb-8 border-b border-[#b8892e] pb-4 text-xs tracking-[0.25em] text-[#b8892e] sm:text-sm">
          <p className="text-[0.65rem] tracking-[0.35em] text-[#7aab8a]">GENTA // CONTACT</p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl tracking-[0.12em] text-[#ffcc66] [text-shadow:0_0_12px_rgba(255,204,102,0.35)] sm:text-2xl">
                Contact
              </h1>
              <p className="mt-2 text-[0.85rem] leading-relaxed text-[#e8c266]/90">
                Questions, press, or partnerships — send a note and we’ll reply by email.
              </p>
            </div>
            <Link
              href="/"
              className={`shrink-0 self-start text-[0.65rem] tracking-[0.2em] sm:text-xs ${linkClass}`}
            >
              ← Back to Genta
            </Link>
          </div>
        </header>

        <ContactForm />

        <footer className="mt-14 border-t border-[#4a6b58]/50 pt-6 text-[0.7rem] tracking-[0.15em] text-[#b8892e]/90 sm:text-xs">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href={LEGAL_ROUTES.privacyPolicy} className={linkClass}>
              Privacy
            </Link>
            <Link href={CHAT_ROUTE} className={linkClass}>
              Terminal chat
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
