export type Section = {
  id: string;
  title: string;
  href: string;
};

export const sections: Section[] = [
  { id: "get-started", title: "Getting started", href: "/get-started/" },
  { id: "guides", title: "Guides", href: "/guides/" },
  { id: "sdk", title: "SDKs", href: "/sdk/" },
  { id: "cli", title: "CLI", href: "/cli/" },
  { id: "agents", title: "MCP and agents", href: "/agents/" },
  { id: "reference", title: "API reference", href: "/reference/" },
  { id: "deploy", title: "Self-host and deploy", href: "/deploy/" },
  { id: "billing", title: "Billing", href: "/billing/" },
];

export function sectionForPath(pathname: string): Section | undefined {
  const clean = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  return sections.find(
    (s) => clean === s.href.slice(0, -1) || clean.startsWith(`${s.href.slice(0, -1)}/`),
  );
}
