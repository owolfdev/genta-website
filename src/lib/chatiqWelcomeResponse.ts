/**
 * Parse ChatIQ JSON-mode welcome (and similar) payloads: `response`, optional `responses`, `conversationId`.
 * @see https://www.chatiq.io/docs/api — `is_welcome: true`, `message: ""`, `stream: false`
 */

function flattenResponses(responses: unknown): string {
  if (!Array.isArray(responses)) {
    return "";
  }
  const parts: string[] = [];
  for (const item of responses) {
    if (typeof item === "string") {
      parts.push(item);
    } else if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      const s = o.response ?? o.content ?? o.text;
      if (typeof s === "string") {
        parts.push(s);
      }
    }
  }
  return parts.filter(Boolean).join("\n\n");
}

export function welcomeTextFromChatiqJson(data: Record<string, unknown>): string {
  const multi = flattenResponses(data.responses);
  const single = typeof data.response === "string" ? data.response : "";
  if (multi && single) {
    return `${single.trim()}\n\n${multi.trim()}`.trim();
  }
  return (multi || single).trim();
}

export function conversationIdFromChatiqJson(data: Record<string, unknown>): string | undefined {
  const id = data.conversationId;
  return typeof id === "string" && id.length > 0 ? id : undefined;
}
