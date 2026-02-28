const fs = require("node:fs");
const path = require("node:path");

const OUT_DIR = path.resolve(process.cwd(), "public", "profession-icons");

const ICONS = [
  {
    id: "alchemy",
    urls: [
      "https://wow.zamimg.com/images/wow/icons/large/trade_alchemy.jpg",
      "https://wow.zamimg.com/images/wow/icons/large/inv_potion_01.jpg",
    ],
  },
  {
    id: "blacksmithing",
    urls: [
      "https://wow.zamimg.com/images/wow/icons/large/trade_blacksmithing.jpg",
    ],
  },
  {
    id: "enchanting",
    urls: [
      "https://wow.zamimg.com/images/wow/icons/large/trade_engraving.jpg",
      "https://wow.zamimg.com/images/wow/icons/large/trade_engraving.jpg",
    ],
  },
  {
    id: "engineering",
    urls: [
      "https://wow.zamimg.com/images/wow/icons/large/trade_engineering.jpg",
    ],
  },
  {
    id: "herbalism",
    urls: [
      "https://wow.zamimg.com/images/wow/icons/large/trade_herbalism.jpg",
    ],
  },
  {
    id: "inscription",
    urls: [
      "https://wow.zamimg.com/images/wow/icons/large/inv_inscription_tradeskill01.jpg",
      "https://wow.zamimg.com/images/wow/icons/large/inv_misc_book_11.jpg",
    ],
  },
  {
    id: "jewelcrafting",
    urls: [
      "https://wow.zamimg.com/images/wow/icons/large/inv_misc_gem_01.jpg",
      "https://wow.zamimg.com/images/wow/icons/large/trade_jewelcrafting.jpg",
    ],
  },
  {
    id: "leatherworking",
    urls: [
      "https://wow.zamimg.com/images/wow/icons/large/trade_leatherworking.jpg",
    ],
  },
  {
    id: "mining",
    urls: [
      "https://wow.zamimg.com/images/wow/icons/large/trade_mining.jpg",
    ],
  },
  {
    id: "skinning",
    urls: [
      "https://wow.zamimg.com/images/wow/icons/large/inv_misc_pelt_wolf_01.jpg",
      "https://wow.zamimg.com/images/wow/icons/large/trade_skinning.jpg",
    ],
  },
  {
    id: "tailoring",
    urls: [
      "https://wow.zamimg.com/images/wow/icons/large/trade_tailoring.jpg",
    ],
  },
];

async function downloadIcon(id, urls) {
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = Buffer.from(await res.arrayBuffer());
      const filePath = path.resolve(OUT_DIR, `${id}.jpg`);
      fs.writeFileSync(filePath, data);
      return true;
    } catch {}
  }
  return false;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const icon of ICONS) {
    const ok = await downloadIcon(icon.id, icon.urls);
    if (!ok) {
      console.warn(`Failed: ${icon.id}`);
    } else {
      console.log(`Saved: ${icon.id}.jpg`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
