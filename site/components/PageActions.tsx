"use client";

import { useEffect, useId, useState } from "react";
import { formatReviewed } from "@/lib/dates";

const STORAGE = "talaria-docs-helpful";

export function PageActions({
  path,
  reviewed,
  editHref,
}: {
  path: string;
  reviewed?: string;
  editHref: string;
}) {
  const labelId = useId();
  const [vote, setVote] = useState<"yes" | "no" | null>(null);

  useEffect(() => {
    try {
      const map = JSON.parse(localStorage.getItem(STORAGE) || "{}") as Record<string, string>;
      if (map[path] === "yes" || map[path] === "no") setVote(map[path]);
    } catch {
      /* ignore */
    }
  }, [path]);

  const choose = (value: "yes" | "no") => {
    setVote(value);
    try {
      const map = JSON.parse(localStorage.getItem(STORAGE) || "{}") as Record<string, string>;
      map[path] = value;
      localStorage.setItem(STORAGE, JSON.stringify(map));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="page-actions">
      <div className="page-helpful">
        <p id={labelId}>Was this helpful?</p>
        {vote ? (
          <p className="page-helpful-thanks" role="status">
            Thanks for the feedback.
          </p>
        ) : (
          <div className="page-helpful-btns" role="group" aria-labelledby={labelId}>
            <button type="button" className="md-btn" onClick={() => choose("yes")}>
              Yes
            </button>
            <button type="button" className="md-btn" onClick={() => choose("no")}>
              No
            </button>
          </div>
        )}
      </div>
      <ul className="page-action-links">
        {reviewed ? <li>Last reviewed {formatReviewed(reviewed)}</li> : null}
        <li>
          <a href={editHref}>Edit on GitHub</a>
        </li>
      </ul>
    </div>
  );
}
