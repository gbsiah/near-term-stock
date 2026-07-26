import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await import(path.join(root, "docs/pdf-export.js"));

const screen = JSON.parse(await fs.readFile(path.join(root, "docs/data/latest.json"), "utf8"));
const savedAt = new Date(process.env.PDF_SAVED_AT || Date.now());
const filename = globalThis.NearTermPdf.createFilename(savedAt);
const outputDirectory = path.join(root, "output/pdf");
const outputPath = path.join(outputDirectory, filename);

await fs.mkdir(outputDirectory, { recursive: true });
await fs.writeFile(outputPath, globalThis.NearTermPdf.buildPdf(screen, savedAt));
console.log(outputPath);
