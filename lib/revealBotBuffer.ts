import { activeStreamSoundKind } from "./botProtocol";

/**
 * Bot output pacing: faster than user prompt (18 cps in page.tsx).
 * Tweaked in steps; current base 32 cps, ramp to 90 cps.
 */
const BASE_CPS = 32;
const MIN_DELAY_MS = 12;

/**
 * Pacing only — not an output cap. Reveal runs until the full streamed reply is shown.
 * After this many characters are *visible*, interpolate reveal speed up to `MAX_CPS`.
 */
const RAMP_START_CHARS = 80;
const RAMP_END_CHARS = 220;
const MAX_CPS = 90;

function delayMsBeforeNextChar(visibleCount: number): number {
  const n = visibleCount;
  let cps: number;
  if (n < RAMP_START_CHARS) {
    cps = BASE_CPS;
  } else if (n >= RAMP_END_CHARS) {
    cps = MAX_CPS;
  } else {
    const t = (n - RAMP_START_CHARS) / (RAMP_END_CHARS - RAMP_START_CHARS);
    cps = BASE_CPS + (MAX_CPS - BASE_CPS) * t;
  }
  const floor = n < RAMP_START_CHARS ? MIN_DELAY_MS : 8;
  return Math.max(floor, Math.round(1000 / cps));
}

/**
 * Reveal text from a growing buffer (SSE) one character at a time.
 * Stops when the stream is done and all buffered characters have been shown.
 */
export async function revealBufferedBotText(opts: {
  getBuffer: () => string;
  isStreamDone: () => boolean;
  setVisible: (s: string) => void;
  onFirstChar?: () => void;
  /** Fires when `@system` / `@end` boundaries change the effective stream kind (for SFX). */
  onRevealSoundKind?: (kind: "bot" | "system") => void;
  onComplete?: () => void;
}): Promise<string> {
  let displayed = "";
  let firstCharHandled = false;
  let lastSoundKind: "bot" | "system" = "bot";

  while (true) {
    const buffer = opts.getBuffer();
    const done = opts.isStreamDone();

    if (done && displayed.length >= buffer.length) {
      break;
    }

    if (displayed.length < buffer.length) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, delayMsBeforeNextChar(displayed.length));
      });
      displayed = buffer.slice(0, displayed.length + 1);
      opts.setVisible(displayed);
      const kind = activeStreamSoundKind(displayed);
      if (!firstCharHandled) {
        firstCharHandled = true;
        opts.onFirstChar?.();
        lastSoundKind = kind;
        opts.onRevealSoundKind?.(kind);
      } else if (kind !== lastSoundKind) {
        lastSoundKind = kind;
        opts.onRevealSoundKind?.(kind);
      }
    } else {
      await new Promise((resolve) => window.setTimeout(resolve, 24));
    }
  }

  opts.onComplete?.();
  return opts.getBuffer();
}
