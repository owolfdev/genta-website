"use client";

import Link from "next/link";
import { useState } from "react";
import { LEGAL_ROUTES } from "@/lib/legalRoutes";
import { WAITLIST_OVERLAY } from "@/lib/shellConfig";

type Props = {
  /** Hero: compact copy; default: same strings as the in-chat waitlist overlay. */
  variant?: "hero" | "default";
  /** From `/?waitlist=success` or `waitlist_error` after native form POST (no-JS). */
  urlFlash?: "success" | "email" | "privacy" | "store" | "webhook" | null;
};

const URL_FLASH_ERROR_TEXT: Record<
  Exclude<NonNullable<Props["urlFlash"]>, "success">,
  string
> = {
  email: "A valid email is required.",
  privacy: "Please confirm you agree to the Privacy Policy.",
  store: "Could not save signup. Try again later.",
  webhook: "Could not save signup. Try again later.",
};

export function LandingWaitlistForm({ variant = "default", urlFlash = null }: Props) {
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

  const emailLabel =
    variant === "hero"
      ? WAITLIST_OVERLAY.landingFormEmailLabel
      : WAITLIST_OVERLAY.emailLabel;
  const privacyBefore =
    variant === "hero"
      ? WAITLIST_OVERLAY.landingFormPrivacyBeforeLink
      : WAITLIST_OVERLAY.waitlistPrivacyBelowInputBeforeLink;
  const privacyAfter =
    variant === "hero"
      ? WAITLIST_OVERLAY.landingFormPrivacyAfterLink
      : WAITLIST_OVERLAY.waitlistPrivacyBelowInputAfterLink;
  const inputId =
    variant === "hero" ? "landing-waitlist-email-hero" : "landing-waitlist-email";

  const showUrlSuccess = urlFlash === "success";
  const urlErrorText =
    urlFlash && urlFlash !== "success" ? URL_FLASH_ERROR_TEXT[urlFlash] : null;

  return (
    <form
      action="/api/waitlist"
      method="post"
      className={
        variant === "hero" ? "mt-8 space-y-3 text-left" : "mt-5 space-y-4 text-left"
      }
      onSubmit={(e) => void onSubmit(e)}
    >
      <input type="hidden" name="privacyAccepted" value="true" />

      {showUrlSuccess ? (
        <p className="text-[0.85rem] text-[#7aab8a]" role="status">
          You’re on the list. We’ll be in touch.
        </p>
      ) : null}
      {urlErrorText ? (
        <p className="text-[0.8rem] text-[#c97a6a]" role="alert">
          {urlErrorText}
        </p>
      ) : null}

      <div>
        <label
          className="mb-2 block text-[0.875rem] leading-relaxed text-[#d4a85e] sm:text-[0.95rem]"
          htmlFor={inputId}
        >
          {emailLabel}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <input
            id={inputId}
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
            disabled={status === "submitting" || status === "success" || showUrlSuccess}
            required
            className="min-h-11 min-w-0 flex-1 border border-[#4a6b58] bg-[#0c0a06] px-3 py-2.5 text-base leading-normal text-[#ffcc66] outline-none ring-0 placeholder:text-[#b8892e]/50 focus:border-[#7aab8a] disabled:opacity-50 sm:min-h-0"
          />
          <button
            type="submit"
            disabled={status === "submitting" || status === "success" || showUrlSuccess}
            className="min-h-11 shrink-0 border border-[#4a6b58] bg-[#0c0a06] px-4 py-2.5 text-sm font-normal tracking-wide text-[#ffcc66] transition hover:border-[#7aab8a] focus-visible:border-[#7aab8a] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0 sm:self-stretch sm:px-5 sm:text-[0.85rem]"
          >
            {status === "submitting" ? "Sending…" : WAITLIST_OVERLAY.submitLabel}
          </button>
        </div>
      </div>

      <p className="text-[0.75rem] leading-relaxed text-[#b8892e]/95 sm:text-[0.8rem]">
        {privacyBefore}
        <Link
          href={LEGAL_ROUTES.privacyPolicy}
          className="text-[#7aab8a] underline decoration-[#4a6b58] underline-offset-2 transition hover:text-[#9fcbad]"
        >
          {WAITLIST_OVERLAY.privacyPolicyLinkText}
        </Link>
        {privacyAfter}
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
