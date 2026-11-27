"use client";

import { useEffect, useId, useState } from "react";
import {
  equivalentHref,
  parseSdkPath,
  platformById,
  platforms,
  readStoredPlatform,
  storePlatform,
} from "@/lib/platforms";

export function PlatformSwitcher({
  path,
  sdkSlugs,
  placement,
}: {
  path: string;
  sdkSlugs: string[];
  placement: "header" | "sidebar";
}) {
  const labelId = useId();
  const fromPath = parseSdkPath(path)?.platformId ?? null;
  const [value, setValue] = useState(fromPath ?? "");

  useEffect(() => {
    if (fromPath) {
      storePlatform(fromPath);
      setValue(fromPath);
      return;
    }
    const q = new URLSearchParams(window.location.search).get("platform");
    if (platformById(q)) {
      storePlatform(q!);
      setValue(q!);
      return;
    }
    const stored = readStoredPlatform();
    if (stored) setValue(stored);
  }, [fromPath, path]);

  useEffect(() => {
    const onStore = (e: Event) => {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      if (id) setValue(id);
    };
    window.addEventListener("talaria-docs-platform", onStore);
    return () => window.removeEventListener("talaria-docs-platform", onStore);
  }, []);

  const onChange = (id: string) => {
    if (!id) return;
    storePlatform(id);
    setValue(id);
    if (!parseSdkPath(path)) return;
    const next = equivalentHref(path, id, sdkSlugs);
    const dest = new URL(next.href, window.location.origin);
    if (dest.pathname !== window.location.pathname || dest.search !== window.location.search) {
      window.location.assign(next.href);
    }
  };

  return (
    <div className="platform-switch">
      <label className={placement === "sidebar" ? undefined : "visually-hidden"} htmlFor={labelId}>
        Platform
      </label>
      <select
        id={labelId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Platform"
      >
        <option value="" disabled>
          Platform
        </option>
        {platforms.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title}
          </option>
        ))}
      </select>
    </div>
  );
}
