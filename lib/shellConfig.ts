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
  /** Persistent footer link to the privacy policy. */
  privacyPolicyLinkLabel: "Privacy",
} as const;

/**
 * Stored under {@link WAITLIST_OVERLAY.sessionStorageKey} when the user dismisses the gate
 * (“Chat With Genta Assistant”). **Browser `sessionStorage`** — one tab only, cleared when the tab
 * closes (not `localStorage`). Re-open anytime via the header “Join Waiting List” control.
 */
export const WAITLIST_GATE_SESSION_VALUE = "dismissed" as const;

/** Marketing overlay (waitlist gate) — short copy, not full docs. */
export const WAITLIST_OVERLAY = {
  /** Waitlist backdrop tint — applied as inline `backgroundColor` on the scrim div (see WaitlistOverlay). */
  scrimBackground: "rgba(4, 3, 2, 0.7)",
  /** Header CTA when the gate is closed — reopens the same dialog. */
  headerReopenLabel: "Join Waiting List",
  title: "Genta",
  tagline:
    "Local-first AI assistant for desktop and mobile. Your chat, tools, and memory stay on your device by default—not on someone else’s server.",
  benefits: [
    "Private by default: run models locally; cloud optional.",
    // "Your files and notes in one place, with retrieval you can trace.",
    "Pick the stack that fits you: model-agnostic, built for real work.",
    "Off grid: use Genta offline and on your own terms.",
  ],
  emailLabel: "Email",
  emailPlaceholder: "you@domain.com",
  submitLabel: "Join the waiting list",
  dismissLabel: "Chat With Genta Assistant",
  /**
   * Shown above the email field. The UI appends a “Privacy Policy” link (new tab) after this sentence.
   * Keep factual; have counsel review for your jurisdictions.
   */
  privacyNoticeBeforeLink:
    "We’ll use your email only to contact you about Genta and related product news. For how we process personal data and your rights, see our",
  privacyPolicyLinkText: "Privacy Policy",
  /** Visually hidden suffix after the link (e.g. closing sentence). */
  privacyNoticeAfterLink: ".",
  /** Checkbox label; the notice above includes the policy link. */
  privacyConsentLabel: "I agree to the Privacy Policy and want to join the waiting list.",
  privacyConsentError: "Please confirm you agree to the Privacy Policy to continue.",
  /** `sessionStorage` key; value {@link WAITLIST_GATE_SESSION_VALUE} means “don’t auto-open on load”. */
  sessionStorageKey: "genta-waitlist-overlay",
} as const;

/**
 * Inline bot directives (e.g. `@waitlist`) rendered as interactive chat controls.
 * Keep this a strict whitelist; unknown directives render as normal text.
 */
export const BOT_INLINE_DIRECTIVES = {
  waitlist: {
    label: "Join Waiting List",
    ariaLabel: "Open join waiting list dialog",
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
