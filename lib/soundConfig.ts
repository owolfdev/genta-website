export const SHELL_SOUNDS = {
  /** Looped while waiting for the model (before first streamed token). */
  botThinking: {
    src: "/audio/bot/cyber.mp3",
    volume: 0.26,
    loop: true,
  },
  /** Looped while assistant text is streaming in. */
  botTyping: {
    src: "/audio/bot/chitchit1.mp3",
    volume: 0.65,
    loop: true,
  },
  /** Looped while `@system`… protocol segments stream in (distinct from main bot typing). */
  systemStreamTyping: {
    src: "/audio/system/hacking.mp3",
    volume: 0.32,
    loop: true,
  },
  /** Looped while a short user prompt is typed into the transcript. */
  userPromptTyping: {
    src: "/audio/usr/binary.mp3",
    volume: 0.4,
    loop: true,
  },
} as const;
