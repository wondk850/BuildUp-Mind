
import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Goal, Difficulty, Project } from '../types';
import { recommendProbability } from '../services/geminiService';
import { TrashIcon } from './Icons';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: Omit<Goal, 'id' | 'projectId'>, projectId: string, id?: string) => void;
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
  const [q, setQ] = useState(0.05);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Normal);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);

  useEffect(() => {
    if (isOpen) {
        if (existingGoal) {
            setTitle(existingGoal.title);
            setQ(existingGoal.q);
            setDifficulty(existingGoal.difficulty);
            setSelectedProjectId(existingGoal.projectId);
            setIsCreatingNewProject(false);
            setNewProjectName('');
        } else {
            // Reset form for new goal
            setTitle('');
            setQ(0.05);
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
  
  const handleRecommendation = async () => {
    if (!title) {
        alert("목표 제목을 먼저 입력해주세요.");
        return;
    }
    setIsRecommending(true);
    try {
        const recommendedQ = await recommendProbability(title);
        setQ(recommendedQ);
    } catch (error) {
        console.error("Failed to get recommendation:", error);
        alert("AI 추천을 받아오는 데 실패했습니다.");
    } finally {
        setIsRecommending(false);
    }
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
    
    onSave({ title, q, difficulty }, finalProjectId, existingGoal?.id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingGoal ? '목표 수정' : '새 목표 설정'}>
      <form onSubmit={handleSubmit} className="space-y-6">
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
            <label className="block text-sm font-medium text-slate-700">
                일일 성공 확률 (q)
            </label>
            <div className="flex items-center gap-2 mt-1">
                <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    max="1"
                    value={q}
                    onChange={(e) => setQ(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                />
                <button 
                    type="button" 
                    onClick={handleRecommendation}
                    disabled={isRecommending || !title}
                    className="p-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                    {isRecommending ? '분석 중...' : 'AI 추천'}
                </button>
            </div>
             <p className="text-xs text-slate-500 mt-1">이 행동을 하루 실천했을 때, 최종 목표에 아주 미세하게 가까워질 확률입니다. (예: 0.001 = 0.1%)</p>
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
