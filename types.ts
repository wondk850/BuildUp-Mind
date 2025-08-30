export enum Difficulty {
  Easy = 'easy',
  Normal = 'normal',
  Hard = 'hard',
}

export interface Project {
  id: string;
  name: string;
}

export interface Goal {
  id: string;
  projectId: string;
  title: string;
  q: number; // Base probability of success for a single attempt (e.g., 0.001 for 0.1%)
  difficulty: Difficulty;
}

export interface ActionLog {
  date: string; // YYYY-MM-DD format
  reflection: string;
  goalId: string;
  projectId: string;
  difficulty: Difficulty;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
}

export enum BadgeId {
  STREAK_7 = 'STREAK_7',
  STREAK_30 = 'STREAK_30',
  LEVEL_10 = 'LEVEL_10',
  FIRST_ACTION = 'FIRST_ACTION',
  PERFECT_WEEK = 'PERFECT_WEEK',
  REFLECTION_KING = 'REFLECTION_KING',
}

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface GoalTemplate {
  id: string;
  category: string;
  title: string;
  difficulty: Difficulty;
  description: string;
}