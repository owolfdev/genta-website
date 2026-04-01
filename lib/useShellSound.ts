"use client";

import { useCallback, useRef, useState } from "react";
import { SHELL_SOUNDS } from "./soundConfig";

type AudioState = {
  ctx: AudioContext;
  typingTimer: number | null;
  ambientEl: HTMLAudioElement | null;
  botTypingEl: HTMLAudioElement | null;
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
        ambientEl: null,
        botTypingEl: null,
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
      nextVolume: number,
      nextLoop: boolean,
    ) => {
      if (!current) {
        return makeEl(nextSrc, nextVolume, nextLoop);
      }
      const currentPath = new URL(current.src, window.location.origin).pathname;
      if (currentPath !== nextSrc) {
        current.pause();
        return makeEl(nextSrc, nextVolume, nextLoop);
      }
      current.volume = nextVolume;
      current.loop = nextLoop;
      return current;
    };

    state.ambientEl = syncEl(
      state.ambientEl,
      SHELL_SOUNDS.ambient.src,
      SHELL_SOUNDS.ambient.volume,
      SHELL_SOUNDS.ambient.loop,
    );
    state.botTypingEl = syncEl(
      state.botTypingEl,
      SHELL_SOUNDS.botTyping.src,
      SHELL_SOUNDS.botTyping.volume,
      SHELL_SOUNDS.botTyping.loop,
    );
    state.userPromptTypingEl = syncEl(
      state.userPromptTypingEl,
      SHELL_SOUNDS.userPromptTyping.src,
      SHELL_SOUNDS.userPromptTyping.volume,
      SHELL_SOUNDS.userPromptTyping.loop,
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

    if (soundEnabled && state.ambientEl) {
      try {
        await state.ambientEl.play();
      } catch {
        // User gesture policies can still reject play in edge cases.
      }
    }
  }, [ensureMedia, soundEnabled]);

  const stopAllMedia = useCallback(() => {
    const state = stateRef.current;
    if (!state) {
      return;
    }
    for (const el of [state.ambientEl, state.botTypingEl, state.userPromptTypingEl]) {
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

  const startAmbient = useCallback(async () => {
    const state = await ensureMedia();
    if (!state || !soundEnabled || !state.ambientEl) {
      return;
    }
    try {
      await state.ambientEl.play();
    } catch {
      // Fallback behavior handled by other cues.
    }
  }, [ensureMedia, soundEnabled]);

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

  const startTyping = useCallback(async () => {
    if (!soundEnabled) {
      return;
    }
    const state = await ensureMedia();
    if (!state) {
      return;
    }
    if (state.botTypingEl) {
      if (!state.botTypingEl.paused) {
        return;
      }
      state.botTypingEl.currentTime = 0;
      try {
        await state.botTypingEl.play();
        return;
      } catch {
        // Fall through to synth typing.
      }
    }
    if (state.ctx.state !== "running" || state.typingTimer != null) {
      return;
    }
    state.typingTimer = window.setInterval(() => {
      const freq = 220 + Math.random() * 120;
      beep(state.ctx, freq, 20, 0.008);
    }, 38);
  }, [ensureMedia, soundEnabled]);

  const stopTyping = useCallback(() => {
    const state = stateRef.current;
    if (!state) {
      return;
    }
    if (state.botTypingEl && !state.botTypingEl.paused) {
      state.botTypingEl.pause();
      state.botTypingEl.currentTime = 0;
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
      } else {
        void startAmbient();
      }
      return next;
    });
  }, [startAmbient, stopAllMedia]);

  const playDone = useCallback(() => {
    // Intentionally unused: no cue after bot finishes (avoids second sound).
  }, []);

  return {
    soundEnabled,
    toggleSoundEnabled,
    unlock,
    startAmbient,
    playSend,
    startUserPromptTypingSound,
    stopUserPromptTypingSound,
    playDone,
    startTyping,
    stopTyping,
    stopAllMedia,
  };
}
