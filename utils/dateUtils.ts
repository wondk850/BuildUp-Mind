import { ActionLog } from "../types";

export const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getWeekNumber = (d: Date): [number, number] => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return [date.getFullYear(), Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7) + 1];
}

export const getPastWeekDates = (): string[] => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(getLocalDateString(d));
    }
    return dates;
}

export const generateYearHeatmapData = (logs: { [date: string]: ActionLog[] }): { date: string; count: number }[] => {
    const data = [];
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setDate(today.getDate() - 364);

    // Add empty cells to align the first day to the correct day of the week
    const firstDayOfWeek = oneYearAgo.getDay(); // 0 = Sunday
    for (let i = 0; i < firstDayOfWeek; i++) {
        data.push({ date: `placeholder-${i}`, count: -1 });
    }

    for (let i = 0; i < 365; i++) {
        const currentDate = new Date(oneYearAgo);
        currentDate.setDate(oneYearAgo.getDate() + i);
        if (currentDate > today) break;

        const dateString = getLocalDateString(currentDate);
        const logCount = logs[dateString]?.length || 0;
        data.push({ date: dateString, count: logCount });
    }

    return data;
};