import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Card } from './ui/Card';
import { Project, ActionLog, UserStats, Difficulty } from '../types';
import { generateYearHeatmapData } from '../utils/dateUtils';
import { StarIcon, FireIcon, TargetIcon, BoltIcon, CalendarDaysIcon, LevelUpIcon } from './Icons';

interface StatsDashboardProps {
  projects: Project[];
  logs: { [date: string]: ActionLog[] };
  stats: UserStats;
  onBack: () => void;
}

// FIX: Changed icon prop type to React.ReactElement to fix typing error with cloneElement.
const StatCard = ({ icon, title, value, unit, colorClass }: { icon: React.ReactElement, title: string, value: string | number, unit?: string, colorClass: string }) => (
    <Card className="flex items-center p-4">
        <div className={`p-3 rounded-full mr-4 ${colorClass.replace('text-', 'bg-').replace('600', '100')}`}>
            {React.cloneElement(icon, { className: `w-6 h-6 ${colorClass}` })}
        </div>
        <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">
                {value} <span className="text-lg font-medium text-slate-500">{unit}</span>
            </p>
        </div>
    </Card>
);

const HeatmapCell = ({ count }: { count: number }) => {
    let colorClass = 'bg-slate-200';
    if (count > 0 && count <= 2) colorClass = 'bg-indigo-200';
    else if (count > 2 && count <= 5) colorClass = 'bg-indigo-400';
    else if (count > 5) colorClass = 'bg-indigo-600';
    return <div className={`w-full aspect-square rounded-sm ${colorClass}`} />;
};

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ projects, logs, stats, onBack }) => {
  const allLogs = useMemo(() => Object.values(logs).flat(), [logs]);
  const totalCompletions = allLogs.length;

  const consistencyScore = useMemo(() => {
    const last30Days = new Set();
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        if (logs[dateStr] && logs[dateStr].length > 0) {
            last30Days.add(dateStr);
        }
    }
    return last30Days.size > 0 ? ((last30Days.size / 30) * 100).toFixed(0) : 0;
  }, [logs]);

  const difficultyBreakdown = useMemo(() => {
      const breakdown = { [Difficulty.Easy]: 0, [Difficulty.Normal]: 0, [Difficulty.Hard]: 0 };
      allLogs.forEach(log => {
          breakdown[log.difficulty] = (breakdown[log.difficulty] || 0) + 1;
      });
      return [
          { name: '쉬움', value: breakdown.easy, color: '#a5b4fc' },
          { name: '보통', value: breakdown.normal, color: '#6366f1' },
          { name: '어려움', value: breakdown.hard, color: '#4338ca' },
      ].filter(d => d.value > 0);
  }, [allLogs]);

  const heatmapData = useMemo(() => generateYearHeatmapData(logs), [logs]);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-600">성장 대시보드</h1>
            <button
                onClick={onBack}
                className="bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
            >
                메인으로
            </button>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<StarIcon />} title="총 완료 횟수" value={totalCompletions} unit="회" colorClass="text-indigo-600" />
            <StatCard icon={<TargetIcon />} title="최근 30일 일관성" value={`${consistencyScore}`} unit="%" colorClass="text-green-600" />
            <StatCard icon={<FireIcon />} title="최장 연속 기록" value={stats.longestStreak} unit="일" colorClass="text-orange-600" />
            <StatCard icon={<LevelUpIcon />} title="현재 레벨" value={stats.level} colorClass="text-yellow-600" />

            <Card className="md:col-span-2 lg:col-span-2">
                <h3 className="text-lg font-bold text-indigo-600 mb-2 flex items-center gap-2">
                    <BoltIcon className="w-5 h-5"/>
                    난이도별 활동 분석
                </h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={difficultyBreakdown}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                innerRadius={50}
                                fill="#8884d8"
                                dataKey="value"
                                stroke="none"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {difficultyBreakdown.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip formatter={(value, name) => [`${value}회`, name]} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="md:col-span-2 lg:col-span-4">
                 <h3 className="text-lg font-bold text-indigo-600 mb-4 flex items-center gap-2">
                    <CalendarDaysIcon className="w-5 h-5"/>
                    활동 히트맵 (지난 1년)
                </h3>
                 <div className="flex text-xs text-slate-500 mb-2 gap-2 pl-6">
                    <span>월</span><span className="ml-10">수</span><span className="ml-10">금</span>
                 </div>
                <div className="grid grid-rows-7 grid-flow-col gap-1">
                    {heatmapData.map((day, index) => (
                        <div key={index} title={day.date !== `placeholder-${index}` ? `${day.date}: ${day.count}회 완료` : ''}>
                             {day.count >= 0 && <HeatmapCell count={day.count} />}
                        </div>
                    ))}
                </div>
                <div className="flex justify-end items-center gap-2 text-xs text-slate-500 mt-2">
                    Less
                    <div className="w-3 h-3 rounded-sm bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-sm bg-indigo-200"></div>
                    <div className="w-3 h-3 rounded-sm bg-indigo-400"></div>
                    <div className="w-3 h-3 rounded-sm bg-indigo-600"></div>
                    More
                </div>
            </Card>
        </div>
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fade-in 0.3s ease-out forwards;
            }
        `}</style>
    </div>
  );
};