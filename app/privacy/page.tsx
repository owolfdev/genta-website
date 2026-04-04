import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Genta",
  description:
    "How Genta (genta-website) collects, uses, and protects personal data for the marketing site and waitlist.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-full bg-[#f7f4ee] text-[#1a1814]">
      <div className="mx-auto max-w-2xl px-5 py-10 pb-16 sm:px-6 sm:py-14">
        <p className="mb-6 rounded border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-[0.8rem] leading-snug text-amber-950/90">
          <strong className="font-semibold">Not legal advice.</strong> This page is a practical
          template aligned with how this marketing site works today. Have it reviewed by qualified
          counsel for every jurisdiction where you market or store data, and update it when your
          product or vendors change.
        </p>

        <p className="mb-8 text-sm text-neutral-600">
          <Link
            href="/"
            className="text-amber-900/90 underline decoration-amber-700/40 underline-offset-2 hover:decoration-amber-800"
          >
            ← Back to Genta
          </Link>
        </p>

        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-neutral-600">Effective date: April 5, 2026</p>

        <section className="mt-10 space-y-4 text-[0.95rem] leading-relaxed text-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900">Who we are</h2>
          <p>
            This policy describes the marketing website at this domain (the “Site”) operated in
            connection with <strong>Genta</strong>, a local-first AI assistant product. The Site is
            separate from any desktop application build; it is used for information, demos, and
            waitlist signups.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-[0.95rem] leading-relaxed text-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900">What we collect on this Site</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Waitlist:</strong> If you join the waiting list, we collect the email address
              you submit and a timestamp (and, where configured, a reference to which version of
              this policy you saw). We use this to contact you about Genta and related product news,
              unless you withdraw consent or we delete your data as described below.
            </li>
            <li>
              <strong>Chat experience:</strong> If you use the on-site assistant, your messages may
              be processed by our configured AI provider to generate replies. Do not paste secrets,
              health data, or other special-category data into the chat. Retention and subprocessors
              depend on that provider’s terms—review their documentation and your ChatIQ (or
              equivalent) settings.
            </li>
            <li>
              <strong>Technical data:</strong> Like most sites, hosting and infrastructure may log
              IP address, user agent, and similar metadata for security and reliability. Use
              essential cookies only unless you later add analytics with consent.
            </li>
          </ul>
        </section>

        <section className="mt-10 space-y-4 text-[0.95rem] leading-relaxed text-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900">Legal bases (EEA / UK style)</h2>
          <p>
            Where GDPR-style laws apply, we rely on <strong>consent</strong> for waitlist email and
            optional marketing contact, and on <strong>legitimate interests</strong> or{" "}
            <strong>contract</strong> where applicable for security logs and operating the Site—
            adjusted to match your actual setup after legal review.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-[0.95rem] leading-relaxed text-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900">Cookies</h2>
          <p>
            This Site aims to use only cookies and storage needed for the session and core
            functionality (for example, remembering that you closed the waitlist gate for the
            current browser tab). If you add analytics or ads, you must disclose them, obtain consent
            where required, and update this policy.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-[0.95rem] leading-relaxed text-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900">Retention</h2>
          <p>
            Waitlist data is kept until you ask us to delete it, you unsubscribe, or we no longer
            need it for the purpose collected—subject to legal retention obligations. Chat logs, if
            stored by a vendor, follow that vendor’s retention settings.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-[0.95rem] leading-relaxed text-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900">Your rights</h2>
          <p>
            Depending on where you live, you may have rights to access, correct, delete, or
            restrict processing of your personal data, to withdraw consent, and to complain to a
            supervisory authority. Contact us using the details you publish for Genta support or
            legal inquiries.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-[0.95rem] leading-relaxed text-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900">International transfers</h2>
          <p>
            Providers (e.g. hosting, database, AI API) may process data in countries other than
            your own. Use appropriate safeguards (such as Standard Contractual Clauses) where
            required and describe them here after review.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-[0.95rem] leading-relaxed text-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900">Children</h2>
          <p>The Site is not directed at children under the age where parental consent is required.</p>
        </section>

        <section className="mt-10 space-y-4 text-[0.95rem] leading-relaxed text-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900">Changes</h2>
          <p>
            We may update this policy from time to time. Material changes should be communicated
            (for example by email to the waitlist or a notice on the Site). Bump the policy version
            in your deployment configuration when you do.
          </p>
        </section>

        <section className="mt-10 space-y-4 text-[0.95rem] leading-relaxed text-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900">Contact</h2>
          <p>
            Replace this paragraph with your legal entity name, address, and a contact email for
            privacy requests.
          </p>
        </section>
      </div>
    </div>
  );
}
