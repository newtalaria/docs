export function SearchForm({ defaultQuery = "", compact = false }: { defaultQuery?: string; compact?: boolean }) {
  return (
    <form className="search-form" action="/search/" method="get" role="search">
      <label className="visually-hidden" htmlFor={compact ? "q-header" : "q"}>
        Search the docs
      </label>
      <input
        id={compact ? "q-header" : "q"}
        type="search"
        name="q"
        placeholder="Search the docs"
        defaultValue={defaultQuery}
        autoComplete="off"
      />
      <kbd className="search-kbd" aria-hidden="true">/</kbd>
    </form>
  );
}
