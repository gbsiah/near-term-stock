import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await import(path.join(root, "docs/pdf-export.js"));
const screen = JSON.parse(await fs.readFile(path.join(root, "docs/data/latest.json"), "utf8"));
const fixedDate = new Date("2026-07-26T06:07:08.000Z");

test("builds a complete timestamped PDF archive", () => {
  const bytes = globalThis.NearTermPdf.buildPdf(screen, fixedDate);
  const pdf = new TextDecoder().decode(bytes);

  assert.ok(bytes.byteLength > 20_000);
  assert.match(pdf, /^%PDF-1\.4/);
  assert.match(pdf, /Near Term Signal - Timestamped Stock Screen/);
  assert.match(pdf, /2026-07-26 14:07:08 SGT \\\(UTC\+08:00\\\)/);
  assert.match(pdf, /\/Count 8\b/);
  assert.match(pdf, /PAGE 8 OF 8/);
  for (const stock of screen.results) {
    assert.match(pdf, new RegExp(`${stock.ticker} /`));
  }
});

test("uses a clear Singapore-time filename", () => {
  assert.equal(
    globalThis.NearTermPdf.createFilename(fixedDate),
    "near-term-signal-20260726-140708-SGT.pdf",
  );
});
