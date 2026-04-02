"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { WAITLIST_OVERLAY } from "@/lib/shellConfig";

const SESSION_VALUE = "dismissed";

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
  /** When the gate is open, parent should set `inert` on the chat shell so focus cannot escape underneath. */
  onBlockingChange?: (blocked: boolean) => void;
};

export function WaitlistOverlay({ className, onBlockingChange }: Props) {
  const titleId = useId();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(true);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    try {
      if (
        sessionStorage.getItem(WAITLIST_OVERLAY.sessionStorageKey) ===
        SESSION_VALUE
      ) {
        // One-time hydrate from sessionStorage; server cannot read this key.
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional gate restore
        setOpen(false);
      }
    } catch {
      /* private mode */
    }
  }, []);

  useLayoutEffect(() => {
    onBlockingChange?.(open);
  }, [open, onBlockingChange]);

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

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(WAITLIST_OVERLAY.sessionStorageKey, SESSION_VALUE);
    } catch {
      /* private mode */
    }
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismiss();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

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
        body: JSON.stringify({ email: trimmed }),
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
    <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`pointer-events-auto relative z-[1] w-full max-w-[26rem] border border-[#b8892e] bg-[#080602] p-6 shadow-[0_0_40px_rgba(184,137,46,0.12),inset_0_0_0_1px_rgba(255,204,102,0.06)] [text-shadow:0_0_10px_rgba(255,204,102,0.35)] sm:p-7 ${className}`}
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
            {WAITLIST_OVERLAY.tagline}
          </p>
          <ul className="mt-4 list-none space-y-2 border-l-2 border-[#4a6b58] pl-3 text-[0.88rem] leading-snug text-[#c9a85e]">
            {WAITLIST_OVERLAY.benefits.map((line) => (
              <li key={line}>
                <span className="text-[#7aab8a]"># </span>
                {line}
              </li>
            ))}
          </ul>

          <form
            className="mt-6 space-y-3"
            onSubmit={(e) => void onSubmitWaitlist(e)}
          >
            <label
              className="block text-[0.7rem] tracking-wider text-[#b8892e]"
              htmlFor="waitlist-email"
            >
              {WAITLIST_OVERLAY.emailLabel}
            </label>
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
              disabled={status === "submitting"}
              className="w-full border border-[#4a6b58] bg-[#0c0a06] px-3 py-2.5 text-[0.95rem] text-[#ffcc66] outline-none ring-0 placeholder:text-[#b8892e]/45 focus:border-[#7aab8a] disabled:opacity-50"
            />
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
            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full border border-[#b8892e] bg-[#b8892e]/10 py-2.5 text-xs font-normal uppercase tracking-[0.2em] text-[#ffcc66] transition hover:bg-[#b8892e]/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === "submitting"
                ? "Sending…"
                : WAITLIST_OVERLAY.submitLabel}
            </button>
          </form>

          <button
            type="button"
            onClick={dismiss}
            className="mt-4 w-full border-0 bg-transparent py-2 text-center text-[0.8rem] tracking-wide text-[#7aab8a] underline decoration-[#4a6b58] underline-offset-4 transition hover:text-[#9fcbad]"
          >
            {WAITLIST_OVERLAY.dismissLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
