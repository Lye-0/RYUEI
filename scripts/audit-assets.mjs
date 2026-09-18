import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(
  await readFile(path.join(root, "docs/assets/manifest.json"), "utf8"),
);
const catalog = JSON.parse(
  await readFile(path.join(root, "src/assets.json"), "utf8"),
);
const expected = new Set(
  manifest.map((entry) => entry.path.replaceAll("\\\\", "/")),
);
const ids = new Set();
let bytes = 0;
for (const entry of manifest) {
  if (ids.has(entry.id)) throw new Error("重複した画像ID: " + entry.id);
  ids.add(entry.id);
  if ("public/images/" + catalog[entry.id] !== entry.path)
    throw new Error("カタログ不一致: " + entry.id);
  const data = await readFile(path.join(root, entry.path));
  if (
    data.length !== entry.bytes ||
    createHash("sha256").update(data).digest("hex") !== entry.sha256
  ) {
    throw new Error("画像と採用記録が不一致: " + entry.path);
  }
  bytes += data.length;
}
async function visit(dir) {
  for (const entry of await readdir(path.join(root, dir), {
    withFileTypes: true,
  })) {
    const relative = dir + "/" + entry.name;
    if (entry.isDirectory()) await visit(relative);
    else if (!expected.has(relative))
      throw new Error("採用記録にないファイル: " + relative);
  }
}
await visit("public/images");
if (Object.keys(catalog).length !== ids.size)
  throw new Error("カタログ件数が一致しません");
console.log(
  "採用画像 " +
    ids.size +
    " 枚 / " +
    bytes.toLocaleString("ja-JP") +
    " bytes。欠落・旧版・重複なし。",
);
