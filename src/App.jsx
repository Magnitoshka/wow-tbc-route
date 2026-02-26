import React, { useEffect, useMemo, useState } from "react";
import {
  classList,
  quests,
  raceClassMap,
  raceFactionMap,
  sourceLinks,
  raceList,
} from "./quests";

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
    return { kind: "neutral", icon: "●", label: "Спорная" };
  }
  if (playerFaction === territoryFaction) {
    return { kind: "friendly", icon: "⚑", label: "Своя" };
  }
  return { kind: "hostile", icon: "⚔", label: "Вражеская" };
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

export default function App() {
  const persisted = useMemo(() => loadPersistedState(), []);
  const [now, setNow] = useState(() => new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const normalizedStartLevel = clampLevel(startLevel);
  const normalizedCurrentLevel = clampLevel(currentLevel);
  const userClock = useMemo(
    () =>
      new Intl.DateTimeFormat("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(now),
    [now],
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
    return "Маршрут не выбран";
  }, [visibleQuests]);
  const zoneImageUrl = useMemo(() => {
    if (currentQuestZone === "Маршрут не выбран") return DEFAULT_ZONE_IMAGE;
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

  return (
    <main className="page">
      <button
        className="burger-btn"
        type="button"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-label="Открыть меню источников"
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
          aria-label="Закрыть меню"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <aside className={`side-menu ${isMenuOpen ? "side-menu--open" : ""}`}>
        <h2>Источники маршрута</h2>
        <ul>
          {sourceLinks.map((item) => (
            <li key={item.url}>
              <a href={item.url} target="_blank">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </aside>

      <aside
        className="zone-widget zone-widget--floating"
        aria-label="Текущая зона и время"
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
          <strong>Зона квестов:</strong> {currentQuestZone}
        </div>
      </aside>

      <section className="board">
        <header className="board__header">
          <div className="board__header-main">
            <h1>Classic WOW TBC Fast Route 1-70</h1>
          </div>
        </header>

        {!isConfigured ? (
          <>
            <div className="filters">
              <label>
                Фракция
                <select
                  value={faction}
                  onChange={(event) => setFaction(event.target.value)}
                >
                  <option value="Both">Любая</option>
                  <option value="Alliance">Alliance</option>
                  <option value="Horde">Horde</option>
                </select>
              </label>

              <label>
                Расса
                <select value={race} onChange={(e) => setRace(e.target.value)}>
                  {allowedRacesForFaction.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Стартовый уровень
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
                Класс
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
              <strong>Стартовый уровень:</strong> {normalizedStartLevel}
            </div>

            <div className="actions">
              <button className="action-btn" onClick={startRoute}>
                Начать маршрут
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="spawn-info">
              <strong>Текущий уровень:</strong> {normalizedCurrentLevel}
            </div>

            <div className="progress">
              <span>Прогресс маршрута: {progress}%</span>
              <div>
                Выполнено: {doneInRoute}/{trackableIds.length}
              </div>
              {recommendedLevel != null && (
                <div>Рекомендуемый уровень квестов: {recommendedLevel}</div>
              )}
            </div>

            <div className="actions">
              <button className="action-btn action-btn--ghost" onClick={resetRoute}>
                Изменить стартовые параметры
              </button>
            </div>

            <div className="quest-stage">
              {visibleQuests.length === 0 ? (
                <p className="empty-state">
                  Для текущего шага пока нет новых квестов. Уровень маршрута
                  обновится автоматически, когда откроется следующий этап.
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
                        ? "Alliance"
                        : territoryFaction === "Horde"
                          ? "Horde"
                          : "Contested";
                    const territoryCrest = territoryIconByFaction[territoryFaction] || null;

                    return (
                      <li
                        key={quest.id}
                        className={`quest-item ${isDone ? "quest-item--completed" : ""}`}
                      >
                        <button
                          className="check"
                          onClick={() => completeQuest(quest.id)}
                          aria-label={`Выполнить ${quest.title}`}
                          disabled={isDone}
                        >
                          {isDone ? "✓" : ""}
                        </button>

                        <div className="quest-content">
                          <p className="quest-title">{quest.title}</p>
                          <p className="quest-meta">
                            {quest.zone} | Уровень: {quest.level} | {quest.chain}
                          </p>
                          <p className="quest-territory">
                            <span
                              className={`territory-badge territory-badge--${territoryStatus.kind}`}
                              aria-label={territoryStatus.label}
                            >
                              {territoryStatus.icon}
                            </span>
                            Территория: {territoryLabel}
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

      </section>

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
