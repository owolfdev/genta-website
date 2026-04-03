# Marketing welcome — extended terminal copy

Draft on-screen welcome for the Genta marketing experience. Tone: **terminal-native**, confident, honest about what ships vs what’s planned. For facts and guardrails, see [`marketing_assistant_knowledge.md`](marketing_assistant_knowledge.md).

---

## Full message (extended)

```text
@system
GENTA TERMINAL INIT // SESSION SECURE // STREAM CHANNEL ONLINE
HANDSHAKE OK // LOCAL-FIRST POLICY LOADED // DISCLOSURE ENGINE ARMED
@end

Local-first AI assistant for desktop—where your chat, tools, and memory stay on your device by default, not on someone else’s server. Cloud isn’t the starting point; it’s an upgrade path when you choose it.

# Private by default: run models locally; cloud stays optional.
# Your files and notes in one place—ingest `.txt`, `.md`, `.pdf`, and (when online) a single URL; chunks stay attributed so you know what the model saw.
# Pick the stack that fits you: model-agnostic design, local runtimes like Ollama with guided setup—eco / balanced / performance profiles so you’re not guessing in the dark.
# Memory you can reason about: profile, prefs, facts, tasks, project notes—with metadata and guardrails; auto-suggested writes ask before they stick; “remember this” still works when you mean it.
# Modes you can see: Local Only, Hybrid, Cloud—badges and disclosures so you’re never guessing which world answered.
# Offline-capable once you’re set up: same session can keep going without treating the network as a crutch.
# Telemetry is opt-in—no prompts, memory bodies, or file contents in the analytics story we’re building. If we measure funnels, we measure behavior, not your thoughts.

@system
// ROADMAP HINT: hosted models, encrypted sync, broader surfaces = later releases.
// VERIFY “download today” claims against the actual build before you ship hero copy.
@end

Built for people who want persistent help without default cloud exposure: builders, founders, security-minded folks, anyone who’s lived through a dead Wi‑Fi day and still needed answers.

# Tool and filesystem access stays bounded—this is an assistant with brakes, not a runaway root shell.
# Goal: first local response in minutes on capable hardware, with a setup flow that shows progress instead of a black box.

Want early access? Tap @waitlist.

@ascii-draw
  ____ _____ _   _ _____  _    
 / ___| ____| \ | |_   _|/ \   
| |  _|  _| |  \| | | | / _ \  
| |_| | |___| |\  | | |/ ___ \ 
 \____|_____|_| \_| |_/_/   \_\
@end

@system
END TRANSMISSION // STAY CURIOUS // OWN YOUR STACK
@end
```

---

## Shorter variant (if the viewport is tight)

Use the original three `#` lines plus the first paragraph under `@system`, the ASCII block, and a single `@waitlist` line—drop the second `@system` block and the “Built for people…” paragraph.

---

## Placeholders

- **`@waitlist`** — replace with the real waitlist control or link target used in the UI.
- **`@ascii-draw` … `@end`** — keep or swap for a responsive logo mark if the ASCII art doesn’t fit small screens.
