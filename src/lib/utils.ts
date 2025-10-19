import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateLevelProgress(points: number): { level: number; currentLevelPoints: number; nextLevelPoints: number; percentage: number } {
  const pointsPerLevel = 100;
  const level = Math.floor(points / pointsPerLevel) + 1;
  const currentLevelPoints = points % pointsPerLevel;
  const nextLevelPoints = pointsPerLevel;
  const percentage = (currentLevelPoints / nextLevelPoints) * 100;
  
  return { level, currentLevelPoints, nextLevelPoints, percentage };
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'beginner':
      return '#10b981'; // green
    case 'intermediate':
      return '#f59e0b'; // orange
    case 'advanced':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common':
      return '#9ca3af';
    case 'rare':
      return '#3b82f6';
    case 'epic':
      return '#a855f7';
    case 'legendary':
      return '#f59e0b';
    default:
      return '#6b7280';
  }
}
