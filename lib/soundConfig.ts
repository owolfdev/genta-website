export const SHELL_SOUNDS = {
  ambient: {
    src: "/audio/sfx-bed.mp3",
    volume: 0,
    loop: true,
  },
  botTyping: {
    src: "/audio/bot/chitchit1.mp3",
    volume: 0.65,
    loop: true,
  },
  /** Looped while a short user prompt is typed into the transcript. */
  userPromptTyping: {
    src: "/audio/usr/binary.mp3",
    volume: 0.4,
    loop: true,
  },
} as const;
