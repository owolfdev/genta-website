"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Share_Tech_Mono } from "next/font/google";
import { getMockResponse } from "@/lib/mockResponder";
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

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: "system",
      text: "GENTA shell mock online. API mode: offline.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [draftBotText, setDraftBotText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { soundEnabled, toggleSoundEnabled, unlock, playSend, playDone, startTyping, stopTyping } =
    useShellSound();

  const canSubmit = useMemo(() => input.trim().length > 0 && !isTyping, [input, isTyping]);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, draftBotText]);

  const onSubmit = async (rawText: string) => {
    const text = rawText.trim();
    if (!text || isTyping) {
      return;
    }

    await unlock();
    playSend();
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text }]);
    setInput("");

    const responseText = getMockResponse(text);
    setIsTyping(true);
    setDraftBotText("");
    startTyping();

    for (let i = 1; i <= responseText.length; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 14));
      setDraftBotText(responseText.slice(0, i));
    }

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "bot", text: responseText },
    ]);
    stopTyping();
    playDone();
    setDraftBotText("");
    setIsTyping(false);
  };

  useEffect(() => {
    return () => {
      stopTyping();
    };
  }, [stopTyping]);

  return (
    <div
      className={`${terminalFont.className} relative min-h-screen overflow-hidden bg-[#080602] text-[#ffcc66]`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_50%_45%,transparent_40%,rgba(0,0,0,0.55)_100%),radial-gradient(ellipse_100%_60%_at_50%_50%,rgba(255,190,90,0.06),transparent_55%)]" />
      <div className="scanlines pointer-events-none absolute inset-0 opacity-20" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col p-6 sm:p-10">
        <header className="mb-5 flex items-center justify-between gap-3 border-b border-[#b8892e] pb-3 text-xs tracking-[0.25em] text-[#b8892e] sm:text-sm">
          <span>GENTA // LOCAL-FIRST SUBSTRATE // MOCK MODE</span>
          <button
            type="button"
            onClick={toggleSoundEnabled}
            className="rounded border border-[#4a6b58] px-2 py-1 text-[10px] tracking-[0.2em] text-[#7aab8a] transition hover:border-[#7aab8a] hover:text-[#9fcbad]"
          >
            {soundEnabled ? "SOUND ON" : "SOUND OFF"}
          </button>
        </header>

        <section
          ref={scrollRef}
          className="flex-1 overflow-y-auto whitespace-pre-wrap wrap-break-word pr-1 text-[17px] leading-relaxed [text-shadow:0_0_8px_rgba(255,204,102,0.62)]"
        >
          {messages.map((m) => (
            <p className="mb-2.5" key={m.id}>
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
                <span className="ml-[2ch] text-[#b8892e]">{m.text}</span>
              )}
            </p>
          ))}

          {isTyping && (
            <p className="mb-2.5">
              <span className="ml-[2ch] text-[#b8892e]">
                {draftBotText}
                <span className="blink">▌</span>
              </span>
            </p>
          )}
        </section>

        <form
          className="mt-4 border-t border-[#4a6b58] pt-4"
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
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => {
                void unlock();
              }}
              placeholder="Type a prompt and press Enter..."
              className="w-full bg-transparent text-[#ffcc66] outline-none placeholder:text-[#b8892e]/60"
            />
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded border border-[#b8892e] px-3 py-1 text-xs uppercase tracking-wider text-[#ffcc66] transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
