"use client";

import { useEffect } from "react";
import { type DocsConnect, readConnect } from "@/lib/connect";

const PK_PLACEHOLDERS = [
  "tal_pk_<env>_<cell>_…",
  "tal_pk_<env>_<cell>_...",
  "tal_pk_prod_nz1_…",
  "tal_pk_prod_nz1_...",
  "tal_pk_…",
  "tal_pk_...",
];

const originals = new WeakMap<Text, string>();

function ingestOrigin(session: DocsConnect): string | undefined {
  if (session.ingest) return session.ingest.replace(/\/+$/, "");
  if (session.cell) return `https://ingest-${session.cell}.newtalaria.com`;
  return undefined;
}

function apply(session: DocsConnect | null, root: ParentNode) {
  const origin = session ? ingestOrigin(session) : undefined;
  const key = session?.publishableKey;
  const org = session?.org;
  const project = session?.project;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = (node as Text).parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  for (const node of nodes) {
    const original = originals.get(node) ?? node.data;
    originals.set(node, original);
    let text = original;
    if (session) {
      if (origin) {
        text = text.replaceAll("https://ingest-<cell>.newtalaria.com", origin);
        text = text.replaceAll("https://ingest-nz1.newtalaria.com", origin);
      }
      if (key) {
        for (const p of PK_PLACEHOLDERS) text = text.replaceAll(p, key);
      }
      if (org) text = text.replaceAll("YOUR_ORG_ID", org);
      if (project) text = text.replaceAll("YOUR_PROJECT_ID", project);
    }
    if (text !== node.data) node.data = text;
  }
}

export function Personalize() {
  useEffect(() => {
    const content = document.getElementById("content") ?? document.body;
    const run = () => apply(readConnect(), content);
    run();
    window.addEventListener("talaria-docs-connect", run);
    return () => window.removeEventListener("talaria-docs-connect", run);
  }, []);
  return null;
}
