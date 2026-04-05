import { ImageResponse } from "next/og";

export const alt = "Genta — local-first AI assistant";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#080602";
const ACCENT = "#ffcc66";
const MUTED = "#c9a85e";
const BORDER = "#b8892e";

const TAGLINE =
  "Local-first AI assistant for desktop and mobile — your chat, tools, and memory on your device by default.";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 72,
          paddingRight: 72,
          backgroundColor: BG,
          borderTop: `solid 8px ${BORDER}`,
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 400,
            color: ACCENT,
            letterSpacing: "0.28em",
            marginBottom: 28,
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          }}
        >
          GENTA
        </div>
        <div
          style={{
            fontSize: 34,
            color: MUTED,
            lineHeight: 1.38,
            maxWidth: 920,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {TAGLINE}
        </div>
      </div>
    ),
    { ...size },
  );
}
