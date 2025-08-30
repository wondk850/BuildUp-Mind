import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Card } from './ui/Card';
import { Goal } from '../types';

interface ProbabilitySimulatorProps {
  goal: Goal | null;
  completedDays: number;
}

const calculateProbability = (q: number, n: number, T: number): number => {
  if (T <= 0) return 0;
  return 1 - Math.pow((1 - q), n * T);
};

export const ProbabilitySimulator: React.FC<ProbabilitySimulatorProps> = ({ goal, completedDays }) => {
  const [futureDays, setFutureDays] = useState(365);

  const chartData = useMemo(() => {
    if (!goal) return [];
    const data = [];
    const totalDuration = completedDays + futureDays;
    
    for (let t = 0; t <= totalDuration; t += Math.max(1, Math.floor(totalDuration / 50))) {
        data.push({
            days: t,
            probability: calculateProbability(goal.q, 1, t) * 100,
        });
    }
    if(data[data.length -1].days < totalDuration){
         data.push({
            days: totalDuration,
            probability: calculateProbability(goal.q, 1, totalDuration) * 100,
        });
    }
    return data;
  }, [goal, completedDays, futureDays]);

  if (!goal) return null;

  const currentProbability = calculateProbability(goal.q, 1, completedDays) * 100;
  const future100DayProbability = calculateProbability(goal.q, 1, completedDays + 100) * 100;
  const future1000DayProbability = calculateProbability(goal.q, 1, completedDays + 1000) * 100;


  return (
    <Card>
      <h2 className="text-xl font-bold text-indigo-600 mb-4">성공 확률 시뮬레이터</h2>
      <p className="text-sm text-slate-500 mb-4">"매일의 작은 행동이 누적될 때, 불가능에 가까웠던 목표의 성공 확률이 어떻게 변하는지 확인해보세요."</p>
      <div className="h-64 w-full mb-6">
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
            <XAxis dataKey="days" stroke="#64748b" unit="일"/>
            <YAxis stroke="#64748b" unit="%" domain={[0, 100]}/>
            <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#475569' }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, '확률']}
            />
            <Legend wrapperStyle={{ color: '#475569' }}/>
            <Line type="monotone" dataKey="probability" name="성공 확률" stroke="#4f46e5" strokeWidth={2.5} dot={false} />
            <ReferenceLine x={completedDays} stroke="#fb923c" strokeDasharray="4 4" label={{ value: 'Today', position: 'insideTop', fill: '#fb923c' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-6">
        <div>
          <label htmlFor="futureDays" className="block text-sm font-medium text-slate-600 mb-2">
            미래 시뮬레이션 기간: <span className="font-bold text-slate-800">{futureDays}</span>일
          </label>
          <input
            id="futureDays"
            type="range"
            min="30"
            max="1825" // ~5 years
            step="5"
            value={futureDays}
            onChange={(e) => setFutureDays(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-slate-100 p-4 rounded-lg">
                <p className="text-sm text-slate-500">현재 ({completedDays}일)</p>
                <p className="text-2xl font-bold text-green-600">{currentProbability.toFixed(2)}%</p>
            </div>
            <div className="bg-slate-100 p-4 rounded-lg">
                <p className="text-sm text-slate-500">100일 후</p>
                <p className="text-2xl font-bold text-yellow-600">{future100DayProbability.toFixed(2)}%</p>
            </div>
            <div className="bg-slate-100 p-4 rounded-lg">
                <p className="text-sm text-slate-500">1000일 후</p>
                <p className="text-2xl font-bold text-orange-600">{future1000DayProbability.toFixed(2)}%</p>
            </div>
        </div>
      </div>
    </Card>
  );
};