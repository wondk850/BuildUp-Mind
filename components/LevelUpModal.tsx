
import React from 'react';
import { Modal } from './ui/Modal';
import { LevelUpIcon } from './Icons';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number | null;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ isOpen, onClose, level }) => {
  if (!level) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="레벨 업!">
      <div className="text-center">
        <LevelUpIcon className="w-24 h-24 text-yellow-400 mx-auto animate-bounce" />
        <p className="text-xl text-slate-600 mt-4">축하합니다!</p>
        <p className="text-4xl font-bold text-indigo-600 my-2">레벨 {level}</p>
        <p className="text-slate-500">에 도달하셨습니다!</p>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          계속하기
        </button>
      </div>
    </Modal>
  );
};
