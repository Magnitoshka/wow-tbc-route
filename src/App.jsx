import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  classList,
  quests,
  raceClassMap,
  raceFactionMap,
  sourceLinks,
  raceList,
} from "./quests";
import { dungeons } from "./dungeons";
import { PROFESSION_ITEM_ICON_MAP } from "./profession-item-icon-map";

const CLASSIC_TBC_DUNGEON_NAMES = new Set([
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
const SCARLET_MONASTERY = "Scarlet Monastery";
const SCARLET_WING_ORDER = ["Graveyard", "Library", "Armory", "Cathedral", "Event"];
const SCARLET_WING_LEVELS = {
  Graveyard: [28, 34],
  Library: [32, 39],
  Armory: [35, 45],
  Cathedral: [38, 45],
  Event: [70, 70],
};
const SCARLET_BOSS_TO_WING = {
  "Bloodmage Thalnos": "Graveyard",
  "Interrogator Vishas": "Graveyard",
  "Azshir the Sleepless": "Graveyard",
  "Fallen Champion": "Graveyard",
  Ironspine: "Graveyard",
  "Houndmaster Loksey": "Library",
  "Arcanist Doan": "Library",
  Herod: "Armory",
  "Scarlet Trainee": "Armory",
  "Scarlet Commander Mograine": "Cathedral",
  "High Inquisitor Whitemane": "Cathedral",
  "High Inquisitor Fairbanks": "Cathedral",
  "Scarlet Champion": "Cathedral",
  "Scarlet Centurion": "Cathedral",
  Scorn: "Cathedral",
  "Headless Horseman": "Event",
};
const PROFESSION_DEFS = [
  { id: "alchemy", en: "Alchemy", ru: "Алхимия", icon: "profession-icons/alchemy.jpg" },
  { id: "blacksmithing", en: "Blacksmithing", ru: "Кузнечное дело", icon: "profession-icons/blacksmithing.jpg" },
  { id: "enchanting", en: "Enchanting", ru: "Наложение чар", icon: "profession-icons/enchanting.jpg" },
  { id: "engineering", en: "Engineering", ru: "Инженерное дело", icon: "profession-icons/engineering.jpg" },
  { id: "herbalism", en: "Herbalism", ru: "Травничество", icon: "profession-icons/herbalism.jpg" },
  { id: "inscription", en: "Inscription", ru: "Начертание", icon: "profession-icons/inscription.jpg" },
  { id: "jewelcrafting", en: "Jewelcrafting", ru: "Ювелирное дело", icon: "profession-icons/jewelcrafting.jpg" },
  { id: "leatherworking", en: "Leatherworking", ru: "Кожевничество", icon: "profession-icons/leatherworking.jpg" },
  { id: "mining", en: "Mining", ru: "Горное дело", icon: "profession-icons/mining.jpg" },
  { id: "skinning", en: "Skinning", ru: "Снятие шкур", icon: "profession-icons/skinning.jpg" },
  { id: "tailoring", en: "Tailoring", ru: "Портняжное дело", icon: "profession-icons/tailoring.jpg" },
];
const DUNGEON_ZONE_BY_NAME = {
  "Ragefire Chasm": "Orgrimmar",
  "Wailing Caverns": "Northern Barrens",
  "The Deadmines": "Westfall",
  "Shadowfang Keep": "Silverpine Forest",
  "Blackfathom Deeps": "Ashenvale",
  "The Stockade": "Stormwind City",
  Gnomeregan: "Dun Morogh",
  "Razorfen Kraul": "Southern Barrens",
  "Scarlet Monastery": "Tirisfal Glades",
  "Razorfen Downs": "Southern Barrens",
  Uldaman: "Badlands",
  "Zul'Farrak": "Tanaris",
  Maraudon: "Desolace",
  "Temple of Atal'Hakkar": "Swamp of Sorrows",
  "Blackrock Depths": "Blackrock Mountain",
  "Lower Blackrock Spire": "Blackrock Mountain",
  "Upper Blackrock Spire": "Blackrock Mountain",
  "Dire Maul": "Feralas",
  Scholomance: "Western Plaguelands",
  Stratholme: "Eastern Plaguelands",
  "Hellfire Ramparts": "Hellfire Peninsula",
  "The Blood Furnace": "Hellfire Peninsula",
  "The Shattered Halls": "Hellfire Peninsula",
  "The Slave Pens": "Zangarmarsh",
  "The Underbog": "Zangarmarsh",
  "The Steamvault": "Zangarmarsh",
  "Mana-Tombs": "Terokkar Forest",
  "Auchenai Crypts": "Terokkar Forest",
  "Sethekk Halls": "Terokkar Forest",
  "Shadow Labyrinth": "Terokkar Forest",
  "Old Hillsbrad Foothills": "Caverns of Time",
  "The Black Morass": "Caverns of Time",
  "The Mechanar": "Netherstorm",
  "The Botanica": "Netherstorm",
  "The Arcatraz": "Netherstorm",
  "Magisters' Terrace": "Isle of Quel'Danas",
};

function getDungeonRegionLabel(location) {
  if (location.startsWith("Outland")) return "Outland";
  return "Azeroth";
}

function getDungeonDisplayLocation(dungeonName, location) {
  const baseName = dungeonName.split(":")[0].trim();
  const zone = DUNGEON_ZONE_BY_NAME[baseName] || "Unknown";
  return `${getDungeonRegionLabel(location)} | ${zone}`;
}

const professionDefById = Object.fromEntries(PROFESSION_DEFS.map((item) => [item.id, item]));

const PROFESSION_LEVELING_STEPS = {
  alchemy: [
    { range: "1-60", qty: 60, en: "Minor Healing Potion", ru: "Малое лечебное зелье" },
    { range: "60-110", qty: 60, en: "Lesser Healing Potion", ru: "Среднее лечебное зелье" },
    { range: "110-140", qty: 30, en: "Healing Potion", ru: "Лечебное зелье" },
    { range: "140-155", qty: 15, en: "Greater Healing Potion", ru: "Сильное лечебное зелье" },
    { range: "155-185", qty: 35, en: "Elixir of Agility", ru: "Эликсир ловкости" },
    { range: "185-210", qty: 25, en: "Elixir of Greater Defense", ru: "Эликсир большой защиты" },
    { range: "210-215", qty: 5, en: "Elixir of Detect Undead", ru: "Эликсир обнаружения нежити" },
    { range: "215-230", qty: 15, en: "Superior Healing Potion", ru: "Превосходное лечебное зелье" },
    { range: "230-250", qty: 25, en: "Elixir of Detect Demon", ru: "Эликсир обнаружения демонов" },
    { range: "250-265", qty: 15, en: "Elixir of Greater Agility", ru: "Эликсир большой ловкости" },
    { range: "265-285", qty: 20, en: "Major Healing Potion", ru: "Мощное лечебное зелье" },
    { range: "285-300", qty: 20, en: "Major Mana Potion", ru: "Мощное зелье маны" },
    { range: "300-315", qty: 20, en: "Volatile Healing Potion", ru: "Нестабильное лечебное зелье" },
    { range: "315-330", qty: 25, en: "Elixir of Healing Power", ru: "Эликсир целительной силы" },
    { range: "330-335", qty: 5, en: "Elixir of Draenic Wisdom", ru: "Эликсир дренейской мудрости" },
    { range: "335-340", qty: 5, en: "Super Healing Potion", ru: "Супер-лечебное зелье" },
    { range: "340-355", qty: 15, en: "Super Mana Potion", ru: "Супер-манапот" },
    { range: "355-375", qty: 40, en: "Major Dreamless Sleep Potion", ru: "Мощное зелье спокойного сна" },
  ],
  blacksmithing: [
    { range: "1-25", qty: 25, en: "Rough Sharpening Stone", ru: "Грубый шлифовальный камень" },
    { range: "25-45", qty: 25, en: "Rough Grinding Stone", ru: "Грубый точильный камень" },
    { range: "45-75", qty: 35, en: "Copper Chain Belt", ru: "Медный кольчужный пояс" },
    { range: "75-90", qty: 15, en: "Coarse Grinding Stone", ru: "Зернистый точильный камень" },
    { range: "90-100", qty: 10, en: "Runed Copper Belt", ru: "Рунический медный пояс" },
    { range: "100-105", qty: 5, en: "Silver Rod", ru: "Серебряный жезл" },
    { range: "105-125", qty: 20, en: "Rough Bronze Leggings", ru: "Грубые бронзовые поножи" },
    { range: "125-150", qty: 25, en: "Heavy Grinding Stone", ru: "Тяжелый точильный камень" },
    { range: "150-155", qty: 5, en: "Golden Rod", ru: "Золотой жезл" },
    { range: "155-185", qty: 30, en: "Green Iron Leggings", ru: "Зеленые железные поножи" },
    { range: "185-200", qty: 15, en: "Golden Scale Bracers", ru: "Золотые чешуйчатые наручи" },
    { range: "200-210", qty: 10, en: "Solid Grinding Stone", ru: "Прочный точильный камень" },
    { range: "210-235", qty: 25, en: "Heavy Mithril Gauntlet", ru: "Тяжелые мифриловые рукавицы" },
    { range: "235-250", qty: 15, en: "Mithril Coif", ru: "Мифриловый капюшон" },
    { range: "250-260", qty: 10, en: "Dense Sharpening Stone", ru: "Плотный шлифовальный камень" },
    { range: "260-270", qty: 10, en: "Thorium Belt", ru: "Ториевый пояс" },
    { range: "270-295", qty: 25, en: "Imperial Plate Bracers", ru: "Имперские латные наручи" },
    { range: "295-300", qty: 5, en: "Thorium Boots", ru: "Ториевые сапоги" },
    { range: "300-305", qty: 7, en: "Fel Weightstone", ru: "Точильный камень Скверны" },
    { range: "305-316", qty: 11, en: "Fel Iron Plate Belt", ru: "Пояс из оскверненного железа" },
    { range: "316-321", qty: 5, en: "Fel Iron Chain Gloves", ru: "Кольчужные перчатки из оскверненного железа" },
    { range: "321-325", qty: 4, en: "Fel Iron Plate Boots", ru: "Латные сапоги из оскверненного железа" },
    { range: "325-335", qty: 45, en: "Lesser Rune of Warding", ru: "Малый символ защиты" },
    { range: "335-340", qty: 7, en: "Fel Iron Chain Tunic", ru: "Кольчужный мундир из оскверненного железа" },
    { range: "340-350", qty: 45, en: "Lesser Ward of Shielding", ru: "Малый идол щита" },
    { range: "350-360", qty: 45, en: "Adamantite Weightstone", ru: "Точильный камень из адамантита" },
    {
      range: "360-375",
      qty: 17,
      en: "Enchanted Adamantite Belt (or Felsteel Gloves)",
      ru: "Зачарованный адамантитовый пояс (или перчатки из оскверненной стали)",
    },
  ],
  enchanting: [
    { range: "1-2", qty: 1, en: "Runed Copper Rod", ru: "Рунический медный жезл" },
    { range: "2-50", qty: 50, en: "Enchant Bracer - Minor Health", ru: "Чары на наручи: здоровье I" },
    { range: "50-70", qty: 20, en: "Enchant Bracer - Minor Stamina", ru: "Чары на наручи: выносливость I" },
    { range: "70-90", qty: 20, en: "Enchant Bracer - Minor Strength", ru: "Чары на наручи: сила I" },
    { range: "90-100", qty: 10, en: "Enchant Bracer - Minor Stamina", ru: "Чары на наручи: выносливость I" },
    { range: "100-101", qty: 1, en: "Runed Silver Rod", ru: "Рунический серебряный жезл" },
    { range: "101-120", qty: 20, en: "Enchant Bracer - Minor Agility", ru: "Чары на наручи: ловкость I" },
    { range: "120-150", qty: 30, en: "Enchant Bracer - Lesser Stamina", ru: "Чары на наручи: выносливость II" },
    { range: "150-151", qty: 1, en: "Runed Golden Rod", ru: "Рунический золотой жезл" },
    { range: "151-160", qty: 10, en: "Enchant Bracer - Spirit", ru: "Чары на наручи: дух I" },
    { range: "160-180", qty: 20, en: "Enchant Bracer - Strength", ru: "Чары на наручи: сила II" },
    { range: "180-200", qty: 20, en: "Enchant Bracer - Greater Stamina", ru: "Чары на наручи: выносливость III" },
    { range: "200-201", qty: 1, en: "Runed Truesilver Rod", ru: "Рунический истинно-серебряный жезл" },
    { range: "201-225", qty: 30, en: "Enchant Bracer - Greater Strength", ru: "Чары на наручи: сила III" },
    { range: "225-235", qty: 10, en: "Enchant Gloves - Agility", ru: "Чары на перчатки: ловкость" },
    { range: "235-245", qty: 10, en: "Enchant Chest - Superior Health", ru: "Чары на нагрудник: здоровье IV" },
    { range: "245-265", qty: 20, en: "Enchant Bracer - Greater Intellect", ru: "Чары на наручи: интеллект III" },
    { range: "265-290", qty: 25, en: "Enchant Shield - Greater Stamina", ru: "Чары на щит: выносливость IV" },
    { range: "290-300", qty: 10, en: "Enchant Chest - Major Health", ru: "Чары на нагрудник: здоровье V" },
    { range: "300-301", qty: 1, en: "Runed Fel Iron Rod", ru: "Рунический жезл из оскверненного железа" },
    { range: "300-310", qty: 9, en: "Enchant Bracer - Assault", ru: "Чары на наручи: штурм" },
    { range: "310-316", qty: 6, en: "Enchant Bracer - Brawn", ru: "Чары на наручи: мощь" },
    { range: "316-330", qty: 16, en: "Enchant Gloves - Assault", ru: "Чары на перчатки: штурм" },
    { range: "330-335", qty: 5, en: "Enchant Shield - Major Stamina", ru: "Чары на щит: выносливость V" },
    { range: "335-340", qty: 5, en: "Enchant Shield - Resilience", ru: "Чары на щит: устойчивость" },
    { range: "340-350", qty: 15, en: "Superior Wizard Oil", ru: "Сверкающее волшебное масло" },
    { range: "350-360", qty: 15, en: "Enchant Gloves - Major Strength", ru: "Чары на перчатки: сила II" },
    { range: "361-365", qty: 10, en: "Enchant Gloves - Major Strength", ru: "Чары на перчатки: сила II" },
    { range: "365-375", qty: 12, en: "Enchant Ring - Spellpower", ru: "Чары для кольца: сила заклинаний" },
  ],
  engineering: [
    { range: "1-30", qty: 60, en: "Rough Blasting Powder", ru: "Грубый взрывчатый порошок" },
    { range: "30-50", qty: 30, en: "Handful of Copper Bolts", ru: "Горсть медных винтов" },
    { range: "50-51", qty: 1, en: "Arclight Spanner", ru: "Патентованный гномский армейский нож" },
    { range: "51-65", qty: 14, en: "Copper Tube", ru: "Медная труба" },
    { range: "65-75", qty: 10, en: "Rough Copper Bomb", ru: "Грубая медная бомба" },
    { range: "75-95", qty: 20, en: "Coarse Blasting Powder", ru: "Зернистый взрывчатый порошок" },
    { range: "95-105", qty: 10, en: "Silver Contact", ru: "Серебряный контакт" },
    { range: "105-120", qty: 15, en: "Bronze Tubes", ru: "Бронзовые трубки" },
    { range: "120-125", qty: 5, en: "Small Bronze Bomb", ru: "Небольшая бронзовая бомба" },
    { range: "125-145", qty: 20, en: "Heavy Blasting Powder", ru: "Тяжелый взрывчатый порошок" },
    { range: "145-150", qty: 5, en: "Whirring Bronze Gizmo", ru: "Трещащий бронзовый механизм" },
    { range: "150-175", qty: 30, en: "Big Bronze Bomb", ru: "Большая бронзовая бомба" },
    { range: "175-200", qty: 25, en: "Solid Blasting Powder", ru: "Твердый взрывчатый порошок" },
    { range: "200-210", qty: 10, en: "Mithril Tube", ru: "Мифриловая труба" },
    { range: "210-225", qty: 15, en: "Unstable Trigger", ru: "Нестабильное пусковое устройство" },
    { range: "225-235", qty: 10, en: "Mithril Casing", ru: "Мифриловая обшивка" },
    { range: "235-245", qty: 10, en: "Hi-Explosive Bomb", ru: "Фугасная бомба" },
    { range: "245-260", qty: 15, en: "Dense Blasting Powder", ru: "Концентрированный взрывчатый порошок" },
    { range: "260-285", qty: 25, en: "Thorium Widget", ru: "Ториевое устройство" },
    { range: "285-300", qty: 20, en: "Thorium Shells", ru: "Ториевые патроны" },
    { range: "300-320", qty: 114, en: "Handful of Fel Iron Bolts", ru: "Горсть винтов из оскверненного железа" },
    { range: "320-325", qty: 7, en: "Fel Iron Bomb", ru: "Бомба из оскверненного железа" },
    { range: "325-335", qty: 30, en: "Adamantite Frame", ru: "Адамантитовая рамка" },
    { range: "335-355", qty: 70, en: "White Smoke Flare", ru: "Белый дымовой сигнал" },
    { range: "355-360", qty: 5, en: "Khorium Power Core", ru: "Кориевый силовой сердечник" },
    { range: "360-370", qty: 15, en: "Adamantite Rifle", ru: "Адамантитовая винтовка" },
    { range: "370-375", qty: 5, en: "Field Repair Bot 110G", ru: "Полевой ремонтный робот 110G" },
  ],
  jewelcrafting: [
    { range: "1-20", qty: 20, en: "Delicate Copper Wire", ru: "Тонкая медная проволока" },
    { range: "20-30", qty: 10, en: "Tigerseye Band", ru: "Кольцо с тигровым глазом" },
    { range: "30-50", qty: 20, en: "Bronze Setting", ru: "Бронзовая оправа" },
    { range: "50-80", qty: 30, en: "Simple Pearl Ring", ru: "Простое кольцо с жемчугом" },
    { range: "80-100", qty: 20, en: "Heavy Stone Statue", ru: "Статуэтка из тяжелого камня" },
    { range: "100-110", qty: 10, en: "Ring of Silver Might", ru: "Серебряное кольцо могущества" },
    { range: "110-130", qty: 20, en: "Pendant of the Agate Shield", ru: "Подвеска агатового щита" },
    { range: "130-150", qty: 20, en: "Mithril Filigree", ru: "Мифриловая филигрань" },
    { range: "150-180", qty: 30, en: "Aqua Marine Signet", ru: "Печатка с аквамарином" },
    { range: "180-200", qty: 20, en: "Thorium Setting", ru: "Ториевая оправа" },
    { range: "200-220", qty: 20, en: "Ruby Pendant of Fire", ru: "Рубиновый кулон огня" },
    { range: "220-250", qty: 30, en: "Simple Opal Ring", ru: "Простое опаловое кольцо" },
    { range: "250-280", qty: 30, en: "Dense Stone Statue", ru: "Статуэтка из плотного камня" },
    { range: "280-300", qty: 20, en: "Sapphire Signet", ru: "Сапфировая печатка" },
    { range: "300-320", qty: 30, en: "Cheap uncommon cuts (mix)", ru: "Дешевые огранки необычных камней (микс)" },
    { range: "320-325", qty: 7, en: "Cheap uncommon cuts", ru: "Дешевые огранки необычных камней" },
    { range: "325-335", qty: 12, en: "Mercurial Adamantite", ru: "Ртутный адамантит" },
    { range: "335-340", qty: 8, en: "Cheap uncommon cuts", ru: "Дешевые огранки необычных камней" },
    { range: "340-350", qty: 12, en: "Heavy Adamantite Ring", ru: "Тяжелое адамантитовое кольцо" },
    { range: "350-360", qty: 15, en: "Purified Shadow Pearl", ru: "Очищенная темная жемчужина" },
    { range: "360-365", qty: 5, en: "Jewelcrafter-only epic gems", ru: "Эпические камни ювелира" },
  ],
  leatherworking: [
    { range: "1-45", qty: 45, en: "Light Armor Kit", ru: "Комплект легкой брони" },
    { range: "45-55", qty: 10, en: "Handstitched Leather Cloak", ru: "Прошитый кожаный плащ" },
    { range: "55-100", qty: 50, en: "Embossed Leather Gloves", ru: "Тисненые кожаные перчатки" },
    { range: "100-120", qty: 20, en: "Fine Leather Belt", ru: "Тонкий кожаный пояс" },
    { range: "120-150", qty: 30, en: "Dark Leather Belt", ru: "Темный кожаный пояс" },
    { range: "150-170", qty: 20, en: "Cured Heavy Hide", ru: "Обработанная толстая шкура" },
    { range: "170-195", qty: 25, en: "Heavy Armor Kit", ru: "Комплект прочной брони" },
    { range: "195-205", qty: 10, en: "Barbaric Bracers", ru: "Варварские наручи" },
    { range: "205-230", qty: 25, en: "Nightscape Headband", ru: "Ночная головная повязка" },
    { range: "230-250", qty: 20, en: "Nightscape Pants", ru: "Ночные штаны" },
    { range: "250-265", qty: 15, en: "Wicked Leather Bracers", ru: "Наручи из кожи зла" },
    { range: "265-290", qty: 25, en: "Wicked Leather Headband", ru: "Повязка из кожи зла" },
    { range: "290-300", qty: 10, en: "Wicked Leather Belt", ru: "Пояс из кожи зла" },
    { range: "300-325", qty: 30, en: "Knothide Armor Kit", ru: "Накладки из узловатой кожи" },
    { range: "325-335", qty: 222, en: "Heavy Knothide Leather", ru: "Плотная узловатая кожа" },
    { range: "335-350", qty: 20, en: "Thick Draenic Vest", ru: "Плотный дренейский жилет" },
    { range: "350-365", qty: 50, en: "Heavy Knothide Armor Kit", ru: "Плотные накладки из узловатой кожи" },
    { range: "365-370", qty: 6, en: "Drums of Battle", ru: "Барабаны битвы" },
    { range: "370-375", qty: 6, en: "Drums of Panic", ru: "Барабаны паники" },
  ],
  tailoring: [
    { range: "1-50", qty: 70, en: "Bolt of Linen Cloth", ru: "Рулон льняной ткани" },
    { range: "50-70", qty: 20, en: "Linen Belt", ru: "Льняной пояс" },
    { range: "70-100", qty: 35, en: "Reinforced Linen Cape", ru: "Усиленный льняной плащ" },
    { range: "100-115", qty: 20, en: "Bolt of Woolen Cloth", ru: "Рулон шерсти" },
    { range: "115-125", qty: 10, en: "Gray Woolen Shirt", ru: "Серая шерстяная рубашка" },
    { range: "125-145", qty: 30, en: "Double-stitched Woolen Shoulders", ru: "Двухшовные шерстяные наплечники" },
    { range: "145-160", qty: 25, en: "Bolt of Silk Cloth", ru: "Рулон шелка" },
    { range: "160-170", qty: 10, en: "Azure Silk Hood", ru: "Лазурный шелковый капюшон" },
    { range: "170-185", qty: 15, en: "Silk Headband", ru: "Шелковая повязка" },
    { range: "185-205", qty: 20, en: "Crimson Silk Vest", ru: "Багровый шелковый жилет" },
    { range: "205-215", qty: 10, en: "Crimson Silk Pantaloons", ru: "Багровые шелковые панталоны" },
    { range: "215-230", qty: 15, en: "Bolt of Mageweave", ru: "Рулон магической ткани" },
    { range: "230-250", qty: 20, en: "Black Mageweave Leggings", ru: "Черные поножи из магической ткани" },
    { range: "250-260", qty: 10, en: "Black Mageweave Gloves", ru: "Черные перчатки из магической ткани" },
    { range: "260-285", qty: 25, en: "Runecloth Belt", ru: "Пояс из рунической ткани" },
    { range: "285-300", qty: 15, en: "Runecloth Gloves", ru: "Перчатки из рунической ткани" },
    { range: "300-325", qty: 496, en: "Bolt of Netherweave", ru: "Рулон ткани Пустоты" },
    { range: "325-340", qty: 102, en: "Bolt of Imbued Netherweave", ru: "Рулон чароткани" },
    { range: "340-345", qty: 5, en: "Netherweave Boots", ru: "Сапоги из ткани Пустоты" },
    { range: "345-360", qty: 20, en: "Netherweave Tunic", ru: "Мундир из ткани Пустоты" },
    { range: "360-375", qty: 17, en: "Imbued Netherweave Tunic", ru: "Чаромундир из чароткани" },
  ],
  herbalism: [
    {
      range: "1-75",
      qty: "route",
      en: "Gather Peacebloom / Silverleaf / Earthroot",
      ru: "Собирать Мироцвет / Серебряный лист / Земляной корень",
      mats: [
        { en: "Peacebloom", ru: "Мироцвет", qty: "route", icon: "inv_misc_flower_02" },
        { en: "Silverleaf", ru: "Серебряный лист", qty: "route", icon: "inv_misc_herb_10" },
        { en: "Earthroot", ru: "Земляной корень", qty: "route", icon: "inv_misc_herb_07" },
      ],
    },
    {
      range: "75-150",
      qty: "route",
      en: "Gather Mageroyal / Briarthorn / Stranglekelp",
      ru: "Собирать Магорозу / Острошип / Удавник",
      mats: [
        { en: "Mageroyal", ru: "Магороза", qty: "route", icon: "inv_jewelry_talisman_03" },
        { en: "Briarthorn", ru: "Острошип", qty: "route", icon: "inv_misc_root_01" },
        { en: "Stranglekelp", ru: "Удавник", qty: "route", icon: "inv_misc_herb_11" },
      ],
    },
    {
      range: "150-225",
      qty: "route",
      en: "Gather Bruiseweed / Wild Steelbloom / Kingsblood",
      ru: "Собирать Синячник / Дикий сталецвет / Королевскую кровь",
      mats: [
        { en: "Bruiseweed", ru: "Синячник", qty: "route", icon: "inv_misc_herb_01" },
        { en: "Wild Steelbloom", ru: "Дикий сталецвет", qty: "route", icon: "inv_misc_flower_01" },
        { en: "Kingsblood", ru: "Королевская кровь", qty: "route", icon: "inv_misc_herb_03" },
      ],
    },
    {
      range: "225-300",
      qty: "route",
      en: "Gather Sungrass / Blindweed / Gromsblood",
      ru: "Собирать Солнечник / Пастушью сумку / Кровь Грома",
      mats: [
        { en: "Sungrass", ru: "Солнечник", qty: "route", icon: "inv_misc_herb_18" },
        { en: "Blindweed", ru: "Пастушья сумка", qty: "route", icon: "inv_misc_herb_14" },
        { en: "Gromsblood", ru: "Кровь Грома", qty: "route", icon: "inv_misc_herb_16" },
      ],
    },
    {
      range: "300-375",
      qty: "route",
      en: "Gather Felweed / Dreaming Glory / Terocone",
      ru: "Собирать Скверноплевел / Славу сновидца / Терошишку",
      mats: [
        { en: "Felweed", ru: "Скверноплевел", qty: "route", icon: "inv_misc_herb_felweed" },
        { en: "Dreaming Glory", ru: "Слава сновидца", qty: "route", icon: "inv_misc_herb_dreamingglory" },
        { en: "Terocone", ru: "Терошишка", qty: "route", icon: "inv_misc_herb_terrocone" },
      ],
    },
  ],
  mining: [
    {
      range: "1-65",
      qty: "route",
      en: "Copper Vein",
      ru: "Медная жила",
      mats: [{ en: "Copper Ore", ru: "Медная руда", qty: "route", icon: "inv_ore_copper_01" }],
    },
    {
      range: "65-125",
      qty: "route",
      en: "Tin Vein / Silver Vein",
      ru: "Оловянная жила / Серебряная жила",
      mats: [
        { en: "Tin Ore", ru: "Оловянная руда", qty: "route", icon: "inv_ore_tin_01" },
        { en: "Silver Ore", ru: "Серебряная руда", qty: "route", icon: "inv_ore_tin_01" },
      ],
    },
    {
      range: "125-175",
      qty: "route",
      en: "Iron Deposit",
      ru: "Залежи железа",
      mats: [{ en: "Iron Ore", ru: "Железная руда", qty: "route", icon: "inv_ore_iron_01" }],
    },
    {
      range: "175-250",
      qty: "route",
      en: "Mithril Deposit",
      ru: "Залежи мифрила",
      mats: [{ en: "Mithril Ore", ru: "Мифриловая руда", qty: "route", icon: "inv_ore_mithril_02" }],
    },
    {
      range: "250-300",
      qty: "route",
      en: "Thorium Vein",
      ru: "Ториевая жила",
      mats: [{ en: "Thorium Ore", ru: "Ториевая руда", qty: "route", icon: "inv_ore_thorium_02" }],
    },
    {
      range: "300-375",
      qty: "route",
      en: "Fel Iron / Adamantite / Khorium",
      ru: "Оскверненное железо / Адамантит / Корий",
      mats: [
        { en: "Fel Iron Ore", ru: "Оскверненная железная руда", qty: "route", icon: "inv_ore_feliron" },
        { en: "Adamantite Ore", ru: "Адамантитовая руда", qty: "route", icon: "inv_ore_mithril_02" },
        { en: "Khorium Ore", ru: "Кориевая руда", qty: "route", icon: "inv_ore_khorium" },
      ],
    },
  ],
  skinning: [
    {
      range: "1-75",
      qty: "route",
      en: "Beasts in starter zones",
      ru: "Звери стартовых зон",
      mats: [{ en: "Light Leather", ru: "Тонкая кожа", qty: "route", icon: "inv_misc_pelt_wolf_01" }],
    },
    {
      range: "75-150",
      qty: "route",
      en: "Beasts in 15-30 zones",
      ru: "Звери зон 15-30",
      mats: [{ en: "Medium Leather", ru: "Кожа среднего качества", qty: "route", icon: "inv_misc_pelt_bear_03" }],
    },
    {
      range: "150-225",
      qty: "route",
      en: "Beasts in 30-45 zones",
      ru: "Звери зон 30-45",
      mats: [
        { en: "Heavy Leather", ru: "Толстая кожа", qty: "route", icon: "inv_misc_pelt_boar_01" },
        { en: "Thick Leather", ru: "Плотная кожа", qty: "route", icon: "inv_misc_pelt_boar_ruin_01" },
      ],
    },
    {
      range: "225-300",
      qty: "route",
      en: "Rugged Leather routes",
      ru: "Маршруты плотной кожи",
      mats: [{ en: "Rugged Leather", ru: "Грубая кожа", qty: "route", icon: "inv_misc_pelt_wolf_02" }],
    },
    {
      range: "300-375",
      qty: "route",
      en: "Knothide Leather routes in Outland",
      ru: "Маршруты узловатой кожи в Запределье",
      mats: [{ en: "Knothide Leather", ru: "Узловатая кожа", qty: "route", icon: "inv_misc_leatherscrap_03" }],
    },
  ],
  inscription: [
    {
      range: "N/A",
      qty: "-",
      en: "Inscription was not available in original TBC.",
      ru: "Начертание отсутствовало в оригинальном TBC.",
    },
  ],
};

const MATERIAL_PRESETS = {
  alchemy: [
    { en: "Herbs", ru: "Травы", icon: "inv_misc_herb_19", mult: 2 },
    { en: "Crystal Vial", ru: "Хрустальный флакон", icon: "inv_drink_06", mult: 1 },
  ],
  blacksmithing: [
    { en: "Metal Bars", ru: "Слитки металла", icon: "inv_ingot_02", mult: 3 },
    { en: "Stones", ru: "Камни", icon: "inv_stone_06", mult: 1 },
  ],
  enchanting: [
    { en: "Dusts", ru: "Чародейская пыль", icon: "inv_enchant_duststrange", mult: 2 },
    { en: "Essences", ru: "Субстанции", icon: "inv_enchant_essenceastralsmall", mult: 1 },
  ],
  engineering: [
    { en: "Bars", ru: "Слитки", icon: "inv_ingot_03", mult: 2 },
    { en: "Powder", ru: "Порошок", icon: "inv_misc_dust_01", mult: 1 },
  ],
  jewelcrafting: [
    { en: "Gems", ru: "Самоцветы", icon: "inv_misc_gem_01", mult: 1 },
    { en: "Ore/Bars", ru: "Руда/Слитки", icon: "inv_ore_copper_01", mult: 2 },
  ],
  leatherworking: [
    { en: "Leather", ru: "Кожа", icon: "inv_misc_leatherscrap_03", mult: 3 },
    { en: "Thread", ru: "Нить", icon: "inv_fabric_silk_02", mult: 1 },
  ],
  tailoring: [
    { en: "Cloth", ru: "Ткань", icon: "inv_fabric_linen_01", mult: 3 },
    { en: "Thread", ru: "Нить", icon: "inv_fabric_silk_02", mult: 1 },
  ],
  herbalism: [
    { en: "Herb nodes", ru: "Травяные узлы", icon: "inv_misc_herb_17", mult: 0 },
  ],
  mining: [
    { en: "Ore veins", ru: "Рудные жилы", icon: "inv_ore_tin_01", mult: 0 },
  ],
  skinning: [
    { en: "Beasts", ru: "Звери", icon: "ability_hunter_beasttaming", mult: 0 },
  ],
};

const RECIPE_MATERIALS_PER_CRAFT = {
  "Minor Healing Potion": [
    { en: "Peacebloom", ru: "Мироцвет", qty: 1 },
    { en: "Silverleaf", ru: "Серебряный лист", qty: 1 },
    { en: "Empty Vial", ru: "Пустой флакон", qty: 1 },
  ],
  "Lesser Healing Potion": [
    { en: "Minor Healing Potion", ru: "Малое лечебное зелье", qty: 1 },
    { en: "Briarthorn", ru: "Острошип", qty: 1 },
  ],
  "Healing Potion": [
    { en: "Bruiseweed", ru: "Синячник", qty: 1 },
    { en: "Briarthorn", ru: "Острошип", qty: 1 },
    { en: "Leaded Vial", ru: "Освинцованный флакон", qty: 1 },
  ],
  "Greater Healing Potion": [
    { en: "Liferoot", ru: "Корень жизни", qty: 1 },
    { en: "Kingsblood", ru: "Королевская кровь", qty: 1 },
    { en: "Leaded Vial", ru: "Освинцованный флакон", qty: 1 },
  ],
  "Elixir of Agility": [
    { en: "Stranglekelp", ru: "Удавник", qty: 1 },
    { en: "Goldthorn", ru: "Златошип", qty: 1 },
    { en: "Leaded Vial", ru: "Освинцованный флакон", qty: 1 },
  ],
  "Elixir of Greater Defense": [
    { en: "Wild Steelbloom", ru: "Дикий сталецвет", qty: 1 },
    { en: "Goldthorn", ru: "Златошип", qty: 1 },
    { en: "Leaded Vial", ru: "Освинцованный флакон", qty: 1 },
  ],
  "Elixir of Detect Undead": [{ en: "Arthas' Tears", ru: "Слезы Артаса", qty: 1 }],
  "Superior Healing Potion": [
    { en: "Sungrass", ru: "Солнечник", qty: 1 },
    { en: "Khadgar's Whisker", ru: "Ус Хаггара", qty: 1 },
    { en: "Crystal Vial", ru: "Хрустальный флакон", qty: 1 },
  ],
  "Elixir of Detect Demon": [{ en: "Gromsblood", ru: "Кровь Грома", qty: 1 }],
  "Elixir of Greater Agility": [
    { en: "Sungrass", ru: "Солнечник", qty: 1 },
    { en: "Goldthorn", ru: "Златошип", qty: 1 },
    { en: "Crystal Vial", ru: "Хрустальный флакон", qty: 1 },
  ],
  "Major Healing Potion": [
    { en: "Golden Sansam", ru: "Золотой сансам", qty: 1 },
    { en: "Mountain Silversage", ru: "Горный серебряный шалфей", qty: 1 },
    { en: "Crystal Vial", ru: "Хрустальный флакон", qty: 1 },
  ],
  "Major Mana Potion": [
    { en: "Dreamfoil", ru: "Снолист", qty: 3 },
    { en: "Icecap", ru: "Ледяной зев", qty: 2 },
    { en: "Crystal Vial", ru: "Хрустальный флакон", qty: 1 },
  ],
  "Volatile Healing Potion": [
    { en: "Golden Sansam", ru: "Золотой сансам", qty: 1 },
    { en: "Felweed", ru: "Скверноплевел", qty: 1 },
    { en: "Imbued Vial", ru: "Насыщенный флакон", qty: 1 },
  ],
  "Elixir of Healing Power": [
    { en: "Felweed", ru: "Скверноплевел", qty: 1 },
    { en: "Golden Sansam", ru: "Золотой сансам", qty: 1 },
    { en: "Imbued Vial", ru: "Насыщенный флакон", qty: 1 },
  ],
  "Elixir of Draenic Wisdom": [
    { en: "Dreaming Glory", ru: "Слава сновидца", qty: 1 },
    { en: "Felweed", ru: "Скверноплевел", qty: 3 },
    { en: "Imbued Vial", ru: "Насыщенный флакон", qty: 1 },
  ],
  "Super Healing Potion": [
    { en: "Dreaming Glory", ru: "Слава сновидца", qty: 2 },
    { en: "Felweed", ru: "Скверноплевел", qty: 1 },
    { en: "Imbued Vial", ru: "Насыщенный флакон", qty: 1 },
  ],
  "Super Mana Potion": [
    { en: "Dreaming Glory", ru: "Слава сновидца", qty: 2 },
    { en: "Nightmare Vine", ru: "Кошмарная лоза", qty: 1 },
    { en: "Imbued Vial", ru: "Насыщенный флакон", qty: 1 },
  ],
  "Major Dreamless Sleep Potion": [
    { en: "Netherbloom", ru: "Пустоцвет", qty: 1 },
    { en: "Nightmare Vine", ru: "Кошмарная лоза", qty: 1 },
    { en: "Imbued Vial", ru: "Насыщенный флакон", qty: 1 },
  ],
  "Bolt of Linen Cloth": [{ en: "Linen Cloth", ru: "Льняная ткань", qty: 2 }],
  "Linen Belt": [{ en: "Bolt of Linen Cloth", ru: "Рулон льняной ткани", qty: 1 }, { en: "Coarse Thread", ru: "Грубая нить", qty: 1 }],
  "Reinforced Linen Cape": [{ en: "Bolt of Linen Cloth", ru: "Рулон льняной ткани", qty: 2 }, { en: "Coarse Thread", ru: "Грубая нить", qty: 3 }],
  "Bolt of Woolen Cloth": [{ en: "Wool Cloth", ru: "Шерсть", qty: 3 }],
  "Gray Woolen Shirt": [{ en: "Bolt of Woolen Cloth", ru: "Рулон шерсти", qty: 2 }, { en: "Fine Thread", ru: "Тонкая нить", qty: 1 }, { en: "Gray Dye", ru: "Серая краска", qty: 1 }],
  "Double-stitched Woolen Shoulders": [{ en: "Bolt of Woolen Cloth", ru: "Рулон шерсти", qty: 3 }, { en: "Fine Thread", ru: "Тонкая нить", qty: 2 }],
  "Bolt of Silk Cloth": [{ en: "Silk Cloth", ru: "Шелковая ткань", qty: 4 }],
  "Azure Silk Hood": [{ en: "Bolt of Silk Cloth", ru: "Рулон шелка", qty: 2 }, { en: "Blue Dye", ru: "Синяя краска", qty: 2 }, { en: "Fine Thread", ru: "Тонкая нить", qty: 1 }],
  "Silk Headband": [{ en: "Bolt of Silk Cloth", ru: "Рулон шелка", qty: 3 }, { en: "Fine Thread", ru: "Тонкая нить", qty: 2 }],
  "Crimson Silk Vest": [{ en: "Bolt of Silk Cloth", ru: "Рулон шелка", qty: 4 }, { en: "Red Dye", ru: "Красная краска", qty: 2 }, { en: "Silken Thread", ru: "Шелковая нить", qty: 2 }],
  "Crimson Silk Pantaloons": [{ en: "Bolt of Silk Cloth", ru: "Рулон шелка", qty: 4 }, { en: "Red Dye", ru: "Красная краска", qty: 2 }, { en: "Silken Thread", ru: "Шелковая нить", qty: 2 }],
  "Bolt of Mageweave": [{ en: "Mageweave Cloth", ru: "Магическая ткань", qty: 5 }],
  "Black Mageweave Leggings": [{ en: "Bolt of Mageweave", ru: "Рулон магической ткани", qty: 2 }, { en: "Silken Thread", ru: "Шелковая нить", qty: 3 }],
  "Black Mageweave Gloves": [{ en: "Bolt of Mageweave", ru: "Рулон магической ткани", qty: 2 }, { en: "Heavy Silken Thread", ru: "Плотная шелковая нить", qty: 2 }],
  "Runecloth Belt": [{ en: "Bolt of Runecloth", ru: "Рулон рунической ткани", qty: 3 }, { en: "Rune Thread", ru: "Руническая нить", qty: 1 }],
  "Runecloth Gloves": [{ en: "Bolt of Runecloth", ru: "Рулон рунической ткани", qty: 4 }, { en: "Rune Thread", ru: "Руническая нить", qty: 4 }],
  "Bolt of Netherweave": [{ en: "Netherweave Cloth", ru: "Ткань Пустоты", qty: 5 }],
  "Bolt of Imbued Netherweave": [{ en: "Bolt of Netherweave", ru: "Рулон ткани Пустоты", qty: 3 }, { en: "Arcane Dust", ru: "Чародейская пыль", qty: 2 }],
  "Netherweave Boots": [{ en: "Bolt of Netherweave", ru: "Рулон ткани Пустоты", qty: 6 }, { en: "Rune Thread", ru: "Руническая нить", qty: 2 }],
  "Netherweave Tunic": [{ en: "Bolt of Netherweave", ru: "Рулон ткани Пустоты", qty: 8 }, { en: "Rune Thread", ru: "Руническая нить", qty: 2 }],
  "Imbued Netherweave Tunic": [{ en: "Bolt of Imbued Netherweave", ru: "Рулон чароткани", qty: 6 }, { en: "Netherweb Spider Silk", ru: "Паучий шелк Пустоты", qty: 2 }],
  "Light Armor Kit": [{ en: "Light Leather", ru: "Тонкая кожа", qty: 1 }],
  "Handstitched Leather Cloak": [{ en: "Light Leather", ru: "Тонкая кожа", qty: 2 }, { en: "Coarse Thread", ru: "Грубая нить", qty: 1 }],
  "Embossed Leather Gloves": [{ en: "Light Leather", ru: "Тонкая кожа", qty: 3 }, { en: "Coarse Thread", ru: "Грубая нить", qty: 2 }],
  "Fine Leather Belt": [{ en: "Medium Leather", ru: "Кожа среднего качества", qty: 6 }, { en: "Fine Thread", ru: "Тонкая нить", qty: 2 }],
  "Dark Leather Belt": [{ en: "Dark Leather", ru: "Темная кожа", qty: 4 }, { en: "Fine Thread", ru: "Тонкая нить", qty: 1 }, { en: "Gray Dye", ru: "Серая краска", qty: 2 }],
  "Cured Heavy Hide": [{ en: "Heavy Hide", ru: "Толстая шкура", qty: 1 }, { en: "Salt", ru: "Соль", qty: 3 }],
  "Heavy Armor Kit": [{ en: "Heavy Leather", ru: "Толстая кожа", qty: 5 }, { en: "Fine Thread", ru: "Тонкая нить", qty: 1 }],
  "Knothide Armor Kit": [{ en: "Knothide Leather", ru: "Узловатая кожа", qty: 4 }],
  "Thick Draenic Vest": [{ en: "Knothide Leather", ru: "Узловатая кожа", qty: 8 }, { en: "Rune Thread", ru: "Руническая нить", qty: 2 }],
  "Heavy Knothide Armor Kit": [{ en: "Heavy Knothide Leather", ru: "Плотная узловатая кожа", qty: 1 }, { en: "Netherweave Thread", ru: "Нить Пустоты", qty: 1 }],
  "Drums of Battle": [{ en: "Heavy Knothide Leather", ru: "Плотная узловатая кожа", qty: 6 }, { en: "Thick Clefthoof Leather", ru: "Толстая кожа копытня", qty: 4 }],
  "Drums of Panic": [{ en: "Heavy Knothide Leather", ru: "Плотная узловатая кожа", qty: 6 }, { en: "Fel Scales", ru: "Чешуя Скверны", qty: 4 }],
  "Rough Sharpening Stone": [{ en: "Rough Stone", ru: "Грубый камень", qty: 1 }],
  "Rough Grinding Stone": [{ en: "Rough Stone", ru: "Грубый камень", qty: 2 }],
  "Copper Chain Belt": [{ en: "Copper Bar", ru: "Медный слиток", qty: 6 }],
  "Coarse Grinding Stone": [{ en: "Coarse Stone", ru: "Зернистый камень", qty: 2 }],
  "Runed Copper Belt": [{ en: "Copper Bar", ru: "Медный слиток", qty: 10 }, { en: "Rough Grinding Stone", ru: "Грубый точильный камень", qty: 6 }],
  "Silver Rod": [{ en: "Silver Bar", ru: "Серебряный слиток", qty: 1 }, { en: "Rough Grinding Stone", ru: "Грубый точильный камень", qty: 2 }],
  "Rough Bronze Leggings": [{ en: "Bronze Bar", ru: "Бронзовый слиток", qty: 6 }],
  "Heavy Grinding Stone": [{ en: "Heavy Stone", ru: "Тяжелый камень", qty: 3 }],
  "Golden Rod": [{ en: "Gold Bar", ru: "Золотой слиток", qty: 1 }, { en: "Coarse Grinding Stone", ru: "Зернистый точильный камень", qty: 2 }],
  "Green Iron Leggings": [{ en: "Iron Bar", ru: "Железный слиток", qty: 8 }, { en: "Heavy Grinding Stone", ru: "Тяжелый точильный камень", qty: 1 }],
  "Golden Scale Bracers": [{ en: "Steel Bar", ru: "Стальной слиток", qty: 5 }, { en: "Heavy Grinding Stone", ru: "Тяжелый точильный камень", qty: 2 }],
  "Solid Grinding Stone": [{ en: "Solid Stone", ru: "Прочный камень", qty: 4 }],
  "Heavy Mithril Gauntlet": [{ en: "Mithril Bar", ru: "Мифриловый слиток", qty: 6 }, { en: "Mageweave Cloth", ru: "Магическая ткань", qty: 4 }],
  "Mithril Coif": [{ en: "Mithril Bar", ru: "Мифриловый слиток", qty: 10 }, { en: "Mageweave Cloth", ru: "Магическая ткань", qty: 6 }],
  "Dense Sharpening Stone": [{ en: "Dense Stone", ru: "Плотный камень", qty: 1 }],
  "Thorium Belt": [{ en: "Thorium Bar", ru: "Ториевый слиток", qty: 8 }],
  "Imperial Plate Bracers": [{ en: "Thorium Bar", ru: "Ториевый слиток", qty: 12 }],
  "Thorium Boots": [{ en: "Thorium Bar", ru: "Ториевый слиток", qty: 12 }],
  "Fel Weightstone": [{ en: "Fel Iron Bar", ru: "Слиток оскверненного железа", qty: 1 }, { en: "Mote of Earth", ru: "Изначальная частица земли", qty: 1 }],
  "Fel Iron Plate Belt": [{ en: "Fel Iron Bar", ru: "Слиток оскверненного железа", qty: 10 }],
  "Fel Iron Chain Gloves": [{ en: "Fel Iron Bar", ru: "Слиток оскверненного железа", qty: 5 }],
  "Fel Iron Plate Boots": [{ en: "Fel Iron Bar", ru: "Слиток оскверненного железа", qty: 12 }],
  "Lesser Rune of Warding": [{ en: "Adamantite Bar", ru: "Адамантитовый слиток", qty: 1 }],
  "Fel Iron Chain Tunic": [{ en: "Fel Iron Bar", ru: "Слиток оскверненного железа", qty: 8 }],
  "Lesser Ward of Shielding": [{ en: "Adamantite Bar", ru: "Адамантитовый слиток", qty: 1 }],
  "Adamantite Weightstone": [{ en: "Adamantite Bar", ru: "Адамантитовый слиток", qty: 1 }],
  "Enchanted Adamantite Belt (or Felsteel Gloves)": [{ en: "Adamantite Bar", ru: "Адамантитовый слиток", qty: 10 }, { en: "Primal Earth", ru: "Изначальная земля", qty: 1 }],
  "Enchant Bracer - Minor Health": [{ en: "Strange Dust", ru: "Странная пыль", qty: 1 }],
  "Enchant Bracer - Minor Stamina": [{ en: "Strange Dust", ru: "Странная пыль", qty: 3 }],
  "Enchant Bracer - Minor Strength": [{ en: "Strange Dust", ru: "Странная пыль", qty: 2 }],
  "Runed Silver Rod": [{ en: "Silver Rod", ru: "Серебряный жезл", qty: 1 }, { en: "Strange Dust", ru: "Странная пыль", qty: 6 }, { en: "Greater Magic Essence", ru: "Великая магическая субстанция", qty: 3 }],
  "Enchant Bracer - Minor Agility": [{ en: "Strange Dust", ru: "Странная пыль", qty: 2 }, { en: "Lesser Magic Essence", ru: "Малая магическая субстанция", qty: 1 }],
  "Enchant Bracer - Lesser Stamina": [{ en: "Soul Dust", ru: "Астральная пыль", qty: 2 }],
  "Runed Golden Rod": [{ en: "Golden Rod", ru: "Золотой жезл", qty: 1 }, { en: "Soul Dust", ru: "Астральная пыль", qty: 2 }, { en: "Greater Astral Essence", ru: "Великая астральная субстанция", qty: 2 }, { en: "Iridescent Pearl", ru: "Радужная жемчужина", qty: 1 }],
  "Enchant Bracer - Spirit": [{ en: "Soul Dust", ru: "Астральная пыль", qty: 1 }, { en: "Lesser Astral Essence", ru: "Малая астральная субстанция", qty: 1 }],
  "Enchant Bracer - Strength": [{ en: "Soul Dust", ru: "Астральная пыль", qty: 1 }, { en: "Greater Astral Essence", ru: "Великая астральная субстанция", qty: 1 }],
  "Enchant Bracer - Greater Stamina": [{ en: "Vision Dust", ru: "Пыль видения", qty: 5 }],
  "Runed Truesilver Rod": [{ en: "Truesilver Rod", ru: "Жезл истинного серебра", qty: 1 }, { en: "Vision Dust", ru: "Пыль видения", qty: 2 }, { en: "Greater Mystic Essence", ru: "Великая мистическая субстанция", qty: 1 }, { en: "Black Pearl", ru: "Черная жемчужина", qty: 1 }],
  "Enchant Bracer - Greater Strength": [{ en: "Vision Dust", ru: "Пыль видения", qty: 2 }, { en: "Dream Dust", ru: "Пыль грез", qty: 1 }],
  "Enchant Gloves - Agility": [{ en: "Vision Dust", ru: "Пыль видения", qty: 1 }, { en: "Greater Nether Essence", ru: "Великая субстанция Пустоты", qty: 1 }],
  "Enchant Chest - Superior Health": [{ en: "Vision Dust", ru: "Пыль видения", qty: 6 }],
  "Enchant Bracer - Greater Intellect": [{ en: "Lesser Nether Essence", ru: "Малая субстанция Пустоты", qty: 2 }],
  "Enchant Shield - Greater Stamina": [{ en: "Dream Dust", ru: "Пыль грез", qty: 10 }],
  "Enchant Chest - Major Health": [{ en: "Small Brilliant Shard", ru: "Малый сияющий осколок", qty: 1 }],
  "Runed Fel Iron Rod": [{ en: "Runed Arcanite Rod", ru: "Рунический арканитовый жезл", qty: 1 }, { en: "Fel Iron Rod", ru: "Жезл из оскверненного железа", qty: 1 }, { en: "Large Brilliant Shard", ru: "Большой сияющий осколок", qty: 6 }, { en: "Greater Eternal Essence", ru: "Великая вечная субстанция", qty: 4 }],
  "Enchant Bracer - Assault": [{ en: "Arcane Dust", ru: "Чародейская пыль", qty: 6 }],
  "Enchant Bracer - Brawn": [{ en: "Arcane Dust", ru: "Чародейская пыль", qty: 8 }, { en: "Greater Planar Essence", ru: "Великая планарная субстанция", qty: 1 }],
  "Enchant Gloves - Assault": [{ en: "Arcane Dust", ru: "Чародейская пыль", qty: 8 }],
  "Enchant Shield - Major Stamina": [{ en: "Arcane Dust", ru: "Чародейская пыль", qty: 15 }, { en: "Greater Planar Essence", ru: "Великая планарная субстанция", qty: 1 }],
  "Enchant Shield - Resilience": [{ en: "Lesser Planar Essence", ru: "Малая планарная субстанция", qty: 4 }, { en: "Large Prismatic Shard", ru: "Большой радужный осколок", qty: 1 }],
  "Superior Wizard Oil": [{ en: "Arcane Dust", ru: "Чародейская пыль", qty: 3 }, { en: "Nightmare Vine", ru: "Кошмарная лоза", qty: 2 }],
  "Enchant Gloves - Major Strength": [{ en: "Arcane Dust", ru: "Чародейская пыль", qty: 6 }, { en: "Greater Planar Essence", ru: "Великая планарная субстанция", qty: 2 }],
  "Enchant Ring - Spellpower": [{ en: "Greater Planar Essence", ru: "Великая планарная субстанция", qty: 6 }, { en: "Large Prismatic Shard", ru: "Большой радужный осколок", qty: 2 }],
  "Rough Blasting Powder": [{ en: "Rough Stone", ru: "Грубый камень", qty: 1 }],
  "Handful of Copper Bolts": [{ en: "Copper Bar", ru: "Медный слиток", qty: 1 }],
  "Arclight Spanner": [{ en: "Copper Bar", ru: "Медный слиток", qty: 6 }, { en: "Weak Flux", ru: "Слабый плавень", qty: 1 }],
  "Copper Tube": [{ en: "Copper Bar", ru: "Медный слиток", qty: 2 }, { en: "Weak Flux", ru: "Слабый плавень", qty: 1 }],
  "Rough Copper Bomb": [{ en: "Handful of Copper Bolts", ru: "Горсть медных винтов", qty: 1 }, { en: "Rough Blasting Powder", ru: "Грубый взрывчатый порошок", qty: 2 }, { en: "Linen Cloth", ru: "Льняная ткань", qty: 1 }],
  "Coarse Blasting Powder": [{ en: "Coarse Stone", ru: "Зернистый камень", qty: 1 }],
  "Silver Contact": [{ en: "Silver Bar", ru: "Серебряный слиток", qty: 1 }],
  "Bronze Tubes": [{ en: "Bronze Bar", ru: "Бронзовый слиток", qty: 2 }, { en: "Weak Flux", ru: "Слабый плавень", qty: 1 }],
  "Small Bronze Bomb": [{ en: "Bronze Bar", ru: "Бронзовый слиток", qty: 2 }, { en: "Coarse Blasting Powder", ru: "Зернистый взрывчатый порошок", qty: 1 }, { en: "Wool Cloth", ru: "Шерсть", qty: 1 }],
  "Heavy Blasting Powder": [{ en: "Heavy Stone", ru: "Тяжелый камень", qty: 1 }],
  "Whirring Bronze Gizmo": [{ en: "Bronze Bar", ru: "Бронзовый слиток", qty: 2 }, { en: "Wool Cloth", ru: "Шерсть", qty: 1 }],
  "Big Bronze Bomb": [{ en: "Heavy Blasting Powder", ru: "Тяжелый взрывчатый порошок", qty: 2 }, { en: "Bronze Bar", ru: "Бронзовый слиток", qty: 3 }, { en: "Silver Contact", ru: "Серебряный контакт", qty: 1 }, { en: "Wool Cloth", ru: "Шерсть", qty: 1 }],
  "Solid Blasting Powder": [{ en: "Solid Stone", ru: "Прочный камень", qty: 2 }],
  "Mithril Tube": [{ en: "Mithril Bar", ru: "Мифриловый слиток", qty: 3 }],
  "Unstable Trigger": [{ en: "Mithril Bar", ru: "Мифриловый слиток", qty: 1 }, { en: "Mageweave Cloth", ru: "Магическая ткань", qty: 1 }, { en: "Solid Blasting Powder", ru: "Твердый взрывчатый порошок", qty: 1 }],
  "Mithril Casing": [{ en: "Mithril Bar", ru: "Мифриловый слиток", qty: 3 }],
  "Hi-Explosive Bomb": [{ en: "Mithril Casing", ru: "Мифриловая обшивка", qty: 1 }, { en: "Unstable Trigger", ru: "Нестабильное пусковое устройство", qty: 1 }, { en: "Solid Blasting Powder", ru: "Твердый взрывчатый порошок", qty: 2 }],
  "Dense Blasting Powder": [{ en: "Dense Stone", ru: "Плотный камень", qty: 2 }],
  "Thorium Widget": [{ en: "Thorium Bar", ru: "Ториевый слиток", qty: 3 }, { en: "Runecloth", ru: "Руническая ткань", qty: 1 }],
  "Thorium Shells": [{ en: "Thorium Bar", ru: "Ториевый слиток", qty: 2 }, { en: "Dense Blasting Powder", ru: "Концентрированный взрывчатый порошок", qty: 1 }],
  "Handful of Fel Iron Bolts": [{ en: "Fel Iron Bar", ru: "Слиток оскверненного железа", qty: 1 }],
  "Fel Iron Bomb": [{ en: "Handful of Fel Iron Bolts", ru: "Горсть винтов из оскверненного железа", qty: 2 }, { en: "Elemental Blasting Powder", ru: "Стихийный взрывчатый порошок", qty: 1 }],
  "Adamantite Frame": [{ en: "Adamantite Bar", ru: "Адамантитовый слиток", qty: 4 }],
  "White Smoke Flare": [{ en: "Netherweave Cloth", ru: "Ткань Пустоты", qty: 1 }],
  "Khorium Power Core": [{ en: "Khorium Bar", ru: "Кориевый слиток", qty: 3 }],
  "Adamantite Rifle": [{ en: "Adamantite Bar", ru: "Адамантитовый слиток", qty: 8 }, { en: "Handful of Fel Iron Bolts", ru: "Горсть винтов из оскверненного железа", qty: 2 }],
  "Field Repair Bot 110G": [{ en: "Adamantite Frame", ru: "Адамантитовая рамка", qty: 2 }, { en: "Khorium Power Core", ru: "Кориевый силовой сердечник", qty: 1 }, { en: "Felsteel Stabilizer", ru: "Стабилизатор из оскверненной стали", qty: 1 }],
  "Delicate Copper Wire": [{ en: "Copper Bar", ru: "Медный слиток", qty: 2 }],
  "Tigerseye Band": [{ en: "Delicate Copper Wire", ru: "Тонкая медная проволока", qty: 1 }, { en: "Tigerseye", ru: "Тигровый глаз", qty: 1 }],
  "Bronze Setting": [{ en: "Bronze Bar", ru: "Бронзовый слиток", qty: 1 }],
  "Simple Pearl Ring": [{ en: "Bronze Setting", ru: "Бронзовая оправа", qty: 1 }, { en: "Small Lustrous Pearl", ru: "Маленькая радужная жемчужина", qty: 1 }],
  "Heavy Stone Statue": [{ en: "Heavy Stone", ru: "Тяжелый камень", qty: 8 }],
  "Ring of Silver Might": [{ en: "Silver Bar", ru: "Серебряный слиток", qty: 1 }, { en: "Tigerseye", ru: "Тигровый глаз", qty: 2 }],
  "Pendant of the Agate Shield": [{ en: "Bronze Setting", ru: "Бронзовая оправа", qty: 1 }, { en: "Moss Agate", ru: "Моховой агат", qty: 1 }],
  "Mithril Filigree": [{ en: "Mithril Bar", ru: "Мифриловый слиток", qty: 2 }],
  "Aqua Marine Signet": [{ en: "Aquamarine", ru: "Аквамарин", qty: 1 }, { en: "Mithril Filigree", ru: "Мифриловая филигрань", qty: 2 }],
  "Thorium Setting": [{ en: "Thorium Bar", ru: "Ториевый слиток", qty: 1 }],
  "Ruby Pendant of Fire": [{ en: "Thorium Setting", ru: "Ториевая оправа", qty: 1 }, { en: "Star Ruby", ru: "Звездный рубин", qty: 1 }],
  "Simple Opal Ring": [{ en: "Thorium Setting", ru: "Ториевая оправа", qty: 1 }, { en: "Large Opal", ru: "Большой опал", qty: 1 }],
  "Dense Stone Statue": [{ en: "Dense Stone", ru: "Плотный камень", qty: 10 }],
  "Sapphire Signet": [{ en: "Thorium Setting", ru: "Ториевая оправа", qty: 1 }, { en: "Blue Sapphire", ru: "Синий сапфир", qty: 1 }],
  "Mercurial Adamantite": [{ en: "Adamantite Powder", ru: "Адамантитовый порошок", qty: 1 }, { en: "Primal Earth", ru: "Изначальная земля", qty: 1 }],
  "Heavy Adamantite Ring": [{ en: "Adamantite Bar", ru: "Адамантитовый слиток", qty: 1 }],
  "Purified Shadow Pearl": [{ en: "Shadow Pearl", ru: "Темная жемчужина", qty: 1 }],
  "Barbaric Bracers": [{ en: "Heavy Leather", ru: "Толстая кожа", qty: 8 }, { en: "Cured Heavy Hide", ru: "Обработанная толстая шкура", qty: 1 }],
  "Nightscape Headband": [{ en: "Thick Leather", ru: "Плотная кожа", qty: 5 }, { en: "Silken Thread", ru: "Шелковая нить", qty: 2 }],
  "Nightscape Pants": [{ en: "Thick Leather", ru: "Плотная кожа", qty: 14 }, { en: "Silken Thread", ru: "Шелковая нить", qty: 2 }],
  "Wicked Leather Bracers": [{ en: "Rugged Leather", ru: "Грубая кожа", qty: 8 }, { en: "Black Dye", ru: "Черная краска", qty: 1 }, { en: "Rune Thread", ru: "Руническая нить", qty: 1 }],
  "Wicked Leather Headband": [{ en: "Rugged Leather", ru: "Грубая кожа", qty: 12 }, { en: "Black Dye", ru: "Черная краска", qty: 1 }, { en: "Rune Thread", ru: "Руническая нить", qty: 1 }],
  "Wicked Leather Belt": [{ en: "Rugged Leather", ru: "Грубая кожа", qty: 8 }, { en: "Rune Thread", ru: "Руническая нить", qty: 1 }],
};

const STEP_MATERIALS_TOTAL = {
  "Heavy Knothide Leather": [{ en: "Knothide Leather", ru: "Узловатая кожа", qty: 5 }],
  "Cheap uncommon cuts (mix)": [{ en: "Uncommon Outland gems", ru: "Необычные самоцветы Запределья", qty: 1 }],
  "Cheap uncommon cuts": [{ en: "Uncommon Outland gems", ru: "Необычные самоцветы Запределья", qty: 1 }],
  "Jewelcrafter-only epic gems": [{ en: "Rare/Epic gems", ru: "Редкие/эпические самоцветы", qty: 1 }],
};

const MATERIAL_ICON_OVERRIDES = {
  "copper bar": "inv_ingot_02",
  "bronze bar": "inv_ingot_05",
  "silver bar": "inv_ingot_01",
  "gold bar": "inv_ingot_03",
  "iron bar": "inv_ingot_04",
  "steel bar": "inv_ingot_06",
  "mithril bar": "inv_ingot_07",
  "truesilver bar": "inv_ingot_08",
  "thorium bar": "inv_ingot_09",
  "fel iron bar": "inv_ingot_11",
  "adamantite bar": "inv_ingot_10",
  "khorium bar": "inv_ingot_08",
  "copper ore": "inv_ore_copper_01",
  "tin ore": "inv_ore_tin_01",
  "silver ore": "inv_ore_tin_01",
  "iron ore": "inv_ore_iron_01",
  "mithril ore": "inv_ore_mithril_02",
  "thorium ore": "inv_ore_thorium_02",
  "fel iron ore": "inv_ore_feliron",
  "adamantite ore": "inv_ore_mithril_02",
  "khorium ore": "inv_ore_khorium",
  "light leather": "inv_misc_pelt_wolf_01",
  "medium leather": "inv_misc_pelt_bear_03",
  "heavy leather": "inv_misc_pelt_boar_01",
  "thick leather": "inv_misc_pelt_boar_ruin_01",
  "rugged leather": "inv_misc_pelt_wolf_02",
  "knothide leather": "inv_misc_leatherscrap_03",
};

function getMaterialIconName(materialName) {
  const name = materialName.toLowerCase().trim();
  if (PROFESSION_ITEM_ICON_MAP[name]) return PROFESSION_ITEM_ICON_MAP[name];
  if (MATERIAL_ICON_OVERRIDES[name]) return MATERIAL_ICON_OVERRIDES[name];
  if (name.includes("cloth") || name.includes("thread") || name.includes("bolt")) return "inv_fabric_linen_01";
  if (name.includes("leather") || name.includes("hide")) return "inv_misc_leatherscrap_03";
  if (name.includes("bar")) return "inv_ingot_02";
  if (name.includes("ore") || name.includes("vein")) return "inv_ore_copper_01";
  if (name.includes("dust")) return "inv_enchant_duststrange";
  if (name.includes("essence") || name.includes("crystal") || name.includes("shard")) return "inv_enchant_essenceastralsmall";
  if (name.includes("vial")) return "inv_drink_06";
  if (name.includes("dye")) return "inv_potion_12";
  if (name.includes("stone") || name.includes("powder")) return "inv_stone_06";
  if (name.includes("gem") || name.includes("pearl") || name.includes("opal") || name.includes("ruby") || name.includes("sapphire")) return "inv_misc_gem_01";
  if (name.includes("weed") || name.includes("herb") || name.includes("bloom") || name.includes("sansam") || name.includes("vine") || name.includes("leaf") || name.includes("root")) return "inv_misc_herb_17";
  return "inv_misc_questionmark";
}

function getCraftIconName(professionId, recipeName) {
  const name = String(recipeName || "").toLowerCase();
  if (PROFESSION_ITEM_ICON_MAP[name]) return PROFESSION_ITEM_ICON_MAP[name];
  if (professionId === "alchemy") {
    if (name.includes("potion")) return "inv_potion_81";
    if (name.includes("elixir")) return "inv_potion_39";
    return "inv_alchemy_elixir_04";
  }
  if (professionId === "blacksmithing") {
    if (name.includes("weightstone") || name.includes("sharpening stone") || name.includes("grinding stone")) {
      return "inv_stone_06";
    }
    if (name.includes("rod")) return "inv_staff_goldfeathered_01";
    if (name.includes("boots")) return "inv_boots_plate_04";
    if (name.includes("gloves") || name.includes("gauntlet")) return "inv_gauntlets_04";
    if (name.includes("belt")) return "inv_belt_01";
    if (name.includes("bracers")) return "inv_bracer_03";
    if (name.includes("leggings")) return "inv_pants_03";
    if (name.includes("coif") || name.includes("helm")) return "inv_helmet_25";
    if (name.includes("tunic")) return "inv_chest_plate10";
    return "inv_hammer_04";
  }
  if (professionId === "enchanting") {
    if (name.includes("rod")) return "inv_staff_goldfeathered_01";
    if (name.includes("oil")) return "inv_potion_100";
    return "trade_engraving";
  }
  if (professionId === "engineering") {
    if (name.includes("bomb")) return "inv_misc_bomb_05";
    if (name.includes("rifle")) return "inv_weapon_rifle_08";
    if (name.includes("bot")) return "inv_gizmo_08";
    return "inv_gizmo_02";
  }
  if (professionId === "jewelcrafting") {
    if (name.includes("ring") || name.includes("band") || name.includes("signet")) return "inv_jewelry_ring_03";
    if (name.includes("pendant")) return "inv_jewelry_necklace_07";
    if (name.includes("wire") || name.includes("setting")) return "inv_misc_gem_variety_01";
    return "inv_misc_gem_01";
  }
  if (professionId === "leatherworking") {
    if (name.includes("kit")) return "inv_misc_armorkit_17";
    if (name.includes("drums")) return "inv_misc_drum_05";
    if (name.includes("belt")) return "inv_belt_03";
    if (name.includes("pants")) return "inv_pants_06";
    return "inv_misc_leatherscrap_03";
  }
  if (professionId === "tailoring") {
    if (name.includes("bolt")) return "inv_fabric_linen_01";
    if (name.includes("boots")) return "inv_boots_05";
    if (name.includes("tunic") || name.includes("vest")) return "inv_chest_cloth_24";
    if (name.includes("gloves")) return "inv_gauntlets_17";
    return "inv_fabric_silk_01";
  }
  if (professionId === "herbalism") return "spell_nature_naturetouchgrow";
  if (professionId === "mining") return "inv_pick_02";
  if (professionId === "skinning") return "inv_misc_pelt_wolf_01";
  return getMaterialIconName(recipeName);
}

function normalizeWowIconName(iconName) {
  if (!iconName || typeof iconName !== "string") return "inv_misc_questionmark";
  const cleaned = iconName
    .trim()
    .toLowerCase()
    .replace(/\\/g, "/")
    .split("?")[0]
    .split("#")[0]
    .split("/")
    .pop()
    ?.replace(/\.(jpg|jpeg|png|webp)$/i, "");
  if (!cleaned) return "inv_misc_questionmark";
  return cleaned.replace(/[^a-z0-9_]/g, "");
}

function getWowIconCandidates(iconName) {
  const normalized = normalizeWowIconName(iconName);
  return [
    assetUrl(`wow-icons/${normalized}.jpg`),
    assetUrl(`wow-icons/${normalized}.png`),
  ];
}

function getWowIconUrl(iconName) {
  return getWowIconCandidates(iconName)[0];
}

function getLocalWowIconFromAny(source) {
  if (!source || typeof source !== "string") return getWowIconUrl("inv_misc_questionmark");
  const normalizedSource = source.trim();
  const queryMatch = normalizedSource.toLowerCase().match(/[?&]icon=([a-z0-9_]+)/i);
  if (queryMatch?.[1]) {
    return getWowIconUrl(queryMatch[1].toLowerCase());
  }
  return getWowIconUrl(normalizeWowIconName(normalizedSource));
}

function handleWowIconError(event) {
  const img = event.currentTarget;
  const currentSrc = img.src || "";

  if (img.dataset.triedCurrentPng !== "1" && /\.jpg(?:\?|$)/i.test(currentSrc)) {
    img.dataset.triedCurrentPng = "1";
    img.src = currentSrc.replace(/\.jpg(\?|$)/i, ".png$1");
    return;
  }

  const questionJpg = getWowIconUrl("inv_misc_questionmark");
  if (img.dataset.triedQuestionJpg !== "1" && currentSrc !== questionJpg) {
    img.dataset.triedQuestionJpg = "1";
    img.src = questionJpg;
    return;
  }

  const questionPng = assetUrl("wow-icons/inv_misc_questionmark.png");
  if (img.dataset.triedQuestionPng !== "1" && currentSrc !== questionPng) {
    img.dataset.triedQuestionPng = "1";
    img.src = questionPng;
    return;
  }

  img.onerror = null;
}

function getStepMaterials(professionId, step, language) {
  if (Array.isArray(step.mats) && step.mats.length > 0) {
    return step.mats.map((mat) => ({
      label: language === "ru" ? mat.ru : mat.en,
      qty: mat.qty,
      icon: getWowIconUrl(mat.icon),
    }));
  }
  const recipeMats = RECIPE_MATERIALS_PER_CRAFT[step.en];
  if (recipeMats && recipeMats.length > 0 && Number.isFinite(Number(step.qty))) {
    const craftQty = Number(step.qty);
    return recipeMats.map((mat) => {
      const label = language === "ru" ? mat.ru : mat.en;
      return {
        label,
        qty: Math.max(1, Math.round(craftQty * mat.qty)),
        icon: getWowIconUrl(getMaterialIconName(mat.en)),
      };
    });
  }
  const totalMats = STEP_MATERIALS_TOTAL[step.en];
  if (totalMats && totalMats.length > 0 && Number.isFinite(Number(step.qty))) {
    const craftQty = Number(step.qty);
    return totalMats.map((mat) => {
      const label = language === "ru" ? mat.ru : mat.en;
      return {
        label,
        qty: Math.max(1, Math.round(craftQty * mat.qty)),
        icon: getWowIconUrl(getMaterialIconName(mat.en)),
      };
    });
  }
  const preset = MATERIAL_PRESETS[professionId];
  if (step.qty === "route" && typeof step.en === "string") {
    const cleaned = step.en
      .replace(/^Gather\s+/i, "")
      .replace(/^Beasts in\s+/i, "")
      .replace(/^Rugged Leather routes$/i, "Rugged Leather")
      .replace(/^Knothide Leather routes in Outland$/i, "Knothide Leather")
      .replace(/^Fel Iron \/ Adamantite \/ Khorium$/i, "Fel Iron Ore / Adamantite Ore / Khorium Ore");
    const tokens = cleaned.includes(" / ")
      ? cleaned.split(" / ").map((token) => token.trim()).filter(Boolean)
      : [cleaned];
    return tokens.map((token) => ({
      label: token,
      qty: "route",
      icon: getWowIconUrl(getMaterialIconName(token)),
    }));
  }
  if (!preset) return [];
  const qty = Number(step.qty);
  return preset.map((item) => ({
    label: language === "ru" ? item.ru : item.en,
    qty: Number.isFinite(qty) ? Math.max(1, Math.round(qty * item.mult)) : "route",
    icon: getWowIconUrl(item.icon),
  }));
}

function getProfessionLabel(language, professionId) {
  const def = professionDefById[professionId];
  if (!def) return professionId;
  return language === "ru" ? def.ru : def.en;
}
const I18N = {
  ru: {
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню",
    menuTitle: "Меню",
    tabRoute: "Маршрут",
    tabDungeons: "Данжи",
    tabProfessions: "Профессии",
    sourcesTitle: "Источники маршрута",
    zoneWidgetLabel: "Текущая зона и время",
    questZone: "Зона квестов:",
    routeNotSelected: "Маршрут не выбран",
    dungeonsTitle: "Все данжи Classic + TBC",
    levelGuide: "Рекомендуемый ориентир: уровень {level}",
    levelGuideDetailed: "Текущий ориентир уровня: {level} (подсветка доступных)",
    sortLabel: "Сортировка",
    sortAsc: "По уровню: 1 → 70",
    sortDesc: "По уровню: 70 → 1",
    characterLevel: "Уровень персонажа",
    clear: "Очистить",
    allDungeonsShown: "Показаны все данжи",
    dungeonsForLevel: "Показаны данжи для уровня {level}",
    noDungeonsForLevel: "Для уровня {level} подходящих данжей не найдено.",
    pickDungeon: "Выберите данж из списка слева.",
    noDungeonsFound: "Для этого уровня данжи не найдены.",
    levelsAndZone: "Уровни: {min}-{max} | {location}",
    bossesListAria: "Список боссов данжа",
    compactListAria: "Список данжей и уровней",
    listAria: "Список данжей",
    boardTitle: "Classic WOW TBC Fast Route 1-70",
    faction: "Фракция",
    race: "Расса",
    startLevel: "Стартовый уровень",
    class: "Класс",
    anyFaction: "Любая",
    alliance: "Альянс",
    horde: "Орда",
    currentLevel: "Текущий уровень:",
    startLevelLabel: "Стартовый уровень:",
    beginRoute: "Начать маршрут",
    progress: "Прогресс маршрута: {value}%",
    completed: "Выполнено: {done}/{total}",
    recommendedQuestLevel: "Рекомендуемый уровень квестов: {level}",
    changeStart: "Изменить стартовые параметры",
    noNewQuests: "Для текущего шага пока нет новых квестов. Уровень маршрута обновится автоматически, когда откроется следующий этап.",
    completeQuest: "Выполнить {title}",
    levelMeta: "{zone} | Уровень: {level} | {chain}",
    territory: "Территория: {label}",
    territoryAlliance: "Alliance",
    territoryHorde: "Horde",
    territoryContested: "Contested",
    territoryFriendly: "Своя",
    territoryHostile: "Вражеская",
    territoryNeutral: "Спорная",
    clearDungeonLevel: "Очистить фильтр уровня данжей",
    backToRoute: "На главную",
    professionsTitle: "Профессии",
    professionsSubtitle: "Выберите до двух основных профессий",
    professionOne: "Профессия 1",
    professionTwo: "Профессия 2",
    professionEmpty: "Выберите профессию слева",
    professionPlanTitle: "Дешевый маршрут прокачки",
    professionStepRange: "Уровень",
    professionStepCraft: "Крафт / действие",
    professionStepQty: "Кол-во",
    professionStepRoute: "Маршрут",
  },
  en: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    menuTitle: "Menu",
    tabRoute: "Route",
    tabDungeons: "Dungeons",
    tabProfessions: "Professions",
    sourcesTitle: "Route Sources",
    zoneWidgetLabel: "Current zone and time",
    questZone: "Quest zone:",
    routeNotSelected: "No route selected",
    dungeonsTitle: "All Classic + TBC Dungeons",
    levelGuide: "Recommended guide: level {level}",
    levelGuideDetailed: "Current level guide: {level} (available highlight)",
    sortLabel: "Sort",
    sortAsc: "By level: 1 → 70",
    sortDesc: "By level: 70 → 1",
    characterLevel: "Character level",
    clear: "Clear",
    allDungeonsShown: "Showing all dungeons",
    dungeonsForLevel: "Showing dungeons for level {level}",
    noDungeonsForLevel: "No matching dungeons for level {level}.",
    pickDungeon: "Select a dungeon from the left list.",
    noDungeonsFound: "No dungeons found for this level.",
    levelsAndZone: "Levels: {min}-{max} | {location}",
    bossesListAria: "Dungeon bosses list",
    compactListAria: "Dungeon and level list",
    listAria: "Dungeon list",
    boardTitle: "Classic WOW TBC Fast Route 1-70",
    faction: "Faction",
    race: "Race",
    startLevel: "Start level",
    class: "Class",
    anyFaction: "Any",
    alliance: "Alliance",
    horde: "Horde",
    currentLevel: "Current level:",
    startLevelLabel: "Start level:",
    beginRoute: "Start route",
    progress: "Route progress: {value}%",
    completed: "Completed: {done}/{total}",
    recommendedQuestLevel: "Recommended quest level: {level}",
    changeStart: "Change starting setup",
    noNewQuests: "No new quests for the current step yet. Route level will update automatically when the next stage unlocks.",
    completeQuest: "Complete {title}",
    levelMeta: "{zone} | Level: {level} | {chain}",
    territory: "Territory: {label}",
    territoryAlliance: "Alliance",
    territoryHorde: "Horde",
    territoryContested: "Contested",
    territoryFriendly: "Friendly",
    territoryHostile: "Hostile",
    territoryNeutral: "Contested",
    clearDungeonLevel: "Clear dungeon level filter",
    backToRoute: "Back to route",
    professionsTitle: "Professions",
    professionsSubtitle: "Choose up to two primary professions",
    professionOne: "Profession 1",
    professionTwo: "Profession 2",
    professionEmpty: "Pick a profession from the left list",
    professionPlanTitle: "Cheap leveling route",
    professionStepRange: "Skill range",
    professionStepCraft: "Craft / action",
    professionStepQty: "Qty",
    professionStepRoute: "Route",
  },
};

function tr(locale, key, vars = {}) {
  const dict = I18N[locale] || I18N.ru;
  const template = dict[key] || I18N.ru[key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ""));
}

function splitScarletMonasteryDungeon(dungeon) {
  if (dungeon.name !== SCARLET_MONASTERY) return [dungeon];

  return SCARLET_WING_ORDER.map((wing) => {
    const wingBosses = dungeon.bosses.filter(
      (boss) => (SCARLET_BOSS_TO_WING[boss.name] || "Other") === wing,
    );
    if (wingBosses.length === 0) return null;
    const [levelMin, levelMax] = SCARLET_WING_LEVELS[wing] || [
      dungeon.levelMin,
      dungeon.levelMax,
    ];
    return {
      ...dungeon,
      id: `${dungeon.id}-${wing.toLowerCase()}`,
      name: `${SCARLET_MONASTERY}: ${wing}`,
      levelMin,
      levelMax,
      bosses: wingBosses,
    };
  }).filter(Boolean);
}

function canUnlock(quest, completed) {
  if (!quest.prereq || quest.prereq.length === 0) return true;
  if (quest.anyPrereq) return quest.prereq.some((id) => completed.has(id));
  return quest.prereq.every((id) => completed.has(id));
}

function isFactionMatch(questFaction, activeFaction) {
  if (activeFaction === "Both") return true;
  return questFaction === "Both" || questFaction === activeFaction;
}

function clampLevel(value) {
  return Math.max(1, Math.min(70, Number(value) || 1));
}

const STORAGE_KEY = "tbc-route-state-v1";
const DEFAULT_ZONE_IMAGE = `data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#201812'/><stop offset='100%' stop-color='#322516'/></linearGradient></defs><rect width='300' height='300' fill='url(#g)'/><circle cx='150' cy='150' r='130' fill='none' stroke='#80622d' stroke-width='8'/><text x='150' y='146' font-size='22' fill='#e8cf9f' text-anchor='middle' font-family='serif'>WoW Zone</text><text x='150' y='176' font-size='16' fill='#cbb48a' text-anchor='middle' font-family='serif'>Loading Screen</text></svg>",
)}`;
const APP_BUILD_ID = typeof __APP_BUILD_ID__ !== "undefined" ? __APP_BUILD_ID__ : "dev";
const assetUrl = (relativePath) => {
  if (!relativePath || relativePath.startsWith("data:")) return relativePath;
  const separator = relativePath.includes("?") ? "&" : "?";
  return `${import.meta.env.BASE_URL}${relativePath}${separator}v=${APP_BUILD_ID}`;
};

const zoneImageByRoute = {
  "Elwynn / Dun Morogh / Teldrassil / Azuremyst": assetUrl("zone-images/elwynn-forest.jpg"),
  "Westfall / Loch Modan / Darkshore": assetUrl("zone-images/westfall.jpg"),
  "Redridge Mountains / Duskwood": assetUrl("zone-images/redridge-mountains.jpg"),
  "Durotar / Mulgore / Tirisfal / Eversong": assetUrl("zone-images/durotar.jpg"),
  "The Barrens / Silverpine / Ghostlands": assetUrl("zone-images/the-barrens.jpg"),
  "Stonetalon Mountains / Hillsbrad Foothills": assetUrl("zone-images/stonetalon-mountains.jpg"),
  "Ashenvale / Stonetalon Mountains": assetUrl("zone-images/ashenvale.jpg"),
  "Thousand Needles / Hillsbrad Foothills": assetUrl("zone-images/thousand-needles.jpg"),
  "Stranglethorn Vale / Arathi Highlands": assetUrl("zone-images/stranglethorn-vale.jpg"),
  "Desolace / Dustwallow Marsh": assetUrl("zone-images/desolace.jpg"),
  "Badlands / Swamp of Sorrows": assetUrl("zone-images/badlands.jpg"),
  "Tanaris / Feralas": assetUrl("zone-images/tanaris.jpg"),
  "The Hinterlands / Searing Gorge": assetUrl("zone-images/the-hinterlands.jpg"),
  "Un'Goro Crater / Felwood": assetUrl("zone-images/ungoro-crater.jpg"),
  "Western/Eastern Plaguelands / Burning Steppes": assetUrl("zone-images/western-plaguelands.jpg"),
  "Blasted Lands": assetUrl("zone-images/blasted-lands.jpg"),
  "Hellfire Peninsula": assetUrl("zone-images/hellfire-peninsula.jpg"),
  "Zangarmarsh": assetUrl("zone-images/zangarmarsh.jpg"),
  "Terokkar Forest": assetUrl("zone-images/terokkar-forest.jpg"),
  "Nagrand": assetUrl("zone-images/nagrand.jpg"),
  "Blade's Edge Mountains": assetUrl("zone-images/blades-edge-mountains.jpg"),
  "Netherstorm": assetUrl("zone-images/netherstorm.jpg"),
  "Shadowmoon Valley": assetUrl("zone-images/shadowmoon-valley.jpg"),
  "Netherstorm / Shadowmoon Valley": assetUrl("zone-images/shadowmoon-valley.jpg"),
};

const zoneTerritoryByRoute = {
  "Elwynn / Dun Morogh / Teldrassil / Azuremyst": "Alliance",
  "Westfall / Loch Modan / Darkshore": "Alliance",
  "Redridge Mountains / Duskwood": "Alliance",
  "Durotar / Mulgore / Tirisfal / Eversong": "Horde",
  "The Barrens / Silverpine / Ghostlands": "Horde",
  "Stonetalon Mountains / Hillsbrad Foothills": "Both",
  "Ashenvale / Stonetalon Mountains": "Both",
  "Thousand Needles / Hillsbrad Foothills": "Both",
  "Stranglethorn Vale / Arathi Highlands": "Both",
  "Desolace / Dustwallow Marsh": "Both",
  "Badlands / Swamp of Sorrows": "Both",
  "Tanaris / Feralas": "Both",
  "The Hinterlands / Searing Gorge": "Both",
  "Un'Goro Crater / Felwood": "Both",
  "Western/Eastern Plaguelands / Burning Steppes": "Both",
  "Blasted Lands": "Both",
  "Hellfire Peninsula": "Both",
  "Zangarmarsh": "Both",
  "Terokkar Forest": "Both",
  "Nagrand": "Both",
  "Blade's Edge Mountains": "Both",
  "Netherstorm": "Both",
  "Shadowmoon Valley": "Both",
  "Netherstorm / Shadowmoon Valley": "Both",
};
const territoryIconByFaction = {
  Alliance: assetUrl("faction-icons/alliance-crest.png"),
  Horde: assetUrl("faction-icons/horde-crest.png"),
};

function getTerritoryStatus(playerFaction, territoryFaction) {
  if (playerFaction === "Both" || territoryFaction === "Both") {
    return { kind: "neutral", icon: "●" };
  }
  if (playerFaction === territoryFaction) {
    return { kind: "friendly", icon: "⚑" };
  }
  return { kind: "hostile", icon: "⚔" };
}

function loadPersistedState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getFilteredTooltipLines(item) {
  const name = String(item?.name || "").trim().toLowerCase();
  const type = String(item?.type || "").trim().toLowerCase();
  const slot = String(item?.slot || "").trim().toLowerCase();
  const duplicatePatterns = [
    /^dropped by:/i,
    /^drop chance:/i,
    /^sell price:?/i,
    /^durability\b/i,
    /^phase\b/i,
  ];

  return (item?.tooltip || []).filter((line) => {
    const raw = String(line?.label || "").trim();
    if (!raw) return false;
    const normalized = raw.toLowerCase();
    if (normalized === name) return false;
    if (type && normalized === type) return false;
    if (slot && normalized === slot) return false;
    if (duplicatePatterns.some((pattern) => pattern.test(raw))) return false;
    return true;
  });
}

function buildTooltipRows(item) {
  const lines = getFilteredTooltipLines(item);
  const rows = [];

  lines.forEach((line) => {
    if (line.format === "alignRight" && rows.length > 0) {
      rows[rows.length - 1].right = line.label;
      return;
    }

    rows.push({
      left: line.label,
      right: "",
      format: line.format || "",
      sourceIndex: rows.length,
    });
  });

  const rank = (text) => {
    const value = String(text || "");
    if (/^item level\b/i.test(value)) return 10;
    if (/^binds when/i.test(value)) return 20;
    if (/^(head|neck|shoulder|back|chest|wrist|hands|waist|legs|feet|finger|trinket|one-hand|two-hand|main hand|off hand|ranged|held in off-hand|shield)$/i.test(value)) return 30;
    if (/^(armor|\d+\s*armor|\d+\s*-\s*\d+\s*damage|speed\b|\+\d+)/i.test(value)) return 40;
    if (/socket/i.test(value)) return 50;
    if (/^requires level\b/i.test(value)) return 60;
    if (/^(equip:|use:|chance on hit:|chance on spell hit:)/i.test(value)) return 70;
    return 80;
  };

  return rows
    .map((row, idx) => ({ ...row, idx, weight: rank(row.left) }))
    .sort((a, b) => a.weight - b.weight || a.idx - b.idx)
    .map(({ sourceIndex, idx, weight, ...clean }) => clean);
}

function getTooltipToneClass(text, format = "") {
  const value = String(text || "");
  if (format === "Misc") return "tooltip-tone--misc";
  if (/^item level\b/i.test(value)) return "tooltip-tone--ilevel";
  if (/^requires level\b/i.test(value)) return "tooltip-tone--req";
  if (/^(equip:|use:|chance on hit:|chance on spell hit:)/i.test(value)) return "tooltip-tone--equip";
  if (/^\+\d+/.test(value)) return "tooltip-tone--stat";
  if (/^meta socket\b/i.test(value)) return "tooltip-tone--socket-meta";
  if (/^blue socket\b/i.test(value)) return "tooltip-tone--socket-blue";
  if (/^red socket\b/i.test(value)) return "tooltip-tone--socket-red";
  if (/^yellow socket\b/i.test(value)) return "tooltip-tone--socket-yellow";
  if (/^socket bonus\b/i.test(value)) return "tooltip-tone--socket-bonus";
  if (/^socket/i.test(value)) return "tooltip-tone--socket";
  if (/^binds when/i.test(value)) return "tooltip-tone--bind";
  return "";
}

export default function App() {
  const persisted = useMemo(() => loadPersistedState(), []);
  const [now, setNow] = useState(() => new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState("route");
  const [dungeonSort, setDungeonSort] = useState("level-asc");
  const [dungeonFilterLevelInput, setDungeonFilterLevelInput] = useState("");
  const [selectedProfessions, setSelectedProfessions] = useState(() =>
    Array.isArray(persisted?.selectedProfessions)
      ? persisted.selectedProfessions.filter((p) => professionDefById[p]).slice(0, 2)
      : [],
  );
  const [language, setLanguage] = useState(
    persisted?.language && ["ru", "en"].includes(persisted.language)
      ? persisted.language
      : "ru",
  );

  const [isConfigured, setIsConfigured] = useState(
    Boolean(persisted?.isConfigured),
  );
  const [faction, setFaction] = useState(
    persisted?.faction && ["Both", "Alliance", "Horde"].includes(persisted.faction)
      ? persisted.faction
      : "Both",
  );
  const [playerClass, setPlayerClass] = useState(
    persisted?.playerClass && classList.includes(persisted.playerClass)
      ? persisted.playerClass
      : "Any",
  );
  const [race, setRace] = useState(
    persisted?.race && raceList.includes(persisted.race) ? persisted.race : "Any",
  );
  const [startLevel, setStartLevel] = useState(
    String(clampLevel(persisted?.startLevel ?? 1)),
  );
  const [currentLevel, setCurrentLevel] = useState(
    clampLevel(persisted?.currentLevel ?? 1),
  );
  const [completedIds, setCompletedIds] = useState(
    () => new Set(Array.isArray(persisted?.completedIds) ? persisted.completedIds : []),
  );
  const [hidingIds, setHidingIds] = useState(
    () => new Set(Array.isArray(persisted?.completedIds) ? persisted.completedIds : []),
  );
  const [selectedDungeonId, setSelectedDungeonId] = useState(null);
  const [selectedBossId, setSelectedBossId] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0, below: false });
  const tooltipRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const updateTooltipPosition = () => {
    if (!tooltipData) return;
    const margin = 12;
    const offset = 16;
    const width = tooltipRef.current?.offsetWidth || 220;
    const height = tooltipRef.current?.offsetHeight || 220;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const x = Number.isFinite(pointerRef.current.x) ? pointerRef.current.x : viewportW / 2;
    const y = Number.isFinite(pointerRef.current.y) ? pointerRef.current.y : viewportH / 2;

    let left = x + offset;
    if (left + width > viewportW - margin) {
      left = x - width - offset;
    }
    if (left < margin) {
      left = Math.max(margin, viewportW - width - margin);
    }

    let below = false;
    let top = y - height - offset;
    if (top < margin) {
      top = y + offset;
      below = true;
    }
    if (top + height > viewportH - margin) {
      top = Math.max(margin, viewportH - height - margin);
    }

    setTooltipPosition({ left, top, below });
  };

  const normalizedStartLevel = clampLevel(startLevel);
  const normalizedCurrentLevel = clampLevel(currentLevel);
  const t = (key, vars) => tr(language, key, vars);
  const userClock = useMemo(
    () =>
      new Intl.DateTimeFormat(language === "en" ? "en-US" : "ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(now),
    [now, language],
  );
  const allowedRacesForFaction = useMemo(() => {
    return raceList.filter((raceName) => {
      const raceFaction = raceFactionMap[raceName] || "Both";
      return faction === "Both" || raceFaction === "Both" || raceFaction === faction;
    });
  }, [faction]);
  const allowedClassesForRace = raceClassMap[race] || classList;

  const questLevelById = useMemo(() => {
    return new Map(quests.map((quest) => [quest.id, Number(quest.level)]));
  }, []);
  const levelForDungeons = isConfigured
    ? normalizedCurrentLevel
    : normalizedStartLevel;
  const dungeonListForLevel = useMemo(() => {
    const list = [...dungeons]
      .filter((dungeon) => CLASSIC_TBC_DUNGEON_NAMES.has(dungeon.name))
      .flatMap((dungeon) => splitScarletMonasteryDungeon(dungeon))
      .sort((a, b) => {
        if (dungeonSort === "level-desc") {
          return b.levelMin - a.levelMin || b.levelMax - a.levelMax || a.name.localeCompare(b.name);
        }
        return a.levelMin - b.levelMin || a.levelMax - b.levelMax || a.name.localeCompare(b.name);
      });
    return list;
  }, [dungeonSort]);
  const hasDungeonLevelFilter = dungeonFilterLevelInput.trim() !== "";
  const dungeonFilterLevel = hasDungeonLevelFilter
    ? clampLevel(dungeonFilterLevelInput)
    : null;
  const filteredDungeonList = useMemo(() => {
    if (activeView !== "dungeons") return dungeonListForLevel;
    if (!hasDungeonLevelFilter || dungeonFilterLevel == null) return dungeonListForLevel;
    return dungeonListForLevel.filter(
      (dungeon) =>
        dungeonFilterLevel >= dungeon.levelMin && dungeonFilterLevel <= dungeon.levelMax,
    );
  }, [activeView, dungeonListForLevel, dungeonFilterLevel, hasDungeonLevelFilter]);
  const visibleDungeonList =
    activeView === "dungeons" ? filteredDungeonList : dungeonListForLevel;
  const selectedDungeon = useMemo(() => {
    if (!selectedDungeonId) return visibleDungeonList[0] || null;
    return visibleDungeonList.find((dungeon) => dungeon.id === selectedDungeonId) || null;
  }, [visibleDungeonList, selectedDungeonId]);
  const selectedBoss = useMemo(() => {
    if (!selectedDungeon || !selectedDungeon.bosses.length) return null;
    if (!selectedBossId) return selectedDungeon.bosses[0] || null;
    return (
      selectedDungeon.bosses.find((b) => b.id === selectedBossId) ||
      selectedDungeon.bosses[0] ||
      null
    );
  }, [selectedDungeon, selectedBossId]);

  const autoCompletedIds = useMemo(() => {
    return new Set(
      quests
        .filter(
          (quest) =>
            isFactionMatch(quest.faction, faction) &&
            Number(quest.level) < normalizedCurrentLevel,
        )
        .map((quest) => quest.id),
    );
  }, [faction, normalizedCurrentLevel]);

  const effectiveCompletedIds = useMemo(() => {
    const ids = new Set(autoCompletedIds);
    completedIds.forEach((id) => ids.add(id));
    return ids;
  }, [autoCompletedIds, completedIds]);

  const unlockedQuests = useMemo(() => {
    return quests.filter((quest) => {
      if (!isFactionMatch(quest.faction, faction)) return false;
      if (hidingIds.has(quest.id)) return false;
      return canUnlock(quest, effectiveCompletedIds);
    });
  }, [faction, hidingIds, effectiveCompletedIds]);

  const highestCompletedLevel = useMemo(() => {
    if (completedIds.size === 0) return null;
    let maxLevel = 0;
    completedIds.forEach((id) => {
      const level = questLevelById.get(id);
      if (typeof level === "number" && level > maxLevel) maxLevel = level;
    });
    return maxLevel || null;
  }, [completedIds, questLevelById]);

  const recommendedLevel = useMemo(() => {
    if (unlockedQuests.length === 0) return null;

    const levels = unlockedQuests.map((quest) => Number(quest.level));
    const levelsAtOrBelowCurrent = levels.filter(
      (level) => level <= normalizedCurrentLevel,
    );

    if (levelsAtOrBelowCurrent.length === 0) return null;

    if (highestCompletedLevel != null) {
      const sequenceLevels = levelsAtOrBelowCurrent.filter(
        (level) => level >= highestCompletedLevel,
      );
      if (sequenceLevels.length === 0) return null;
      return Math.min(...sequenceLevels);
    }

    return Math.max(...levelsAtOrBelowCurrent);
  }, [unlockedQuests, normalizedCurrentLevel, highestCompletedLevel]);

  const nextRecommendedLevel = useMemo(() => {
    if (unlockedQuests.length === 0) return null;

    const levels = unlockedQuests
      .map((quest) => Number(quest.level))
      .filter((level) => level > normalizedCurrentLevel);

    if (highestCompletedLevel != null) {
      const forwardLevels = levels.filter((level) => level >= highestCompletedLevel);
      if (forwardLevels.length === 0) return null;
      return Math.min(...forwardLevels);
    }

    if (levels.length === 0) return null;
    return Math.min(...levels);
  }, [unlockedQuests, normalizedCurrentLevel, highestCompletedLevel]);

  const visibleQuests = useMemo(() => {
    if (recommendedLevel == null) return [];
    return unlockedQuests.filter(
      (quest) => Number(quest.level) === recommendedLevel,
    );
  }, [unlockedQuests, recommendedLevel]);
  const currentQuestZone = useMemo(() => {
    if (visibleQuests.length > 0) return visibleQuests[0].zone;
    return null;
  }, [visibleQuests]);
  const zoneImageUrl = useMemo(() => {
    if (!currentQuestZone) return DEFAULT_ZONE_IMAGE;
    return zoneImageByRoute[currentQuestZone] || DEFAULT_ZONE_IMAGE;
  }, [currentQuestZone]);

  const trackableIds = useMemo(() => {
    return quests
      .filter((quest) => isFactionMatch(quest.faction, faction))
      .map((quest) => quest.id);
  }, [faction]);

  const doneInRoute = trackableIds.filter((id) =>
    effectiveCompletedIds.has(id),
  ).length;
  const progress = Math.round((doneInRoute / (trackableIds.length || 1)) * 100);

  const completeQuest = (questId) => {
    if (completedIds.has(questId) || hidingIds.has(questId)) return;

    setCompletedIds((prev) => new Set(prev).add(questId));
    setCurrentLevel((prev) => Math.max(prev, questLevelById.get(questId) || prev));

    window.setTimeout(() => {
      setHidingIds((prev) => new Set(prev).add(questId));
    }, 760);
  };

  const startRoute = () => {
    const initialLevel = clampLevel(startLevel);
    setCurrentLevel(initialLevel);
    setCompletedIds(new Set());
    setHidingIds(new Set());
    setIsConfigured(true);
  };

  const resetRoute = () => {
    setIsConfigured(false);
    setCompletedIds(new Set());
    setHidingIds(new Set());
    setCurrentLevel(clampLevel(startLevel));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const snapshot = {
      isConfigured,
      faction,
      playerClass,
      race,
      startLevel: normalizedStartLevel,
      currentLevel: normalizedCurrentLevel,
      completedIds: Array.from(completedIds),
      language,
      selectedProfessions,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [
    isConfigured,
    faction,
    playerClass,
    race,
    normalizedStartLevel,
    normalizedCurrentLevel,
    completedIds,
    language,
    selectedProfessions,
  ]);

  useEffect(() => {
    if (!isConfigured) return;
    if (recommendedLevel != null) return;
    if (nextRecommendedLevel == null) return;
    setCurrentLevel(nextRecommendedLevel);
  }, [isConfigured, recommendedLevel, nextRecommendedLevel]);

  useEffect(() => {
    const timerId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (allowedClassesForRace.includes(playerClass)) return;
    setPlayerClass("Any");
  }, [allowedClassesForRace, playerClass]);

  useEffect(() => {
    if (allowedRacesForFaction.includes(race)) return;
    setRace("Any");
  }, [allowedRacesForFaction, race]);
  useEffect(() => {
    if (visibleDungeonList.length === 0) {
      setSelectedDungeonId(null);
      return;
    }
    if (!selectedDungeonId || !visibleDungeonList.some((d) => d.id === selectedDungeonId)) {
      setSelectedDungeonId(visibleDungeonList[0].id);
    }
  }, [visibleDungeonList, selectedDungeonId]);
  useEffect(() => {
    if (!selectedDungeon || selectedDungeon.bosses.length === 0) {
      setSelectedBossId(null);
      return;
    }
    if (!selectedBossId || !selectedDungeon.bosses.some((boss) => boss.id === selectedBossId)) {
      setSelectedBossId(selectedDungeon.bosses[0]?.id || null);
    }
  }, [selectedDungeon, selectedBossId]);
  useEffect(() => {
    if (!tooltipData) return;
    updateTooltipPosition();
  }, [tooltipData]);

  const openLootTooltip = (item, event) => {
    const x = Number.isFinite(event?.clientX) ? event.clientX : window.innerWidth / 2;
    const y = Number.isFinite(event?.clientY) ? event.clientY : window.innerHeight / 2;
    pointerRef.current = { x, y };
    setTooltipData({ item, bossName: selectedBoss?.name || "" });
  };

  const moveLootTooltip = (event) => {
    if (!tooltipData) return;
    if (!Number.isFinite(event?.clientX) || !Number.isFinite(event?.clientY)) return;
    pointerRef.current = { x: event.clientX, y: event.clientY };
    updateTooltipPosition();
  };

  const closeLootTooltip = () => setTooltipData(null);
  const toggleProfession = (profession) => {
    setSelectedProfessions((prev) => {
      if (prev.includes(profession)) {
        return prev.filter((p) => p !== profession);
      }
      if (prev.length < 2) {
        return [...prev, profession];
      }
      return [prev[0], profession];
    });
  };
  const removeProfession = (profession) => {
    setSelectedProfessions((prev) => prev.filter((p) => p !== profession));
  };
  const renderProfessionPlan = (professionId) => {
    const steps = PROFESSION_LEVELING_STEPS[professionId] || [];
    if (steps.length === 0) return null;
    return (
      <section className="profession-plan" aria-label={t("professionPlanTitle")}>
        <h4>{t("professionPlanTitle")}</h4>
        <div className="profession-plan__rows">
          {steps.map((step, index) => (
            <article className="profession-plan__row" key={`${professionId}-${step.range}-${index}`}>
              <div className="profession-plan__top">
                <span className="profession-plan__range">{step.range}</span>
                <span className="profession-plan__craft">
                  <img
                    src={getWowIconUrl(getCraftIconName(professionId, step.en))}
                    alt={language === "ru" ? step.ru : step.en}
                    loading="lazy"
                    onError={handleWowIconError}
                  />
                  <span>{language === "ru" ? step.ru : step.en}</span>
                </span>
                {step.qty !== "route" && (
                  <span className="profession-plan__qty">
                    {`x${step.qty}`}
                  </span>
                )}
              </div>
              <div className="profession-plan__materials">
                {getStepMaterials(professionId, step, language).map((mat, matIndex) => (
                  <span className="profession-plan__mat" key={`${professionId}-${step.range}-mat-${matIndex}`}>
                    <img
                      src={mat.icon}
                      alt={mat.label}
                      loading="lazy"
                      onError={handleWowIconError}
                    />
                    <span className="profession-plan__mat-label">{mat.label}</span>
                    {mat.qty !== "route" && <strong>{`x${mat.qty}`}</strong>}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  };

  return (
    <main className={`page ${language === "ru" ? "page--lang-ru" : "page--lang-en"}`}>
      <button
        className="burger-btn"
        type="button"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-label={t("openMenu")}
        aria-expanded={isMenuOpen}
      >
        <span />
        <span />
        <span />
      </button>

      {isMenuOpen && (
        <button
          className="menu-overlay"
          type="button"
          aria-label={t("closeMenu")}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <aside className={`side-menu ${isMenuOpen ? "side-menu--open" : ""}`}>
        <h2>{t("menuTitle")}</h2>
        <div className="side-menu__nav">
          <button
            type="button"
            className={`side-menu__tab ${activeView === "route" ? "side-menu__tab--active" : ""}`}
            onClick={() => {
              setActiveView("route");
              setIsMenuOpen(false);
            }}
          >
            {t("tabRoute")}
          </button>
          <button
            type="button"
            className={`side-menu__tab ${activeView === "dungeons" ? "side-menu__tab--active" : ""}`}
            onClick={() => {
              setActiveView("dungeons");
              setIsMenuOpen(false);
            }}
          >
            {t("tabDungeons")}
          </button>
          <button
            type="button"
            className={`side-menu__tab ${activeView === "professions" ? "side-menu__tab--active" : ""}`}
            onClick={() => {
              setActiveView("professions");
              setIsMenuOpen(false);
            }}
          >
            {t("tabProfessions")}
          </button>
        </div>
        <div className="side-menu__sources">
          <h3>{t("sourcesTitle")}</h3>
          <ul>
            {sourceLinks.map((item) => (
              <li key={item.url}>
                <a href={item.url} target="_blank">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            className="github-badge"
            href="https://github.com/Magnitoshka"
            target="_blank"
            rel="noopener"
            aria-label="Magnitoshka on GitHub"
            title="Magnitoshka on GitHub"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.72c-2.78.61-3.37-1.19-3.37-1.19-.45-1.15-1.11-1.46-1.11-1.46-.9-.62.07-.61.07-.61 1 .07 1.52 1.03 1.52 1.03.88 1.51 2.31 1.07 2.87.82.09-.64.35-1.07.63-1.31-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.03a9.58 9.58 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.37.2 2.39.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.85-2.33 4.69-4.56 4.94.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </aside>

      <aside
        className="zone-widget zone-widget--floating"
        aria-label={t("zoneWidgetLabel")}
      >
        <div className="minimap-shell">
          <div className="minimap-frame">
            <img
              className="zone-widget__map"
              src={zoneImageUrl}
              alt={`Миникарта зоны ${currentQuestZone}`}
              onError={(event) => {
                event.currentTarget.src = DEFAULT_ZONE_IMAGE;
              }}
            />
            <div className="minimap-overlay" />
            <div className="minimap-coords">{userClock}</div>
          </div>
        </div>
        <div className="zone-widget__meta">
          <strong>{t("questZone")}</strong> {currentQuestZone || t("routeNotSelected")}
        </div>
      </aside>

      <button
        className="lang-btn"
        type="button"
        onClick={() => setLanguage((prev) => (prev === "ru" ? "en" : "ru"))}
        aria-label="Switch language"
      >
        {language === "ru" ? "EN" : "RU"}
      </button>

      {activeView === "route" ? (
        <section className="dungeon-panel dungeon-panel--compact" aria-label={t("listAria")}>
          <div className="dungeon-panel__header">
            <h2>{t("dungeonsTitle")}</h2>
            <span>{t("levelGuide", { level: levelForDungeons })}</span>
          </div>
          <div className="dungeon-sort">
            <label>
              {t("sortLabel")}
              <select value={dungeonSort} onChange={(e) => setDungeonSort(e.target.value)}>
                <option value="level-asc">{t("sortAsc")}</option>
                <option value="level-desc">{t("sortDesc")}</option>
              </select>
            </label>
          </div>
          <ul className="dungeon-list dungeon-list--compact" role="list" aria-label={t("compactListAria")}>
            {dungeonListForLevel.map((dungeon) => (
              <li key={dungeon.id}>
                <button
                  type="button"
                  className={`dungeon-row ${levelForDungeons >= dungeon.levelMin && levelForDungeons <= dungeon.levelMax ? "dungeon-row--recommended" : ""}`}
                  onClick={() => {
                    setSelectedDungeonId(dungeon.id);
                    setActiveView("dungeons");
                  }}
                >
                  <span className="dungeon-row__name">{dungeon.name}</span>
                  <span className="dungeon-row__meta">
                    {dungeon.levelMin}-{dungeon.levelMax} | {getDungeonDisplayLocation(dungeon.name, dungeon.location)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : activeView === "dungeons" ? (
        <section className="dungeon-panel dungeon-panel--detailed" aria-label={t("listAria")}>
          <button
            type="button"
            className="back-to-route-btn"
            onClick={() => setActiveView("route")}
          >
            {t("backToRoute")}
          </button>
          <div className="dungeon-panel__header">
            <h2>{t("dungeonsTitle")}</h2>
            <span>{t("levelGuideDetailed", { level: levelForDungeons })}</span>
          </div>
          <div className="dungeon-sort">
            <label>
              {t("sortLabel")}
              <select value={dungeonSort} onChange={(e) => setDungeonSort(e.target.value)}>
                <option value="level-asc">{t("sortAsc")}</option>
                <option value="level-desc">{t("sortDesc")}</option>
              </select>
            </label>
            <label>
              {t("characterLevel")}
              <input
                type="number"
                min={1}
                max={70}
                value={dungeonFilterLevelInput}
                placeholder={String(levelForDungeons)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setDungeonFilterLevelInput("");
                  } else {
                    setDungeonFilterLevelInput(String(clampLevel(value)));
                  }
                }}
              />
            </label>
            {hasDungeonLevelFilter && (
              <button
                type="button"
                className="dungeon-sort__clear"
                onClick={() => setDungeonFilterLevelInput("")}
                aria-label={t("clearDungeonLevel")}
                title={t("clear")}
              >
                ×
              </button>
            )}
            <span className="dungeon-sort__hint">
              {hasDungeonLevelFilter && dungeonFilterLevel != null
                ? t("dungeonsForLevel", { level: dungeonFilterLevel })
                : t("allDungeonsShown")}
            </span>
          </div>

          <div className="dungeon-panel__layout">
            <ul className="dungeon-list" role="listbox" aria-label={t("listAria")}>
              {visibleDungeonList.map((dungeon) => (
                <li key={dungeon.id}>
                  <button
                    type="button"
                    className={`dungeon-row ${selectedDungeon?.id === dungeon.id ? "dungeon-row--active" : ""} ${(hasDungeonLevelFilter && dungeonFilterLevel != null)
                      ? dungeonFilterLevel >= dungeon.levelMin && dungeonFilterLevel <= dungeon.levelMax
                        ? "dungeon-row--recommended"
                        : ""
                      : "dungeon-row--recommended"}`}
                    onClick={() => setSelectedDungeonId(dungeon.id)}
                  >
                    <span className="dungeon-row__name">{dungeon.name}</span>
                    <span className="dungeon-row__meta">
                      {dungeon.levelMin}-{dungeon.levelMax} | {getDungeonDisplayLocation(dungeon.name, dungeon.location)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="dungeon-loot">
              {visibleDungeonList.length === 0 ? (
                <p className="empty-state">
                  {t("noDungeonsForLevel", { level: dungeonFilterLevel ?? levelForDungeons })}
                </p>
              ) : !selectedDungeon ? (
                <p className="empty-state">{t("pickDungeon")}</p>
              ) : (
                <>
                  <h3>{selectedDungeon.name}</h3>
                  <p className="dungeon-loot__sub">
                    {t("levelsAndZone", {
                      min: selectedDungeon.levelMin,
                      max: selectedDungeon.levelMax,
                      location: getDungeonDisplayLocation(selectedDungeon.name, selectedDungeon.location),
                    })}
                  </p>
                  <ul className="boss-list" role="tablist" aria-label={t("bossesListAria")}>
                    {selectedDungeon.bosses.map((boss) => (
                      <li key={boss.id}>
                        <button
                          type="button"
                          className={`boss-chip ${selectedBoss?.id === boss.id ? "boss-chip--active" : ""}`}
                          onClick={() => setSelectedBossId(boss.id)}
                        >
                          {boss.name}
                        </button>
                      </li>
                    ))}
                  </ul>

                  <ul className="loot-list">
                    {(selectedBoss?.loot || []).map((item) => (
                      <li key={`${selectedDungeon.id}-${item.id}`} className="loot-item">
                        <button
                          type="button"
                          className="loot-icon-btn"
                          onMouseEnter={(event) => openLootTooltip(item, event)}
                          onMouseMove={moveLootTooltip}
                          onMouseLeave={closeLootTooltip}
                          onFocus={(event) => {
                            const rect = event.currentTarget.getBoundingClientRect();
                            openLootTooltip(item, {
                              clientX: rect.left + rect.width / 2,
                              clientY: rect.top + rect.height / 2,
                            });
                          }}
                          onBlur={closeLootTooltip}
                        >
                          <img
                            src={getLocalWowIconFromAny(item.icon)}
                            alt={item.name}
                            loading="lazy"
                            onError={handleWowIconError}
                          />
                          <span className={`loot-rarity loot-rarity--${item.rarity.toLowerCase()}`}>{item.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {tooltipData &&
                    createPortal(
                      <div
                        ref={tooltipRef}
                        className={`loot-tooltip-float ${tooltipPosition.below ? "loot-tooltip-float--below" : ""}`}
                        role="tooltip"
                        style={{
                          left: `${tooltipPosition.left}px`,
                          top: `${tooltipPosition.top}px`,
                        }}
                      >
                        <strong className={`loot-tooltip__name loot-tooltip__name--${tooltipData.item.rarity.toLowerCase()}`}>
                          {tooltipData.item.name}
                        </strong>
                        {buildTooltipRows(tooltipData.item).map((row, idx) => (
                          <div
                            key={`${tooltipData.item.id}-${idx}`}
                            className={`loot-tooltip__row ${row.format ? `loot-tooltip__row--${row.format}` : ""}`}
                          >
                            <span
                              className={`loot-tooltip__line ${row.format ? `loot-tooltip__line--${row.format}` : ""} ${getTooltipToneClass(row.left, row.format)}`}
                            >
                              {row.left}
                            </span>
                            {row.right && (
                              <span
                                className={`loot-tooltip__line loot-tooltip__line--right ${getTooltipToneClass(row.right, row.format)}`}
                              >
                                {row.right}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>,
                      document.body,
                    )}
                </>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="profession-panel" aria-label={t("professionsTitle")}>
          <header className="profession-panel__header">
            <h2>{t("professionsTitle")}</h2>
            <span>{t("professionsSubtitle")}</span>
          </header>
          <div className="profession-panel__layout">
            <aside className="profession-list-wrap">
              <ul className="profession-list" role="list" aria-label={t("professionsTitle")}>
                {PROFESSION_DEFS.map((profession) => {
                  const active = selectedProfessions.includes(profession.id);
                  return (
                    <li key={profession.id}>
                      <button
                        type="button"
                        className={`profession-item ${active ? "profession-item--active" : ""}`}
                        onClick={() => toggleProfession(profession.id)}
                        title={getProfessionLabel(language, profession.id)}
                        aria-label={getProfessionLabel(language, profession.id)}
                      >
                        <img
                          src={assetUrl(profession.icon)}
                          alt={getProfessionLabel(language, profession.id)}
                          loading="lazy"
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>
            <div className="profession-slots">
              <article className="profession-slot">
                <h3>{t("professionOne")}</h3>
                {selectedProfessions[0] ? (
                  <>
                    <button
                      type="button"
                      key={selectedProfessions[0]}
                      className="profession-chip profession-chip--placed"
                      onClick={() => removeProfession(selectedProfessions[0])}
                      title={t("clear")}
                    >
                      <img
                        src={assetUrl(professionDefById[selectedProfessions[0]].icon)}
                        alt={getProfessionLabel(language, selectedProfessions[0])}
                      />
                      <span>{getProfessionLabel(language, selectedProfessions[0])}</span>
                    </button>
                    {renderProfessionPlan(selectedProfessions[0])}
                  </>
                ) : (
                  <p className="profession-slot__empty">{t("professionEmpty")}</p>
                )}
              </article>
              <article className="profession-slot">
                <h3>{t("professionTwo")}</h3>
                {selectedProfessions[1] ? (
                  <>
                    <button
                      type="button"
                      key={selectedProfessions[1]}
                      className="profession-chip profession-chip--placed"
                      onClick={() => removeProfession(selectedProfessions[1])}
                      title={t("clear")}
                    >
                      <img
                        src={assetUrl(professionDefById[selectedProfessions[1]].icon)}
                        alt={getProfessionLabel(language, selectedProfessions[1])}
                      />
                      <span>{getProfessionLabel(language, selectedProfessions[1])}</span>
                    </button>
                    {renderProfessionPlan(selectedProfessions[1])}
                  </>
                ) : (
                  <p className="profession-slot__empty">{t("professionEmpty")}</p>
                )}
              </article>
            </div>
          </div>
        </section>
      )}

      {activeView === "route" && <section className="board">
        <header className="board__header">
          <div className="board__header-main">
            <h1>{t("boardTitle")}</h1>
          </div>
        </header>

        {!isConfigured ? (
          <>
            <div className="filters">
              <label>
                {t("faction")}
                <select
                  value={faction}
                  onChange={(event) => setFaction(event.target.value)}
                >
                  <option value="Both">{t("anyFaction")}</option>
                  <option value="Alliance">{t("alliance")}</option>
                  <option value="Horde">{t("horde")}</option>
                </select>
              </label>

              <label>
                {t("race")}
                <select value={race} onChange={(e) => setRace(e.target.value)}>
                  {allowedRacesForFaction.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                {t("startLevel")}
                <input
                  type="number"
                  min={1}
                  max={70}
                  value={startLevel}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setStartLevel("");
                    } else {
                      setStartLevel(String(clampLevel(val)));
                    }
                  }}
                />
              </label>

              <label>
                {t("class")}
                <select
                  value={playerClass}
                  onChange={(event) => setPlayerClass(event.target.value)}
                >
                  {allowedClassesForRace.map((gameClass) => (
                    <option key={gameClass} value={gameClass}>
                      {gameClass}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="spawn-info">
              <strong>{t("startLevelLabel")}</strong> {normalizedStartLevel}
            </div>

            <div className="actions">
              <button className="action-btn" onClick={startRoute}>
                {t("beginRoute")}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="spawn-info">
              <strong>{t("currentLevel")}</strong> {normalizedCurrentLevel}
            </div>

            <div className="progress">
              <span>{t("progress", { value: progress })}</span>
              <div>
                {t("completed", { done: doneInRoute, total: trackableIds.length })}
              </div>
              {recommendedLevel != null && (
                <div>{t("recommendedQuestLevel", { level: recommendedLevel })}</div>
              )}
            </div>

            <div className="actions">
              <button className="action-btn action-btn--ghost" onClick={resetRoute}>
                {t("changeStart")}
              </button>
            </div>

            <div className="quest-stage">
              {visibleQuests.length === 0 ? (
                <p className="empty-state">
                  {t("noNewQuests")}
                </p>
              ) : (
                <ul className="quest-list" aria-live="polite">
                  {visibleQuests.map((quest) => {
                    const isDone = completedIds.has(quest.id);
                    const territoryFaction = zoneTerritoryByRoute[quest.zone] || "Both";
                    const territoryStatus = getTerritoryStatus(
                      faction,
                      territoryFaction,
                    );
                    const territoryLabel =
                      territoryFaction === "Alliance"
                        ? t("territoryAlliance")
                        : territoryFaction === "Horde"
                          ? t("territoryHorde")
                          : t("territoryContested");
                    const territoryCrest = territoryIconByFaction[territoryFaction] || null;

                    return (
                      <li
                        key={quest.id}
                        className={`quest-item ${isDone ? "quest-item--completed" : ""}`}
                      >
                        <button
                          className="check"
                          onClick={() => completeQuest(quest.id)}
                          aria-label={t("completeQuest", { title: quest.title })}
                          disabled={isDone}
                        >
                          {isDone ? "✓" : ""}
                        </button>

                        <div className="quest-content">
                          <p className="quest-title">{quest.title}</p>
                          <p className="quest-meta">
                            {t("levelMeta", {
                              zone: quest.zone,
                              level: quest.level,
                              chain: quest.chain,
                            })}
                          </p>
                          <p className="quest-territory">
                            <span
                              className={`territory-badge territory-badge--${territoryStatus.kind}`}
                              aria-label={
                                territoryStatus.kind === "friendly"
                                  ? t("territoryFriendly")
                                  : territoryStatus.kind === "hostile"
                                    ? t("territoryHostile")
                                    : t("territoryNeutral")
                              }
                            >
                              {territoryStatus.icon}
                            </span>
                            {t("territory", { label: territoryLabel })}
                            {territoryCrest && (
                              <span className="territory-crest-box">
                                <img
                                  className="territory-crest"
                                  src={territoryCrest}
                                  alt={`${territoryLabel} crest`}
                                />
                              </span>
                            )}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}

      </section>}

    </main>
  );
}
