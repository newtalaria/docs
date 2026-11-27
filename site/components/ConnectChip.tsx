"use client";

import { useEffect, useState } from "react";
import {
  type DocsConnect,
  chipLabel,
  clearConnect,
  consumeHash,
  CONNECT_STATE_KEY,
  readConnect,
  startConnect,
  writeConnect,
} from "@/lib/connect";

function stripHash() {
  const url = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", url);
}

export function ConnectChip() {
  const [session, setSession] = useState<DocsConnect | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let next = readConnect();
    if (window.location.hash && window.location.hash.length > 1) {
      let stored: string | null = null;
      try {
        stored = sessionStorage.getItem(CONNECT_STATE_KEY);
      } catch {
        stored = null;
      }
      const incoming = consumeHash(window.location.hash, stored);
      stripHash();
      try {
        sessionStorage.removeItem(CONNECT_STATE_KEY);
      } catch {
        /* ignore */
      }
      if (incoming) {
        try {
          writeConnect(incoming);
        } catch {
          /* ignore */
        }
        next = incoming;
        window.dispatchEvent(new CustomEvent("talaria-docs-connect"));
      }
    }
    setSession(next);
    setReady(true);
    window.dispatchEvent(new CustomEvent("talaria-docs-connect"));
  }, []);

  const connect = () => {
    const returnUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;
    try {
      window.location.href = startConnect(returnUrl);
    } catch {
      window.location.href = "https://one.newtalaria.com/docs-connect";
    }
  };

  const forget = () => {
    clearConnect();
    setSession(null);
    window.dispatchEvent(new CustomEvent("talaria-docs-connect"));
    window.location.reload();
  };

  if (!ready) return <span className="connect-chip connect-chip-slot" aria-hidden="true" />;

  if (!session) {
    return (
      <button
        type="button"
        className="connect-chip connect-chip-action"
        onClick={connect}
        title="Fill the publishable key, project, and ingest host from your dashboard. Secrets stay out of the page."
      >
        Use my project
      </button>
    );
  }

  return (
    <span className="connect-chip connect-chip-session" role="status">
      <span className="connect-chip-label">{chipLabel(session)}</span>
      <button type="button" className="connect-chip-link" onClick={connect}>
        Change
      </button>
      <button type="button" className="connect-chip-link" onClick={forget}>
        Forget
      </button>
    </span>
  );
}
