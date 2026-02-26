import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const sourceUrl =
  "https://static.wikia.nocookie.net/wowpedia/images/b/b9/Westfall_Lighthouse_WoW.jpg/revision/latest?cb=20230526124933";
const targetPath = path.join(projectRoot, "public", "zone-images", "westfall.jpg");

const response = await fetch(sourceUrl, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  },
});

if (!response.ok) {
  throw new Error(`Failed to download image: HTTP ${response.status}`);
}

const bytes = Buffer.from(await response.arrayBuffer());
await writeFile(targetPath, bytes);
console.log(`Updated ${targetPath}`);

