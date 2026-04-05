import {
  stripClearDirectivesFromText,
  stripIncompletePauseInRaw,
  stripPauseDirectivesFromText,
} from "./botDirectives";

/**
 * Inline styled segments inside an assistant stream (markers stripped for display).
 *
 * Grammar (line-oriented):
 * - `@system` … `@end` — teal “# ” system voice (see below).
 * - `@ascii-draw` … `@end` — ASCII art / path / block: monospace mint, dedicated SFX (Video: asciiDraw + asciiDone).
 * - Single-line system: `@system ` + rest of line.
 *
 * Inline (inside bot text segments):
 * - `@pause[ms]` — non-displayed pause during reveal (`ms` = milliseconds, clamped). Example: `@pause[1000]` ≈ one second.
 *   On its own line between paragraphs, the token is removed but the surrounding newlines stay, so you get a **blank line**
 *   between blocks (`text` / `@pause` / `text` → `text`, empty line, `text`). Inline pauses (`… @pause[500] …`) keep layout as written.
 * - `@clear` — during reveal, clears the visible transcript so following text types on a blank screen; stripped from API history.
 *
 * After `@end`, start further content on a new line. The UI inserts `\n` between segments. Blank lines in
 * the source (e.g. between `@end` and the next paragraph) are kept in bot segments via line-wise join.
 *
 * Markers stay in stored `role: "bot"` text for re-parse; use `stripBotProtocolForHistory()` for APIs.
 */

export type StreamSoundKind = "bot" | "system" | "ascii";

export type BotStreamSegment = { kind: StreamSoundKind; text: string };

const BLOCK_SYSTEM = "@system";
const BLOCK_ASCII = "@ascii-draw";
const BLOCK_CLOSE = "@end";
const LINE_PREFIX_SYSTEM = "@system ";

const INCOMPLETE_DIRECTIVES: readonly string[] = [BLOCK_SYSTEM, BLOCK_ASCII, BLOCK_CLOSE];

function normalizeLine(line: string): string {
  return line.replace(/\r$/, "");
}

export function stripIncompleteBotProtocol(raw: string): string {
  if (!raw) {
    return raw;
  }
  const nl = raw.lastIndexOf("\n");
  const lastLine = normalizeLine(nl === -1 ? raw : raw.slice(nl + 1));
  let base = raw;
  if (lastLine.startsWith("@")) {
    for (const d of INCOMPLETE_DIRECTIVES) {
      if (d.startsWith(lastLine) && d !== lastLine) {
        base = nl === -1 ? "" : raw.slice(0, nl);
        break;
      }
    }
  }
  return stripIncompletePauseInRaw(base);
}

/**
 * Parse raw assistant text (including markers) into display segments. Markers are not included in `text`.
 */
export function parseBotProtocolToSegments(raw: string): BotStreamSegment[] {
  const lines = raw.split("\n");
  const out: BotStreamSegment[] = [];
  /** Joined with `\n` so empty strings preserve blank lines (split drops nothing; old `+=` skipped `""`). */
  let botLines: string[] = [];
  let systemBuf = "";
  let asciiBuf = "";
  let mode: "bot" | "block_system" | "block_ascii" = "bot";

  const flushBot = () => {
    if (botLines.length === 0) {
      return;
    }
    const text = botLines.join("\n");
    botLines = [];
    if (text.length === 0) {
      return;
    }
    out.push({ kind: "bot", text });
  };
  const flushSystem = () => {
    if (systemBuf.length > 0) {
      out.push({ kind: "system", text: systemBuf });
      systemBuf = "";
    }
  };
  const flushAscii = () => {
    if (asciiBuf.length > 0) {
      out.push({ kind: "ascii", text: asciiBuf });
      asciiBuf = "";
    }
  };

  for (const line of lines) {
    const l = normalizeLine(line);
    if (mode === "bot") {
      if (l === BLOCK_SYSTEM) {
        flushBot();
        mode = "block_system";
        continue;
      }
      if (l === BLOCK_ASCII) {
        flushBot();
        mode = "block_ascii";
        continue;
      }
      if (l.startsWith(LINE_PREFIX_SYSTEM)) {
        flushBot();
        out.push({ kind: "system", text: l.slice(LINE_PREFIX_SYSTEM.length) });
        continue;
      }
      botLines.push(l);
    } else if (mode === "block_system") {
      if (l === BLOCK_CLOSE) {
        flushSystem();
        mode = "bot";
        continue;
      }
      systemBuf += (systemBuf ? "\n" : "") + l;
    } else {
      if (l === BLOCK_CLOSE) {
        flushAscii();
        mode = "bot";
        continue;
      }
      asciiBuf += (asciiBuf ? "\n" : "") + l;
    }
  }
  flushBot();
  if (mode === "block_system") {
    flushSystem();
  }
  if (mode === "block_ascii") {
    flushAscii();
  }
  return out;
}

/** Which stream typing sound matches the character at the end of the visible raw buffer. */
export function activeStreamSoundKind(raw: string): StreamSoundKind {
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
    .map((s) => stripClearDirectivesFromText(stripPauseDirectivesFromText(s.text)))
    .join("\n")
    .trimEnd();
}
