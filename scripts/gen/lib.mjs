// Shared helpers for the asset generators (Node 22+, no dependencies).
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const requireSlug = (slug) => {
  if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    console.error("A reel slug (lowercase letters, digits, dashes) is required.");
    process.exit(1);
  }
  const dir = path.join(ROOT, "src", "reels", slug);
  if (!fs.existsSync(dir)) {
    console.error(`No reel at src/reels/${slug}`);
    process.exit(1);
  }
  return { slug, srcDir: dir, pubDir: path.join(ROOT, "public", "reels", slug) };
};

export const requireEnv = (...names) => {
  for (const n of names) {
    if (!process.env[n]) {
      console.error(`Missing environment variable ${n}. Add it as a GitHub Actions secret (or export it locally).`);
      process.exit(1);
    }
  }
};

export const idemKey = (...parts) => crypto.createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 32);

/** fetch JSON with retries on 429/5xx; throws with the response body on other errors. */
export const fetchJson = async (url, opts = {}, tries = 5) => {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, opts);
    const text = await res.text();
    if (res.ok) return text ? JSON.parse(text) : {};
    if ((res.status === 429 || res.status >= 500) && i < tries - 1) {
      const wait = Number(res.headers.get("retry-after")) * 1000 || 2000 * 2 ** i;
      console.warn(`  ${res.status} from ${new URL(url).pathname}, retrying in ${Math.round(wait / 1000)} s`);
      await sleep(wait);
      continue;
    }
    throw new Error(`${opts.method ?? "GET"} ${url} -> ${res.status}: ${text.slice(0, 600)}`);
  }
  throw new Error("unreachable");
};

export const download = async (url, file) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${url} -> ${res.status}`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log(`  saved ${path.relative(ROOT, file)} (${(fs.statSync(file).size / 1e6).toFixed(1)} MB)`);
};

export const ffprobeDuration = (file) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim());

/** Append a provenance record (what was generated, with which prompt/model/request). */
export const recordManifest = (pubDir, entry) => {
  const file = path.join(pubDir, "generated.json");
  const list = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : [];
  const rest = list.filter((e) => !(e.tool === entry.tool && e.name === entry.name));
  rest.push({ ...entry, generated_at: new Date().toISOString() });
  fs.mkdirSync(pubDir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(rest, null, 2) + "\n");
};
