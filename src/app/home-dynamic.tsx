"use client";

import dynamic from "next/dynamic";

const HomeClient = dynamic(() => import("./home-client"), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-dvh bg-[#080602]"
      aria-busy="true"
      aria-label="Loading"
    />
  ),
});

export default function HomeDynamic() {
  return <HomeClient />;
}
