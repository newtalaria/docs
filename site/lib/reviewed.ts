import { execFileSync } from "node:child_process";
import path from "node:path";

const repoRoot = path.resolve(process.cwd(), "..");

function isShallow(): boolean {
  try {
    return (
      execFileSync("git", ["rev-parse", "--is-shallow-repository"], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim() === "true"
    );
  } catch {
    return true;
  }
}

export function lastReviewedIso(file: string): string | undefined {
  const rel = path.relative(repoRoot, file);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return undefined;
  // A shallow clone attributes every file to the shallow tip, which looks like the build date.
  if (isShallow()) return undefined;
  try {
    const iso = execFileSync("git", ["log", "-1", "--format=%cs", "--", rel], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : undefined;
  } catch {
    return undefined;
  }
}

export function repoRelative(file: string): string {
  return path.relative(repoRoot, file).replaceAll(path.sep, "/");
}

export function githubBlobUrl(file: string): string {
  return `https://github.com/newtalaria/docs/blob/main/${repoRelative(file)}`;
}
