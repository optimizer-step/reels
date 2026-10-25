// Start a new reel from the template:
//   npm run new -- attention-bank
// Copies src/reels/_template to src/reels/<slug>, renames its components, creates
// public/reels/<slug>/{sfx,broll} and registers the reel in src/Root.tsx.
import fs from "fs";
import path from "path";

const slug = process.argv[2];
if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error("usage: npm run new -- <slug>   (lowercase letters, digits and dashes)");
  process.exit(1);
}
const pascal = slug
  .split("-")
  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
  .join("");
const src = path.join("src", "reels", "_template");
const dst = path.join("src", "reels", slug);
if (fs.existsSync(dst)) {
  console.error(`${dst} already exists`);
  process.exit(1);
}
fs.mkdirSync(dst, { recursive: true });
for (const f of fs.readdirSync(src)) {
  const text = fs
    .readFileSync(path.join(src, f), "utf8")
    .replaceAll('"_template"', `"${slug}"`)
    .replaceAll('<Folder name="template">', `<Folder name="${slug}">`)
    .replaceAll("TemplateReel", `${pascal}Reel`)
    .replaceAll("TemplateCover", `${pascal}Cover`)
    .replaceAll('"Template-Cover"', `"${pascal}-Cover"`)
    .replaceAll('"Template"', `"${pascal}"`)
    .replaceAll("export const Template:", `export const ${pascal}:`)
    .replace("// TEMPLATE REEL — copied by `npm run new -- <slug>`.", `// Reel: ${slug}.`);
  fs.writeFileSync(path.join(dst, f), text);
}
for (const d of ["sfx", "broll"]) {
  const p = path.join("public", "reels", slug, d);
  fs.mkdirSync(p, { recursive: true });
  fs.writeFileSync(path.join(p, ".gitkeep"), "");
}
const rootPath = path.join("src", "Root.tsx");
let root = fs.readFileSync(rootPath, "utf8");
root = root.replace("// REELS:IMPORTS:END", `import { ${pascal} } from "./reels/${slug}";\n// REELS:IMPORTS:END`);
root = root.replace("{/* REELS:LIST:END */}", `<${pascal} />\n    {/* REELS:LIST:END */}`);
fs.writeFileSync(rootPath, root);
console.log(`Created ${dst} (compositions ${pascal} and ${pascal}-Cover). Next: edit copy.ts and timeline.ts.`);
