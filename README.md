# Genta — marketing website

Public marketing site for **Genta**, a local-first desktop AI assistant: chat, tools, and persistent memory on the device by default, with optional cloud and hosted models as upgrades—not prerequisites.

This repo is **not** the Genta desktop app (that ships as a Tauri + Next.js installable); it is the web presence for positioning, landing pages, and campaigns.

## Canonical copy and product context

For messaging guardrails, release boundaries (MVP vs later), telemetry claims, and ICP, use:

[`docs/marketing_assistant_knowledge.md`](docs/marketing_assistant_knowledge.md)

## Development

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Stack

[Next.js](https://nextjs.org) (App Router), React, TypeScript, Tailwind CSS.
