import type { Metadata } from "next";
import Link from "next/link";
import { Share_Tech_Mono } from "next/font/google";

const terminalFont = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
});

const SITE_URL = "https://trygenta.com";
const CONTACT_EMAIL = "hello@trygenta.com";
const CONTACT_LOCATION = "Bangkok, Thailand";
/** Trading / product name; used as data-controller identification on this Site. */
const LEGAL_ENTITY_LABEL = "Genta";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Genta collects, uses, and protects personal data on trygenta.com — waitlist, on-site chat, and related services.",
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

        <section className={sectionClass}>
          <h2 className={h2Class}>Who we are</h2>
          <p>
            This policy describes how{" "}
            <strong className="text-[#ffcc66]">{LEGAL_ENTITY_LABEL}</strong>{" "}
            (“we”, “us”) handles personal data when you use our marketing
            website at{" "}
            <a
              href={SITE_URL}
              className={linkClass}
              target="_blank"
              rel="noopener noreferrer"
            >
              trygenta.com
            </a>{" "}
            and related pages (together, the “Site”). {LEGAL_ENTITY_LABEL} is
            a local-first AI assistant product. The Site is used for information
            about the product, interactive demos, and waitlist signups. It is
            separate from any downloadable or desktop version you may install
            separately.
          </p>
          <p>
            For applicable data protection laws,{" "}
            <strong className="text-[#ffcc66]">{LEGAL_ENTITY_LABEL}</strong>,
            based in {CONTACT_LOCATION}, is the controller of personal data
            collected through the Site as described here. Use the contact
            details in the <strong className="text-[#ffcc66]">Contact</strong>{" "}
            section below for privacy requests and questions about this policy.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>What we collect on this Site</h2>
          <ul className="list-none space-y-3 border-l-2 border-[#4a6b58] pl-4 text-[#c9a85e]">
            <li>
              <span className="text-[#7aab8a]"># </span>
              <strong className="text-[#e8c266]">Waitlist:</strong> If you join
              the waitlist, we collect the email address you provide, a
              timestamp, and (where our systems record it) which version of
              this policy applied at signup. We use this to contact you about
              Genta and related product news until you withdraw consent, ask us
              to delete your data, or we no longer need it for that purpose.
            </li>
            <li>
              <span className="text-[#7aab8a]"># </span>
              <strong className="text-[#e8c266]">On-site assistant:</strong> If
              you use the chat experience on the Site, your messages are sent
              to our configured AI provider to generate replies. Do not paste
              passwords, financial or health information, or other highly
              sensitive data into the chat. How long content is kept depends on
              that provider’s terms and our configuration (for example ChatIQ or
              an equivalent service).
            </li>
            <li>
              <span className="text-[#7aab8a]"># </span>
              <strong className="text-[#e8c266]">Technical data:</strong> Our
              hosting and infrastructure providers may process IP address,
              browser type, and similar technical data for security, fraud
              prevention, and reliability. The Site is intended to use only
              cookies and similar storage needed for basic operation (such as
              session state for the current browser tab).
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>Legal bases (EEA / UK)</h2>
          <p>
            If you are in the European Economic Area, the UK, or another region
            with similar laws, we process personal data on the following bases
            where they apply:{" "}
            <strong className="text-[#ffcc66]">consent</strong> for waitlist
            email and similar voluntary signups;{" "}
            <strong className="text-[#ffcc66]">legitimate interests</strong> in
            securing and improving the Site; and{" "}
            <strong className="text-[#ffcc66]">contract</strong> where
            processing is necessary to provide a service you have asked for.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>Cookies</h2>
          <p>
            We do not use advertising or cross-site tracking cookies on this
            Site as of the effective date above. We may use strictly necessary
            storage (for example so the Site can remember UI choices for your
            current session or tab). If we introduce optional analytics or
            similar tools that are not essential, we will update this policy and,
            where required, ask for your consent before they run.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>Retention</h2>
          <p>
            We keep waitlist data only as long as needed to stay in touch about
            Genta, unless you ask us to delete it earlier or the law requires a
            different period. Content processed through the on-site assistant is
            retained according to our AI provider’s settings and our agreements
            with them.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>Your rights</h2>
          <p>
            Depending on where you live, you may have the right to access,
            correct, or delete your personal data; to restrict or object to
            certain processing; to withdraw consent where processing is based on
            consent; and to lodge a complaint with a data protection authority.
            To exercise these rights or ask a question about this policy,
            contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>International transfers</h2>
          <p>
            We and our service providers may process data in the United States
            and other countries. Where the law requires safeguards for
            international transfers (for example Standard Contractual Clauses), we
            use appropriate measures offered by our vendors or under applicable
            law.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>Children</h2>
          <p>
            The Site is not directed at children, and we do not knowingly collect
            personal data from anyone under the age where parental consent is
            required in their jurisdiction.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>Changes</h2>
          <p>
            We may update this policy from time to time. When we make material
            changes, we will post the revised policy on this Site and adjust the
            effective date. Where appropriate, we may also notify waitlist
            subscribers by email. Continued use of the Site after changes become
            effective constitutes acceptance of the updated policy, except where
            the law requires a different approach.
          </p>
        </section>

        <section
          className={`${sectionClass} border-t border-[#4a6b58]/50 pt-10`}
        >
          <h2 className={h2Class}>Contact</h2>
          <p>
            <strong className="text-[#ffcc66]">{LEGAL_ENTITY_LABEL}</strong> is
            the legal entity responsible for personal data collected through
            this Site. For privacy requests (including access, correction,
            deletion, or withdrawal of consent where applicable), or any question
            about how we process personal data, contact us using:
          </p>
          <ul className="list-none space-y-2 border-l-2 border-[#4a6b58] pl-4 text-[#c9a85e]">
            <li>
              <span className="text-[#7aab8a]"># </span>
              <strong className="text-[#e8c266]">{LEGAL_ENTITY_LABEL}</strong>{" "}
              (data controller for this Site)
            </li>
            <li>
              <span className="text-[#7aab8a]"># </span>
              {CONTACT_LOCATION}
            </li>
            <li>
              <span className="text-[#7aab8a]"># </span>
              <a
                href={SITE_URL}
                className={linkClass}
                target="_blank"
                rel="noopener noreferrer"
              >
                trygenta.com
              </a>
            </li>
            <li>
              <span className="text-[#7aab8a]"># </span>
              <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
                {CONTACT_EMAIL}
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
