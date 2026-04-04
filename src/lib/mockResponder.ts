const RESPONSES: { test: RegExp; output: string[] }[] = [
  {
    test: /(hello|hi|hey)/i,
    output: [
      "Hello. GENTA shell is in mock mode and ready for interaction.",
      "Signal received. Design sandbox is live.",
    ],
  },
  {
    test: /(who are you|what are you)/i,
    output: [
      "I am a local mock persona for shell design and interaction testing.",
      "This is a preconfigured response engine, not the production model.",
    ],
  },
  {
    test: /(api|backend|server)/i,
    output: [
      "API path is intentionally disconnected for now. UI behavior is local-only.",
      "When ready, swap the mock adapter with the chat transport implementation.",
    ],
  },
  {
    test: /(design|style|theme|look)/i,
    output: [
      "Theme profile: amber phosphor, CRT scanlines, monospaced terminal rhythm.",
      "Adjusting pacing and typography now will reduce rework once API mode is enabled.",
    ],
  },
];

const FALLBACK = [
  "Acknowledged. This response is preconfigured for shell testing.",
  "Mock channel active — local shell testing only; production uses the configured chat API.",
  "Input accepted. Prototype behavior currently runs on deterministic rules.",
];

function pickRandom(items: string[]): string {
  return items[Math.floor(Math.random() * items.length)] ?? "";
}

export function getMockResponse(input: string): string {
  for (const group of RESPONSES) {
    if (group.test.test(input)) {
      return pickRandom(group.output);
    }
  }
  return pickRandom(FALLBACK);
}
