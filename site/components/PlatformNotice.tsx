"use client";

import { useEffect, useState } from "react";
import { platformById } from "@/lib/platforms";

function label(leaf: string): string {
  return leaf.split("/").filter(Boolean).join(" ");
}

export function PlatformNotice() {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const missing = q.get("missing");
    if (!missing) return;
    const platform = platformById(q.get("platform"));
    const title = platform?.title ?? "this platform";
    setText(`${title} has no ${label(missing)} page, so this is the ${title} SDK hub.`);
  }, []);
  if (!text) return null;
  return (
    <p className="platform-notice" role="status">
      {text}
    </p>
  );
}
