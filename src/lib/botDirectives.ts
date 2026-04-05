export type BotInlineChunk =
  | { kind: "text"; text: string }
  | { kind: "directive"; name: string; raw: string }
  | { kind: "pause"; ms: number; raw: string };

/** Upper bound so a hostile API cannot stall the UI indefinitely. */
export const PAUSE_DIRECTIVE_MAX_MS = 30_000;

export function clampPauseMs(ms: number): number {
  if (!Number.isFinite(ms) || ms < 0) {
    return 0;
  }
  return Math.min(Math.floor(ms), PAUSE_DIRECTIVE_MAX_MS);
}

/**
 * If `s[fromIndex:]` begins with a complete `@pause[ms]`, returns token length and clamped delay.
 * Used by the reveal loop (must match display stripping in {@link parseInlineBotDirectives}).
 */
export function matchPauseDirectiveAt(
  s: string,
  fromIndex: number,
): { len: number; ms: number } | null {
  if (fromIndex < 0 || fromIndex >= s.length) {
    return null;
  }
  const sub = s.slice(fromIndex);
  const m = sub.match(/^@pause\[(\d+)\]/);
  if (!m) {
    return null;
  }
  return { len: m[0].length, ms: clampPauseMs(Number(m[1])) };
}

/**
 * If `s[fromIndex:]` begins with `@clear`, returns token length (reveal loop consumes it; screen resets).
 */
export function matchClearDirectiveAt(s: string, fromIndex: number): { len: number } | null {
  if (fromIndex < 0 || fromIndex >= s.length) {
    return null;
  }
  const sub = s.slice(fromIndex);
  const m = sub.match(/^@clear\b/);
  if (!m) {
    return null;
  }
  return { len: m[0].length };
}

/** Remove completed pause tokens from plain text (e.g. chat history). */
export function stripPauseDirectivesFromText(text: string): string {
  return text.replace(/@pause\[\d+\]/g, "");
}

/** Remove `@clear` tokens (not sent to model context / history helpers). */
export function stripClearDirectivesFromText(text: string): string {
  return text.replace(/@clear\b/g, "");
}

/**
 * While streaming, hide a trailing incomplete `@pause…` tail so `@` / brackets do not flash.
 */
export function stripIncompletePauseInRaw(raw: string): string {
  const i = raw.lastIndexOf("@pause");
  if (i < 0) {
    return raw;
  }
  const tail = raw.slice(i);
  if (/^@pause\[\d+\]/.test(tail)) {
    return raw;
  }
  return raw.slice(0, i);
}

/**
 * Parses bot segment text for `@pause[ms]` (non-displayed beat) and inline directives like `@waitlist`.
 * Invalid `@pause[…` without a matching digit+`]` closing is left as plain text.
 */
export function parseInlineBotDirectives(raw: string): BotInlineChunk[] {
  if (!raw) {
    return [];
  }

  const chunks: BotInlineChunk[] = [];
  let pos = 0;

  while (pos < raw.length) {
    const nextAt = raw.indexOf("@", pos);
    if (nextAt < 0) {
      chunks.push({ kind: "text", text: raw.slice(pos) });
      break;
    }
    if (nextAt > pos) {
      chunks.push({ kind: "text", text: raw.slice(pos, nextAt) });
    }
    const slice = raw.slice(nextAt);

    const pauseFull = slice.match(/^@pause\[(\d+)\]/);
    if (pauseFull) {
      chunks.push({
        kind: "pause",
        ms: clampPauseMs(Number(pauseFull[1])),
        raw: pauseFull[0],
      });
      pos = nextAt + pauseFull[0].length;
      continue;
    }

    if (slice.startsWith("@pause[")) {
      chunks.push({ kind: "text", text: slice });
      break;
    }

    const dirM = slice.match(/^@([a-z][a-z0-9-]{1,31})\b/);
    if (dirM) {
      chunks.push({
        kind: "directive",
        name: dirM[1]!,
        raw: dirM[0],
      });
      pos = nextAt + dirM[0].length;
      continue;
    }

    chunks.push({ kind: "text", text: "@" });
    pos = nextAt + 1;
  }

  return chunks.length > 0 ? chunks : [{ kind: "text", text: raw }];
}
