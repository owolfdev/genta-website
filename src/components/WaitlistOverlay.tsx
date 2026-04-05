"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { LEGAL_ROUTES } from "@/lib/legalRoutes";
import { WaitlistTaglineInline } from "@/components/WaitlistTaglineInline";
import { WAITLIST_OVERLAY } from "@/lib/shellConfig";

/**
 * Full-screen dim layer owned by the page shell so it exists on the same commit as `<main>`,
 * avoiding a dev flash where the chat paints before the waitlist subtree mounts.
 */
export function WaitlistGateScrim({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!active || !ref.current) {
      return;
    }
    ref.current.style.setProperty(
      "background-color",
      WAITLIST_OVERLAY.scrimBackground,
      "important",
    );
  }, [active]);
  if (!active) {
    return null;
  }
  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[100]"
      style={{ backgroundColor: WAITLIST_OVERLAY.scrimBackground }}
      aria-hidden
    />
  );
}

type Props = {
  /** Terminal font class from parent (Share Tech Mono) — applied to the dialog card only, not the scrim. */
  className: string;
  open: boolean;
  /** Persist dismissal + close UI (parent sets `sessionStorage` and `open` false). */
  onDismiss: () => void;
};

export function WaitlistOverlay({ className, open, onDismiss }: Props) {
  const titleId = useId();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => emailInputRef.current?.focus(), 100);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDismiss();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onDismiss]);

  const onSubmitWaitlist = async (e: React.FormEvent) => {
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

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[101] overflow-y-auto overflow-x-hidden overscroll-y-contain"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      <div className="flex min-h-full items-start justify-center py-2 pb-10 sm:items-center sm:py-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={`relative z-[1] my-2 w-full max-w-[min(26rem,calc(100vw-2rem))] max-h-[calc(100dvh-2.5rem)] overflow-y-auto overscroll-y-contain border border-[#b8892e] bg-[#080602] p-5 shadow-[0_0_40px_rgba(184,137,46,0.12),inset_0_0_0_1px_rgba(255,204,102,0.06)] [text-shadow:0_0_10px_rgba(255,204,102,0.35)] sm:my-4 sm:max-w-[min(34rem,92vw)] sm:max-h-[calc(100dvh-4rem)] sm:p-6 md:max-w-[min(40rem,90vw)] md:p-7 lg:max-w-[min(44rem,88vw)] ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            aria-hidden
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)",
            }}
          />
          <div className="relative">
          <p className="text-[0.65rem] tracking-[0.35em] text-[#7aab8a]">
            MARKETING CHANNEL
          </p>
          <h2
            id={titleId}
            className="mt-2 text-xl tracking-[0.12em] text-[#ffcc66] sm:text-2xl"
          >
            {WAITLIST_OVERLAY.title}
          </h2>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-[#e8c266]/95">
            <WaitlistTaglineInline />
          </p>
          <ul className="mt-4 list-none space-y-2 border-l-2 border-[#4a6b58] pl-3 text-[0.88rem] leading-snug text-[#c9a85e]">
            {WAITLIST_OVERLAY.benefits.map((item) => (
              <li key={item.headline}>
                <span className="text-[#7aab8a]"># </span>
                <span className="text-[#e8c266]">{item.headline}</span>
                <span className="text-[#c9a85e]"> — {item.supporting}</span>
              </li>
            ))}
          </ul>

          <form
            className="mt-6 space-y-3 border-t border-[#4a6b58]/50 pt-4 sm:mt-6 sm:pt-5"
            onSubmit={(e) => void onSubmitWaitlist(e)}
          >
            <label
              className="mb-0.5 block text-[0.75rem] leading-relaxed text-[#b8892e]/95 sm:text-[0.8rem]"
              htmlFor="waitlist-email"
            >
              {WAITLIST_OVERLAY.emailLabel}
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <input
                ref={emailInputRef}
                id="waitlist-email"
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
                className="min-w-0 flex-1 border border-[#4a6b58] bg-[#0c0a06] px-3 py-2.5 text-[0.95rem] text-[#ffcc66] outline-none ring-0 placeholder:text-[#b8892e]/45 focus:border-[#7aab8a] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "submitting" || status === "success"}
                className="shrink-0 border border-[#4a6b58] bg-[#0c0a06] px-4 py-2.5 text-[0.85rem] font-normal tracking-wide text-[#ffcc66] transition hover:border-[#7aab8a] focus-visible:border-[#7aab8a] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 sm:self-stretch sm:px-5"
              >
                {status === "submitting" ? "Sending…" : WAITLIST_OVERLAY.submitLabel}
              </button>
            </div>

            <p className="block text-[0.75rem] leading-relaxed text-[#b8892e]/95 sm:text-[0.8rem]">
              {WAITLIST_OVERLAY.waitlistPrivacyBelowInputBeforeLink}
              <Link
                href={LEGAL_ROUTES.privacyPolicy}
                target="_blank"
                rel="noopener noreferrer"
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

          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              onClick={onDismiss}
              aria-label={WAITLIST_OVERLAY.dismissAriaLabel}
              className="w-full border border-[#b8892e] bg-[#b8892e]/10 py-2.5 text-xs font-normal uppercase tracking-[0.2em] text-[#ffcc66] transition hover:bg-[#b8892e]/20"
            >
              {WAITLIST_OVERLAY.dismissLabel}
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
