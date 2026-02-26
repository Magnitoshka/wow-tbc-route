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
const I18N = {
  ru: {
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню",
    menuTitle: "Меню",
    tabRoute: "Маршрут",
    tabDungeons: "Данжи",
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
  },
  en: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    menuTitle: "Menu",
    tabRoute: "Route",
    tabDungeons: "Dungeons",
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
const assetUrl = (relativePath) => `${import.meta.env.BASE_URL}${relativePath}`;

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
        </section>
      ) : (
        <section className="dungeon-panel dungeon-panel--detailed" aria-label={t("listAria")}>
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
                            src={item.icon}
                            alt={item.name}
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.src = "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg";
                            }}
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

      <footer className="site-footer">
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
      </footer>
    </main>
  );
}
