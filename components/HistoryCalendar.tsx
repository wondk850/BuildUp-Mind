import React from 'react';
import { Card } from './ui/Card';
import { ActionLog } from '../types';

interface HistoryCalendarProps {
  logs: { [date: string]: ActionLog[] };
  onDayClick: (log: ActionLog) => void;
}

export const HistoryCalendar: React.FC<HistoryCalendarProps> = ({ logs, onDayClick }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

  const calendarDays = [];
  // Add empty cells for days before the start of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="w-full aspect-square"></div>);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split('T')[0];
    const isToday = dateString === today.toISOString().split('T')[0];
    const isCompleted = logs[dateString] && logs[dateString].length > 0;

    calendarDays.push(
      <div 
        key={day}
        onClick={isCompleted ? () => onDayClick(logs[dateString][0]) : undefined}
        className={`w-full aspect-square flex items-center justify-center rounded-full transition-all duration-200
          ${isCompleted ? 'bg-indigo-500 text-white font-bold cursor-pointer hover:bg-indigo-600' : 'bg-slate-100 text-slate-700'}
          ${isToday ? 'ring-2 ring-indigo-500' : ''}
        `}
      >
        {day}
      </div>
    );
  }

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <Card>
      <h2 className="text-xl font-bold text-indigo-600 mb-4">
        나의 빌드업 여정 ({month + 1}월)
      </h2>
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-500 mb-2">
        {weekdays.map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2 text-sm">
        {calendarDays}
      </div>
    </Card>
  );
};