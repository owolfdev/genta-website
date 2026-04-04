"use client";

import dynamic from "next/dynamic";

const ChatClient = dynamic(() => import("./chat-client"), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-dvh bg-[#080602]"
      aria-busy="true"
      aria-label="Loading"
    />
  ),
});

export default function ChatDynamic() {
  return <ChatClient />;
}
