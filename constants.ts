import { Difficulty } from "./types";

export const XP_PER_ACTION: { [key in Difficulty]: number } = {
  [Difficulty.Easy]: 10,
  [Difficulty.Normal]: 15,
  [Difficulty.Hard]: 20,
};

export const XP_STREAK_BONUS_PER_DAY = 2;
export const LEVEL_UP_BASE_XP = 100;