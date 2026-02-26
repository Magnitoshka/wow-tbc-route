import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const sourceUrl =
  "https://static.wikia.nocookie.net/wowpedia/images/6/6e/Desolace2.jpg/revision/latest?cb=20051122204923";
const targetPath = path.join(projectRoot, "public", "zone-images", "desolace.jpg");

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
