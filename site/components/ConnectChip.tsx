"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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

/** Logged-out chip stays hidden until the dashboard handshake exists. */
export const CONNECT_LIVE = process.env.NEXT_PUBLIC_DOCS_CONNECT_LIVE === "true";

type ConnectState = {
  ready: boolean;
  session: DocsConnect | null;
  connect: () => void;
  forget: () => void;
};

const ConnectContext = createContext<ConnectState | null>(null);

function stripHash() {
  const url = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", url);
}

export function ConnectProvider({ children }: { children: ReactNode }) {
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

  return (
    <ConnectContext.Provider value={{ ready, session, connect, forget }}>{children}</ConnectContext.Provider>
  );
}

export function ConnectChip({ placement }: { placement: "header" | "drawer" }) {
  const ctx = useContext(ConnectContext);
  if (!ctx) return null;
  const { ready, session, connect, forget } = ctx;

  if (!ready) {
    if (!CONNECT_LIVE) return null;
    return <span className={`connect-chip connect-chip-${placement} connect-chip-slot`} aria-hidden="true" />;
  }

  if (!session) {
    if (!CONNECT_LIVE) return null;
    return (
      <button
        type="button"
        className={`connect-chip connect-chip-${placement} connect-chip-action`}
        onClick={connect}
        title="Fill the publishable key, project, and ingest host from your dashboard. Secrets stay out of the page."
      >
        Use my project
      </button>
    );
  }

  return (
    <span className={`connect-chip connect-chip-${placement} connect-chip-session`} role="status">
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
