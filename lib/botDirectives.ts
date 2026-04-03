export type BotInlineChunk =
  | { kind: "text"; text: string }
  | { kind: "directive"; name: string; raw: string };

const INLINE_DIRECTIVE_RE = /@([a-z][a-z0-9-]{1,31})\b/g;

/**
 * Parses plain bot text for inline directives like `@waitlist`.
 * Unknown directives are still returned as `directive` chunks so callers can decide fallback behavior.
 */
export function parseInlineBotDirectives(raw: string): BotInlineChunk[] {
  if (!raw) {
    return [];
  }

  const chunks: BotInlineChunk[] = [];
  let last = 0;

  for (const m of raw.matchAll(INLINE_DIRECTIVE_RE)) {
    const full = m[0];
    const name = m[1];
    const idx = m.index ?? -1;
    if (!name || idx < 0) {
      continue;
    }
    if (idx > last) {
      chunks.push({ kind: "text", text: raw.slice(last, idx) });
    }
    chunks.push({ kind: "directive", name, raw: full });
    last = idx + full.length;
  }

  if (last < raw.length) {
    chunks.push({ kind: "text", text: raw.slice(last) });
  }

  return chunks.length > 0 ? chunks : [{ kind: "text", text: raw }];
}
