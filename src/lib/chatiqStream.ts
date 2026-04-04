/**
 * Parse ChatIQ SSE stream (OpenAI-style delta chunks + optional metadata lines).
 */

export type StreamMeta = {
  conversationId?: string;
};

export async function consumeChatiqSseStream(
  response: Response,
  onDelta: (chunk: string) => void,
  onMeta?: (meta: StreamMeta) => void,
  onFirstContent?: () => void,
  signal?: AbortSignal,
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const onAbort = () => {
    reader.cancel().catch(() => {});
  };
  if (signal) {
    if (signal.aborted) {
      onAbort();
      return "";
    }
    signal.addEventListener("abort", onAbort, { once: true });
  }

  const decoder = new TextDecoder();
  let carry = "";
  let full = "";
  let firstContentFired = false;

  try {
  while (true) {
    let readResult: ReadableStreamReadResult<Uint8Array>;
    try {
      readResult = await reader.read();
    } catch (e) {
      if (
        signal?.aborted &&
        e instanceof DOMException &&
        e.name === "AbortError"
      ) {
        return full;
      }
      throw e;
    }
    const { done, value } = readResult;
    if (done) {
      break;
    }
    carry += decoder.decode(value, { stream: true });
    const parts = carry.split("\n");
    carry = parts.pop() ?? "";

    for (const raw of parts) {
      const line = raw.trim();
      if (!line.startsWith("data: ")) {
        continue;
      }
      const data = line.slice(6).trim();
      if (data === "[DONE]") {
        continue;
      }
      try {
        const parsed = JSON.parse(data) as Record<string, unknown>;
        const choices = parsed.choices as Array<{ delta?: { content?: string } }> | undefined;
        const content = choices?.[0]?.delta?.content;
        if (typeof content === "string" && content.length > 0) {
          if (!firstContentFired) {
            firstContentFired = true;
            onFirstContent?.();
          }
          full += content;
          onDelta(content);
        }
        const cid = parsed.conversationId;
        if (typeof cid === "string" && cid.length > 0) {
          onMeta?.({ conversationId: cid });
        }
      } catch {
        // Ignore non-JSON event payloads.
      }
    }
  }

  return full;
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }
}
