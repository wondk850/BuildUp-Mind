import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ActionLog, Badge, BadgeId, Goal, UserStats, Difficulty, Project, ChatMessage } from './types';
import { XP_PER_ACTION, XP_STREAK_BONUS_PER_DAY, LEVEL_UP_BASE_XP } from './constants';
import { generateInsightfulQuote, recommendProbability, getAICoachResponse } from './services/geminiService';
import { BadgeIcon, ChartBarIcon, CheckCircleIcon, FireIcon, LevelUpIcon, StarIcon, PencilIcon, PlusIcon, ChevronDownIcon, TrashIcon, ChatBubbleLeftRightIcon } from './components/Icons';
import { Modal } from './components/ui/Modal';
import { Card } from './components/ui/Card';
import { ProbabilitySimulator } from './components/ProbabilitySimulator';
import { HistoryCalendar } from './components/HistoryCalendar';
import { getPastWeekDates, getWeekNumber } from './utils/dateUtils';
import { StatsDashboard } from './components/StatsDashboard';
import { AICoach } from './components/AICoach';


// Helper to get today's date string
const getTodayDateString = () => new Date().toISOString().split('T')[0];

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
}
const Header: React.FC<HeaderProps> = ({ level, xp, xpForNextLevel, streak, projects, goals, activeGoalId, onSelectGoal, onAddNewGoal, onOpenStats, onOpenAICoach }) => {
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
  const [weeklySummaryData, setWeeklySummaryData] = useState({ completions: 0 });

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
      const pastWeekDates = getPastWeekDates();
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
    { id: BadgeId.LEVEL_10, name: "레벨 10 달성", description: "레벨 10에 도달했습니다.", icon: <LevelUpIcon className="w-5 h-5"/>, earned: false }
  ].map(b => ({ ...b, earned: badges.includes(b.id) })), [badges]);

  const checkStreak = useCallback(() => {
    let streak = 0;
    let d = new Date();
    // Check if today has a log. If not, the streak is 0, start check from yesterday.
    const todayLogs = logs[d.toISOString().split('T')[0]] || [];
    if (todayLogs.length === 0) {
        d.setDate(d.getDate() - 1);
    }
    
    const checkedDays = new Set<string>();

    // Count consecutive days with logs backwards from today/yesterday.
    while (true) {
        const dateStr = d.toISOString().split('T')[0];
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


  const handleCompleteAction = async () => {
    if (isCompletedToday || !activeGoal) return;

    const { difficulty, projectId } = activeGoal;
    const newLog: ActionLog = { date: todayStr, reflection: '', goalId: activeGoal.id, projectId, difficulty };
    
    setLogs(prev => ({ ...prev, [todayStr]: [...(prev[todayStr] || []), newLog] }));

    // Recalculate streak immediately after logging
    const currentStreak = checkStreak();
    // A completion today means streak is at least 1, or currentStreak + 1 if yesterday was completed.
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

    setBadges(prevBadges => {
      const newBadges = new Set(prevBadges);
      const xpGained = XP_PER_ACTION[difficulty];
      const xpForNextLevel = LEVEL_UP_BASE_XP * stats.level;
      const newLevel = stats.level + (stats.xp + xpGained >= xpForNextLevel ? 1 : 0);

      newBadges.add(BadgeId.FIRST_ACTION);
      if(newStreak >= 7) newBadges.add(BadgeId.STREAK_7);
      if(newStreak >= 30) newBadges.add(BadgeId.STREAK_30);
      if(newLevel >= 10) newBadges.add(BadgeId.LEVEL_10);
      
      return Array.from(newBadges);
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
      if (todayLogs.length === 0) return prev; // Should not happen
      const lastLog = todayLogs[todayLogs.length - 1];
      const updatedLog = { ...lastLog, reflection };
      const updatedTodayLogs = [...todayLogs.slice(0, -1), updatedLog];
      return { ...prev, [todayStr]: updatedTodayLogs };
    });
    setReflectionModalOpen(false);
  };
  
  const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'projectId'>, projectId: string, id?: string) => {
    if (id) {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...goalData, projectId } : g));
    } else {
      const newGoal = { ...goalData, id: Date.now().toString(), projectId };
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

  const xpForNextLevel = LEVEL_UP_BASE_XP * stats.level;
  const completedDaysCount = activeGoal ? Object.values(logs).flat().filter(l => l.goalId === activeGoal.id).length : 0;
  
  return (
    <div className="min-h-screen text-slate-800 font-sans p-4">
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
      
      <ReflectionViewModal 
        log={viewedLog}
        goalTitle={goals.find(g => g.id === viewedLog?.goalId)?.title}
        onClose={() => setViewedLog(null)}
      />

      <GoalSetupModal 
        isOpen={isGoalModalOpen}
        onClose={() => { setGoalModalOpen(false); setEditingGoal(null); }}
        onSave={(goalData, projectId) => {
            const id = editingGoal?.id
            if (projectId === 'new_project') return; // Should be handled inside modal
            handleSaveGoal(goalData, projectId, id)
        }}
        onDelete={handleDeleteGoal}
        currentGoal={editingGoal}
        projects={projects}
        setProjects={setProjects}
      />

      <ReflectionModal
        isOpen={isReflectionModalOpen}
        onClose={() => setReflectionModalOpen(false)}
        onSave={handleSaveReflection}
        quote={insightfulQuote}
        isLoading={isLoadingQuote}
      />
    
      <WeeklySummaryModal
        isOpen={isWeeklySummaryModalOpen}
        onClose={() => {
          const [year, week] = getWeekNumber(new Date());
          setLastWeeklySummary(`${year}-${week}`);
          setIsWeeklySummaryModalOpen(false);
        }}
        completions={weeklySummaryData.completions}
        streak={stats.streak}
      />
    </div>
  );
}

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number | null;
}
const LevelUpModal: React.FC<LevelUpModalProps> = ({ isOpen, onClose, level }) => {
    if (!isOpen || !level) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="레벨 업!">
            <div className="text-center p-6">
                <LevelUpIcon className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-bounce" />
                <h3 className="text-3xl font-bold text-slate-800 mb-2">축하합니다!</h3>
                <p className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mb-4">
                    레벨 {level}
                </p>
                <p className="text-slate-500">당신의 꾸준함이 빛을 발하는 순간입니다. 계속 나아가세요!</p>
                <button onClick={onClose} className="mt-8 w-full bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    계속하기
                </button>
            </div>
        </Modal>
    );
}

interface GoalSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goalData: Omit<Goal, 'id' | 'projectId'>, projectId: string, id?: string) => void;
    onDelete: (id: string) => void;
    currentGoal: Goal | null;
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}
const GoalSetupModal: React.FC<GoalSetupModalProps> = ({ isOpen, onClose, onSave, onDelete, currentGoal, projects, setProjects }) => {
    const [title, setTitle] = useState('');
    const [q, setQ] = useState(0.001);
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Normal);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [newProjectName, setNewProjectName] = useState('');
    const [isRecommending, setIsRecommending] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (currentGoal) {
                setTitle(currentGoal.title);
                setQ(currentGoal.q);
                setDifficulty(currentGoal.difficulty);
                setSelectedProjectId(currentGoal.projectId);
            } else {
                setTitle('');
                setQ(0.001);
                setDifficulty(Difficulty.Normal);
                setSelectedProjectId(projects.length > 0 ? projects[0].id : 'new_project');
            }
            setNewProjectName('');
        }
    }, [currentGoal, isOpen, projects]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let finalProjectId = selectedProjectId;
        if (selectedProjectId === 'new_project') {
            if (!newProjectName.trim()) {
                alert('새 프로젝트 이름을 입력해주세요.');
                return;
            }
            const newProject = { id: Date.now().toString(), name: newProjectName.trim() };
            setProjects(prev => [...prev, newProject]);
            finalProjectId = newProject.id;
        }
        onSave({ title, q, difficulty }, finalProjectId, currentGoal?.id);
    };

    const handleRecommendation = async () => {
        if (!title) {
            alert("AI가 분석할 수 있도록 먼저 오늘의 행동(목표)을 입력해주세요.");
            return;
        }
        setIsRecommending(true);
        try {
            const recommendedQ = await recommendProbability(title);
            setQ(recommendedQ / 100);
        } catch (error) {
            console.error("Failed to get recommendation", error);
            alert("추천 값을 가져오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsRecommending(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={currentGoal ? "목표 수정하기" : "새 목표 설정하기"}>
            <p className="text-slate-500 mb-6">"오늘, 확실한 한 가지를 정해볼래요?"</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="project-select" className="block text-sm font-medium text-slate-700 mb-1">프로젝트</label>
                    <select
                        id="project-select"
                        value={selectedProjectId}
                        onChange={e => setSelectedProjectId(e.target.value)}
                        className="block w-full bg-white border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        <option value="new_project">새 프로젝트 만들기</option>
                    </select>
                </div>

                {selectedProjectId === 'new_project' && (
                    <div>
                        <label htmlFor="new-project-name" className="block text-sm font-medium text-slate-700 mb-1">새 프로젝트 이름</label>
                        <input
                            type="text"
                            id="new-project-name"
                            value={newProjectName}
                            onChange={e => setNewProjectName(e.target.value)}
                            placeholder="예: 건강한 삶 만들기"
                            className="block w-full bg-white border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                )}
                
                <div>
                    <label htmlFor="goal-title" className="block text-sm font-medium text-slate-700 mb-1">빌드업 행동 (Sub-task)</label>
                    <input 
                        type="text" 
                        id="goal-title" 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="예: 30분 운동하기"
                        className="block w-full bg-white border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">난이도</label>
                  <div className="grid grid-cols-3 gap-2">
                      {(Object.values(Difficulty) as Difficulty[]).map(d => (
                          <button
                              type="button"
                              key={d}
                              onClick={() => setDifficulty(d)}
                              className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-colors ${difficulty === d ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                          >
                            {d === Difficulty.Easy ? '쉬움' : d === Difficulty.Normal ? '보통' : '어려움'}
                          </button>
                      ))}
                  </div>
                </div>
                 <div>
                    <label htmlFor="goal-q" className="block text-sm font-medium text-slate-700 mb-1">초기 성공 확률 (%)</label>
                    <div className="flex items-center gap-2">
                      <input 
                          type="number" 
                          id="goal-q" 
                          value={q * 100}
                          onChange={e => setQ(Number(e.target.value) / 100)}
                          step="0.01"
                          min="0.01"
                          max="10"
                          className="block w-full bg-white border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                          required
                          disabled={isRecommending}
                      />
                      <button 
                          type="button" 
                          onClick={handleRecommendation}
                          disabled={isRecommending || !title}
                          className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex-shrink-0 disabled:bg-slate-400 disabled:cursor-not-allowed"
                      >
                          {isRecommending ? '분석 중...' : 'AI 추천'}
                      </button>
                    </div>
                     <p className="text-xs text-slate-500 mt-2">이 행동이 최종 목표에 기여하는 정도입니다. AI 추천을 받아보세요.</p>
                </div>
                <div className="flex gap-2 pt-2">
                    {currentGoal && (
                        <button 
                            type="button" 
                            onClick={() => onDelete(currentGoal.id)}
                            className="w-auto bg-red-600 text-white p-2.5 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                        저장하기
                    </button>
                </div>
            </form>
        </Modal>
    );
};

interface ReflectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (reflection: string) => void;
    quote: { korean: string; english: string };
    isLoading: boolean;
}
const ReflectionModal: React.FC<ReflectionModalProps> = ({ isOpen, onClose, onSave, quote, isLoading }) => {
    const [reflection, setReflection] = useState('');

    const handleSave = () => {
        onSave(reflection);
        setReflection('');
    };

    useEffect(() => {
      if (!isOpen) {
        setReflection('');
      }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="오늘의 마무리">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">오늘의 성찰</h3>
                    <textarea 
                        value={reflection}
                        onChange={e => setReflection(e.target.value)}
                        placeholder="오늘 행동을 통해 무엇을 느끼고 배웠나요? (1~3문장)"
                        rows={3}
                        className="w-full bg-white border border-slate-300 rounded-lg shadow-sm p-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-slate-700 text-center">
                  <h3 className="text-lg font-semibold text-indigo-600 mb-3">오늘의 영감</h3>
                  <div className="min-h-[80px] flex flex-col items-center justify-center mb-4 px-2">
                      {isLoading ? <p>AI가 당신을 위한 메시지를 만들고 있어요...</p> : 
                      (
                        <>
                            <p className="italic text-lg">"{quote.korean}"</p>
                            <p className="italic text-sm text-slate-500 mt-2">"{quote.english}"</p>
                        </>
                      )}
                  </div>
                </div>
                <button onClick={handleSave} className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    기록 완료
                </button>
            </div>
        </Modal>
    )
}

interface ReflectionViewModalProps {
    log: ActionLog | null;
    goalTitle?: string;
    onClose: () => void;
}
const ReflectionViewModal: React.FC<ReflectionViewModalProps> = ({ log, goalTitle, onClose }) => {
    if (!log) return null;
    
    return (
        <Modal isOpen={!!log} onClose={onClose} title={`${log.date}의 기록`}>
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-slate-500">완료한 행동</p>
                    <p className="text-lg font-semibold">{goalTitle || '삭제된 목표'}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500">나의 성찰</p>
                    {log.reflection ? (
                        <p className="text-slate-700 bg-slate-100 p-3 rounded-md whitespace-pre-wrap">{log.reflection}</p>
                    ) : (
                        <p className="text-slate-400 italic">이날은 성찰을 기록하지 않았습니다.</p>
                    )}
                </div>
                <button onClick={onClose} className="mt-4 w-full bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors">
                    닫기
                </button>
            </div>
        </Modal>
    )
}

interface WeeklySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  completions: number;
  streak: number;
}
const WeeklySummaryModal: React.FC<WeeklySummaryModalProps> = ({ isOpen, onClose, completions, streak }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="주간 리포트">
      <div className="text-center p-4">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">한 주 동안 수고하셨어요!</h3>
        <p className="text-slate-500 mb-6">지난 7일간의 노력을 확인해보세요.</p>
        <div className="flex justify-around items-center bg-slate-100 rounded-lg p-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-indigo-600">{completions}</p>
            <p className="text-sm text-slate-500">완료한 행동</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-orange-500">{streak}</p>
            <p className="text-sm text-slate-500">현재 연속 기록</p>
          </div>
        </div>
        <p className="text-slate-500 mt-6">당신의 꾸준함이 미래를 만듭니다. 다음 주도 화이팅!</p>
        <button onClick={onClose} className="mt-8 w-full bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
          확인
        </button>
      </div>
    </Modal>
  );
};


export default App;