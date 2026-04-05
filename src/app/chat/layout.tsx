import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terminal chat",
  description:
    "Try the Genta assistant in your browser — local-first AI, terminal-style chat.",
  openGraph: {
    title: "Terminal chat · Genta",
    description:
      "Try the Genta assistant in your browser — local-first AI, terminal-style chat.",
    url: "/chat",
  },
  twitter: {
    title: "Terminal chat · Genta",
    description:
      "Try the Genta assistant in your browser — local-first AI, terminal-style chat.",
  },
};

export default function ChatLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
