import React, { useMemo } from 'react';
import { Card } from './ui/Card';
import { Goal, UserStats, ActionLog } from '../types';
import { ShieldCheckIcon } from './Icons';

interface FutureTrustBuilderProps {
  goal: Goal | null;
  stats: UserStats;
  logs: { [date: string]: ActionLog[] };
}

export const FutureTrustBuilder: React.FC<FutureTrustBuilderProps> = ({ goal, stats, logs }) => {
  const pastSuccesses = useMemo(() => {
    if (!goal) return 0;
    return Object.values(logs).flat().filter(log => log.goalId === goal.id).length;
  }, [logs, goal]);
  
  const trustScore = useMemo(() => {
    // A simple scoring model: 1 point per success, 5 per level, 2 per longest streak day. Capped at 100.
    const score = (pastSuccesses * 1) + (stats.level * 5) + (stats.longestStreak * 2);
    return Math.min((score / 200) * 100, 100); // Normalize to 100 (e.g., 200 points = 100%)
  }, [pastSuccesses, stats]);

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
      <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
        <ShieldCheckIcon className="w-6 h-6"/>
        미래에 대한 신뢰
      </h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-600">신뢰도 점수</p>
          <div className="w-full bg-slate-200 rounded-full h-3 mt-1">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${trustScore}%` }}
            />
          </div>
          <p className="text-right text-sm font-bold text-blue-600 mt-1">{trustScore.toFixed(1)}%</p>
        </div>
        
        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <p className="text-sm font-semibold text-blue-800">신뢰의 근거 (Data):</p>
          <ul className="text-sm text-blue-700 mt-1 space-y-1">
            <li>• <span className="font-bold">{pastSuccesses}번</span>의 성공적인 실행</li>
            <li>• <span className="font-bold">{stats.longestStreak}일</span>의 최장 연속 기록</li>
            <li>• 현재 <span className="font-bold">{stats.level}레벨</span> 달성</li>
          </ul>
        </div>
        
        {trustScore < 50 && (
          <div className="bg-yellow-100 p-3 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              💡 신뢰를 쌓으려면: 더 작고 확실한 목표부터 시작해보세요. 
              성공 경험이 쌓일수록 미래에 대한 확신이 생깁니다.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
