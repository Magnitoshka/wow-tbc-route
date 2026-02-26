import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const DB = require("wow-classic-items");

const zones = new DB.Zones();
const items = new DB.Items({ iconSrc: "wowhead" });
const zonesById = new Map(zones.map((zone) => [zone.id, zone]));
const outlandDungeonNames = new Set([
  "Hellfire Ramparts",
  "The Blood Furnace",
  "The Shattered Halls",
  "The Slave Pens",
  "The Underbog",
  "The Steamvault",
  "Mana-Tombs",
  "Auchenai Crypts",
  "Sethekk Halls",
  "Shadow Labyrinth",
  "Old Hillsbrad Foothills",
  "The Black Morass",
  "The Mechanar",
  "The Botanica",
  "The Arcatraz",
  "Magisters' Terrace",
]);
const allDungeonZones = zones.filter(
  (zone) =>
    zone.category === "Dungeon" &&
    Array.isArray(zone.level) &&
    typeof zone.level[0] === "number",
);
const dungeonZoneIdSet = new Set(allDungeonZones.map((zone) => zone.id));

const grouped = new Map();
for (const zone of allDungeonZones) {
  const location = outlandDungeonNames.has(zone.name)
    ? "Outland / Caverns of Time / Quel'Danas"
    : "Azeroth";
  grouped.set(zone.id, {
    id: zone.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    name: zone.name,
    levelMin: Number(zone.level?.[0] ?? 58),
    levelMax: Number(zone.level?.[1] ?? 70),
    location,
    bosses: new Map(),
  });
}

for (const item of items) {
  if (!item?.source || item.source.category !== "Boss Drop") continue;
  const zoneId = Number(item.source.zone);
  if (!dungeonZoneIdSet.has(zoneId)) continue;

  const dungeon = grouped.get(zoneId);
  const bossName = item.source.name || "Unknown Boss";
  if (!dungeon.bosses.has(bossName)) {
    dungeon.bosses.set(bossName, {
      id: bossName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      name: bossName,
      loot: [],
    });
  }

  dungeon.bosses.get(bossName).loot.push({
    id: item.itemId,
    name: item.name,
    rarity: item.quality,
    dropChance: item.source.dropChance ? `${(item.source.dropChance * 100).toFixed(2)}%` : "N/A",
    type: item.class || "Item",
    slot: item.slot || item.subclass || "N/A",
    icon: item.icon,
    tooltip: (item.tooltip || []).map((line) => ({
      label: line.label,
      format: line.format || "",
    })),
  });
}

const result = Array.from(grouped.values())
  .map((dungeon) => ({
    ...dungeon,
    bosses: Array.from(dungeon.bosses.values())
      .map((boss) => ({
        ...boss,
        loot: boss.loot.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }))
  .filter((dungeon) => dungeon.bosses.length > 0)
  .sort((a, b) => a.levelMin - b.levelMin || a.name.localeCompare(b.name));

const output = `export const dungeons = ${JSON.stringify(result, null, 2)};\n`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const target = path.resolve(__dirname, "../src/dungeons.js");
writeFileSync(target, output, "utf8");

const countDungeons = result.length;
const countBosses = result.reduce((acc, d) => acc + d.bosses.length, 0);
const countItems = result.reduce(
  (acc, d) => acc + d.bosses.reduce((sum, b) => sum + b.loot.length, 0),
  0,
);
console.log(`Generated src/dungeons.js: ${countDungeons} dungeons, ${countBosses} bosses, ${countItems} items`);
