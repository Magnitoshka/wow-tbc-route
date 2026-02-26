import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outDir = path.join(projectRoot, "public", "zone-images");

const ZONES = [
  ["elwynn-forest", "Elwynn Forest"],
  ["westfall", "Westfall"],
  ["redridge-mountains", "Redridge Mountains"],
  ["durotar", "Durotar"],
  ["the-barrens", "The Barrens"],
  ["stonetalon-mountains", "Stonetalon Mountains"],
  ["ashenvale", "Ashenvale"],
  ["thousand-needles", "Thousand Needles"],
  ["stranglethorn-vale", "Stranglethorn Vale"],
  ["desolace", "Desolace"],
  ["badlands", "Badlands"],
  ["tanaris", "Tanaris"],
  ["the-hinterlands", "The Hinterlands"],
  ["ungoro-crater", "Un'Goro Crater"],
  ["western-plaguelands", "Western Plaguelands"],
  ["blasted-lands", "Blasted Lands"],
  ["hellfire-peninsula", "Hellfire Peninsula"],
  ["zangarmarsh", "Zangarmarsh"],
  ["terokkar-forest", "Terokkar Forest"],
  ["nagrand", "Nagrand"],
  ["blades-edge-mountains", "Blade's Edge Mountains"],
  ["netherstorm", "Netherstorm"],
  ["shadowmoon-valley", "Shadowmoon Valley"],
];

const requestHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  Referer: "https://wowpedia.fandom.com/",
};

function buildSearchUrl(zoneName) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    list: "search",
    srnamespace: "6",
    srlimit: "10",
    origin: "*",
    srsearch: `${zoneName} loading screen`,
  });
  return `https://wowpedia.fandom.com/api.php?${params.toString()}`;
}

function buildImageInfoUrl(fileTitle) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "imageinfo",
    iiprop: "url",
    origin: "*",
    titles: fileTitle,
  });
  return `https://wowpedia.fandom.com/api.php?${params.toString()}`;
}

function pickBestFileTitle(results, zoneName) {
  if (!Array.isArray(results) || results.length === 0) return null;
  const lowerZone = zoneName.toLowerCase();

  const scored = results
    .map((item) => {
      const title = (item?.title || "").toLowerCase();
      let score = 0;
      if (title.includes(lowerZone)) score += 3;
      if (title.includes("loading screen")) score += 3;
      if (title.includes("tbc")) score += 1;
      if (title.includes("classic")) score += 1;
      return { score, title: item?.title };
    })
    .filter((item) => item.title);

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.title || null;
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: requestHeaders });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function downloadFile(url, targetPath) {
  const response = await fetch(url, { headers: requestHeaders });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(targetPath, bytes);
}

function zoneCandidates(zoneName) {
  return [
    `File:${zoneName}.jpg`,
    `File:${zoneName}.png`,
    `File:${zoneName} loading screen.jpg`,
    `File:${zoneName} loading screen.png`,
    `File:${zoneName} concept art.jpg`,
    `File:${zoneName} concept art.png`,
  ];
}

async function getImageUrlFromFileTitle(fileTitle) {
  const infoJson = await fetchJson(buildImageInfoUrl(fileTitle));
  const pages = infoJson?.query?.pages || {};
  const page = Object.values(pages)[0];
  return page?.imageinfo?.[0]?.url || null;
}

await mkdir(outDir, { recursive: true });

for (const [slug, zoneName] of ZONES) {
  const target = path.join(outDir, `${slug}.jpg`);

  try {
    let pickedTitle = null;
    let fileUrl = null;

    for (const title of zoneCandidates(zoneName)) {
      // eslint-disable-next-line no-await-in-loop
      const candidateUrl = await getImageUrlFromFileTitle(title);
      if (candidateUrl) {
        pickedTitle = title;
        fileUrl = candidateUrl;
        break;
      }
    }

    if (!fileUrl) {
      const searchJson = await fetchJson(buildSearchUrl(zoneName));
      const results = searchJson?.query?.search || [];
      const fileTitle = pickBestFileTitle(results, zoneName);
      if (fileTitle) {
        pickedTitle = fileTitle;
        fileUrl = await getImageUrlFromFileTitle(fileTitle);
      }
    }

    if (!fileUrl) {
      console.error(`No image URL for zone: ${zoneName}`);
      continue;
    }

    await downloadFile(fileUrl, target);
    console.log(`Saved ${slug}.jpg from ${pickedTitle}`);
  } catch (error) {
    console.error(`Failed ${zoneName}: ${error.message}`);
  }
}
