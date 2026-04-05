"use client";

import Link from "next/link";
import { useState } from "react";
import { LEGAL_ROUTES } from "@/lib/legalRoutes";
import { WAITLIST_OVERLAY } from "@/lib/shellConfig";

const inputClass =
  "w-full border border-[#4a6b58] bg-[#0c0a06] px-3 py-2.5 text-[0.95rem] text-[#ffcc66] outline-none ring-0 placeholder:text-[#b8892e]/45 focus:border-[#7aab8a] disabled:opacity-50";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyAccepted) {
      setErrorMessage("Please confirm you agree to the Privacy Policy.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setErrorMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim() || undefined,
          message: message.trim(),
          privacyAccepted: true,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      if (!res.ok) {
        setErrorMessage(data.error?.message ?? "Something went wrong.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMessage("Network error. Try again.");
      setStatus("error");
    }
  };

  const disabled = status === "submitting" || status === "success";

  return (
    <form className="mt-8 space-y-5" onSubmit={(e) => void onSubmit(e)} noValidate>
      <div>
        <label className="mb-1.5 block text-[0.75rem] text-[#b8892e]/95" htmlFor="contact-name">
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (status === "error") {
              setStatus("idle");
              setErrorMessage("");
            }
          }}
          disabled={disabled}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[0.75rem] text-[#b8892e]/95" htmlFor="contact-email">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") {
              setStatus("idle");
              setErrorMessage("");
            }
          }}
          disabled={disabled}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label
          className="mb-1.5 block text-[0.75rem] text-[#b8892e]/95"
          htmlFor="contact-company"
        >
          Company <span className="text-[#6a7a6e]">(optional)</span>
        </label>
        <input
          id="contact-company"
          name="company"
          type="text"
          autoComplete="organization"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          disabled={disabled}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[0.75rem] text-[#b8892e]/95" htmlFor="contact-message">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (status === "error") {
              setStatus("idle");
              setErrorMessage("");
            }
          }}
          disabled={disabled}
          required
          className={`${inputClass} resize-y min-h-[8rem]`}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-[0.75rem] leading-relaxed text-[#b8892e]/95 sm:text-[0.8rem]">
        <input
          type="checkbox"
          checked={privacyAccepted}
          onChange={(e) => {
            setPrivacyAccepted(e.target.checked);
            if (status === "error") {
              setStatus("idle");
              setErrorMessage("");
            }
          }}
          disabled={disabled}
          className="mt-1 h-3.5 w-3.5 shrink-0 border border-[#4a6b58] bg-[#0c0a06] accent-[#7aab8a]"
        />
        <span>
          I agree to the{" "}
          <Link
            href={LEGAL_ROUTES.privacyPolicy}
            className="text-[#7aab8a] underline decoration-[#4a6b58] underline-offset-2 transition hover:text-[#9fcbad]"
          >
            {WAITLIST_OVERLAY.privacyPolicyLinkText}
          </Link>{" "}
          for processing this message.
        </span>
      </label>

      <button
        type="submit"
        disabled={disabled}
        className="border border-[#4a6b58] bg-[#0c0a06] px-5 py-2.5 text-[0.85rem] font-normal tracking-wide text-[#ffcc66] transition hover:border-[#7aab8a] focus-visible:border-[#7aab8a] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>

      {errorMessage ? (
        <p className="text-[0.8rem] text-[#c97a6a]" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {status === "success" ? (
        <p className="text-[0.85rem] text-[#7aab8a]">Thanks — we’ll get back to you.</p>
      ) : null}
    </form>
  );
}
