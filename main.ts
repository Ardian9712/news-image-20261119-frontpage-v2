import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(scriptDirectory, "entry.png");
const outputDirectory = resolve(process.env.OUTPUT_DIR ?? "/output");
const outputPath = join(outputDirectory, "entry.png");

async function verifySha256(sourceFile: string, outputFile: string): Promise<void> {
  const [sourceBytes, outputBytes] = await Promise.all([
    readFile(sourceFile),
    readFile(outputFile),
  ]);
  const sourceHash = createHash("sha256").update(sourceBytes).digest("hex");
  const outputHash = createHash("sha256").update(outputBytes).digest("hex");
  const matches = sourceHash === outputHash;

  console.log(`SHA-256 verification: ${matches ? "PASS" : "FAIL"} (${outputHash})`);
  if (!matches) {
    throw new Error("Output SHA-256 does not match entry.png.");
  }
}

await mkdir(outputDirectory, { recursive: true });
await copyFile(sourcePath, outputPath);
console.log(`Copied entry image to ${outputPath}.`);
await verifySha256(sourcePath, outputPath);
