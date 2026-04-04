/**
 * Terminal shell UI copy and static labels.
 * Prefer editing this file over hunting through components.
 *
 * Protocol markup in assistant replies: `@system` / `@end` (teal `# `), `@ascii-draw` / `@end`
 * (mint `<pre>` + ascii SFX) — see `lib/botProtocol.ts`.
 */
export const SHELL_UI = {
  /** Top bar title on `sm+` breakpoints (monospace header). */
  headerTitle: "GENTA // LOCAL-FIRST AI ASSISTANT",
  /** Top bar title below `sm` — short line when the full title would crowd narrow viewports. */
  headerTitleShort: "GENTA",
  /** Stops streamed / revealed assistant output and re-enables input (see home-client). */
  interruptOutputLabel: "Stop",
  interruptOutputAriaLabel: "Stop assistant output",
  /** Header link to `/privacy` (new tab). */
  privacyPolicyLinkLabel: "Privacy",
} as const;

/**
 * Stored under {@link WAITLIST_OVERLAY.sessionStorageKey} when the user dismisses the gate
 * (“Chat With Genta Assistant”). **Browser `sessionStorage`** — one tab only, cleared when the tab
 * closes (not `localStorage`). Re-open anytime via the header “Waitlist” control.
 */
export const WAITLIST_GATE_SESSION_VALUE = "dismissed" as const;

/** Marketing overlay (waitlist gate) — short copy, not full docs. */
export const WAITLIST_OVERLAY = {
  /** Waitlist backdrop tint — applied as inline `backgroundColor` on the scrim div (see WaitlistOverlay). */
  scrimBackground: "rgba(4, 3, 2, 0.7)",
  /** Header CTA when the gate is closed — reopens the same dialog. */
  headerReopenLabel: "Waitlist",
  title: "Genta",
  tagline:
    "Local-first AI assistant for desktop and mobile. Your chat, tools, and memory stay on your device by default—not on someone else’s server.",
  benefits: [
    "Private by default: run models locally; cloud optional.",
    // "Your files and notes in one place, with retrieval you can trace.",
    "Pick the stack that fits you: model-agnostic, built for real work.",
    "Off grid: use Genta offline and on your own terms.",
    "Genta is coming soon. Join the waitlist to get news and updates.",
  ],
  /** Visible label for the email field (full sentence; linked via `htmlFor`). */
  emailLabel: "Join the waitlist — we’ll email you when Genta is ready.",
  emailPlaceholder: "you@domain.com",
  submitLabel: "Join Waitlist",
  dismissLabel: "Chat With Genta Assistant",
  /** `aria-label` for the dismiss button (visible label is long). */
  dismissAriaLabel: "Continue to chat with the Genta assistant",
  /**
   * Footer below “Chat…”; `privacyPolicyLinkText` is the linked phrase (new tab).
   * Plain-language data use + implicit consent.
   */
  privacyFooterBeforeLink:
    "We only use your email for Genta news. We don’t sell it or share it with anyone for advertising. Joining waitlist or chat means you agree to our ",
  privacyPolicyLinkText: "Privacy Policy",
  privacyFooterAfterLink: ".",
  /** `sessionStorage` key; value {@link WAITLIST_GATE_SESSION_VALUE} means “don’t auto-open on load”. */
  sessionStorageKey: "genta-waitlist-overlay",
} as const;

/**
 * Inline bot directives (e.g. `@waitlist`) rendered as interactive chat controls.
 * Keep this a strict whitelist; unknown directives render as normal text.
 */
export const BOT_INLINE_DIRECTIVES = {
  waitlist: {
    label: "Waitlist",
    ariaLabel: "Open waitlist dialog",
  },
} as const;

/**
 * Fallback if the on-load ChatIQ welcome (`is_welcome` JSON) fails or is empty.
 * Your real welcome should be configured in ChatIQ; this is only a client-side backup.
 */
export const SAMPLE_ASSISTANT_BOOT_WELCOME = `@system
GENTA TERMINAL // INIT
ROM checksum ........ OK
Kernel ............... LOADED
Session .............. SECURE
Stream channel ....... READY
STATUS ............... ONLINE
@end
Session open. Enter a prompt at the > line and press Return.`;

/** Used when the on-load ChatIQ welcome request fails or returns no content. */
export const ASSISTANT_WELCOME_FALLBACK_TEXT = SAMPLE_ASSISTANT_BOOT_WELCOME;
