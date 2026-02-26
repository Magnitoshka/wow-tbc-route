import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const files = [
  {
    url: "https://static.wikia.nocookie.net/wowpedia/images/0/08/Horde_Crest.png/revision/latest?cb=20241011200658",
    out: path.join(projectRoot, "public", "faction-icons", "horde-crest.png"),
  },
  {
    url: "https://static.wikia.nocookie.net/wowpedia/images/f/f7/AllianceCrest.png/revision/latest?cb=20101123221454",
    out: path.join(projectRoot, "public", "faction-icons", "alliance-crest.png"),
  },
];

for (const item of files) {
  const response = await fetch(item.url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed ${item.url}: HTTP ${response.status}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(item.out, bytes);
  console.log(`Saved ${item.out}`);
}
