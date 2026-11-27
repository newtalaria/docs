"use client";
import { useEffect } from "react";
export function CodeCopy() {
  useEffect(() => {
    document.querySelectorAll<HTMLElement>(".prose figure[data-rehype-pretty-code-figure]").forEach((fig) => {
      if (fig.querySelector(".copy-btn")) return;
      const btn = document.createElement("button");
      btn.type = "button"; btn.className = "copy-btn"; btn.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy code"); btn.setAttribute("aria-live", "polite");
      btn.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(fig.querySelector("code")?.innerText ?? ""); btn.textContent = "Copied"; }
        catch { btn.textContent = "Copy failed"; }
        setTimeout(() => { btn.textContent = "Copy"; }, 2000);
      });
      fig.appendChild(btn);
    });
  }, []);
  return null;
}
