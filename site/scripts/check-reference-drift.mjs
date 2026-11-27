#!/usr/bin/env node
/**
 * Compare the pinned public OpenAPI document to the snapshot in _data/reference.
 * Intended for an Infra/box nightly job. Does not write files.
 *
 *   node site/scripts/check-reference-drift.mjs
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lockPath = path.join(repo, "docs.lock.yaml");
const snapPath = path.join(repo, "_data/reference/openapi.json");
const url = "https://api.newtalaria.com/api/v1/openapi.json";

const lock = fs.readFileSync(lockPath, "utf8");
const pinned = (lock.match(/public_openapi:[\s\S]*?sha256:\s*([0-9a-f]+)/) || [])[1];
const live = await fetch(url);
if (!live.ok) {
  console.error(`check-reference-drift: GET ${url} -> ${live.status}`);
  process.exit(2);
}
const body = Buffer.from(await live.arrayBuffer());
const hash = crypto.createHash("sha256").update(body).digest("hex");
const snap = crypto.createHash("sha256").update(fs.readFileSync(snapPath)).digest("hex");
if (hash !== pinned || hash !== snap) {
  console.error(`check-reference-drift: OpenAPI drifted (live=${hash} pinned=${pinned} snapshot=${snap})`);
  console.error("Refresh _data/reference/openapi.json, update docs.lock.yaml, run npm run generate, and commit.");
  process.exit(1);
}
console.log("check-reference-drift: OpenAPI snapshot matches the live document");
