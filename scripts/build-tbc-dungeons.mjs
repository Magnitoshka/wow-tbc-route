import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const DB = require("wow-classic-items");

const zones = new DB.Zones();
const items = new DB.Items({ iconSrc: "wowhead" });
const tbcDungeonNames = new Set([
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
const classicDungeonNames = new Set([
  "Ragefire Chasm",
  "Wailing Caverns",
  "The Deadmines",
  "Shadowfang Keep",
  "Blackfathom Deeps",
  "The Stockade",
  "Gnomeregan",
  "Razorfen Kraul",
  "Scarlet Monastery",
  "Razorfen Downs",
  "Uldaman",
  "Zul'Farrak",
  "Maraudon",
  "Temple of Atal'Hakkar",
  "Blackrock Depths",
  "Lower Blackrock Spire",
  "Upper Blackrock Spire",
  "Dire Maul",
  "Scholomance",
  "Stratholme",
]);
const allowedDungeonNames = new Set([
  ...classicDungeonNames,
  ...tbcDungeonNames,
]);
const tbcEraDungeonLevels = {
  "Ragefire Chasm": [13, 18],
  "Wailing Caverns": [17, 24],
  "The Deadmines": [18, 23],
  "Shadowfang Keep": [22, 30],
  "Blackfathom Deeps": [24, 32],
  "The Stockade": [22, 32],
  "Gnomeregan": [29, 38],
  "Razorfen Kraul": [30, 40],
  "Scarlet Monastery": [26, 45],
  "Razorfen Downs": [37, 46],
  "Uldaman": [41, 51],
  "Zul'Farrak": [44, 54],
  Maraudon: [46, 55],
  "Temple of Atal'Hakkar": [50, 58],
  "Blackrock Depths": [52, 60],
  "Lower Blackrock Spire": [55, 60],
  "Upper Blackrock Spire": [55, 60],
  "Dire Maul": [55, 60],
  Scholomance: [58, 60],
  Stratholme: [58, 60],
  "Hellfire Ramparts": [58, 63],
  "The Blood Furnace": [60, 64],
  "The Shattered Halls": [67, 70],
  "The Slave Pens": [61, 65],
  "The Underbog": [62, 66],
  "The Steamvault": [67, 70],
  "Mana-Tombs": [64, 68],
  "Auchenai Crypts": [65, 69],
  "Sethekk Halls": [67, 70],
  "Shadow Labyrinth": [68, 70],
  "Old Hillsbrad Foothills": [66, 68],
  "The Black Morass": [68, 70],
  "The Mechanar": [68, 70],
  "The Botanica": [69, 70],
  "The Arcatraz": [69, 70],
  "Magisters' Terrace": [68, 70],
};
const allDungeonZones = zones.filter(
  (zone) =>
    zone.category === "Dungeon" &&
    Array.isArray(zone.level) &&
    typeof zone.level[0] === "number" &&
    allowedDungeonNames.has(zone.name),
);
const dungeonZoneIdSet = new Set(allDungeonZones.map((zone) => zone.id));

const grouped = new Map();
for (const zone of allDungeonZones) {
  const location = tbcDungeonNames.has(zone.name)
    ? "Outland / Caverns of Time / Quel'Danas"
    : "Azeroth";
  const [levelMin, levelMax] = tbcEraDungeonLevels[zone.name] || [
    Number(zone.level?.[0] ?? 1),
    Math.min(70, Number(zone.level?.[1] ?? 70)),
  ];
  grouped.set(zone.id, {
    id: zone.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    name: zone.name,
    levelMin,
    levelMax,
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
