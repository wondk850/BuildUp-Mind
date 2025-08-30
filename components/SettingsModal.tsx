
import React, { useRef } from 'react';
import { Modal } from './ui/Modal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onExport, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="설정">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">데이터 관리</h3>
          <p className="text-sm text-slate-500 mb-4">
            모든 진행 상황을 파일로 내보내거나, 백업 파일에서 데이터를 복원할 수 있습니다.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={onExport}
              className="w-full bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              데이터 내보내기
            </button>
            <button
              onClick={handleImportClick}
              className="w-full bg-white border border-slate-300 text-slate-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-slate-50 transition-colors"
            >
              데이터 가져오기
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".json"
            />
          </div>
        </div>
        <div className="pt-4 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">주의사항</h3>
            <ul className="list-disc list-inside text-sm text-slate-500 space-y-1">
                <li>데이터를 가져오면 현재 앱의 모든 데이터가 백업 파일의 내용으로 덮어쓰여집니다.</li>
                <li>데이터 내보내기는 현재 기기의 브라우저에 저장된 정보만을 포함합니다.</li>
                <li>백업 파일은 안전한 곳에 보관해주세요.</li>
            </ul>
        </div>
      </div>
    </Modal>
  );
};
