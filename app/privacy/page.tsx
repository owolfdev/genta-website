import type { Metadata } from "next";
import Link from "next/link";
import { Share_Tech_Mono } from "next/font/google";

const terminalFont = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Privacy Policy | Genta",
  description:
    "How Genta (genta-website) collects, uses, and protects personal data for the marketing site and waitlist.",
};

const linkClass =
  "text-[#7aab8a] underline decoration-[#4a6b58] underline-offset-4 transition hover:text-[#9fcbad]";

const sectionClass =
  "mt-10 space-y-4 text-[0.95rem] leading-relaxed text-[#e8c266]/95";
const h2Class =
  "text-lg font-normal tracking-wide text-[#ffcc66] [text-shadow:0_0_10px_rgba(255,204,102,0.25)]";

export default function PrivacyPolicyPage() {
  return (
    <div
      className={`${terminalFont.className} relative min-h-dvh overflow-x-hidden bg-[#080602] text-[#ffcc66]`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_50%_45%,transparent_40%,rgba(0,0,0,0.55)_100%),radial-gradient(ellipse_100%_60%_at_50%_50%,rgba(255,190,90,0.06),transparent_55%)]" />
      <div className="scanlines pointer-events-none absolute inset-0 opacity-20" />

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-8 pb-20 sm:px-10 sm:py-10">
        <header className="mb-8 border-b border-[#b8892e] pb-4 text-xs tracking-[0.25em] text-[#b8892e] sm:text-sm">
          <p className="text-[0.65rem] tracking-[0.35em] text-[#7aab8a]">
            LEGAL // PRIVACY
          </p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-xl tracking-[0.12em] text-[#ffcc66] [text-shadow:0_0_12px_rgba(255,204,102,0.35)] sm:text-2xl">
                Privacy Policy
              </h1>
              <p className="mt-2 text-[0.7rem] tracking-[0.2em] text-[#6a8a72] sm:text-xs">
                Effective date: April 5, 2026
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

        {/* <p className="rounded border border-[#b8892e]/60 bg-[#0c0a06] px-3 py-3 text-[0.8rem] leading-snug text-[#c9a85e] text-shadow-none">
          <span className="text-[#ffcc66]"># </span>
          <strong className="font-normal text-[#e8c266]">
            Not legal advice.
          </strong>{" "}
          This page is a practical template aligned with how this marketing site
          works today. Have it reviewed by qualified counsel for every
          jurisdiction where you market or store data, and update it when your
          product or vendors change.
        </p> */}

        <section className={sectionClass}>
          <h2 className={h2Class}>Who we are</h2>
          <p>
            This policy describes the marketing website at this domain (the
            “Site”) operated in connection with{" "}
            <strong className="text-[#ffcc66]">Genta</strong>, a local-first AI
            assistant product. The Site is separate from any desktop application
            build; it is used for information, demos, and waitlist signups.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>What we collect on this Site</h2>
          <ul className="list-none space-y-3 border-l-2 border-[#4a6b58] pl-4 text-[#c9a85e]">
            <li>
              <span className="text-[#7aab8a]"># </span>
              <strong className="text-[#e8c266]">Waitlist:</strong> If you join
              the waiting list, we collect the email address you submit and a
              timestamp (and, where configured, a reference to which version of
              this policy you saw). We use this to contact you about Genta and
              related product news, unless you withdraw consent or we delete
              your data as described below.
            </li>
            <li>
              <span className="text-[#7aab8a]"># </span>
              <strong className="text-[#e8c266]">Chat experience:</strong> If
              you use the on-site assistant, your messages may be processed by
              our configured AI provider to generate replies. Do not paste
              secrets, health data, or other special-category data into the
              chat. Retention and subprocessors depend on that provider’s
              terms—review their documentation and your ChatIQ (or equivalent)
              settings.
            </li>
            <li>
              <span className="text-[#7aab8a]"># </span>
              <strong className="text-[#e8c266]">Technical data:</strong> Like
              most sites, hosting and infrastructure may log IP address, user
              agent, and similar metadata for security and reliability. Use
              essential cookies only unless you later add analytics with
              consent.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>Legal bases (EEA / UK style)</h2>
          <p>
            Where GDPR-style laws apply, we rely on{" "}
            <strong className="text-[#ffcc66]">consent</strong> for waitlist
            email and optional marketing contact, and on{" "}
            <strong className="text-[#ffcc66]">legitimate interests</strong> or{" "}
            <strong className="text-[#ffcc66]">contract</strong> where
            applicable for security logs and operating the Site—adjusted to
            match your actual setup after legal review.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>Cookies</h2>
          <p>
            This Site aims to use only cookies and storage needed for the
            session and core functionality (for example, remembering that you
            closed the waitlist gate for the current browser tab). If you add
            analytics or ads, you must disclose them, obtain consent where
            required, and update this policy.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>Retention</h2>
          <p>
            Waitlist data is kept until you ask us to delete it, you
            unsubscribe, or we no longer need it for the purpose
            collected—subject to legal retention obligations. Chat logs, if
            stored by a vendor, follow that vendor’s retention settings.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>Your rights</h2>
          <p>
            Depending on where you live, you may have rights to access, correct,
            delete, or restrict processing of your personal data, to withdraw
            consent, and to complain to a supervisory authority. Contact us
            using the details you publish for Genta support or legal inquiries.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>International transfers</h2>
          <p>
            Providers (e.g. hosting, database, AI API) may process data in
            countries other than your own. Use appropriate safeguards (such as
            Standard Contractual Clauses) where required and describe them here
            after review.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>Children</h2>
          <p>
            The Site is not directed at children under the age where parental
            consent is required.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>Changes</h2>
          <p>
            We may update this policy from time to time. Material changes should
            be communicated (for example by email to the waitlist or a notice on
            the Site). Bump the policy version in your deployment configuration
            when you do.
          </p>
        </section>

        <section
          className={`${sectionClass} border-t border-[#4a6b58]/50 pt-10`}
        >
          <h2 className={h2Class}>Contact</h2>
          <p>
            Replace this paragraph with your legal entity name, address, and a
            contact email for privacy requests.
          </p>
        </section>
      </div>
    </div>
  );
}
