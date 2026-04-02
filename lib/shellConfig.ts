/**
 * Terminal shell UI copy and static labels.
 * Prefer editing this file over hunting through components.
 *
 * Protocol markup in assistant replies: `@system` / `@end` (teal `# `), `@ascii-draw` / `@end`
 * (mint `<pre>` + ascii SFX) — see `lib/botProtocol.ts`.
 */
export const SHELL_UI = {
  /** Top bar title (monospace header). */
  headerTitle: "GENTA // LOCAL-FIRST MODEL-AGNOSTIC LLM TOOLING // STREAMING",
} as const;

/** Marketing overlay (waitlist gate) — short copy, not full docs. */
export const WAITLIST_OVERLAY = {
  /** Waitlist backdrop tint — applied as inline `backgroundColor` on the scrim div (see WaitlistOverlay). */
  scrimBackground: "rgba(4, 3, 2, 0.7)",
  title: "Genta",
  tagline:
    "Local-first AI assistant for desktop and mobile. Your chat, tools, and memory stay on your device by default—not on someone else’s server.",
  benefits: [
    "Private by default: run models locally; cloud stays optional.",
    "Your files and notes in one place, with retrieval you can trace.",
    "Pick the stack that fits you—model-agnostic, built for real work.",
  ],
  emailLabel: "Email",
  emailPlaceholder: "you@domain.com",
  submitLabel: "Join the waiting list",
  dismissLabel: "Chat With Genta Assistant",
  sessionStorageKey: "genta-waitlist-overlay",
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
