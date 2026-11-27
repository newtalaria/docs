"use client";

import { useSearchParams } from "next/navigation";
import { SearchForm } from "@/components/SearchForm";
import { SearchResults } from "@/components/SearchResults";

export function SearchPanel() {
  const query = (useSearchParams().get("q") ?? "").trim();
  return (
    <>
      <SearchForm defaultQuery={query} />
      {query ? <SearchResults query={query} /> : <p className="lede">Type what you’re looking for and press Enter.</p>}
    </>
  );
}
