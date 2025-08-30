import React from 'react';
import { Card } from './ui/Card';
import { Goal } from '../types';
import { SparklesIcon } from './Icons';

interface ProbabilityMagicExplainerProps {
  goal: Goal | null;
  completedDays: number;
}

export const ProbabilityMagicExplainer: React.FC<ProbabilityMagicExplainerProps> = ({ goal, completedDays }) => {
  if (!goal) return null;

  const todayProbability = goal.q * 100;
  const cumulativeProbability = (1 - Math.pow(1 - goal.q, completedDays)) * 100;
  const impossibleBecomingPossible = cumulativeProbability > 50;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
      <h3 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
        <SparklesIcon className="w-6 h-6"/>
        확률의 마법
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
            <p className="text-2xl font-bold text-purple-600">{todayProbability.toFixed(3)}%</p>
            <p className="text-xs text-slate-500">하루 성공 확률</p>
            <p className="text-xs text-purple-600">거의 불가능해 보임</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
            <p className="text-2xl font-bold text-pink-600">{cumulativeProbability.toFixed(1)}%</p>
            <p className="text-xs text-slate-500">{completedDays}일 누적 확률</p>
            <p className={`text-xs font-bold ${impossibleBecomingPossible ? 'text-green-600' : 'text-orange-600'}`}>
              {impossibleBecomingPossible ? '가능해졌음!' : '가능해지는 중...'}
            </p>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <p className="text-sm font-semibold text-slate-800">빌드업의 힘:</p>
          <p className="text-sm text-slate-600">
            매일 {todayProbability.toFixed(3)}%의 작은 가능성이 
            {completedDays > 0 ? ` ${completedDays}번 쌓여서 ${cumulativeProbability.toFixed(1)}%가 되었습니다.` : ' 쌓이면 기적을 만듭니다.'}
          </p>
          {impossibleBecomingPossible && (
            <p className="text-sm text-green-700 font-semibold mt-2">
              🎉 불가능이 가능이 되는 임계점을 넘었습니다!
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
