/** Handshake-only docs personalisation. Never store or render secret keys. */

export const CONNECT_STORAGE_KEY = "talaria-docs-connect";
export const CONNECT_STATE_KEY = "talaria-docs-connect-state";
export const CONNECT_URL = "https://one.newtalaria.com/docs-connect";

export type DocsConnect = {
  org?: string;
  project?: string;
  projectName?: string;
  env?: string;
  cell?: string;
  ingest?: string;
  publishableKey?: string;
};

const PK = /^tal_pk_[A-Za-z0-9_-]+$/;
const ID = /^[A-Za-z0-9._:-]{1,128}$/;
const ENV = /^[A-Za-z0-9_-]{1,32}$/;
const CELL = /^[A-Za-z0-9-]{1,32}$/;

export function isPublishableKey(value: string): boolean {
  if (!PK.test(value)) return false;
  if (value.includes("…") || value.includes("...") || value.includes("<")) return false;
  // real keys are longer than the prefix plus env/cell placeholders
  return value.length >= 20;
}

function cleanId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  if (!v || !ID.test(v)) return undefined;
  if (/^(YOUR_|<.*>$)/i.test(v)) return undefined;
  return v;
}

function cleanKey(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  if (v.startsWith("tal_sk_") || v.startsWith("tal_org_") || v.startsWith("tal_mon_")) return undefined;
  if (!isPublishableKey(v)) return undefined;
  return v;
}

function cleanIngest(value: unknown, cell?: string): string | undefined {
  if (typeof value === "string" && value.trim()) {
    try {
      const u = new URL(value.trim());
      if (u.protocol !== "https:") return undefined;
      if (!/\.newtalaria\.com$/i.test(u.hostname) && u.hostname !== "localhost") return undefined;
      // origin only; collect /otlp at call sites that need it
      return u.origin;
    } catch {
      return undefined;
    }
  }
  if (cell && CELL.test(cell)) return `https://ingest-${cell}.newtalaria.com`;
  return undefined;
}

function pick(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) {
    if (obj[k] != null && obj[k] !== "") return obj[k];
  }
  return undefined;
}

export function sanitizeConnect(input: unknown): DocsConnect | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const envRaw = pick(raw, ["env", "environment"]);
  const cellRaw = pick(raw, ["cell"]);
  const env = typeof envRaw === "string" && ENV.test(envRaw.trim()) ? envRaw.trim() : undefined;
  const cell = typeof cellRaw === "string" && CELL.test(cellRaw.trim()) ? cellRaw.trim() : undefined;
  const session: DocsConnect = {
    org: cleanId(pick(raw, ["org", "orgId", "organizationId", "organisationId"])),
    project: cleanId(pick(raw, ["project", "projectId"])),
    projectName: cleanId(pick(raw, ["projectName", "name"])),
    env,
    cell,
    ingest: cleanIngest(pick(raw, ["ingest", "ingestUrl", "url", "endpoint"]), cell),
    // Dashboard fragment uses publishableKey, with tal_pk as an alias (new_talaria #540).
    publishableKey: cleanKey(pick(raw, ["publishableKey", "tal_pk", "apiKey", "key", "pk"])),
  };
  if (!session.org && !session.project && !session.ingest && !session.publishableKey && !session.cell) {
    return null;
  }
  return session;
}

export function parseFragment(hash: string): { payload: unknown; state?: string } | null {
  if (!hash || hash === "#") return null;
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const tryJson = (text: string): unknown => {
    try {
      return JSON.parse(text);
    } catch {
      return undefined;
    }
  };
  const fromBase64 = (text: string): unknown => {
    try {
      const pad = text.replace(/-/g, "+").replace(/_/g, "/");
      const b64 = pad + "=".repeat((4 - (pad.length % 4)) % 4);
      return tryJson(atob(b64));
    } catch {
      return undefined;
    }
  };

  let payload = tryJson(decodeURIComponent(raw));
  if (payload === undefined) payload = fromBase64(raw);
  if (payload === undefined && raw.includes("=")) {
    const params = new URLSearchParams(raw);
    const packed = params.get("payload") || params.get("data") || params.get("connect");
    if (packed) {
      payload = tryJson(packed) ?? fromBase64(packed) ?? undefined;
    }
    if (payload === undefined) {
      payload = Object.fromEntries(params.entries());
    }
    const state = params.get("state") || undefined;
    if (payload && typeof payload === "object") {
      const obj = payload as Record<string, unknown>;
      return { payload, state: state || (typeof obj.state === "string" ? obj.state : undefined) };
    }
  }
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    return { payload, state: typeof obj.state === "string" ? obj.state : undefined };
  }
  return null;
}

export function readConnect(): DocsConnect | null {
  try {
    const raw = localStorage.getItem(CONNECT_STORAGE_KEY);
    if (!raw) return null;
    return sanitizeConnect(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeConnect(session: DocsConnect): void {
  localStorage.setItem(CONNECT_STORAGE_KEY, JSON.stringify(session));
}

export function clearConnect(): void {
  try {
    localStorage.removeItem(CONNECT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.removeItem(CONNECT_STATE_KEY);
  } catch {
    /* ignore */
  }
}

export function startConnect(returnUrl: string): string {
  const state = crypto.randomUUID();
  sessionStorage.setItem(CONNECT_STATE_KEY, state);
  const url = new URL(CONNECT_URL);
  url.searchParams.set("return", returnUrl);
  url.searchParams.set("state", state);
  return url.toString();
}

export function consumeHash(hash: string, storedState: string | null): DocsConnect | null {
  const parsed = parseFragment(hash);
  if (!parsed) return null;
  if (!storedState || parsed.state !== storedState) return null;
  return sanitizeConnect(parsed.payload);
}

export function chipLabel(session: DocsConnect): string {
  const name = session.projectName || session.project || "project";
  return session.env ? `Using ${name} (${session.env})` : `Using ${name}`;
}
