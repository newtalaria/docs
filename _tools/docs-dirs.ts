/** Directory names the root docs pack never walks, besides underscore-prefixed dirs.
 *  New-IA pages under site/content are checked by site/scripts, not this pack.
 */
export const IGNORED_DOCS_DIRS = new Set(["site", "node_modules"]);

export function isIgnoredDocsDir(name: string): boolean {
  return name.startsWith("_") || IGNORED_DOCS_DIRS.has(name);
}
