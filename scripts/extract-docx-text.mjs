import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";

function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function extractParas(xmlPath) {
  const raw = readFileSync(xmlPath, "utf8");
  const paras = [];
  for (const part of raw.split(/<\/w:p>/)) {
    const t = [...part.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)]
      .map((m) => decode(m[1]))
      .join("");
    if (t.trim()) paras.push(t.trim());
  }
  return paras;
}

function extractDrawingOrder(xmlPath) {
  // Map approximate image order by appearance of a:blip r:embed
  const raw = readFileSync(xmlPath, "utf8");
  const embeds = [...raw.matchAll(/a:blip[^>]*r:embed="(rId\d+)"/g)].map((m) => m[1]);
  return embeds;
}

function loadRels(book) {
  const relsPath = `data/cookbooks/${book}/unzipped/word/_rels/document.xml.rels`;
  if (!existsSync(relsPath)) return {};
  const raw = readFileSync(relsPath, "utf8");
  const map = {};
  for (const m of raw.matchAll(/Id="(rId\d+)"[^>]*Target="([^"]+)"/g)) {
    map[m[1]] = m[2].replace(/^\.\.\//, "");
  }
  // also Target before Id
  for (const m of raw.matchAll(/Target="([^"]+)"[^>]*Id="(rId\d+)"/g)) {
    map[m[2]] = m[1].replace(/^\.\.\//, "");
  }
  return map;
}

for (const book of ["egypt", "b0dc", "soup"]) {
  const xml = `data/cookbooks/${book}/unzipped/word/document.xml`;
  if (!existsSync(xml)) {
    console.log(book, "missing");
    continue;
  }
  const paras = extractParas(xml);
  const mediaDir = `data/cookbooks/${book}/unzipped/word/media`;
  const media = existsSync(mediaDir) ? readdirSync(mediaDir) : [];
  const outDir = `data/cookbooks/${book}`;
  writeFileSync(join(outDir, "paragraphs.json"), JSON.stringify(paras, null, 2));
  writeFileSync(
    join(outDir, "meta.json"),
    JSON.stringify(
      {
        book,
        paragraphCount: paras.length,
        mediaCount: media.length,
        media,
        sample: paras.slice(0, 40),
        midSample: paras.slice(200, 260),
      },
      null,
      2
    )
  );
  console.log(JSON.stringify({ book, paras: paras.length, media: media.length, head: paras.slice(0, 8) }));
}
