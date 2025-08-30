
import React from 'react';
import { Modal } from './ui/Modal';
import { ActionLog, Goal } from '../types';

interface ActionLogDetailModalProps {
  log: ActionLog | null;
  goal: Goal | null;
  onClose: () => void;
}

export const ActionLogDetailModal: React.FC<ActionLogDetailModalProps> = ({ log, goal, onClose }) => {
  if (!log) return null;

  return (
    <Modal isOpen={!!log} onClose={onClose} title={`기록: ${log.date}`}>
      <div className="space-y-4">
        {goal && (
            <div>
            <h3 className="text-sm font-medium text-slate-500">완료한 목표</h3>
            <p className="text-lg font-semibold text-indigo-700 bg-indigo-50 p-2 rounded-md">{goal.title}</p>
            </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-slate-500">나의 성찰</h3>
           <div className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-md min-h-[6rem]">
             <p className="text-slate-700 whitespace-pre-wrap">
                {log.reflection ? log.reflection : <span className="text-slate-400 italic">기록된 성찰이 없습니다.</span>}
             </p>
           </div>
        </div>
        <div className="flex justify-end">
            <button
              onClick={onClose}
              className="mt-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              닫기
            </button>
        </div>
      </div>
    </Modal>
  );
};
