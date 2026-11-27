export type Platform = {
  id: string;
  title: string;
  href: string;
  family?: string;
};

export const PLATFORM_STORAGE_KEY = "talaria-docs-platform";

export const platforms: Platform[] = [
  { id: "javascript", title: "JavaScript", href: "/sdk/javascript/", family: "JavaScript" },
  { id: "react", title: "React", href: "/sdk/javascript/react/", family: "JavaScript" },
  { id: "nextjs", title: "Next.js", href: "/sdk/javascript/nextjs/", family: "JavaScript" },
  { id: "node", title: "Node.js", href: "/sdk/javascript/node/", family: "JavaScript" },
  { id: "flutter", title: "Flutter", href: "/sdk/flutter/", family: "Dart and Flutter" },
  { id: "dart", title: "Dart", href: "/sdk/dart/", family: "Dart and Flutter" },
  { id: "php", title: "PHP", href: "/sdk/php/", family: "PHP" },
  { id: "laravel", title: "Laravel", href: "/sdk/laravel/", family: "PHP" },
  { id: "silverstripe", title: "Silverstripe", href: "/sdk/silverstripe/", family: "PHP" },
  { id: "serverpod", title: "Serverpod", href: "/sdk/serverpod/", family: "Dart and Flutter" },
];

export function platformById(id: string | null | undefined): Platform | undefined {
  if (!id) return undefined;
  return platforms.find((p) => p.id === id);
}

/** Longest href first so javascript/nextjs wins over javascript. */
const byHrefLength = [...platforms].sort((a, b) => b.href.length - a.href.length);

export function parseSdkPath(pathname: string): { platformId: string; leaf: string } | null {
  const clean = pathname.replace(/^\/+|\/+$/g, "");
  if (clean !== "sdk" && !clean.startsWith("sdk/")) return null;
  const rest = clean === "sdk" ? "" : clean.slice(4);
  if (!rest) return null;
  for (const p of byHrefLength) {
    const prefix = p.href.replace(/^\/+|\/+$/g, "").slice(4); // after sdk/
    if (rest === prefix) return { platformId: p.id, leaf: "" };
    if (rest.startsWith(`${prefix}/`)) return { platformId: p.id, leaf: rest.slice(prefix.length + 1) };
  }
  return null;
}

export function equivalentHref(
  pathname: string,
  targetId: string,
  sdkSlugs: Iterable<string>,
): { href: string; found: boolean; missing?: string } {
  const target = platformById(targetId);
  if (!target) return { href: "/", found: false };
  const slugs = new Set(sdkSlugs);
  const parsed = parseSdkPath(pathname);
  if (!parsed || !parsed.leaf) {
    return { href: `${target.href}?platform=${targetId}`, found: true };
  }
  const slug = `${target.href.replace(/^\/+|\/+$/g, "")}/${parsed.leaf}`;
  if (slugs.has(slug)) {
    return { href: `${target.href}${parsed.leaf}/?platform=${targetId}`, found: true };
  }
  return {
    href: `${target.href}?platform=${targetId}&missing=${encodeURIComponent(parsed.leaf)}`,
    found: false,
    missing: parsed.leaf,
  };
}

export function readStoredPlatform(): string | null {
  try {
    const id = localStorage.getItem(PLATFORM_STORAGE_KEY);
    return platformById(id) ? id : null;
  } catch {
    return null;
  }
}

export function storePlatform(id: string) {
  try {
    localStorage.setItem(PLATFORM_STORAGE_KEY, id);
    window.dispatchEvent(new CustomEvent("talaria-docs-platform", { detail: { id } }));
  } catch {
    /* ignore */
  }
}
