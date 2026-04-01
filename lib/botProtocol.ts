/**
 * Inline “system” voice inside an assistant stream (teal / # styling), controlled by the model.
 *
 * Grammar (line-oriented):
 * - Block: a line exactly `@system`, then body lines until a line exactly `@end` (body is system-styled).
 *   Put a newline after `@end` before any further assistant (amber) content so it doesn’t run into the block.
 * - Single line: a line starting with `@system ` — the rest of that line is system-styled; then bot resumes.
 *
 * The shell also inserts a newline between rendered segments when both system and bot text appear in one reply.
 *
 * Markers are stripped from the visible transcript; they remain in stored `role: "bot"` text for re-parse,
 * or use `stripBotProtocolForHistory()` before sending to APIs.
 */

export type BotStreamSegment = { kind: "bot" | "system"; text: string };

const BLOCK_OPEN = "@system";
const BLOCK_CLOSE = "@end";
const LINE_PREFIX = "@system ";

/** Remove a trailing partial directive line (streaming `@sy…` / `@end`). */
function normalizeLine(line: string): string {
  return line.replace(/\r$/, "");
}

export function stripIncompleteBotProtocol(raw: string): string {
  if (!raw) {
    return raw;
  }
  const nl = raw.lastIndexOf("\n");
  const lastLine = normalizeLine(nl === -1 ? raw : raw.slice(nl + 1));
  if (!lastLine.startsWith("@")) {
    return raw;
  }
  for (const d of [BLOCK_OPEN, BLOCK_CLOSE] as const) {
    if (d.startsWith(lastLine) && d !== lastLine) {
      return nl === -1 ? "" : raw.slice(0, nl);
    }
  }
  return raw;
}

/**
 * Parse raw assistant text (including markers) into display segments. Markers are not included in `text`.
 */
export function parseBotProtocolToSegments(raw: string): BotStreamSegment[] {
  const lines = raw.split("\n");
  const out: BotStreamSegment[] = [];
  let botBuf = "";
  let systemBuf = "";
  let mode: "bot" | "block_system" = "bot";

  const flushBot = () => {
    if (botBuf.length > 0) {
      out.push({ kind: "bot", text: botBuf });
      botBuf = "";
    }
  };
  const flushSystem = () => {
    if (systemBuf.length > 0) {
      out.push({ kind: "system", text: systemBuf });
      systemBuf = "";
    }
  };

  for (const line of lines) {
    const l = normalizeLine(line);
    if (mode === "bot") {
      if (l === BLOCK_OPEN) {
        flushBot();
        mode = "block_system";
        continue;
      }
      if (l.startsWith(LINE_PREFIX)) {
        flushBot();
        out.push({ kind: "system", text: l.slice(LINE_PREFIX.length) });
        continue;
      }
      botBuf += (botBuf ? "\n" : "") + l;
    } else {
      if (l === BLOCK_CLOSE) {
        flushSystem();
        mode = "bot";
        continue;
      }
      systemBuf += (systemBuf ? "\n" : "") + l;
    }
  }
  flushBot();
  if (mode === "block_system") {
    flushSystem();
  }
  return out;
}

/** Which stream typing sound to use for the character at the end of the visible raw buffer. */
export function activeStreamSoundKind(raw: string): "bot" | "system" {
  const cleaned = stripIncompleteBotProtocol(raw);
  const segs = parseBotProtocolToSegments(cleaned);
  if (segs.length === 0) {
    return "bot";
  }
  return segs[segs.length - 1]!.kind;
}

/** Flatten to plain text for chat history / APIs (no protocol lines). */
export function stripBotProtocolForHistory(raw: string): string {
  return parseBotProtocolToSegments(raw)
    .map((s) => s.text)
    .join("\n")
    .trimEnd();
}
