import React from 'react';
import { BrainIcon } from './Icons';

interface DoubtOvercomeHelperProps {
  doubtLevel: number;
  setDoubtLevel: (level: number) => void;
  currentStreak: number;
}

export const DoubtOvercomeHelper: React.FC<DoubtOvercomeHelperProps> = ({ doubtLevel, setDoubtLevel, currentStreak }) => {
  return (
    <div className="p-4 rounded-lg border border-orange-200 bg-orange-50">
      <h4 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
        <BrainIcon className="w-5 h-5"/>
        자기 의심 극복
      </h4>
      <div className="space-y-3">
        <div>
            <p className="text-xs text-slate-600 mb-1">오늘 의심 레벨: <span className="font-bold">{doubtLevel}/10</span></p>
            <input 
            type="range" 
            min="0" 
            max="10" 
            value={doubtLevel}
            onChange={(e) => setDoubtLevel(Number(e.target.value))}
            className="w-full h-2 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
        </div>
        
        {doubtLevel > 5 && (
          <div className="bg-white p-3 rounded-lg border border-orange-200 animate-fade-in">
            <p className="font-semibold text-orange-800 text-sm">의심 극복 처방전:</p>
            <ul className="text-sm text-orange-700 mt-2 space-y-1 list-disc list-inside">
              {currentStreak > 0 && <li>지금까지 <span className="font-bold">{currentStreak}일</span> 연속 달성한 당신을 신뢰하세요.</li>}
              <li>과정을 믿고, 결과는 시간에 맡기세요.</li>
              <li>오늘의 100% 확실한 행동에 집중하세요.</li>
            </ul>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
