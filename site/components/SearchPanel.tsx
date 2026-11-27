"use client";

import { useSearchParams } from "next/navigation";
import { SearchForm } from "@/components/SearchForm";
import { SearchResults } from "@/components/SearchResults";
import { platformById, readStoredPlatform } from "@/lib/platforms";
import { useEffect, useState } from "react";

export function SearchPanel() {
  const params = useSearchParams();
  const query = (params.get("q") ?? "").trim();
  const fromUrl = params.get("platform");
  const [platform, setPlatform] = useState<string | null>(platformById(fromUrl)?.id ?? null);

  useEffect(() => {
    if (platformById(fromUrl)) {
      setPlatform(fromUrl);
      return;
    }
    setPlatform(readStoredPlatform());
  }, [fromUrl]);

  return (
    <div className="search-js">
      <SearchForm defaultQuery={query} defaultPlatform={platform ?? undefined} />
      {query ? (
        <SearchResults query={query} platform={platform} />
      ) : (
        <p className="lede">Type what you’re looking for and press Enter.</p>
      )}
    </div>
  );
}
