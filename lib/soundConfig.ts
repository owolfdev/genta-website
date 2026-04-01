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
  systemEvent: {
    src: "/audio/bot/digital-text.mp3",
    volume: 0.35,
    loop: false,
  },
} as const;
