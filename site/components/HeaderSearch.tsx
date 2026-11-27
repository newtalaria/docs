"use client";

import { SearchForm } from "@/components/SearchForm";
import { openSearchDialog } from "@/components/SearchDialog";

export function HeaderSearch() {
  return (
    <>
      <div
        onMouseDown={(e) => {
          const t = e.target as HTMLElement;
          if (t.closest("input[data-search-field='header']")) {
            e.preventDefault();
            openSearchDialog((t as HTMLInputElement).value ?? "");
          }
        }}
      >
        <SearchForm compact defaultQuery="" />
      </div>
      <a
        className="icon-btn search-link"
        href="/search/"
        aria-label="Search the docs"
        onClick={(e) => {
          e.preventDefault();
          openSearchDialog();
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </a>
    </>
  );
}
