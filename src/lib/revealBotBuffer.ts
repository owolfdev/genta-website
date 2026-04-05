import { matchClearDirectiveAt, matchPauseDirectiveAt } from "./botDirectives";
import { activeStreamSoundKind, type StreamSoundKind } from "./botProtocol";

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

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const onAbort = () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const t = window.setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort);
  });
}

export type RevealAbortFinal = "buffer" | "visible";

/**
 * Reveal text from a growing buffer (SSE) one character at a time.
 * Stops when the stream is done and all buffered characters have been shown.
 * Pass `signal` to let the user interrupt; use `abortFinal` to choose whether the
 * returned text is the full buffer (`buffer`) or the revealed transcript (`visible`, excluding
 * `@pause` / `@clear` token characters — same string passed to `setVisible`). On successful
 * completion, `visible` is returned when `abortFinal` is `visible` so stored welcome text
 * matches the typing animation.
 *
 * `@clear` — consumed in the buffer; clears the on-screen visible substring so content after it
 * types from a blank area (full buffer is still returned for storage when using stream mode).
 */
export async function revealBufferedBotText(opts: {
  getBuffer: () => string;
  isStreamDone: () => boolean;
  setVisible: (s: string) => void;
  onFirstChar?: () => void;
  /** Fires when protocol boundaries change the effective stream kind (for SFX). */
  onRevealSoundKind?: (kind: StreamSoundKind) => void;
  /** After leaving an `@ascii-draw` block (aligned with Video `asciiDone`). */
  onAfterAsciiSegment?: () => void;
  onComplete?: () => void;
  signal?: AbortSignal;
  /** On interrupt: full received buffer vs visible-only (welcome typing). */
  abortFinal?: RevealAbortFinal;
}): Promise<string> {
  const abortFinal: RevealAbortFinal = opts.abortFinal ?? "buffer";
  /** Consumption index into the full buffer (includes `@pause` / `@clear` tokens). */
  let bufPos = 0;
  /** Post-`@clear` visible substring; not necessarily a prefix of the buffer. */
  let visible = "";
  let firstCharHandled = false;
  let lastSoundKind: StreamSoundKind = "bot";

  const abortAndFinish = (): string => {
    const buffer = opts.getBuffer();
    let out: string;
    if (abortFinal === "visible") {
      out = visible;
    } else {
      out = buffer;
      opts.setVisible(buffer);
    }
    opts.onComplete?.();
    return out;
  };

  try {
    while (true) {
      if (opts.signal?.aborted) {
        return abortAndFinish();
      }

      const buffer = opts.getBuffer();
      const done = opts.isStreamDone();

      if (done && bufPos >= buffer.length) {
        break;
      }

      if (bufPos < buffer.length) {
        const pauseHit = matchPauseDirectiveAt(buffer, bufPos);
        if (pauseHit) {
          try {
            await delay(pauseHit.ms, opts.signal);
          } catch (e) {
            if (e instanceof DOMException && e.name === "AbortError") {
              return abortAndFinish();
            }
            throw e;
          }
          bufPos += pauseHit.len;
          opts.setVisible(visible);
          continue;
        }

        const clearHit = matchClearDirectiveAt(buffer, bufPos);
        if (clearHit) {
          visible = "";
          bufPos += clearHit.len;
          opts.setVisible(visible);
          firstCharHandled = false;
          lastSoundKind = "bot";
          continue;
        }

        try {
          await delay(delayMsBeforeNextChar(visible.length), opts.signal);
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") {
            return abortAndFinish();
          }
          throw e;
        }
        visible += buffer[bufPos]!;
        bufPos += 1;
        opts.setVisible(visible);
        const kind = activeStreamSoundKind(visible);
        if (!firstCharHandled) {
          firstCharHandled = true;
          opts.onFirstChar?.();
          lastSoundKind = kind;
          opts.onRevealSoundKind?.(kind);
        } else if (kind !== lastSoundKind) {
          if (lastSoundKind === "ascii") {
            opts.onAfterAsciiSegment?.();
          }
          lastSoundKind = kind;
          opts.onRevealSoundKind?.(kind);
        }
      } else {
        try {
          await delay(24, opts.signal);
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") {
            return abortAndFinish();
          }
          throw e;
        }
      }
    }

    if (lastSoundKind === "ascii") {
      opts.onAfterAsciiSegment?.();
    }
    opts.onComplete?.();
    /** `abortFinal: "visible"` (welcome typing): stored transcript must match what was revealed — pause/clear tokens are never appended to `visible`. */
    if (abortFinal === "visible") {
      return visible;
    }
    return opts.getBuffer();
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return abortAndFinish();
    }
    throw e;
  }
}
