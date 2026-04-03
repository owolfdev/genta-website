# Genta — Knowledge Base for LLM Marketing Assistants

Use this document as **canonical product context** when drafting positioning, campaigns, landing copy, emails, social posts, or partner one-pagers. Prefer facts here over inference. When something is marked **planned** or **Release 2+**, do not describe it as shipping today unless a human confirms launch scope.

---

## Document purpose

- Ground messaging in **local-first privacy**, **offline resilience**, and **user-controlled** model and memory behavior.
- Respect **messaging guardrails** and **telemetry/privacy** claims; avoid language that implies no safeguards or unbounded risk.
- Distinguish **Release 1 (MVP)** from **later releases** so copy matches what is actually promised for launch.

---

## Product in one sentence

**Genta is a local-first desktop AI assistant** that keeps chat, tools, and persistent memory on the device by default, with optional cloud and hosted models as upgrades—not prerequisites.

---

## What Genta is

- **Desktop app**: Tauri shell with a Next.js (React) UI—an installable app, not “just a website.”
- **Local-first agent**: Conversation and orchestration are designed around **local SQLite + vector embeddings** for memory and retrieval (RAG on your machine).
- **Models**: Users can run **local models** (e.g. via **Ollama** in the Release 1 plan); a unified provider layer also supports cloud APIs and, in later releases, Genta-hosted models for paid tiers.
- **Memory that stays yours**: Memory types include profile, preferences, facts, tasks, and project notes—with metadata (source, timestamps, confidence, tags). **Writes from the agent in v1 are confirmed by the user** before persistence for auto-suggested memories; explicit “remember this” style commands persist.
- **Your documents, attributed**: Manual ingestion (Release 1 scope) includes **`.txt`, `.md`, `.pdf`**, and optionally a **single URL** when online—chunked, embedded, stored with **source attribution** (not a full web crawler).
- **Trust and control**: Designed UX includes mode visibility (`Local Only`, `Hybrid`, `Cloud`), per-response model disclosure, memory read/write visibility, filesystem/tool **guardrails**, and a **local-only lock**. Telemetry is **opt-in** and must not include prompts, memory body, or file contents (see Telemetry section).

---

## Who it is for (ICP)

**Primary ICP**: Privacy-conscious technical professionals who want **persistent AI assistance** without **default cloud exposure**.

**Early segments**:

- Independent developers and founders  
- Security- and privacy-aware operators and researchers  
- Power users who need **offline** or **internet-optional** use (travel, unreliable networks, restricted environments)

**Not the primary early focus**: Casual users who expect **fully managed, zero-configuration** AI with no local setup tradeoffs—be honest about guided setup and local runtime expectations where relevant.

---

## Killer use case (v1 narrative)

**“An offline-capable AI companion you can get talking quickly—without treating the cloud as the default.”**

Supporting story beats (align with product, not hype):

- **Time-to-value**: Success criteria in-product include reaching **first local response within ~5 minutes** on supported hardware (Release 1 goal).
- **Same session offline**: User can **keep chatting with a local model while offline** once configured.
- **Clarity under setup**: Low-friction installer and **clear progress** during model setup (Ollama detection, guided flow, one-click model download where applicable).

---

## Release boundaries (do not conflate)

### Release 1 — Offline-first foundation (current MVP direction)

- Guided local setup; **Ollama** integration with install detection and model recommendation by device profile (`eco` / `balanced` / `performance`).
- **Local-only default** with clear trust indicators; **local-only lock**.
- **Local memory**: save / confirm / retrieve with retrieval caps and transparency.
- **Manual ingestion v1** (files + optional single URL) with attribution.
- **Security baseline**: filesystem/tool limits, encryption metadata path (keychain-backed) as specified in mission.
- **Telemetry**: opt-in; KPIs for activation and trust (no content in telemetry).

### Release 2 — Hybrid and cloud expansion (future positioning)

- Genta **hosted cloud models** (paid) with entitlements.
- **Optional encrypted cloud sync** across devices.
- Hybrid routing presets (e.g. privacy-first vs balanced vs quality).

### Release 3 — Add-ons and scale (future positioning)

- Multimodal add-ons (image, vision, speech), mobile companion, LAN bridge concepts, broader adapters—**future roadmap**, not current MVP claims.

When writing “available now” or “download today,” **verify** against actual build—this doc describes **intent and plan**, not a live feature audit.

---

## Differentiation (safe framing)

- **Local-first / private by default**: Memory and core chat+RAG are designed to work **on device** without sending data off-machine in local mode.
- **Internet-optional operation**: Strong story for travel, outages, and sensitive environments—paired with honest setup steps for local models.
- **User-controlled model behavior**: User chooses or is guided to models and modes; disclosures and locks reinforce **agency**.
- **Persistent, inspectable memory**: Not ephemeral chat only—memory is **governed**, **inspectable**, and **reversible** from a management UX (design intent).
- **Transparent trust UX**: Badges, disclosures, and memory indicators—marketing can echo **transparency** rather than vague “trust us.”

Avoid claiming superiority over named competitors unless given separate approved competitive messaging.

---

## Monetization (high-level, accurate)

**Free tier (design intent)**

- Bring your own providers / **local models**.
- Full **local memory** persistence and retrieval.
- **Offline** operation for core chat + RAG.

**Paid tier (design intent)**

- Access to **Genta-managed hosted model pool**.
- **Optional encrypted cloud sync** for cross-device memory.
- Curated model/orchestration options.

**Stripe** for billing; **Supabase** for auth and sync metadata; **offline grace** for paid features is part of the design—do not promise unlimited offline paid cloud access without checking current policy copy.

For **future** GTM pricing shapes (e.g. entry tiers with caps), see `dev_docs/go_to_market.md`—treat dollar amounts and tier names as **planning inputs**, not finalized public pricing until approved.

---

## Messaging guardrails (required)

**Preferred language** (from go-to-market doc):

- “User-controlled model behavior”
- “Local-first and private by default”
- “Internet-optional operation”

**Avoid in public-facing copy**

- “Censorship-free,” “unfiltered,” or any wording that implies **absence of safeguards** or encouragement of harm.
- Implying **no telemetry** if product offers **opt-in** analytics—say **opt-in**, **disabled by default**, and **no prompt/content** in allowed telemetry.
- Promising **zero setup** if speaking to Release 1—guided setup is part of the value proposition.

---

## Telemetry and privacy (claims you can make carefully)

- **Opt-in only** for analytics/telemetry; off until consent.
- **Allowed**: funnel events, counters, performance timings, crash diagnostics.
- **Not allowed**: prompt text, memory content, file contents, raw conversation bodies, secrets.
- **User controls**: toggle, retention notice, local log purge (as specified in GTM).

Do not state “we never collect anything” if crash or opt-in analytics exist—use the precise policy above.

---

## UX principles (tone and experience)

- Clarity first: one primary purpose per screen.
- Progressive complexity: advanced options when needed.
- Fast feedback: loading, success, error states.
- **Zero-confusion onboarding**: user can **chat before full setup** (reduce abandonment; still be honest about full local value after setup).

---

## KPIs and campaigns (optional context)

Early funnel stages include install → first launch → first response → **local-only confirmed** → model selected → first memory write/retrieve → day-2 return. Campaigns can align with **activation** and **trust** metrics (e.g. share staying in local-only, cloud opt-in after prompts)—see `dev_docs/go_to_market.md` for targets and cohort ideas.

---

## Open product questions (do not invent answers)

Examples from design/GTM that are still **TBD** for external comms:

- Exact MVP vs post-MVP feature list for first public launch  
- Final ICP priority and channel plan for first ~50 users  
- Paid entitlement grace period details for offline users  
- Final default bundled model artifacts and licenses  
- Confirmed v1 list of local runtimes beyond Ollama emphasis  

When uncertain, **omit** or say “details at launch” rather than fabricate.

---

## Related canonical docs

| Doc | Use |
|-----|-----|
| `dev_docs/design.md` | Product intent, memory policy, monetization sketch |
| `dev_docs/go_to_market.md` | ICP, funnel, KPIs, messaging guardrails, telemetry |
| `dev_docs/roadmap.md` | Release 1/2/3 scope |
| `dev_docs/architecture.md` | Subsystems, routing modes, ingestion limits |
| `dev_docs/_mission.md` | Active implementation mission and DoD |

---

## Revision note

Update this file when **release scope**, **ICP**, **messaging guardrails**, or **pricing** change materially so marketing assistants stay aligned with the team.
