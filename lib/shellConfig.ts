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
