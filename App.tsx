
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ActionLog, Badge, BadgeId, Goal, UserStats, Difficulty, Project, ChatMessage, BackupData } from './types';
import { XP_PER_ACTION, XP_STREAK_BONUS_PER_DAY, LEVEL_UP_BASE_XP, DIFFICULTY_Q_MAP } from './constants';
// FIX: Import 'getAICoachResponse' to make it available in the component.
import { generateInsightfulQuote, getAICoachResponse } from './services/geminiService';
import { BadgeIcon, ChartBarIcon, CheckCircleIcon, FireIcon, LevelUpIcon, StarIcon, PencilIcon, PlusIcon, ChevronDownIcon, TrashIcon, ChatBubbleLeftRightIcon, CalendarDaysIcon, CogIcon } from './components/Icons';
import { Modal } from './components/ui/Modal';
import { Card } from './components/ui/Card';
import { ProbabilitySimulator } from './components/ProbabilitySimulator';
import { HistoryCalendar } from './components/HistoryCalendar';
import { getLocalDateString, getPastWeekDates, getWeekNumber } from './utils/dateUtils';
import { StatsDashboard } from './components/StatsDashboard';
import { AICoach } from './components/AICoach';
import { GoalModal } from './components/GoalModal';
import { ReflectionModal } from './components/ReflectionModal';
import { ActionLogDetailModal } from './components/ActionLogDetailModal';
import { LevelUpModal } from './components/LevelUpModal';
import { ParticleEffect } from './components/ParticleEffect';
import { SettingsModal } from './components/SettingsModal';


// Helper to get today's date string
const getTodayDateString = () => getLocalDateString(new Date());

// Custom hook for localStorage
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};


// --- UI Components ---

interface HeaderProps {
  level: number;
  xp: number;
  xpForNextLevel: number;
  streak: number;
  projects: Project[];
  goals: Goal[];
  activeGoalId: string | null;
  onSelectGoal: (id: string) => void;
  onAddNewGoal: () => void;
  onOpenStats: () => void;
  onOpenAICoach: () => void;
  onOpenSettings: () => void;
}
const Header: React.FC<HeaderProps> = ({ level, xp, xpForNextLevel, streak, projects, goals, activeGoalId, onSelectGoal, onAddNewGoal, onOpenStats, onOpenAICoach, onOpenSettings }) => {
  const xpPercentage = (xp / xpForNextLevel) * 100;

  const groupedGoals = useMemo(() => {
    return projects.map(p => ({
      ...p,
      goals: goals.filter(g => g.projectId === p.id)
    })).filter(p => p.goals.length > 0);
  }, [projects, goals]);

  return (
    <header className="p-4 mb-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-indigo-600 mb-2 tracking-tight">
          BuildUp Mind
        </h1>
        <p className="text-center text-slate-500">"가능한 걸 매일하면, 불가능한 걸 할 수 있다."</p>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="relative md:col-span-2">
                <label className="text-xs text-slate-500 absolute -top-2 left-3 bg-slate-50 px-1 z-10">오늘의 집중 목표</label>
                <select 
                    value={activeGoalId || ''}
                    onChange={(e) => onSelectGoal(e.target.value)}
                    disabled={goals.length === 0}
                    className="w-full bg-white border border-slate-300 rounded-lg py-2.5 pl-4 pr-10 text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    {goals.length > 0 ? groupedGoals.map(p => (
                        <optgroup key={p.id} label={p.name}>
                            {p.goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                        </optgroup>
                    )) : <option>프로젝트와 목표를 추가해주세요</option>}
                </select>
                 <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"/>
            </div>
            <div className="flex gap-2 justify-self-end w-full md:w-auto">
                <button onClick={onAddNewGoal} className="w-full flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                    <PlusIcon className="w-5 h-5"/>
                    <span className="hidden sm:inline">새 목표</span>
                </button>
                 <div className="relative group">
                    <button onClick={onOpenAICoach} className="w-auto flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 font-semibold p-2.5 rounded-lg hover:bg-slate-100 transition-colors shadow-sm" aria-label="AI Coach">
                        <ChatBubbleLeftRightIcon className="w-5 h-5"/>
                    </button>
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-slate-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        AI 코치
                    </div>
                </div>
                <div className="relative group">
                    <button onClick={onOpenStats} className="w-auto flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 font-semibold p-2.5 rounded-lg hover:bg-slate-100 transition-colors shadow-sm" aria-label="Statistics">
                        <ChartBarIcon className="w-5 h-5"/>
                    </button>
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-slate-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        통계
                    </div>
                </div>
                 <div className="relative group">
                    <button onClick={onOpenSettings} className="w-auto flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 font-semibold p-2.5 rounded-lg hover:bg-slate-100 transition-colors shadow-sm" aria-label="Settings">
                        <CogIcon className="w-5 h-5"/>
                    </button>
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-slate-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        설정
                    </div>
                </div>
            </div>
        </div>

        <Card className="mt-4 !p-4">
          <div className="flex justify-around items-center">
            <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-indigo-500">
                    <StarIcon className="w-6 h-6" />
                    <span className="font-bold text-lg">{level}</span>
                </div>
                <span className="text-xs text-slate-500">LEVEL</span>
            </div>
             <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-orange-500">
                    <FireIcon className="w-6 h-6" />
                    <span className="font-bold text-lg">{streak}</span>
                </div>
                <span className="text-xs text-slate-500">STREAK</span>
            </div>
             <div className="w-1/2">
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${xpPercentage}%` }}></div>
                </div>
                <p className="text-xs text-right text-slate-500 mt-1">{xp} / {xpForNextLevel} XP</p>
            </div>
          </div>
        </Card>
      </div>
    </header>
  );
};

interface ActionCardProps {
  goal: Goal;
  isCompletedToday: boolean;
  onComplete: () => void;
  onEdit: () => void;
}
const ActionCard: React.FC<ActionCardProps> = ({ goal, isCompletedToday, onComplete, onEdit }) => (
  <Card className="text-center">
    <div className="flex justify-between items-start mb-2">
      <h2 className="text-lg text-slate-600 text-left">오늘의 행동</h2>
      <button 
        onClick={onEdit} 
        className="p-1 -mr-1 -mt-1 text-slate-400 hover:text-indigo-600 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Edit Goal"
      >
        <PencilIcon className="w-5 h-5" />
      </button>
    </div>
    <p className="text-2xl font-bold mb-6 text-slate-900 text-left">{goal.title}</p>
    {isCompletedToday ? (
      <div className="flex items-center justify-center gap-2 text-green-700 py-3 rounded-lg bg-green-100 border border-green-200">
        <CheckCircleIcon className="w-8 h-8"/>
        <span className="text-xl font-bold">완료!</span>
      </div>
    ) : (
      <button
        onClick={onComplete}
        className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-500/30"
      >
        오늘의 빌드업 완료하기
      </button>
    )}
  </Card>
);

// --- Main App Component ---

const APP_DATA_KEYS: Array<keyof BackupData> = [
    'buildup-projects',
    'buildup-goals',
    'buildup-activeGoalId',
    'buildup-stats',
    'buildup-logs',
    'buildup-badges',
    'buildup-lastWeeklySummary',
    'buildup-chatHistory',
];

function App() {
  const [projects, setProjects] = useLocalStorage<Project[]>('buildup-projects', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('buildup-goals', []);
  const [activeGoalId, setActiveGoalId] = useLocalStorage<string | null>('buildup-activeGoalId', null);
  const [stats, setStats] = useLocalStorage<UserStats>('buildup-stats', { xp: 0, level: 1, streak: 0, longestStreak: 0 });
  const [logs, setLogs] = useLocalStorage<{ [date: string]: ActionLog[] }>('buildup-logs', {});
  const [badges, setBadges] = useLocalStorage<BadgeId[]>('buildup-badges', []);
  const [lastWeeklySummary, setLastWeeklySummary] = useLocalStorage<string>('buildup-lastWeeklySummary', '');
  const [chatHistory, setChatHistory] = useLocalStorage<ChatMessage[]>('buildup-chatHistory', []);

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isReflectionModalOpen, setReflectionModalOpen] = useState(false);
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'dashboard' | 'coach'>('main');
  const [isWeeklySummaryModalOpen, setIsWeeklySummaryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [weeklySummaryData, setWeeklySummaryData] = useState({ completions: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  const [viewedLog, setViewedLog] = useState<ActionLog | null>(null);
  
  const [achievedLevel, setAchievedLevel] = useState<number | null>(null);
  const [insightfulQuote, setInsightfulQuote] = useState({ korean: '', english: '' });
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isCoachLoading, setIsCoachLoading] = useState(false);

  const todayStr = getTodayDateString();
  const activeGoal = useMemo(() => goals.find(g => g.id === activeGoalId), [goals, activeGoalId]);
  const isCompletedToday = useMemo(() => {
    if (!activeGoalId) return false;
    return logs[todayStr]?.some(log => log.goalId === activeGoalId) ?? false;
  }, [logs, todayStr, activeGoalId]);

  useEffect(() => {
    if (goals.length > 0 && !activeGoalId) {
      setActiveGoalId(goals[0].id);
    } else if (goals.length === 0) {
      setActiveGoalId(null);
    }
  }, [goals, activeGoalId, setActiveGoalId]);

  useEffect(() => {
    if (projects.length === 0 && goals.length === 0) {
        setGoalModalOpen(true);
    }
  }, [projects.length, goals.length]);

  useEffect(() => {
    const today = new Date();
    const [year, week] = getWeekNumber(today);
    const currentWeekId = `${year}-${week}`;
    if (lastWeeklySummary !== currentWeekId) {
      const pastWeekDates = getPastWeekDates(7);
      const completions = pastWeekDates.reduce((acc, date) => acc + (logs[date]?.length || 0), 0);
      if (completions > 0) {
        setWeeklySummaryData({ completions });
        setIsWeeklySummaryModalOpen(true);
      }
    }
  }, []); // Run only once on app load
  
  const allBadges: Badge[] = useMemo(() => [
    { id: BadgeId.FIRST_ACTION, name: "첫 걸음", description: "첫 행동을 완료했습니다.", icon: <StarIcon className="w-5 h-5"/>, earned: false },
    { id: BadgeId.STREAK_7, name: "7일 연속", description: "7일 연속으로 행동을 완료했습니다.", icon: <FireIcon className="w-5 h-5"/>, earned: false },
    { id: BadgeId.STREAK_30, name: "30일 연속", description: "30일 연속으로 행동을 완료했습니다.", icon: <FireIcon className="w-5 h-5 text-orange-400"/>, earned: false },
    { id: BadgeId.LEVEL_10, name: "레벨 10 달성", description: "레벨 10에 도달했습니다.", icon: <LevelUpIcon className="w-5 h-5"/>, earned: false },
    { id: BadgeId.PERFECT_WEEK, name: "완벽한 한 주", description: "한 주(7일) 동안 매일 행동을 완료했습니다.", icon: <CalendarDaysIcon className="w-5 h-5"/>, earned: false },
    { id: BadgeId.REFLECTION_KING, name: "성찰의 왕", description: "성찰 기록을 50회 이상 작성했습니다.", icon: <PencilIcon className="w-5 h-5"/>, earned: false }
  ].map(b => ({ ...b, earned: badges.includes(b.id) })), [badges]);

  const checkStreak = useCallback(() => {
    let streak = 0;
    let d = new Date();
    const todayLogs = logs[getLocalDateString(d)] || [];
    if (todayLogs.length === 0) {
        d.setDate(d.getDate() - 1);
    }
    
    const checkedDays = new Set<string>();

    while (true) {
        const dateStr = getLocalDateString(d);
        if (logs[dateStr] && logs[dateStr].length > 0 && !checkedDays.has(dateStr)) {
            streak++;
            checkedDays.add(dateStr);
            d.setDate(d.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
  }, [logs]);

  useEffect(() => {
    const currentStreak = checkStreak();
    if(currentStreak !== stats.streak) {
      setStats(prev => ({...prev, streak: currentStreak, longestStreak: Math.max(prev.longestStreak, currentStreak)}));
    }
  }, [logs, checkStreak, stats.streak, setStats]);

  useEffect(() => {
    const allLogsFlat = Object.values(logs).flat();
    const newBadges = new Set(badges);
    let updated = false;

    const checkAndAdd = (id: BadgeId, condition: boolean) => {
        if (condition && !badges.includes(id)) {
            newBadges.add(id);
            updated = true;
        }
    };

    checkAndAdd(BadgeId.FIRST_ACTION, allLogsFlat.length > 0);
    checkAndAdd(BadgeId.STREAK_7, stats.streak >= 7);
    checkAndAdd(BadgeId.STREAK_30, stats.streak >= 30);
    checkAndAdd(BadgeId.LEVEL_10, stats.level >= 10);
    
    const last7Days = getPastWeekDates(7);
    const uniqueLogDaysInLast7 = new Set(Object.keys(logs).filter(dateStr => last7Days.includes(dateStr)));
    checkAndAdd(BadgeId.PERFECT_WEEK, uniqueLogDaysInLast7.size >= 7);

    const reflectionCount = allLogsFlat.filter(log => log.reflection && log.reflection.trim() !== '').length;
    checkAndAdd(BadgeId.REFLECTION_KING, reflectionCount >= 50);

    if (updated) {
        setBadges(Array.from(newBadges));
    }
  }, [stats, logs, badges, setBadges]);


  const handleCompleteAction = async () => {
    if (isCompletedToday || !activeGoal) return;

    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);

    const { difficulty, projectId } = activeGoal;
    const newLog: ActionLog = { date: todayStr, reflection: '', goalId: activeGoal.id, projectId, difficulty, timestamp: Date.now() };
    
    setLogs(prev => ({ ...prev, [todayStr]: [...(prev[todayStr] || []), newLog] }));
    
    const currentStreak = checkStreak();
    const newStreak = currentStreak + 1;
    
    setStats(prev => {
        const xpGained = XP_PER_ACTION[difficulty] + (newStreak * XP_STREAK_BONUS_PER_DAY);
        const xpForNextLevel = LEVEL_UP_BASE_XP * prev.level;
        let newXp = prev.xp + xpGained;
        
        let newLevel = prev.level;
        if (newXp >= xpForNextLevel) {
          newLevel += 1;
          newXp -= xpForNextLevel;
          setAchievedLevel(newLevel);
          setIsLevelUpModalOpen(true);
        }

        return {
            xp: newXp,
            level: newLevel,
            streak: newStreak,
            longestStreak: Math.max(prev.longestStreak, newStreak),
        };
    });

    setReflectionModalOpen(true);
    setIsLoadingQuote(true);
    const quote = await generateInsightfulQuote(activeGoal.title);
    setInsightfulQuote(quote);
    setIsLoadingQuote(false);
  };

  const handleSaveReflection = (reflection: string) => {
    setLogs(prev => {
      const todayLogs = prev[todayStr] || [];
      if (todayLogs.length === 0) return prev;
      const lastLog = todayLogs[todayLogs.length - 1];
      const updatedLog = { ...lastLog, reflection };
      const updatedTodayLogs = [...todayLogs.slice(0, -1), updatedLog];
      return { ...prev, [todayStr]: updatedTodayLogs };
    });
    setReflectionModalOpen(false);
  };
  
  const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'projectId' | 'q'>, projectId: string, id?: string) => {
    const q = DIFFICULTY_Q_MAP[goalData.difficulty];
    if (id) {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...goalData, projectId, q } : g));
    } else {
      const newGoal = { ...goalData, id: Date.now().toString(), projectId, q };
      setGoals(prev => [...prev, newGoal]);
      setActiveGoalId(newGoal.id);
    }
    setEditingGoal(null);
    setGoalModalOpen(false);
  };

  const handleDeleteGoal = (id: string) => {
    if (window.confirm("정말로 이 목표를 삭제하시겠습니까? 관련된 모든 기록은 유지됩니다.")) {
        const newGoals = goals.filter(g => g.id !== id);
        setGoals(newGoals);
        if (activeGoalId === id) {
            setActiveGoalId(newGoals.length > 0 ? newGoals[0].id : null);
        }
        setEditingGoal(null);
        setGoalModalOpen(false);
    }
  };
  
  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalModalOpen(true);
  };
  
  const handleAddNewGoal = () => {
    setEditingGoal(null);
    setGoalModalOpen(true);
  }
  
  const handleDayClick = (log: ActionLog) => {
    setViewedLog(log);
  };

  const handleSendMessageToCoach = async (message: string) => {
      const newUserMessage: ChatMessage = { role: 'user', content: message };
      const updatedHistory = [...chatHistory, newUserMessage];
      setChatHistory(updatedHistory);
      setIsCoachLoading(true);

      const context = `
      - User Level: ${stats.level}
      - Current Streak: ${stats.streak} days
      - Longest Streak: ${stats.longestStreak} days
      - Projects: ${projects.map(p => p.name).join(', ') || 'None'}
      - Active Daily Goals: ${goals.map(g => g.title).join(', ') || 'None'}
      `;

      try {
          const response = await getAICoachResponse(message, context, updatedHistory);
          const newModelMessage: ChatMessage = { role: 'model', content: response };
          setChatHistory(prev => [...prev, newModelMessage]);
      } catch (error) {
          console.error("AI Coach Error:", error);
          const errorMessage: ChatMessage = { role: 'model', content: "죄송합니다. 오류가 발생했습니다." };
          setChatHistory(prev => [...prev, errorMessage]);
      } finally {
          setIsCoachLoading(false);
      }
  };
  
  const handleExportData = () => {
    try {
      const dataToExport: Partial<BackupData> = {};
      APP_DATA_KEYS.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          dataToExport[key] = JSON.parse(item);
        }
      });
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
      const link = document.createElement('a');
      link.href = jsonString;
      link.download = `buildup-mind-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (error) {
      console.error("Failed to export data:", error);
      alert("데이터 내보내기에 실패했습니다.");
    }
  };
  
  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string) as Partial<BackupData>;
        
        const requiredKeys = ['buildup-projects', 'buildup-goals', 'buildup-stats'];
        const hasRequiredKeys = requiredKeys.every(key => key in importedData);

        if (!hasRequiredKeys) {
          alert("유효하지 않은 백업 파일입니다. 필수 데이터가 누락되었습니다.");
          return;
        }

        if (window.confirm("데이터를 가져오면 현재 모든 데이터가 덮어쓰여집니다. 계속하시겠습니까?")) {
          APP_DATA_KEYS.forEach(key => {
            if (importedData[key]) {
              localStorage.setItem(key, JSON.stringify(importedData[key]));
            } else {
              localStorage.removeItem(key);
            }
          });
          alert("데이터를 성공적으로 가져왔습니다. 앱을 새로고침합니다.");
          window.location.reload();
        }
      } catch (error) {
        console.error("Failed to import data:", error);
        alert("데이터 가져오기에 실패했습니다. 파일 형식을 확인해주세요.");
      }
    };
    reader.readAsText(file);
  };

  const xpForNextLevel = LEVEL_UP_BASE_XP * stats.level;
  const completedDaysCount = activeGoal ? Object.values(logs).flat().filter(l => l.goalId === activeGoal.id).length : 0;
  
  return (
    <div className="min-h-screen text-slate-800 font-sans p-4">
      {showConfetti && <ParticleEffect />}
      {currentView === 'main' ? (
        <>
            <Header 
                level={stats.level} 
                xp={stats.xp} 
                xpForNextLevel={xpForNextLevel} 
                streak={stats.streak} 
                projects={projects}
                goals={goals}
                activeGoalId={activeGoalId}
                onSelectGoal={setActiveGoalId}
                onAddNewGoal={handleAddNewGoal}
                onOpenStats={() => setCurrentView('dashboard')}
                onOpenAICoach={() => setCurrentView('coach')}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
            />
            
            <main className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                {activeGoal ? (
                    <ActionCard 
                    goal={activeGoal} 
                    isCompletedToday={isCompletedToday} 
                    onComplete={handleCompleteAction} 
                    onEdit={() => handleEditGoal(activeGoal)} 
                    />
                ) : (
                    <Card className="text-center py-10">
                        <p className="text-slate-500 mb-4">"오늘의 1%가 내일의 가능성을 만듭니다."</p>
                        <button onClick={handleAddNewGoal} className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all">
                            첫 목표 설정하기
                        </button>
                    </Card>
                )}
                <ProbabilitySimulator goal={activeGoal} completedDays={completedDaysCount} />
                </div>
                
                <div className="space-y-8">
                <Card>
                    <h2 className="text-xl font-bold text-indigo-600 mb-4 flex items-center gap-2"><BadgeIcon className="w-6 h-6"/>획득한 배지</h2>
                    <div className="space-y-3">
                    {allBadges.map(badge => (
                        <div key={badge.id} className={`flex items-center gap-3 p-2 rounded-md transition-all ${badge.earned ? 'bg-slate-100' : 'bg-slate-50 opacity-60'}`}>
                            <div className={`flex-shrink-0 ${badge.earned ? 'text-yellow-400' : 'text-slate-400'}`}>{badge.icon}</div>
                            <div>
                                <p className={`font-semibold ${badge.earned ? 'text-slate-800' : 'text-slate-500'}`}>{badge.name}</p>
                                <p className="text-xs text-slate-500">{badge.description}</p>
                            </div>
                        </div>
                    ))}
                    </div>
                </Card>
                <HistoryCalendar logs={logs} onDayClick={handleDayClick}/>
                </div>
            </main>
        </>
      ) : currentView === 'dashboard' ? (
        <StatsDashboard 
            projects={projects} 
            logs={logs} 
            stats={stats} 
            onBack={() => setCurrentView('main')}
        />
      ) : (
        <AICoach
            chatHistory={chatHistory}
            onSendMessage={handleSendMessageToCoach}
            isLoading={isCoachLoading}
            onBack={() => setCurrentView('main')}
        />
      )}

      <LevelUpModal
        isOpen={isLevelUpModalOpen}
        onClose={() => setIsLevelUpModalOpen(false)}
        level={achievedLevel}
      />
      
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onExport={handleExportData}
        onImport={handleImportData}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setEditingGoal(null);
          setGoalModalOpen(false);
        }}
        onSave={handleSaveGoal}
        onDelete={handleDeleteGoal}
        projects={projects}
        setProjects={setProjects}
        existingGoal={editingGoal}
      />

      <ReflectionModal
        isOpen={isReflectionModalOpen}
        onClose={() => setReflectionModalOpen(false)}
        onSave={handleSaveReflection}
        quote={insightfulQuote}
        isLoadingQuote={isLoadingQuote}
      />

      <ActionLogDetailModal
        log={viewedLog}
        goal={viewedLog ? goals.find(g => g.id === viewedLog.goalId) : null}
        onClose={() => setViewedLog(null)}
      />
      
       <Modal 
          isOpen={isWeeklySummaryModalOpen} 
          onClose={() => {
            const today = new Date();
            const [year, week] = getWeekNumber(today);
            const currentWeekId = `${year}-${week}`;
            setLastWeeklySummary(currentWeekId);
            setIsWeeklySummaryModalOpen(false);
          }}
          title="주간 요약"
        >
           <div>
            <p className="text-lg text-slate-700">지난 주에 <span className="font-bold text-indigo-600">{weeklySummaryData.completions}번</span>의 행동을 완료하셨습니다!</p>
            <p className="text-slate-500 mt-2">꾸준함이 성장의 열쇠입니다. 이번 주도 화이팅!</p>
          </div>
        </Modal>

    </div>
  );
}

// FIX: Add default export for App component to resolve module import error in index.tsx.
export default App;