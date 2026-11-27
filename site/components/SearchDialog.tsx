"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SearchResults } from "@/components/SearchResults";
import { readStoredPlatform } from "@/lib/platforms";

const EVENT = "talaria-docs-search";

export function openSearchDialog(query = "") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { query } }));
}

export function SearchDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const listId = useId();
  const titleId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [platform, setPlatform] = useState<string | null>(null);
  const [hitCount, setHitCount] = useState(0);

  const close = () => dialogRef.current?.close();

  const show = (q?: string) => {
    restoreRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPlatform(readStoredPlatform());
    if (typeof q === "string") setQuery(q);
    setActive(0);
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      if (typeof q === "string" && q) inputRef.current?.select();
    });
  };

  useEffect(() => {
    const onOpen = (e: Event) => {
      const next = (e as CustomEvent<{ query?: string }>).detail?.query ?? "";
      show(next);
    };
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      const hit = (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing);
      if (!hit) return;
      e.preventDefault();
      if (dialogRef.current?.open) {
        inputRef.current?.focus();
        return;
      }
      show("");
    };
    window.addEventListener(EVENT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => restoreRef.current?.focus();
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);

  const links = () => Array.from(dialogRef.current?.querySelectorAll<HTMLAnchorElement>(".search-results a") ?? []);

  useEffect(() => {
    const items = links();
    items.forEach((a, i) => {
      a.setAttribute("role", "option");
      a.parentElement?.classList.toggle("is-active", i === active);
      if (i === active) a.id = "search-option-active";
      else if (a.id === "search-option-active") a.removeAttribute("id");
    });
  }, [active, hitCount, query]);

  const move = (delta: number) => {
    const items = links();
    if (!items.length) return;
    const next = (active + delta + items.length) % items.length;
    setActive(next);
    items[next]?.scrollIntoView({ block: "nearest" });
  };

  const q = query.trim();

  return (
    <dialog
      ref={dialogRef}
      className="search-dialog"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === dialogRef.current) close();
      }}
    >
      <div className="search-dialog-header">
        <h2 id={titleId} className="visually-hidden">
          Search the docs
        </h2>
        <form
          className="search-form"
          action="/search/"
          method="get"
          role="search"
          onSubmit={(e) => {
            const items = links();
            if (items[active]) {
              e.preventDefault();
              items[active].click();
            }
          }}
        >
          <label className="visually-hidden" htmlFor="q-dialog">
            Search the docs
          </label>
          <input
            ref={inputRef}
            id="q-dialog"
            type="search"
            name="q"
            placeholder="Search the docs"
            autoComplete="off"
            value={query}
            role="combobox"
            aria-expanded={q.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={hitCount ? "search-option-active" : undefined}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                move(1);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                move(-1);
              }
            }}
          />
          {platform ? <input type="hidden" name="platform" value={platform} /> : null}
        </form>
      </div>
      <p className="search-dialog-hint">↑↓ to move · Enter to open · Esc to close</p>
      <div className="search-dialog-body" id={listId} role="listbox" aria-label="Search results">
        {q ? (
          <SearchResults query={q} platform={platform} variant="dialog" onHits={setHitCount} />
        ) : (
          <p className="search-dialog-empty">Type to search every page. Results are grouped by section.</p>
        )}
      </div>
    </dialog>
  );
}
