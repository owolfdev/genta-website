"use client";

import { Fragment } from "react";
import {
  parseBotProtocolToSegments,
  stripIncompleteBotProtocol,
} from "@/lib/botProtocol";
import { parseInlineBotDirectives, type BotInlineChunk } from "@/lib/botDirectives";
import { BOT_INLINE_DIRECTIVES } from "@/lib/shellConfig";

const SYSTEM_PREFIX = "# ";

/** `@waitlist` etc.: reads as normal inline copy; underline signals clickability (no chip outline). */
const inlineBotDirectiveClass =
  "inline cursor-pointer border-0 bg-transparent p-0 align-baseline font-inherit text-inherit underline decoration-[#5a7a66] underline-offset-2 transition hover:decoration-[#7aab8a] hover:text-[#e8c266]";

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
  if (chunk.kind === "directive" && chunk.name === "clear") {
    return <span className="my-8 block w-full shrink-0" aria-hidden />;
  }
  const known = BOT_INLINE_DIRECTIVES[chunk.name as keyof typeof BOT_INLINE_DIRECTIVES];
  if (known && onDirective) {
    return (
      <button
        type="button"
        onClick={() => onDirective(chunk.name)}
        aria-label={known.ariaLabel}
        className={inlineBotDirectiveClass}
      >
        {known.label}
      </button>
    );
  }
  return <Fragment>{chunk.raw}</Fragment>;
}

export function BotMessageBody({
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
              <span className="text-[#7aab8a] [text-shadow:0_0_8px_rgba(122,171,138,0.42)]">
                {seg.text}
              </span>
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
