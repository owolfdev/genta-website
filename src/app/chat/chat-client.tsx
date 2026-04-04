"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Share_Tech_Mono } from "next/font/google";
import {
  parseBotProtocolToSegments,
  stripBotProtocolForHistory,
  stripIncompleteBotProtocol,
} from "@/lib/botProtocol";
import { parseInlineBotDirectives, type BotInlineChunk } from "@/lib/botDirectives";
import { conversationIdFromChatiqJson, welcomeTextFromChatiqJson } from "@/lib/chatiqWelcomeResponse";
import { consumeChatiqSseStream } from "@/lib/chatiqStream";
import { revealBufferedBotText } from "@/lib/revealBotBuffer";
import { WaitlistGateScrim, WaitlistOverlay } from "@/components/WaitlistOverlay";
import { LEGAL_ROUTES } from "@/lib/legalRoutes";
import {
  ASSISTANT_WELCOME_FALLBACK_TEXT,
  BOT_INLINE_DIRECTIVES,
  SHELL_UI,
  WAITLIST_GATE_SESSION_VALUE,
  WAITLIST_OVERLAY,
} from "@/lib/shellConfig";
import { useShellSound } from "@/lib/useShellSound";

type ChatRole = "user" | "bot" | "system";
type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

const terminalFont = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
});

const USER_PREFIX = "> ";
const SYSTEM_PREFIX = "# ";

function AudioFeedbackIcon({ muted }: { muted: boolean }) {
  return muted ? (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={true}
    >
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  ) : (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={true}
    >
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 010 7.07" />
      <path d="M19.07 4.93a9 9 0 010 14.14" />
    </svg>
  );
}

/** Prompts shorter than this are revealed character-by-character with digital-text audio. */
const SHORT_PROMPT_CHAR_MAX = 48;

/** If the log is within this many px of the bottom, new content auto-scrolls. */
const SCROLL_STICK_BOTTOM_PX = 72;

function buildChatiqHistory(messages: ChatMessage[]): { role: string; content: string }[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "bot")
    .map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.role === "bot" ? stripBotProtocolForHistory(m.text) : m.text,
    }));
}

function InlineBotChunk({
  chunk,
  onDirective,
}: {
  chunk: BotInlineChunk;
  onDirective?: (name: string) => void;
}) {
  if (chunk.kind === "text") {
    return <Fragment>{chunk.text}</Fragment>;
  }
  if (chunk.kind === "pause") {
    return null;
  }
  const known = BOT_INLINE_DIRECTIVES[chunk.name as keyof typeof BOT_INLINE_DIRECTIVES];
  if (!known || !onDirective) {
    return <Fragment>{chunk.raw}</Fragment>;
  }
  return (
    <button
      type="button"
      onClick={() => onDirective(chunk.name)}
      aria-label={known.ariaLabel}
      className="mx-1 inline-block cursor-pointer rounded border border-[#4a6b58] px-2 py-0.5 text-[0.85em] tracking-[0.08em] text-[#7aab8a] underline decoration-[#4a6b58] underline-offset-2 transition hover:text-[#9fcbad]"
    >
      {known.label}
    </button>
  );
}

function BotMessageBody({
  raw,
  streaming,
  onDirective,
}: {
  raw: string;
  streaming?: boolean;
  onDirective?: (name: string) => void;
}) {
  const source = streaming ? stripIncompleteBotProtocol(raw) : raw;
  const segs = parseBotProtocolToSegments(source);
  if (segs.length === 0) {
    return null;
  }
  return (
    <>
      {segs.map((seg, i) => (
        <Fragment key={i}>
          {seg.kind === "system" ? (
            <span className="text-[#4a6b58]">
              {SYSTEM_PREFIX}
              <span className="text-[#7aab8a] [text-shadow:0_0_8px_rgba(122,171,138,0.42)]">{seg.text}</span>
            </span>
          ) : seg.kind === "ascii" ? (
            <pre className="my-1 max-w-full overflow-x-auto font-[inherit] text-[0.92em] leading-tight text-[#7dd3c0] whitespace-pre [text-shadow:0_0_6px_rgba(125,211,192,0.38)]">
              {seg.text}
            </pre>
          ) : (
            <span className="text-[#b8892e]">
              {parseInlineBotDirectives(seg.text).map((chunk, chunkIdx) => (
                <InlineBotChunk
                  key={`${i}-${chunkIdx}`}
                  chunk={chunk}
                  onDirective={onDirective}
                />
              ))}
            </span>
          )}
          {i < segs.length - 1 ? "\n" : null}
        </Fragment>
      ))}
    </>
  );
}

export default function ChatClient() {
  /** Waitlist opens only from the header or inline bot control — not on first paint (landing covers onboarding). */
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  /** Bumps when the user explicitly reopens the waitlist so the dialog remounts with fresh consent state. */
  const [waitlistDialogEpoch, setWaitlistDialogEpoch] = useState(0);
  const conversationIdRef = useRef<string | null>(null);
  /** Boot welcome row removed from the log on the user’s first message (thread continues via `conversation_id`). */
  const welcomeMessageIdRef = useRef<string | null>(null);
  /** Set only after a non-empty welcome is committed — avoids Strict Mode double-effect skipping welcome; still enforces one welcome per mount. */
  const welcomeFinishedRef = useRef(false);
  const botBufferRef = useRef("");
  const streamDoneRef = useRef(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [draftBotText, setDraftBotText] = useState("");
  const [revealingUserPrompt, setRevealingUserPrompt] = useState(false);
  const [draftUserText, setDraftUserText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);
  /** Active welcome or chat assistant work (fetch + reveal); `abort()` stops output and re-enables input. */
  const assistantAbortRef = useRef<AbortController | null>(null);

  const dismissWaitlist = useCallback(() => {
    try {
      sessionStorage.setItem(
        WAITLIST_OVERLAY.sessionStorageKey,
        WAITLIST_GATE_SESSION_VALUE,
      );
    } catch {
      /* private mode */
    }
    setWaitlistOpen(false);
  }, []);

  const openWaitlist = useCallback(() => {
    setWaitlistDialogEpoch((e) => e + 1);
    setWaitlistOpen(true);
  }, []);

  const handleInlineDirective = useCallback(
    (name: string) => {
      if (name === "waitlist") {
        openWaitlist();
      }
    },
    [openWaitlist],
  );

  const {
    soundEnabled,
    toggleSoundEnabled,
    unlock,
    playSend,
    startUserPromptTypingSound,
    stopUserPromptTypingSound,
    startBotThinkingSound,
    stopBotThinkingSound,
    playAsciiDrawDoneSound,
    startStreamTypingSound,
    stopTyping,
  } = useShellSound();

  const canSubmit = useMemo(
    () => input.trim().length > 0 && !isTyping && !revealingUserPrompt,
    [input, isTyping, revealingUserPrompt],
  );

  const interruptAssistant = useCallback(() => {
    assistantAbortRef.current?.abort();
  }, []);

  const updateStickToBottom = () => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = el;
    const distFromBottom = scrollHeight - scrollTop - clientHeight;
    stickToBottomRef.current = distFromBottom <= SCROLL_STICK_BOTTOM_PX;
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !stickToBottomRef.current) {
      return;
    }
    el.scrollTop = el.scrollHeight;
  }, [messages, draftBotText, draftUserText]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (isTyping || revealingUserPrompt) {
      return;
    }
    const id = window.setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(id);
  }, [isTyping, revealingUserPrompt]);

  useEffect(() => {
    if (!isTyping || waitlistOpen) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") {
        return;
      }
      e.preventDefault();
      interruptAssistant();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isTyping, waitlistOpen, interruptAssistant]);

  const streamAssistantFromResponse = useCallback(
    async (res: Response, signal: AbortSignal): Promise<string> => {
      botBufferRef.current = "";
      streamDoneRef.current = false;
      setDraftBotText("");

      const streamTask = (async () => {
        try {
          return await consumeChatiqSseStream(
            res,
            (chunk) => {
              botBufferRef.current += chunk;
            },
            (meta) => {
              if (meta.conversationId) {
                conversationIdRef.current = meta.conversationId;
              }
            },
            undefined,
            signal,
          );
        } catch (e) {
          if (
            signal.aborted &&
            e instanceof DOMException &&
            e.name === "AbortError"
          ) {
            return botBufferRef.current;
          }
          throw e;
        } finally {
          streamDoneRef.current = true;
        }
      })();

      const revealTask = revealBufferedBotText({
        getBuffer: () => botBufferRef.current,
        isStreamDone: () => streamDoneRef.current,
        setVisible: setDraftBotText,
        onFirstChar: () => {
          stopBotThinkingSound();
        },
        onRevealSoundKind: (kind) => {
          void startStreamTypingSound(kind);
        },
        onAfterAsciiSegment: () => {
          void playAsciiDrawDoneSound();
        },
        onComplete: () => {
          stopBotThinkingSound();
          stopTyping();
        },
        signal,
        abortFinal: "buffer",
      });

      const [, revealed] = await Promise.all([streamTask, revealTask]);
      if (signal.aborted && !revealed.trim()) {
        return "";
      }
      const raw = revealed.trim();
      return raw ? revealed : "(empty response)";
    },
    [playAsciiDrawDoneSound, startStreamTypingSound, stopBotThinkingSound, stopTyping],
  );

  const revealStaticAssistantText = useCallback(
    async (fullText: string, signal?: AbortSignal): Promise<string> => {
      botBufferRef.current = fullText;
      streamDoneRef.current = true;
      setDraftBotText("");
      return await revealBufferedBotText({
        getBuffer: () => botBufferRef.current,
        isStreamDone: () => true,
        setVisible: setDraftBotText,
        onFirstChar: () => {
          stopBotThinkingSound();
        },
        onRevealSoundKind: (kind) => {
          void startStreamTypingSound(kind);
        },
        onAfterAsciiSegment: () => {
          void playAsciiDrawDoneSound();
        },
        onComplete: () => {
          stopBotThinkingSound();
          stopTyping();
        },
        signal,
        abortFinal: "visible",
      });
    },
    [playAsciiDrawDoneSound, startStreamTypingSound, stopBotThinkingSound, stopTyping],
  );

  /** Welcome runs once; sound pref hydrates from localStorage and would otherwise change callback identities and retrigger the effect (flash / restart). */
  const welcomeFlowRef = useRef({
    startBotThinkingSound,
    stopBotThinkingSound,
    stopTyping,
    revealStaticAssistantText,
  });
  welcomeFlowRef.current = {
    startBotThinkingSound,
    stopBotThinkingSound,
    stopTyping,
    revealStaticAssistantText,
  };

  useEffect(() => {
    if (waitlistOpen || welcomeFinishedRef.current) {
      return;
    }
    let cancelled = false;

    const runWelcome = async () => {
      const w = welcomeFlowRef.current;
      const ac = new AbortController();
      assistantAbortRef.current = ac;
      stickToBottomRef.current = true;
      setIsTyping(true);
      setDraftBotText("");
      await w.startBotThinkingSound();

      let responseText = "";
      let revealedForMessage = "";

      const finishWelcome = (messageText: string) => {
        if (welcomeFinishedRef.current) {
          return;
        }
        welcomeFlowRef.current.stopTyping();
        welcomeFlowRef.current.stopBotThinkingSound();
        setDraftBotText("");
        setIsTyping(false);
        assistantAbortRef.current = null;
        if (!messageText.trim()) {
          return;
        }
        welcomeFinishedRef.current = true;
        const welcomeId = crypto.randomUUID();
        welcomeMessageIdRef.current = welcomeId;
        setMessages((prev) => [...prev, { id: welcomeId, role: "bot", text: messageText }]);
      };

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            is_welcome: true,
            message: "",
            stream: false,
          }),
          signal: ac.signal,
        });

        if (cancelled || ac.signal.aborted) {
          w.stopTyping();
          w.stopBotThinkingSound();
          setDraftBotText("");
          setIsTyping(false);
          assistantAbortRef.current = null;
          return;
        }

        if (!res.ok) {
          w.stopBotThinkingSound();
          let errMsg = `HTTP ${res.status}`;
          const ct = res.headers.get("content-type") ?? "";
          try {
            if (ct.includes("application/json")) {
              const j = (await res.json()) as { error?: { message?: string } };
              errMsg = j.error?.message ?? errMsg;
            } else {
              errMsg = (await res.text()) || errMsg;
            }
          } catch {
            /* keep errMsg */
          }
          console.warn("[genta] welcome request failed:", errMsg);
          responseText = ASSISTANT_WELCOME_FALLBACK_TEXT;
        } else {
          const ct = res.headers.get("content-type") ?? "";
          if (!ct.includes("application/json")) {
            w.stopBotThinkingSound();
            console.warn("[genta] welcome: expected JSON, got", ct);
            responseText = ASSISTANT_WELCOME_FALLBACK_TEXT;
          } else {
            const data = (await res.json()) as Record<string, unknown>;
            if (data.error != null) {
              w.stopBotThinkingSound();
              console.warn("[genta] welcome API error payload:", data.error);
              responseText = ASSISTANT_WELCOME_FALLBACK_TEXT;
            } else {
              const cid = conversationIdFromChatiqJson(data);
              if (cid) {
                conversationIdRef.current = cid;
              }
              responseText = welcomeTextFromChatiqJson(data);
              if (!responseText.trim()) {
                responseText = ASSISTANT_WELCOME_FALLBACK_TEXT;
              }
              revealedForMessage = await welcomeFlowRef.current.revealStaticAssistantText(
                responseText,
                ac.signal,
              );
              if (cancelled) {
                w.stopTyping();
                w.stopBotThinkingSound();
                setDraftBotText("");
                setIsTyping(false);
                assistantAbortRef.current = null;
                return;
              }
              if (ac.signal.aborted) {
                finishWelcome(revealedForMessage);
                return;
              }
            }
          }
        }
      } catch (e) {
        if (cancelled) {
          welcomeFlowRef.current.stopTyping();
          welcomeFlowRef.current.stopBotThinkingSound();
          setDraftBotText("");
          setIsTyping(false);
          assistantAbortRef.current = null;
          return;
        }
        if (e instanceof DOMException && e.name === "AbortError") {
          welcomeFlowRef.current.stopTyping();
          welcomeFlowRef.current.stopBotThinkingSound();
          setDraftBotText("");
          setIsTyping(false);
          assistantAbortRef.current = null;
          return;
        }
        welcomeFlowRef.current.stopBotThinkingSound();
        welcomeFlowRef.current.stopTyping();
        console.warn("[genta] welcome request error:", e);
        responseText = ASSISTANT_WELCOME_FALLBACK_TEXT;
      }

      if (cancelled) {
        welcomeFlowRef.current.stopTyping();
        welcomeFlowRef.current.stopBotThinkingSound();
        setDraftBotText("");
        setIsTyping(false);
        assistantAbortRef.current = null;
        return;
      }

      if (welcomeFinishedRef.current) {
        return;
      }

      const toShow = revealedForMessage.trim() ? revealedForMessage : responseText;
      finishWelcome(toShow);
    };

    void runWelcome();
    return () => {
      cancelled = true;
      assistantAbortRef.current?.abort();
      welcomeFlowRef.current.stopTyping();
      welcomeFlowRef.current.stopBotThinkingSound();
    };
  }, [waitlistOpen]);

  const onSubmit = async (rawText: string) => {
    const text = rawText.trim();
    if (!text || isTyping || revealingUserPrompt) {
      return;
    }

    stickToBottomRef.current = true;

    const welcomeId = welcomeMessageIdRef.current;
    if (welcomeId) {
      welcomeMessageIdRef.current = null;
      setMessages((prev) => prev.filter((m) => m.id !== welcomeId));
    }

    await unlock();
    playSend();
    setInput("");

    if (text.length < SHORT_PROMPT_CHAR_MAX) {
      setRevealingUserPrompt(true);
      setDraftUserText("");
      await startUserPromptTypingSound();
      const cps = 18;
      const delayMs = Math.max(12, Math.round(1000 / cps));
      for (let i = 1; i <= text.length; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        setDraftUserText(text.slice(0, i));
      }
      stopUserPromptTypingSound();
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text }]);
      setDraftUserText("");
      setRevealingUserPrompt(false);
    } else {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text }]);
    }

    const priorHistory = buildChatiqHistory(
      messages
        .filter((m) => m.role === "user" || m.role === "bot")
        .filter((m) => !welcomeId || m.id !== welcomeId),
    );

    const ac = new AbortController();
    assistantAbortRef.current = ac;
    botBufferRef.current = "";

    setIsTyping(true);
    setDraftBotText("");
    await startBotThinkingSound();

    let responseText = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: priorHistory,
          conversation_id: conversationIdRef.current,
          stream: true,
        }),
        signal: ac.signal,
      });

      if (!res.ok) {
        stopBotThinkingSound();
        let errMsg = `HTTP ${res.status}`;
        const ct = res.headers.get("content-type") ?? "";
        try {
          if (ct.includes("application/json")) {
            const j = (await res.json()) as { error?: { message?: string } };
            errMsg = j.error?.message ?? errMsg;
          } else {
            errMsg = (await res.text()) || errMsg;
          }
        } catch {
          /* keep errMsg */
        }
        responseText = `[error] ${errMsg}`;
      } else {
        responseText = await streamAssistantFromResponse(res, ac.signal);
      }
    } catch (e) {
      stopBotThinkingSound();
      stopTyping();
      if (e instanceof DOMException && e.name === "AbortError") {
        responseText = botBufferRef.current;
      } else {
        responseText = `[error] ${e instanceof Error ? e.message : String(e)}`;
      }
    } finally {
      assistantAbortRef.current = null;
    }

    stopTyping();
    stopBotThinkingSound();
    setDraftBotText("");
    setIsTyping(false);

    if (!responseText.trim()) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "bot", text: responseText },
    ]);
  };

  useEffect(() => {
    return () => {
      stopTyping();
      stopBotThinkingSound();
      stopUserPromptTypingSound();
    };
  }, [stopTyping, stopBotThinkingSound, stopUserPromptTypingSound]);

  return (
    <div
      className={`${terminalFont.className} relative h-[100dvh] overflow-hidden bg-[#080602] text-[#ffcc66]`}
    >
      <WaitlistGateScrim active={waitlistOpen} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_50%_45%,transparent_40%,rgba(0,0,0,0.55)_100%),radial-gradient(ellipse_100%_60%_at_50%_50%,rgba(255,190,90,0.06),transparent_55%)]" />
      <div className="scanlines pointer-events-none absolute inset-0 opacity-20" />

      <main
        inert={waitlistOpen ? true : undefined}
        className="relative z-10 mx-auto box-border flex h-full min-h-0 w-full max-w-5xl flex-col px-6 pb-6 pt-6 sm:px-10 sm:pb-8 sm:pt-10"
      >
        <header
          className="mb-5 shrink-0 flex items-center justify-between gap-3 border-b border-[#b8892e] pb-3 text-xs tracking-[0.25em] text-[#b8892e] sm:text-sm"
          aria-label={SHELL_UI.headerTitle}
        >
          <span className="text-base tracking-[0.25em] sm:hidden">
            {SHELL_UI.headerTitleShort}
          </span>
          <span className="hidden sm:inline">{SHELL_UI.headerTitle}</span>
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            {!waitlistOpen ? (
              <>
                <button
                  type="button"
                  onClick={openWaitlist}
                  className="cursor-pointer border-0 bg-transparent p-0 text-[0.65rem] tracking-[0.2em] text-[#7aab8a] underline decoration-[#4a6b58] underline-offset-4 transition hover:text-[#9fcbad] sm:text-xs"
                >
                  {WAITLIST_OVERLAY.headerReopenLabel}
                </button>
                <Link
                  href={LEGAL_ROUTES.privacyPolicy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.65rem] tracking-[0.2em] text-[#7aab8a] underline decoration-[#4a6b58] underline-offset-4 transition hover:text-[#9fcbad] sm:text-xs"
                >
                  {SHELL_UI.privacyPolicyLinkLabel}
                </Link>
              </>
            ) : null}
            <button
              type="button"
              onClick={toggleSoundEnabled}
              aria-pressed={soundEnabled}
              aria-label={soundEnabled ? "Turn audio feedback off" : "Turn audio feedback on"}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[#7aab8a] shadow-none ring-0 transition hover:text-[#9fcbad] focus:outline-none"
            >
              <AudioFeedbackIcon muted={!soundEnabled} />
            </button>
          </div>
        </header>

        <section
          ref={scrollRef}
          onScroll={updateStickToBottom}
          className="genta-chat-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain whitespace-pre-wrap wrap-break-word pr-1 text-[17px] leading-relaxed [text-shadow:0_0_8px_rgba(255,204,102,0.62)]"
        >
          {messages.map((m) => (
            <div className="mb-2.5" key={m.id}>
              {m.role === "user" ? (
                <>
                  <span>{USER_PREFIX}</span>
                  <span>{m.text}</span>
                </>
              ) : m.role === "system" ? (
                <>
                  <span className="text-[#4a6b58]">{SYSTEM_PREFIX}</span>
                  <span className="text-[#7aab8a]">{m.text}</span>
                </>
              ) : (
                <div className="ml-[2ch]">
                  <BotMessageBody raw={m.text} onDirective={handleInlineDirective} />
                </div>
              )}
            </div>
          ))}

          {revealingUserPrompt && (
            <div className="mb-2.5">
              <span>{USER_PREFIX}</span>
              <span>{draftUserText}</span>
              <span className="blink">▌</span>
            </div>
          )}

          {isTyping && (
            <div className="mb-2.5">
              <div className="ml-[2ch] text-[#b8892e]">
                <BotMessageBody
                  raw={draftBotText}
                  streaming={true}
                  onDirective={handleInlineDirective}
                />
                <span className="blink">▌</span>
              </div>
            </div>
          )}
        </section>

        <form
          className="mt-4 shrink-0 border-t border-[#4a6b58] bg-[#080602] pt-4"
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit(input);
          }}
        >
          <label className="sr-only" htmlFor="chat-input">
            Chat input
          </label>
          <div className="flex items-center gap-3">
            <span className="text-[#ffcc66]">{USER_PREFIX}</span>
            <input
              ref={inputRef}
              id="chat-input"
              name="genta-chat-prompt"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => {
                void unlock();
              }}
              disabled={isTyping || revealingUserPrompt}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="Type a prompt and press Enter..."
              className="w-full bg-transparent text-[#ffcc66] outline-none placeholder:text-[#b8892e]/60 disabled:opacity-40"
            />
            {isTyping ? (
              <button
                type="button"
                onClick={interruptAssistant}
                aria-label={SHELL_UI.interruptOutputAriaLabel}
                className="rounded border border-[#c45c5c] px-3 py-1 text-xs uppercase tracking-wider text-[#f0a0a0] transition hover:border-[#e08080] hover:text-[#ffc8c8]"
              >
                {SHELL_UI.interruptOutputLabel}
              </button>
            ) : null}
            <button
              type="submit"
              disabled={!canSubmit || revealingUserPrompt}
              className="rounded border border-[#b8892e] px-3 py-1 text-xs uppercase tracking-wider text-[#ffcc66] transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </form>
      </main>

      <WaitlistOverlay
        key={waitlistDialogEpoch}
        className={terminalFont.className}
        open={waitlistOpen}
        onDismiss={dismissWaitlist}
      />
    </div>
  );
}
