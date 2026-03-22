/**
 * Gamification Service
 * Tracks user achievements, streaks, and badges
 */

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "beginner" | "consistency" | "care" | "collection" | "special";
  requirement: string;
  points: number;
}

export interface UserStats {
  totalPlants: number;
  totalCareEvents: number;
  currentStreak: number;
  longestStreak: number;
  consecutiveDays: number;
  totalPoints: number;
  level: number;
  badges: string[];
  lastCareDate: string | null;
}

export interface Achievement {
  badge: Badge;
  unlockedAt: string;
  isNew: boolean;
}

// All available badges
export const BADGES: Badge[] = [
  // Beginner badges
  {
    id: "first_plant",
    name: "First Sprout",
    description: "Added your first plant to GrowKeeper",
    icon: "🌱",
    category: "beginner",
    requirement: "Add 1 plant",
    points: 10,
  },
  {
    id: "first_water",
    name: "First Drops",
    description: "Logged your first watering",
    icon: "💧",
    category: "beginner",
    requirement: "Log 1 watering event",
    points: 10,
  },
  {
    id: "first_care_complete",
    name: "Green Thumb Initiate",
    description: "Completed your first care task",
    icon: "✅",
    category: "beginner",
    requirement: "Complete 1 task",
    points: 15,
  },

  // Collection badges
  {
    id: "plant_collector_5",
    name: "Plant Parent",
    description: "Growing a small collection",
    icon: "🪴",
    category: "collection",
    requirement: "Have 5 plants",
    points: 25,
  },
  {
    id: "plant_collector_10",
    name: "Indoor Jungle",
    description: "Your home is becoming a jungle!",
    icon: "🌿",
    category: "collection",
    requirement: "Have 10 plants",
    points: 50,
  },
  {
    id: "plant_collector_25",
    name: "Botanical Garden",
    description: "A true plant enthusiast",
    icon: "🏛️",
    category: "collection",
    requirement: "Have 25 plants",
    points: 100,
  },
  {
    id: "plant_collector_50",
    name: "Master Cultivator",
    description: "Legendary plant collector",
    icon: "👑",
    category: "collection",
    requirement: "Have 50 plants",
    points: 200,
  },

  // Consistency badges
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "7-day care streak",
    icon: "🔥",
    category: "consistency",
    requirement: "7-day streak",
    points: 30,
  },
  {
    id: "streak_30",
    name: "Monthly Master",
    description: "30-day care streak",
    icon: "🌟",
    category: "consistency",
    requirement: "30-day streak",
    points: 75,
  },
  {
    id: "streak_100",
    name: "Century Club",
    description: "100-day care streak - incredible dedication!",
    icon: "💯",
    category: "consistency",
    requirement: "100-day streak",
    points: 200,
  },
  {
    id: "streak_365",
    name: "Year-Round Gardener",
    description: "365-day care streak - legendary!",
    icon: "🏆",
    category: "consistency",
    requirement: "365-day streak",
    points: 500,
  },

  // Care badges
  {
    id: "care_events_50",
    name: "Dedicated Caretaker",
    description: "Logged 50 care events",
    icon: "📝",
    category: "care",
    requirement: "50 care events",
    points: 40,
  },
  {
    id: "care_events_100",
    name: "Plant Whisperer",
    description: "Logged 100 care events",
    icon: "🌸",
    category: "care",
    requirement: "100 care events",
    points: 75,
  },
  {
    id: "care_events_500",
    name: "Botanical Expert",
    description: "Logged 500 care events",
    icon: "🎓",
    category: "care",
    requirement: "500 care events",
    points: 150,
  },
  {
    id: "all_task_types",
    name: "Well-Rounded Care",
    description: "Used all care types: water, fertilize, prune, repot",
    icon: "🌈",
    category: "care",
    requirement: "Use all 4 care types",
    points: 35,
  },

  // Special badges
  {
    id: "early_adopter",
    name: "Early Adopter",
    description: "Joined GrowKeeper early",
    icon: "⭐",
    category: "special",
    requirement: "Join before 2027",
    points: 50,
  },
  {
    id: "perfect_week",
    name: "Perfect Week",
    description: "Completed all tasks for a full week",
    icon: "💎",
    category: "special",
    requirement: "No overdue tasks for 7 days",
    points: 60,
  },
];

/**
 * Calculate user level based on points
 */
export function calculateLevel(points: number): { level: number; currentXp: number; nextLevelXp: number } {
  // XP required per level increases
  // Level 1: 0-99, Level 2: 100-249, Level 3: 250-449, etc.
  let level = 1;
  let xpRequired = 100;
  let totalXpForLevel = 0;

  while (points >= totalXpForLevel + xpRequired) {
    totalXpForLevel += xpRequired;
    level++;
    xpRequired = Math.floor(xpRequired * 1.5);
  }

  return {
    level,
    currentXp: points - totalXpForLevel,
    nextLevelXp: xpRequired,
  };
}

/**
 * Check which badges a user has earned based on their stats
 */
export function checkEarnedBadges(stats: UserStats): string[] {
  const earned: string[] = [];

  // Beginner badges
  if (stats.totalPlants >= 1) earned.push("first_plant");
  if (stats.totalCareEvents >= 1) earned.push("first_water");

  // Collection badges
  if (stats.totalPlants >= 5) earned.push("plant_collector_5");
  if (stats.totalPlants >= 10) earned.push("plant_collector_10");
  if (stats.totalPlants >= 25) earned.push("plant_collector_25");
  if (stats.totalPlants >= 50) earned.push("plant_collector_50");

  // Streak badges
  if (stats.longestStreak >= 7) earned.push("streak_7");
  if (stats.longestStreak >= 30) earned.push("streak_30");
  if (stats.longestStreak >= 100) earned.push("streak_100");
  if (stats.longestStreak >= 365) earned.push("streak_365");

  // Care badges
  if (stats.totalCareEvents >= 50) earned.push("care_events_50");
  if (stats.totalCareEvents >= 100) earned.push("care_events_100");
  if (stats.totalCareEvents >= 500) earned.push("care_events_500");

  // Special: Early adopter (joined before 2027)
  earned.push("early_adopter");

  return earned;
}

/**
 * Get newly earned badges
 */
export function getNewBadges(currentBadges: string[], earnedBadges: string[]): Badge[] {
  const newBadgeIds = earnedBadges.filter((id) => !currentBadges.includes(id));
  return BADGES.filter((badge) => newBadgeIds.includes(badge.id));
}

/**
 * Calculate total points from badges
 */
export function calculateTotalPoints(badgeIds: string[]): number {
  return badgeIds.reduce((total, id) => {
    const badge = BADGES.find((b) => b.id === id);
    return total + (badge?.points || 0);
  }, 0);
}

/**
 * Get badge by ID
 */
export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find((badge) => badge.id === id);
}

/**
 * Get badges by category
 */
export function getBadgesByCategory(category: Badge["category"]): Badge[] {
  return BADGES.filter((badge) => badge.category === category);
}

/**
 * Calculate streak based on care dates
 */
export function calculateStreak(careDates: Date[]): { current: number; longest: number } {
  if (careDates.length === 0) return { current: 0, longest: 0 };

  // Sort dates descending
  const sorted = [...careDates].sort((a, b) => b.getTime() - a.getTime());
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  let lastDate = sorted[0];
  lastDate.setHours(0, 0, 0, 0);

  // Check if streak is still active (cared for today or yesterday)
  const daysSinceLastCare = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  const isActive = daysSinceLastCare <= 1;

  for (let i = 1; i < sorted.length; i++) {
    const currentDate = sorted[i];
    currentDate.setHours(0, 0, 0, 0);
    
    const dayDiff = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      tempStreak++;
    } else if (dayDiff > 1) {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
    // dayDiff === 0 means same day, continue without incrementing
    
    lastDate = currentDate;
  }

  longestStreak = Math.max(longestStreak, tempStreak);
  currentStreak = isActive ? tempStreak : 0;

  return { current: currentStreak, longest: longestStreak };
}
