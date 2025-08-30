import React from 'react';
import { Card } from './ui/Card';
import { ActionLog, Goal } from '../types';
import { RoadIcon } from './Icons';
import { calculateAchievementDate } from '../utils/dateUtils';

interface BuildupStoryVisualizationProps {
  logs: { [date: string]: ActionLog[] };
  goal: Goal | null;
  completedDays: number;
}

const Milestones = [
  { days: 1, message: "첫 걸음을 내디뎠습니다." },
  { days: 7, message: "첫 주 완주! 시작이 반입니다." },
  { days: 30, message: "한 달 달성, 습관의 기초 형성!" },
  { days: 100, message: "100일의 기적, 이제 당신의 것입니다." },
  { days: 365, message: "1년의 여정, 불가능을 가능으로!" },
];

export const BuildupStoryVisualization: React.FC<BuildupStoryVisualizationProps> = ({ logs, goal, completedDays }) => {
  if (!goal) return null;

  return (
    <Card>
      <h3 className="text-xl font-bold text-indigo-600 mb-4 flex items-center gap-2">
        <RoadIcon className="w-6 h-6"/>
        나의 빌드업 스토리
      </h3>
      <div className="space-y-4">
        {Milestones.map((milestone, i) => {
          const isAchieved = completedDays >= milestone.days;
          const achievementDate = isAchieved ? calculateAchievementDate(logs, goal.id, milestone.days) : null;

          return (
            <div key={i} className={`flex items-start gap-4 transition-all ${isAchieved ? 'opacity-100' : 'opacity-50'}`}>
              <div className="flex flex-col items-center">
                <div className={`w-5 h-5 rounded-full flex-shrink-0 ${isAchieved ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                {i < Milestones.length - 1 && <div className={`w-0.5 h-12 ${isAchieved ? 'bg-indigo-300' : 'bg-slate-300'}`} />}
              </div>
              <div className="-mt-1">
                <p className={`font-semibold ${isAchieved ? 'text-indigo-700' : 'text-slate-600'}`}>
                  {milestone.days}일: {milestone.message}
                </p>
                {isAchieved && achievementDate && (
                  <p className="text-sm text-slate-500">
                    달성일: {achievementDate}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};