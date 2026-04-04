import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terminal chat",
  description:
    "Try the Genta assistant in your browser — local-first AI positioning, interactive terminal demo.",
};

export default function ChatLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
