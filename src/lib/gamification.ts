// XP Thresholds
export const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0, maxXp: 100 },
  { level: 2, minXp: 100, maxXp: 250 },
  { level: 3, minXp: 250, maxXp: 500 },
  { level: 4, minXp: 500, maxXp: 900 },
  { level: 5, minXp: 900, maxXp: 1400 },
];

export const RANK_THRESHOLDS = [
  { rank: 'E', minXp: 0, maxXp: 249 },
  { rank: 'D', minXp: 250, maxXp: 499 },
  { rank: 'C', minXp: 500, maxXp: 899 },
  { rank: 'B', minXp: 900, maxXp: 1399 },
  { rank: 'A', minXp: 1400, maxXp: 2199 },
  { rank: 'S', minXp: 2200, maxXp: Infinity },
];

export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].minXp) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1;
}

export function calculateRank(xp: number): string {
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= RANK_THRESHOLDS[i].minXp) {
      return RANK_THRESHOLDS[i].rank;
    }
  }
  return 'E';
}

export function getNextLevelProgress(xp: number) {
  const currentLevel = calculateLevel(xp);
  const threshold = LEVEL_THRESHOLDS.find((t) => t.level === currentLevel);
  const nextThreshold = LEVEL_THRESHOLDS.find((t) => t.level === currentLevel + 1);

  if (!nextThreshold || !threshold) {
    return { current: xp, max: xp, percentage: 100 }; // Max level
  }

  const xpInCurrentLevel = xp - threshold.minXp;
  const xpNeededForNext = nextThreshold.minXp - threshold.minXp;
  const percentage = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100));

  return {
    current: xpInCurrentLevel,
    max: xpNeededForNext,
    percentage,
  };
}
