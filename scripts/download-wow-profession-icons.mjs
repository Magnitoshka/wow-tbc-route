import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

const ICON_NAMES = [
  "ability_hunter_beasttaming",
  "inv_alchemy_elixir_04",
  "inv_belt_01",
  "inv_boots_05",
  "inv_boots_plate_04",
  "inv_bracer_03",
  "inv_chest_cloth_24",
  "inv_drink_06",
  "inv_enchant_duststrange",
  "inv_enchant_essenceastralsmall",
  "inv_fabric_linen_01",
  "inv_fabric_silk_01",
  "inv_fabric_silk_02",
  "inv_gauntlets_04",
  "inv_gauntlets_17",
  "inv_gizmo_02",
  "inv_gizmo_08",
  "inv_hammer_04",
  "inv_ingot_01",
  "inv_ingot_02",
  "inv_ingot_03",
  "inv_ingot_04",
  "inv_ingot_05",
  "inv_ingot_06",
  "inv_ingot_07",
  "inv_ingot_08",
  "inv_ingot_09",
  "inv_ingot_10",
  "inv_ingot_11",
  "inv_jewelry_necklace_07",
  "inv_jewelry_ring_03",
  "inv_misc_bomb_05",
  "inv_misc_drum_05",
  "inv_misc_dust_01",
  "inv_misc_gem_01",
  "inv_misc_gem_variety_01",
  "inv_misc_herb_17",
  "inv_misc_herb_19",
  "inv_misc_leatherscrap_03",
  "inv_misc_pelt_bear_03",
  "inv_misc_pelt_boar_01",
  "inv_misc_pelt_boar_ruin_01",
  "inv_misc_pelt_wolf_02",
  "inv_misc_pelt_wolf_01",
  "inv_misc_questionmark",
  "inv_ore_copper_01",
  "inv_ore_feliron",
  "inv_ore_iron_01",
  "inv_ore_khorium",
  "inv_ore_mithril_02",
  "inv_ore_tin_01",
  "inv_ore_thorium_02",
  "inv_pick_02",
  "inv_pants_03",
  "inv_potion_100",
  "inv_potion_12",
  "inv_potion_39",
  "inv_potion_81",
  "inv_helmet_25",
  "inv_chest_plate10",
  "inv_staff_goldfeathered_01",
  "inv_stone_06",
  "inv_weapon_rifle_08",
  "spell_nature_naturetouchgrow",
  "trade_engraving",
];

const OUTPUT_DIR = path.resolve("public", "wow-icons");
const CDN = "https://wow.zamimg.com/images/wow/icons/large";

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadIcon(iconName) {
  const outPath = path.join(OUTPUT_DIR, `${iconName}.jpg`);
  if (await fileExists(outPath)) return "skipped";
  const url = `${CDN}/${iconName}.jpg`;
  const res = await fetch(url);
  if (!res.ok) return "missing";
  const arr = await res.arrayBuffer();
  await writeFile(outPath, Buffer.from(arr));
  return "downloaded";
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  let downloaded = 0;
  let skipped = 0;
  let missing = 0;

  for (const iconName of ICON_NAMES) {
    const status = await downloadIcon(iconName);
    if (status === "downloaded") downloaded += 1;
    if (status === "skipped") skipped += 1;
    if (status === "missing") {
      missing += 1;
      console.warn(`Missing icon: ${iconName}`);
    }
  }

  console.log(
    `WoW icons sync complete. downloaded=${downloaded}, skipped=${skipped}, missing=${missing}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
