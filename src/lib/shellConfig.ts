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
  /** Stops streamed / revealed assistant output and re-enables input (see `app/chat/chat-client.tsx`). */
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
    "Local-first AI assistant for desktop and mobile. Your chat, tools, and memory stay on your device by default. Genta is coming soon. Join the waitlist to get news and updates.",
  /** Landing page — heading above the benefit cards (middle section). */
  featuresSectionTitle: "Why Genta",
  benefits: [
    "Private by default: run models locally; cloud optional.",
    // "Your files and notes in one place, with retrieval you can trace.",
    "Pick the stack that fits you: model-agnostic, built for real work.",
    "Off grid: use Genta offline and on your own terms.",
    "Genta is coming soon. Join the waitlist to get news and updates.",
  ],
  /** `<label htmlFor="waitlist-email">` — no link; privacy line sits below the input row. */
  emailLabel:
    "Enter your email address — we’ll contact you when Genta is ready.",
  /** Below email + Join; before `privacyPolicyLinkText` (new tab). */
  waitlistPrivacyBelowInputBeforeLink:
    "We only use your email for Genta news. We don’t sell it or share it with anyone for advertising. Joining waitlist or chat means you agree to our ",
  privacyPolicyLinkText: "Privacy Policy",
  waitlistPrivacyBelowInputAfterLink: ".",
  emailPlaceholder: "you@domain.com",
  submitLabel: "Join Waitlist",
  dismissLabel: "Chat With Genta Assistant",
  /** Primary CTA on the marketing landing page (see `CHAT_ROUTE` in `lib/routes.ts`). */
  landingChatCtaLabel: "Open terminal chat",
  /** `aria-label` for the dismiss button (visible label is long). */
  dismissAriaLabel: "Continue to chat with the Genta assistant",
  /** `sessionStorage` key; value {@link WAITLIST_GATE_SESSION_VALUE} means “don’t auto-open on load”. */
  sessionStorageKey: "genta-waitlist-overlay",
} as const;

/**
 * Landing hero — “mothership” sequencer countdown (see `MothershipCountdown.tsx`).
 *
 * **`enabled`:** keep `false` until you are willing to stand behind `targetIso` publicly (missed
 * deadlines read as vapor). Set to `true` to show the widget; copy and dates stay wired below.
 */
export const LAUNCH_COUNTDOWN = {
  enabled: false,
  /** ISO 8601 instant (UTC recommended), e.g. `2026-07-04T00:00:00.000Z`. */
  targetIso: "2026-07-04T00:00:00.000Z",
  statusLine: "SEQUENCE // PRIMARY BURN WINDOW",
  subLine: "T-MINUS — NOMINAL",
  completeLine: "SEQUENCE COMPLETE // STANDBY FOR HANDSHAKE",
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
