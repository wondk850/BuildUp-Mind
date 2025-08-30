import React from 'react';
import { HeartIcon } from './Icons';

interface PassionTrackerProps {
  passionLevel: number;
  setPassionLevel: (level: number) => void;
}

export const PassionTracker: React.FC<PassionTrackerProps> = ({ passionLevel, setPassionLevel }) => {
  return (
    <div className="p-4 rounded-lg border border-red-200 bg-red-50">
      <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
        <HeartIcon className="w-5 h-5"/>
        오늘의 열정 레벨
      </h4>
      <div className="space-y-3">
        <div>
            <input 
                type="range" 
                min="1" 
                max="10" 
                value={passionLevel}
                onChange={(e) => setPassionLevel(Number(e.target.value))}
                className="w-full h-2 bg-red-100 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>의무감</span>
                <span className="font-bold text-red-600">미쳐있음</span>
            </div>
        </div>
        
        {passionLevel <= 3 && (
          <div className="bg-yellow-100 p-2 rounded text-xs text-yellow-800">
            ⚠️ 열정이 부족한 날도 괜찮아요. 목표를 재검토하거나 휴식이 필요할 수 있습니다.
          </div>
        )}
        
        {passionLevel >= 8 && (
          <div className="bg-red-100 p-2 rounded text-xs text-red-800">
            🔥 훌륭한 열정입니다! 이 에너지를 유지하면서 지속가능성도 고려하세요.
          </div>
        )}
      </div>
    </div>
  );
};
