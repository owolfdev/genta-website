"use client";

import Link from "next/link";
import { useState } from "react";
import { LEGAL_ROUTES } from "@/lib/legalRoutes";
import { WAITLIST_OVERLAY } from "@/lib/shellConfig";

export function LandingWaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage("Enter your email.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setErrorMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, privacyAccepted: true }),
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

  return (
    <form
      className="mt-5 space-y-4"
      onSubmit={(e) => void onSubmit(e)}
      noValidate
    >
      <div>
        <label
          className="mb-2 block text-[0.875rem] leading-relaxed text-[#d4a85e] sm:text-[0.95rem]"
          htmlFor="landing-waitlist-email"
        >
          {WAITLIST_OVERLAY.emailLabel}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <input
            id="landing-waitlist-email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder={WAITLIST_OVERLAY.emailPlaceholder}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") {
                setStatus("idle");
                setErrorMessage("");
              }
            }}
            disabled={status === "submitting" || status === "success"}
            className="min-h-11 min-w-0 flex-1 border border-[#4a6b58] bg-[#0c0a06] px-3 py-2.5 text-base leading-normal text-[#ffcc66] outline-none ring-0 placeholder:text-[#b8892e]/50 focus:border-[#7aab8a] disabled:opacity-50 sm:min-h-0"
          />
          <button
            type="submit"
            disabled={status === "submitting" || status === "success"}
            className="min-h-11 shrink-0 border border-[#4a6b58] bg-[#0c0a06] px-4 py-2.5 text-sm font-normal tracking-wide text-[#ffcc66] transition hover:border-[#7aab8a] focus-visible:border-[#7aab8a] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0 sm:self-stretch sm:px-5 sm:text-[0.85rem]"
          >
            {status === "submitting" ? "Sending…" : WAITLIST_OVERLAY.submitLabel}
          </button>
        </div>
      </div>

      <p className="text-[0.75rem] leading-relaxed text-[#b8892e]/95 sm:text-[0.8rem]">
        {WAITLIST_OVERLAY.waitlistPrivacyBelowInputBeforeLink}
        <Link
          href={LEGAL_ROUTES.privacyPolicy}
          className="text-[#7aab8a] underline decoration-[#4a6b58] underline-offset-2 transition hover:text-[#9fcbad]"
        >
          {WAITLIST_OVERLAY.privacyPolicyLinkText}
        </Link>
        {WAITLIST_OVERLAY.waitlistPrivacyBelowInputAfterLink}
      </p>

      {errorMessage ? (
        <p className="text-[0.8rem] text-[#c97a6a]" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {status === "success" ? (
        <p className="text-[0.85rem] text-[#7aab8a]">
          You’re on the list. We’ll be in touch.
        </p>
      ) : null}
    </form>
  );
}
