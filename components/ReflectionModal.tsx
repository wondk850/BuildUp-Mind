
import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { PassionTracker } from './PassionTracker';
import { DoubtOvercomeHelper } from './DoubtOvercomeHelper';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reflection: string, passionLevel: number, doubtLevel: number) => void;
  quote: { korean: string; english: string };
  isLoadingQuote: boolean;
  currentStreak: number;
}

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  quote,
  isLoadingQuote,
  currentStreak,
}) => {
  const [reflection, setReflection] = useState('');
  const [passionLevel, setPassionLevel] = useState(5);
  const [doubtLevel, setDoubtLevel] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setReflection('');
      setPassionLevel(5);
      setDoubtLevel(0);
    }
  }, [isOpen]);

  const handleSave = () => {
    onSave(reflection, passionLevel, doubtLevel);
    onClose();
  };
  
  const handleCloseAndSkip = () => {
    onSave('', passionLevel, doubtLevel); // Save levels even if reflection is empty
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseAndSkip} title="오늘의 성찰">
      <div className="space-y-6">
        <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg">
          {isLoadingQuote ? (
            <div className="h-16 flex items-center justify-center">
              <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
              </div>
            </div>
          ) : (
            <>
              <p className="text-lg font-semibold text-slate-800 text-center">"{quote.korean}"</p>
              <p className="text-sm text-slate-500 text-center mt-1">"{quote.english}"</p>
            </>
          )}
        </div>

        <div>
          <label htmlFor="reflection" className="block text-sm font-medium text-slate-700 mb-1">
            오늘 행동을 통해 무엇을 배우고 느끼셨나요?
          </label>
          <textarea
            id="reflection"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={4}
            className="mt-1 block w-full bg-white border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
            placeholder="자유롭게 기록해보세요..."
          />
        </div>

        <PassionTracker passionLevel={passionLevel} setPassionLevel={setPassionLevel} />
        <DoubtOvercomeHelper doubtLevel={doubtLevel} setDoubtLevel={setDoubtLevel} currentStreak={currentStreak} />

        <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleCloseAndSkip}
              className="bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors"
            >
              나중에
            </button>
            <button
                type="button"
                onClick={handleSave}
                className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
                기록하기
            </button>
        </div>
      </div>
    </Modal>
  );
};