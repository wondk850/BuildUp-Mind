import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Goal, Difficulty, Project, GoalTemplate } from '../types';
import { TrashIcon } from './Icons';
import { GOAL_TEMPLATES } from '../constants';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: Omit<Goal, 'id' | 'projectId' | 'q'>, projectId: string, id?: string) => void;
  onDelete: (id: string) => void;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  existingGoal: Goal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  projects,
  setProjects,
  existingGoal,
}) => {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Normal);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);

  useEffect(() => {
    if (isOpen) {
        if (existingGoal) {
            setTitle(existingGoal.title);
            setDifficulty(existingGoal.difficulty);
            setSelectedProjectId(existingGoal.projectId);
            setIsCreatingNewProject(false);
            setNewProjectName('');
        } else {
            // Reset form for new goal
            setTitle('');
            setDifficulty(Difficulty.Normal);
            if (projects.length > 0) {
                setSelectedProjectId(projects[0].id);
                setIsCreatingNewProject(false);
            } else {
                setIsCreatingNewProject(true);
                setSelectedProjectId('');
            }
        }
    }
  }, [existingGoal, isOpen, projects]);
  
  const handleSelectTemplate = (template: GoalTemplate) => {
    setTitle(template.title);
    setDifficulty(template.difficulty);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalProjectId = selectedProjectId;

    if (isCreatingNewProject) {
        if (!newProjectName.trim()) {
            alert("새 프로젝트 이름을 입력해주세요.");
            return;
        }
        const newProject: Project = { id: Date.now().toString(), name: newProjectName.trim() };
        setProjects(prev => [...prev, newProject]);
        finalProjectId = newProject.id;
    }

    if (!finalProjectId) {
        alert("프로젝트를 선택하거나 새로 만들어주세요.");
        return;
    }
    
    onSave({ title, difficulty }, finalProjectId, existingGoal?.id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingGoal ? '목표 수정' : '새 목표 설정'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {!existingGoal && (
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">템플릿으로 시작하기</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                {GOAL_TEMPLATES.map(template => (
                    <button
                    type="button"
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="text-left p-3 border border-slate-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                    <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold py-0.5 px-2 rounded-full">{template.category}</span>
                    <p className="font-semibold text-slate-800 mt-1">{template.title}</p>
                    <p className="text-sm text-slate-500">{template.description}</p>
                    </button>
                ))}
                </div>
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-slate-300" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-2 text-sm text-slate-500">또는 직접 만들기</span>
                    </div>
                </div>
            </div>
        )}
        
        <div>
          <label htmlFor="project" className="block text-sm font-medium text-slate-700">
            프로젝트
          </label>
          <div className="flex items-center gap-2 mt-1">
            <select
              id="project"
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setIsCreatingNewProject(false);
              }}
              className="w-full bg-white border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50"
              disabled={isCreatingNewProject || projects.length === 0}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
              {projects.length === 0 && <option>새 프로젝트를 추가하세요</option>}
            </select>
            <button type="button" onClick={() => setIsCreatingNewProject(prev => !prev)} className="p-2 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors text-sm font-semibold text-slate-600 flex-shrink-0">
                {isCreatingNewProject ? '취소' : '새로 만들기'}
            </button>
          </div>
          {isCreatingNewProject && (
             <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="새 프로젝트 이름"
              className="mt-2 w-full bg-white border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
            />
          )}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">
            목표 제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full bg-white border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
            placeholder="예: 매일 10분씩 책 읽기"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">난이도</label>
          <div className="mt-2 flex justify-around rounded-md shadow-sm border border-slate-300 p-1">
            {Object.values(Difficulty).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`capitalize w-full py-1.5 text-sm font-medium rounded-md transition-all ${
                  difficulty === d
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <div>
            {existingGoal && (
                <button
                    type="button"
                    onClick={() => onDelete(existingGoal.id)}
                    className="flex items-center gap-2 text-red-600 font-semibold hover:text-red-800 transition-colors p-2 rounded-md hover:bg-red-50"
                >
                    <TrashIcon className="w-5 h-5" />
                    삭제
                </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              저장
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};