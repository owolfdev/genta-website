/**
 * Client-side persistence for ChatIQ threads: `conversation_id` plus transcript
 * (user/bot only), aligned with ChatIQ’s “Continuing Conversations” pattern —
 * see https://www.chatiq.io/docs/api (conversation_id + history on each request).
 */

const STORAGE_KEY = "genta.chatiq.session.v1";

export type PersistedChatTurn = {
  role: "user" | "bot";
  text: string;
};

export type PersistedChatiqSessionV1 = {
  v: 1;
  conversationId: string | null;
  messages: PersistedChatTurn[];
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === "object";
}

export function readChatiqSession(): PersistedChatiqSessionV1 | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || parsed.v !== 1) {
      return null;
    }
    const conversationId =
      parsed.conversationId === null || parsed.conversationId === undefined
        ? null
        : String(parsed.conversationId);
    const messagesRaw = parsed.messages;
    if (!Array.isArray(messagesRaw)) {
      return null;
    }
    const messages: PersistedChatTurn[] = [];
    for (const item of messagesRaw) {
      if (!isRecord(item)) {
        continue;
      }
      const role = item.role;
      const text = item.text;
      if (role !== "user" && role !== "bot") {
        continue;
      }
      if (typeof text !== "string") {
        continue;
      }
      messages.push({ role, text });
    }
    return { v: 1, conversationId, messages };
  } catch {
    return null;
  }
}

export function writeChatiqSession(payload: {
  conversationId: string | null;
  messages: PersistedChatTurn[];
}): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const data: PersistedChatiqSessionV1 = {
      v: 1,
      conversationId: payload.conversationId,
      messages: payload.messages,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota / private mode */
  }
}

export function clearChatiqSession(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
