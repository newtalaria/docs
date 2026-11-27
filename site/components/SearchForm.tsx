export function SearchForm({
  defaultQuery = "",
  defaultPlatform,
  compact = false,
}: {
  defaultQuery?: string;
  defaultPlatform?: string;
  compact?: boolean;
}) {
  const id = compact ? "q-header" : "q";
  return (
    <form className="search-form" action="/search/" method="get" role="search">
      <label className="visually-hidden" htmlFor={id}>
        Search the docs
      </label>
      <input
        id={id}
        type="search"
        name="q"
        placeholder="Search the docs"
        defaultValue={defaultQuery}
        autoComplete="off"
        data-search-field={compact ? "header" : "page"}
      />
      {defaultPlatform ? <input type="hidden" name="platform" value={defaultPlatform} /> : null}
      {compact ? <kbd className="search-kbd" aria-hidden="true">⌘K</kbd> : null}
    </form>
  );
}
