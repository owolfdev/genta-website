/**
 * Header sound toggle persistence (`localStorage`, not `sessionStorage`).
 * - Missing key → default **off** (first visit).
 * - `"1"` / `"0"` → user explicitly chose on/off (survives tab close and new tabs on same origin).
 */
export const SOUND_ENABLED_STORAGE_KEY = "genta-shell-sound-enabled";

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
  /** Looped while `@ascii-draw`… body streams in (Remotion: AUDIO_ASSETS.asciiDraw). */
  asciiStreamTyping: {
    src: "/audio/system/ascii-draw-hi.mp3",
    volume: 0.42,
    loop: true,
  },
  /** One-shot when an `@ascii-draw` block ends (Remotion: AUDIO_ASSETS.asciiDone). */
  asciiDrawDone: {
    src: "/audio/bot/beepboop2.mp3",
    volume: 0.4,
    loop: false,
  },
  /** Looped while a short user prompt is typed into the transcript. */
  userPromptTyping: {
    src: "/audio/usr/binary.mp3",
    volume: 0.4,
    loop: true,
  },
} as const;
