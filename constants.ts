import { Difficulty, GoalTemplate } from "./types";

export const XP_PER_ACTION: { [key in Difficulty]: number } = {
  [Difficulty.Easy]: 10,
  [Difficulty.Normal]: 15,
  [Difficulty.Hard]: 20,
};

export const XP_STREAK_BONUS_PER_DAY = 2;
export const LEVEL_UP_BASE_XP = 100;

export const DIFFICULTY_Q_MAP: { [key in Difficulty]: number } = {
  [Difficulty.Easy]: 0.05,
  [Difficulty.Normal]: 0.01,
  [Difficulty.Hard]: 0.001,
};

export const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    id: 'daily-reading',
    category: '학습',
    title: '매일 10분 책 읽기',
    difficulty: Difficulty.Easy,
    description: '지식을 쌓고 마음의 양식을 채우는 시간',
  },
  {
    id: 'daily-meditation',
    category: '건강',
    title: '매일 5분 명상하기',
    difficulty: Difficulty.Easy,
    description: '마음의 평온을 찾고 스트레스를 관리',
  },
  {
    id: 'daily-workout',
    category: '건강',
    title: '매일 15분 운동하기',
    difficulty: Difficulty.Normal,
    description: '체력을 증진하고 건강한 신체를 유지',
  },
  {
    id: 'learn-new-word',
    category: '학습',
    title: '새로운 외국어 단어 5개 외우기',
    difficulty: Difficulty.Normal,
    description: '언어 능력을 꾸준히 향상',
  },
  {
    id: 'coding-challenge',
    category: '생산성',
    title: '코딩 문제 1개 풀기',
    difficulty: Difficulty.Hard,
    description: '문제 해결 능력과 코딩 스킬을 단련',
  },
  {
    id: 'write-journal',
    category: '창작',
    title: '하루 일과를 한 문단으로 기록하기',
    difficulty: Difficulty.Easy,
    description: '자신을 돌아보고 생각을 정리하는 습관',
  }
];