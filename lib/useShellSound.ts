"use client";

import { useCallback, useRef, useState } from "react";
import { SHELL_SOUNDS } from "./soundConfig";

type AudioState = {
  ctx: AudioContext;
  typingTimer: number | null;
  botThinkingEl: HTMLAudioElement | null;
  botTypingEl: HTMLAudioElement | null;
  systemStreamTypingEl: HTMLAudioElement | null;
  userPromptTypingEl: HTMLAudioElement | null;
};

function beep(ctx: AudioContext, frequency: number, durationMs: number, gainValue: number) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "square";
  osc.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(gainValue, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + durationMs / 1000);
}

export function useShellSound() {
  const stateRef = useRef<AudioState | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const getOrCreate = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }
    if (!stateRef.current) {
      const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) {
        return null;
      }
      stateRef.current = {
        ctx: new Ctor(),
        typingTimer: null,
        botThinkingEl: null,
        botTypingEl: null,
        systemStreamTypingEl: null,
        userPromptTypingEl: null,
      };
    }
    return stateRef.current;
  }, []);

  const ensureMedia = useCallback(async () => {
    const state = getOrCreate();
    if (!state) {
      return null;
    }

    const makeEl = (src: string, volume: number, loop: boolean) => {
      const el = new Audio(src);
      el.volume = volume;
      el.loop = loop;
      el.preload = "auto";
      return el;
    };

    const syncEl = (
      current: HTMLAudioElement | null,
      nextSrc: string,
      nextVolume: number | null,
      nextLoop: boolean,
      createVolumeFallback: number,
    ) => {
      const volForNew = nextVolume ?? createVolumeFallback;
      if (!current) {
        return makeEl(nextSrc, volForNew, nextLoop);
      }
      const currentPath = new URL(current.src, window.location.origin).pathname;
      if (currentPath !== nextSrc) {
        current.pause();
        return makeEl(nextSrc, volForNew, nextLoop);
      }
      if (nextVolume !== null) {
        current.volume = nextVolume;
      }
      current.loop = nextLoop;
      return current;
    };

    state.botThinkingEl = syncEl(
      state.botThinkingEl,
      SHELL_SOUNDS.botThinking.src,
      SHELL_SOUNDS.botThinking.volume,
      SHELL_SOUNDS.botThinking.loop,
      SHELL_SOUNDS.botThinking.volume,
    );
    state.botTypingEl = syncEl(
      state.botTypingEl,
      SHELL_SOUNDS.botTyping.src,
      SHELL_SOUNDS.botTyping.volume,
      SHELL_SOUNDS.botTyping.loop,
      SHELL_SOUNDS.botTyping.volume,
    );
    state.systemStreamTypingEl = syncEl(
      state.systemStreamTypingEl,
      SHELL_SOUNDS.systemStreamTyping.src,
      SHELL_SOUNDS.systemStreamTyping.volume,
      SHELL_SOUNDS.systemStreamTyping.loop,
      SHELL_SOUNDS.systemStreamTyping.volume,
    );
    state.userPromptTypingEl = syncEl(
      state.userPromptTypingEl,
      SHELL_SOUNDS.userPromptTyping.src,
      SHELL_SOUNDS.userPromptTyping.volume,
      SHELL_SOUNDS.userPromptTyping.loop,
      SHELL_SOUNDS.userPromptTyping.volume,
    );

    return state;
  }, [getOrCreate]);

  const unlock = useCallback(async () => {
    const state = await ensureMedia();
    if (!state) {
      return;
    }
    if (state.ctx.state !== "running") {
      await state.ctx.resume();
    }
  }, [ensureMedia]);

  const stopAllMedia = useCallback(() => {
    const state = stateRef.current;
    if (!state) {
      return;
    }
    for (const el of [state.botThinkingEl, state.botTypingEl, state.systemStreamTypingEl, state.userPromptTypingEl]) {
      if (!el) {
        continue;
      }
      el.pause();
      if (!el.loop) {
        el.currentTime = 0;
      }
    }
    if (state.typingTimer != null) {
      window.clearInterval(state.typingTimer);
      state.typingTimer = null;
    }
  }, []);

  const playSend = useCallback(() => {
    // Intentionally muted for now; keeping hook API stable for later UX pass.
  }, []);

  const startUserPromptTypingSound = useCallback(async () => {
    if (!soundEnabled) {
      return;
    }
    const state = await ensureMedia();
    if (!state?.userPromptTypingEl) {
      return;
    }
    state.userPromptTypingEl.currentTime = 0;
    try {
      await state.userPromptTypingEl.play();
    } catch {
      // Autoplay / decode edge cases.
    }
  }, [ensureMedia, soundEnabled]);

  const stopUserPromptTypingSound = useCallback(() => {
    const state = stateRef.current;
    if (!state?.userPromptTypingEl || state.userPromptTypingEl.paused) {
      return;
    }
    state.userPromptTypingEl.pause();
    state.userPromptTypingEl.currentTime = 0;
  }, []);

  const startBotThinkingSound = useCallback(async () => {
    if (!soundEnabled) {
      return;
    }
    const state = await ensureMedia();
    if (!state?.botThinkingEl) {
      return;
    }
    if (state.botTypingEl && !state.botTypingEl.paused) {
      state.botTypingEl.pause();
      state.botTypingEl.currentTime = 0;
    }
    if (state.systemStreamTypingEl && !state.systemStreamTypingEl.paused) {
      state.systemStreamTypingEl.pause();
      state.systemStreamTypingEl.currentTime = 0;
    }
    state.botThinkingEl.currentTime = 0;
    try {
      await state.botThinkingEl.play();
    } catch {
      /* ignore */
    }
  }, [ensureMedia, soundEnabled]);

  const stopBotThinkingSound = useCallback(() => {
    const state = stateRef.current;
    if (!state?.botThinkingEl || state.botThinkingEl.paused) {
      return;
    }
    state.botThinkingEl.pause();
    state.botThinkingEl.currentTime = 0;
  }, []);

  const startStreamTypingSound = useCallback(
    async (kind: "bot" | "system") => {
      if (!soundEnabled) {
        return;
      }
      const state = await ensureMedia();
      if (!state) {
        return;
      }
      if (state.typingTimer != null) {
        window.clearInterval(state.typingTimer);
        state.typingTimer = null;
      }
      if (state.botThinkingEl && !state.botThinkingEl.paused) {
        state.botThinkingEl.pause();
        state.botThinkingEl.currentTime = 0;
      }
      if (kind === "bot") {
        if (state.systemStreamTypingEl && !state.systemStreamTypingEl.paused) {
          state.systemStreamTypingEl.pause();
          state.systemStreamTypingEl.currentTime = 0;
        }
        if (state.botTypingEl && !state.botTypingEl.paused) {
          return;
        }
        if (state.botTypingEl) {
          state.botTypingEl.currentTime = 0;
          try {
            await state.botTypingEl.play();
            return;
          } catch {
            /* fall through to synth */
          }
        }
      } else {
        if (state.botTypingEl && !state.botTypingEl.paused) {
          state.botTypingEl.pause();
          state.botTypingEl.currentTime = 0;
        }
        if (state.systemStreamTypingEl && !state.systemStreamTypingEl.paused) {
          return;
        }
        if (state.systemStreamTypingEl) {
          state.systemStreamTypingEl.currentTime = 0;
          try {
            await state.systemStreamTypingEl.play();
            return;
          } catch {
            /* fall through to softer synth */
          }
        }
      }
      if (state.ctx.state !== "running" || state.typingTimer != null) {
        return;
      }
      const vol = kind === "system" ? 0.005 : 0.008;
      state.typingTimer = window.setInterval(() => {
        const freq = kind === "system" ? 180 + Math.random() * 80 : 220 + Math.random() * 120;
        beep(state.ctx, freq, 20, vol);
      }, kind === "system" ? 42 : 38);
    },
    [ensureMedia, soundEnabled],
  );

  /** @deprecated Prefer `startStreamTypingSound("bot")` for new code. */
  const startTyping = useCallback(async () => startStreamTypingSound("bot"), [startStreamTypingSound]);

  const stopTyping = useCallback(() => {
    const state = stateRef.current;
    if (!state) {
      return;
    }
    if (state.botThinkingEl && !state.botThinkingEl.paused) {
      state.botThinkingEl.pause();
      state.botThinkingEl.currentTime = 0;
    }
    if (state.botTypingEl && !state.botTypingEl.paused) {
      state.botTypingEl.pause();
      state.botTypingEl.currentTime = 0;
    }
    if (state.systemStreamTypingEl && !state.systemStreamTypingEl.paused) {
      state.systemStreamTypingEl.pause();
      state.systemStreamTypingEl.currentTime = 0;
    }
    if (state.typingTimer == null) {
      return;
    }
    window.clearInterval(state.typingTimer);
    state.typingTimer = null;
  }, []);

  const toggleSoundEnabled = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (!next) {
        stopAllMedia();
      }
      return next;
    });
  }, [stopAllMedia]);

  const playDone = useCallback(() => {
    // Intentionally unused: no cue after bot finishes (avoids second sound).
  }, []);

  return {
    soundEnabled,
    toggleSoundEnabled,
    unlock,
    playSend,
    startUserPromptTypingSound,
    stopUserPromptTypingSound,
    playDone,
    startBotThinkingSound,
    stopBotThinkingSound,
    startStreamTypingSound,
    startTyping,
    stopTyping,
    stopAllMedia,
  };
}
