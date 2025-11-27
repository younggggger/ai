
import React, { useState, useEffect } from 'react';
import { GameStats, GameStatus, TurnData, Ending, Language, FounderProfile, FounderStats } from './types';
import { getAllFounders, getRandomBuff, getRandomDebuff, getRandomIdea } from './data';
import * as AI from './utils/ai';
import StatCard from './components/StatCard';
import GameUI from './components/GameUI';
import { Wallet, Users, Rocket, TrendingUp, Activity, RotateCcw, Play, Globe, User, Plus, Minus, Dice5, AlertTriangle, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

const INITIAL_STATS: GameStats = {
  cash: 100, // $100k
  team: 10,
  product: 10,
  traction: 0,
  stress: 0
};

const App: React.FC = () => {
  // Hardcoded to Chinese based on user request
  const [language] = useState<Language>('zh');
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [turnData, setTurnData] = useState<TurnData | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Character Creation State
  const [foundersList] = useState(getAllFounders());
  const [selectedFounderId, setSelectedFounderId] = useState<string | null>(null);
  const [allocatedStats, setAllocatedStats] = useState<FounderStats>({ tech: 0, vision: 0, charisma: 0 });
  const [pointsLeft, setPointsLeft] = useState(10);
  const [randomTraits, setRandomTraits] = useState<{buff: any, debuff: any} | null>(null);
  
  // Idea State
  const [userIdea, setUserIdea] = useState('');

  const currentFounder = foundersList.find(f => f.id === selectedFounderId) || null;

  // -- HANDLERS --

  const startNewGame = () => {
    setStatus(GameStatus.CHARACTER_CREATE);
    setStats(INITIAL_STATS);
    setHistory([]);
    setTurnData(null);
    setUserIdea('');
    setSelectedFounderId(null);
    setAllocatedStats({ tech: 0, vision: 0, charisma: 0 });
    setPointsLeft(10);
    setRandomTraits(null);
  };

  const handleStatChange = (stat: keyof FounderStats, delta: number) => {
    if (delta > 0 && pointsLeft > 0 && allocatedStats[stat] < 10) {
      setAllocatedStats(prev => ({...prev, [stat]: prev[stat] + 1}));
      setPointsLeft(prev => prev - 1);
    } else if (delta < 0 && allocatedStats[stat] > 0) {
      setAllocatedStats(prev => ({...prev, [stat]: prev[stat] - 1}));
      setPointsLeft(prev => prev + 1);
    }
  };

  const confirmCharacter = () => {
    if (!currentFounder) return;
    // Assign random traits now
    const buff = getRandomBuff();
    const debuff = getRandomDebuff();
    setRandomTraits({ buff, debuff });
    setStatus(GameStatus.IDEA_PHASE);
  };

  const handleIdeaSubmit = async () => {
    if (!currentFounder || !randomTraits) return;
    setIsLoading(true);
    setStatus(GameStatus.PLAYING);

    const fullFounder: FounderProfile = {
      ...currentFounder,
      stats: allocatedStats,
      assignedBuff: randomTraits.buff,
      assignedDebuff: randomTraits.debuff
    };

    // Apply initial Buff/Debuff effects to base stats if any
    let newStats = { ...INITIAL_STATS };
    if (randomTraits.buff.effect) {
        Object.entries(randomTraits.buff.effect).forEach(([k, v]) => {
            // @ts-ignore
            newStats[k] = (newStats[k] || 0) + v;
        });
    }
    if (randomTraits.debuff.effect) {
        Object.entries(randomTraits.debuff.effect).forEach(([k, v]) => {
            // @ts-ignore
            newStats[k] = (newStats[k] || 0) + v;
        });
    }
    setStats(newStats);

    const firstTurn = await AI.startGame(fullFounder, userIdea, language);
    setTurnData(firstTurn);
    setHistory(prev => [`第1个月: ${firstTurn.description}`]);
    setIsLoading(false);
  };

  const handleGameChoice = async (actionText: string) => {
    if (!currentFounder || !randomTraits || !turnData) return;
    setIsLoading(true);

    const fullFounder: FounderProfile = {
      ...currentFounder,
      stats: allocatedStats,
      assignedBuff: randomTraits.buff,
      assignedDebuff: randomTraits.debuff
    };

    // 1. Call AI for result
    const nextTurn = await AI.nextTurn(
      fullFounder, 
      userIdea, 
      stats, 
      history.join('\n'), 
      actionText, 
      turnData.month,
      language
    );

    // 2. Update Stats
    if (nextTurn.statsChange) {
      const s = { ...stats };
      Object.entries(nextTurn.statsChange).forEach(([k, v]) => {
         // @ts-ignore
         s[k] = Math.max(0, (s[k] || 0) + v); 
      });
      // Hard cap logic
      s.cash = Math.floor(s.cash); // Cash can be negative (debt)
      s.team = Math.min(100, Math.max(0, s.team));
      s.product = Math.min(100, Math.max(0, s.product));
      s.traction = Math.min(100, Math.max(0, s.traction));
      s.stress = Math.min(100, Math.max(0, s.stress));
      setStats(s);
    }

    setHistory(prev => [...prev, `第 ${turnData.month} 月操作: ${actionText}`, `结果: ${nextTurn.outcomeText}`]);
    setTurnData(nextTurn);
    setIsLoading(false);

    if (nextTurn.isGameOver || nextTurn.month > 12) {
      setStatus(GameStatus.GAME_OVER);
    }
  };

  // Helper to color code MBTI groups
  const getMbtiColor = (index: number) => {
    if (index < 4) return "text-purple-400"; // NT Analysts
    if (index < 8) return "text-emerald-400"; // NF Diplomats
    if (index < 12) return "text-sky-400"; // SJ Sentinels
    return "text-amber-400"; // SP Explorers
  };

  // --- RENDERERS ---

  if (status === GameStatus.START) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-slate-950">
        
        <div className="max-w-3xl w-full space-y-12 animate-in fade-in zoom-in duration-1000">
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-primary blur-3xl opacity-20 rounded-full"></div>
             <div className="relative p-6 rounded-full bg-slate-900 border border-slate-800 shadow-2xl ring-1 ring-white/10">
                <Rocket size={64} className="text-primary animate-float" />
             </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
              AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">创始人模拟器</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 font-light max-w-xl mx-auto leading-relaxed">
              体验真实的创业至暗时刻。<br/>
              <span className="text-slate-500 text-lg">
                距离破产，往往只有一个月。
              </span>
            </p>
          </div>

          <button 
            onClick={startNewGame}
            className="group relative inline-flex items-center gap-4 px-10 py-5 bg-white text-slate-950 rounded-full font-bold text-xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] overflow-hidden"
          >
            <Play fill="currentColor" size={24} />
            <span>开始模拟</span>
          </button>
        </div>
      </div>
    );
  }

  if (status === GameStatus.CHARACTER_CREATE) {
      return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col">
            <div className="max-w-7xl mx-auto w-full h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <User className="text-primary" /> 
                        1. 选择人格 (4x4 阵营)
                    </h2>
                    
                    {/* Stats & Confirmation Panel (Sticky on mobile or top) */}
                    {selectedFounderId && (
                         <div className="flex flex-wrap items-center gap-4 bg-slate-900/90 border border-slate-700 p-2 md:p-4 rounded-xl backdrop-blur-md sticky top-2 z-50 shadow-2xl w-full md:w-auto">
                            <div className="hidden md:flex flex-col text-right mr-4">
                                <span className="text-xs text-slate-500 uppercase">剩余天赋点</span>
                                <span className="text-2xl font-mono font-bold text-white">{pointsLeft}</span>
                            </div>
                            
                            <div className="flex gap-4 md:gap-6 flex-1 justify-around">
                                {(['tech', 'vision', 'charisma'] as const).map(stat => (
                                    <div key={stat} className="flex flex-col items-center gap-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-500">
                                            {stat === 'tech' ? '技术' : stat === 'vision' ? '产品' : '忽悠'}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleStatChange(stat, -1)} className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300"><Minus size={12} /></button>
                                            <span className="font-mono text-primary font-bold w-4 text-center">{allocatedStats[stat]}</span>
                                            <button onClick={() => handleStatChange(stat, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-white"><Plus size={12} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button 
                                disabled={!selectedFounderId || pointsLeft > 0}
                                onClick={confirmCharacter}
                                className="px-6 py-2 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 ml-4"
                            >
                                确认 <ArrowRight size={16} />
                            </button>
                         </div>
                    )}
                </div>

                {/* MBTI Grid (4x4) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 overflow-y-auto pb-8 custom-scrollbar">
                    {foundersList.map((f, index) => (
                        <button
                            key={f.id}
                            onClick={() => setSelectedFounderId(f.id)}
                            className={`flex flex-col text-left p-4 rounded-xl border transition-all h-full relative overflow-hidden group hover:-translate-y-1 ${selectedFounderId === f.id ? 'bg-slate-800/80 border-primary ring-1 ring-primary/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:border-slate-600'}`}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className={`text-3xl font-black font-mono tracking-wide mb-1 ${getMbtiColor(index)}`}>
                                        {f.mbti}
                                    </div>
                                    <div className="font-bold text-sm text-slate-300">{f.name.zh.split(' ')[0]}</div>
                                </div>
                                {selectedFounderId === f.id && <div className="text-primary"><CheckCircle2 size={24} /></div>}
                            </div>
                            
                            {/* Desc */}
                            <p className="text-xs text-slate-400 leading-snug mb-4 line-clamp-2">
                                {f.description.zh}
                            </p>

                            {/* Pros & Cons */}
                            <div className="mt-auto space-y-1.5 pt-3 border-t border-slate-800/50">
                                <div className="text-[10px] md:text-xs font-medium text-slate-300 flex items-start gap-1">
                                    <span className="text-green-400 font-bold shrink-0">+</span> {f.pros.zh}
                                </div>
                                <div className="text-[10px] md:text-xs font-medium text-slate-400 flex items-start gap-1">
                                    <span className="text-red-400 font-bold shrink-0">-</span> {f.cons.zh}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                
            </div>
        </div>
      );
  }

  if (status === GameStatus.IDEA_PHASE) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
              <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-500">
                  <h2 className="text-3xl font-bold text-white mb-2">
                      输入你的“改变世界”想法
                  </h2>
                  <p className="text-slate-400 mb-8">
                      你可以输入任何天马行空的点子，AI 将推演它的未来。或者直接随机一个。
                  </p>

                  <div className="space-y-4">
                      <textarea
                        value={userIdea}
                        onChange={(e) => setUserIdea(e.target.value)}
                        placeholder="例如：开发一个能听懂猫语的翻译器，或者一个只在凌晨3点开放的社交软件..."
                        className="w-full h-40 bg-slate-950 border border-slate-800 rounded-xl p-4 text-lg text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                      />
                      
                      <div className="flex gap-4">
                          <button 
                            onClick={() => setUserIdea(getRandomIdea(language))}
                            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors flex items-center gap-2"
                          >
                              <Dice5 size={18} />
                              随机点子
                          </button>
                          <button 
                            onClick={handleIdeaSubmit}
                            disabled={!userIdea.trim() || isLoading}
                            className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors shadow-[0_0_20px_rgba(99,102,241,0.4)] flex justify-center items-center gap-2"
                          >
                             {isLoading ? <Activity className="animate-spin" /> : <Rocket size={18} />}
                             启动项目
                          </button>
                      </div>
                  </div>

                   {/* Character Summary Pill */}
                   <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                          <User size={14} />
                          <span>{currentFounder?.name.zh} ({currentFounder?.mbti})</span>
                      </div>
                      <div className="flex gap-3">
                          <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={12} /> {randomTraits?.buff.name.zh}</span>
                          <span className="text-red-500 flex items-center gap-1"><AlertTriangle size={12} /> {randomTraits?.debuff.name.zh}</span>
                      </div>
                   </div>
              </div>
          </div>
      )
  }

  // --- MAIN GAME UI ---

  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-primary/30 flex flex-col bg-slate-950">
      
      {/* Header / Stats Bar */}
      <div className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            {/* Stats Grid */}
            <div className="grid grid-cols-5 gap-2 md:gap-4 flex-grow">
                <StatCard 
                label="资金 (k)" 
                value={stats.cash} 
                suffix="k" 
                icon={Wallet} 
                color="text-secondary" 
                max={500} 
                />
                <StatCard 
                label="团队"
                value={stats.team} 
                icon={Users} 
                color="text-blue-400" 
                />
                <StatCard 
                label="产品"
                value={stats.product} 
                icon={Rocket} 
                color="text-purple-400" 
                />
                <StatCard 
                label="增长" 
                value={stats.traction} 
                icon={TrendingUp} 
                color="text-orange-400" 
                />
                <StatCard 
                label="压力"
                value={stats.stress} 
                icon={Activity} 
                color="text-danger" 
                />
            </div>
        </div>
      </div>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col">
        {status === GameStatus.PLAYING && turnData ? (
          <GameUI 
            turnData={turnData}
            onChoice={handleGameChoice}
            language={language}
            founder={currentFounder ? {...currentFounder, assignedBuff: randomTraits?.buff, assignedDebuff: randomTraits?.debuff} : null}
            isLoading={isLoading}
          />
        ) : status === GameStatus.GAME_OVER && turnData ? (
          <div className="flex-1 flex items-center justify-center p-4 animate-in fade-in duration-1000">
             <div className="max-w-3xl w-full text-center space-y-8 bg-slate-900/80 backdrop-blur-xl p-10 md:p-14 rounded-3xl border border-slate-700 shadow-2xl">
                 <div className="space-y-4">
                     <h2 className="text-4xl md:text-6xl font-black text-white">{turnData.endingType === 'unicorn' ? '🦄 独角兽！' : turnData.endingType === 'bankruptcy' ? '💀 破产清算' : '游戏结束'}</h2>
                     <p className="text-xl text-slate-300 font-serif leading-relaxed">{turnData.outcomeText}</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 bg-slate-800/50 p-6 rounded-xl">
                      <div className="text-center">
                          <div className="text-xs uppercase text-slate-500 mb-1">存活时间</div>
                          <div className="text-3xl font-mono font-bold text-white">{turnData.month}/12 个月</div>
                      </div>
                      <div className="text-center">
                          <div className="text-xs uppercase text-slate-500 mb-1">最终估值</div>
                          <div className="text-3xl font-mono font-bold text-green-400">${(stats.traction * stats.product * (stats.cash > 0 ? 1 : 0) * 100).toLocaleString()}</div>
                      </div>
                 </div>

                 <button 
                  onClick={startNewGame}
                  className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-200 transition-colors flex items-center gap-2 mx-auto"
                >
                  <RotateCcw size={20} />
                  再来一局
                </button>
             </div>
          </div>
        ) : (
             <div className="flex-1 flex items-center justify-center">
                 <div className="flex flex-col items-center gap-4">
                      <Loader2 size={48} className="animate-spin text-primary" />
                      <p className="text-slate-500 font-mono">AI 正在推演平行宇宙...</p>
                 </div>
             </div>
        )}
      </main>
    </div>
  );
};

export default App;
