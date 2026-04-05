"use client";

import { useEffect, useState } from "react";
import { LAUNCH_COUNTDOWN } from "@/lib/shellConfig";

function pad3(n: number) {
  return String(Math.max(0, n)).padStart(3, "0");
}

function pad2(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function remainingParts(totalMs: number) {
  if (totalMs <= 0) {
    return null;
  }
  let ms = totalMs;
  const days = Math.floor(ms / 86_400_000);
  ms %= 86_400_000;
  const hours = Math.floor(ms / 3_600_000);
  ms %= 3_600_000;
  const minutes = Math.floor(ms / 60_000);
  ms %= 60_000;
  const seconds = Math.floor(ms / 1000);
  const millis = Math.floor(ms % 1000);
  return { days, hours, minutes, seconds, millis };
}

export function MothershipCountdown() {
  const targetMs = Date.parse(LAUNCH_COUNTDOWN.targetIso);
  const [now, setNow] = useState(() => Date.now());
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!mounted || Number.isNaN(targetMs)) {
      return;
    }
    const tick = () => setNow(Date.now());
    tick();
    const ms = reduceMotion ? 1000 : 50;
    const id = window.setInterval(tick, ms);
    return () => window.clearInterval(id);
  }, [mounted, reduceMotion, targetMs]);

  if (!mounted || Number.isNaN(targetMs)) {
    return (
      <div
        className="mx-auto mt-10 max-w-xl border border-[#4a6b58]/70 bg-[#0c0a06]/95 px-4 py-5 sm:px-6"
        aria-hidden
      >
        <div className="h-[4.5rem] animate-pulse bg-[#1a1814]/80" />
      </div>
    );
  }

  const diff = targetMs - now;
  const parts = remainingParts(diff);
  const ariaLabel = parts
    ? `Time until launch: ${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes, ${parts.seconds} seconds`
    : "Launch window elapsed";

  return (
    <div
      className="mx-auto mt-10 max-w-xl border border-[#4a6b58]/80 bg-[#080602]/95 px-4 py-5 shadow-[inset_0_0_24px_rgba(77,171,138,0.06)] sm:px-6"
      role="timer"
      aria-label={ariaLabel}
    >
      <p className="text-center text-[0.6rem] tracking-[0.28em] text-[#5a8a72] sm:text-[0.65rem]">
        {LAUNCH_COUNTDOWN.statusLine}
      </p>
      <p className="mt-1 text-center text-[0.55rem] tracking-[0.35em] text-[#4a6b58] sm:text-[0.6rem]">
        {LAUNCH_COUNTDOWN.subLine}
      </p>

      {!parts ? (
        <p className="mt-5 text-center text-sm tracking-[0.2em] text-[#7dd3c0] [text-shadow:0_0_12px_rgba(125,211,192,0.35)]">
          {LAUNCH_COUNTDOWN.completeLine}
        </p>
      ) : (
        <div className="mt-5 font-[inherit]">
          <div
            className="flex flex-wrap items-end justify-center gap-x-3 gap-y-2 tabular-nums sm:gap-x-5"
            aria-hidden
          >
            <div className="text-center">
              <div className="text-xl text-[#7dd3c0] [text-shadow:0_0_14px_rgba(125,211,192,0.45)] sm:text-2xl">
                {pad3(parts.days)}
              </div>
              <div className="mt-1 text-[0.55rem] tracking-[0.25em] text-[#5a8a72]">DAY</div>
            </div>
            <span className="hidden pb-6 text-[#4a6b58] sm:inline" aria-hidden>
              :
            </span>
            <div className="text-center">
              <div className="text-xl text-[#7dd3c0] [text-shadow:0_0_14px_rgba(125,211,192,0.45)] sm:text-2xl">
                {pad2(parts.hours)}
              </div>
              <div className="mt-1 text-[0.55rem] tracking-[0.25em] text-[#5a8a72]">HR</div>
            </div>
            <span className="hidden pb-6 text-[#4a6b58] sm:inline" aria-hidden>
              :
            </span>
            <div className="text-center">
              <div className="text-xl text-[#7dd3c0] [text-shadow:0_0_14px_rgba(125,211,192,0.45)] sm:text-2xl">
                {pad2(parts.minutes)}
              </div>
              <div className="mt-1 text-[0.55rem] tracking-[0.25em] text-[#5a8a72]">MIN</div>
            </div>
            <span className="hidden pb-6 text-[#4a6b58] sm:inline" aria-hidden>
              :
            </span>
            <div className="text-center">
              <div className="text-xl text-[#7dd3c0] [text-shadow:0_0_14px_rgba(125,211,192,0.45)] sm:text-2xl">
                {pad2(parts.seconds)}
              </div>
              <div className="mt-1 text-[0.55rem] tracking-[0.25em] text-[#5a8a72]">SEC</div>
            </div>
            {!reduceMotion ? (
              <>
                <span className="hidden pb-6 text-[#4a6b58] sm:inline" aria-hidden>
                  :
                </span>
                <div className="text-center">
                  <div className="text-lg text-[#9ae5d4]/90 [text-shadow:0_0_10px_rgba(154,229,212,0.35)] sm:text-xl">
                    {pad3(parts.millis)}
                  </div>
                  <div className="mt-1 text-[0.55rem] tracking-[0.25em] text-[#5a8a72]">MS</div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
