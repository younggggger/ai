import React, { useState, useRef, useEffect } from 'react';
import { TurnData, Language, FounderProfile, AIChoice } from '../types';
import { Brain, Terminal, ArrowRight, Send, Loader2, AlertCircle } from 'lucide-react';

interface GameUIProps {
  turnData: TurnData;
  onChoice: (choiceText: string) => void;
  language: Language;
  founder: FounderProfile | null;
  isLoading: boolean;
}

const GameUI: React.FC<GameUIProps> = ({ turnData, onChoice, language, founder, isLoading }) => {
  const [customInput, setCustomInput] = useState('');
  const [showOutcome, setShowOutcome] = useState(!!turnData.outcomeText);
  
  // Reset state when turn changes
  useEffect(() => {
    if (turnData.outcomeText) {
      setShowOutcome(true);
    } else {
      setShowOutcome(false);
    }
    setCustomInput('');
  }, [turnData]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onChoice(customInput);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto items-center justify-between pb-4 md:pb-8 animate-in fade-in duration-700">
      
      {/* 1. TOP SECTION: Narrative Area */}
      <div className="w-full max-w-4xl flex flex-col items-center gap-4 relative z-10 mt-4 md:mt-8 px-4">
        
        {/* HUD Info */}
        <div className="flex flex-wrap justify-center gap-3">
            <div className="bg-slate-900/80 border border-slate-700 px-4 py-1 rounded-full text-xs font-mono text-slate-400 uppercase tracking-widest shadow-lg backdrop-blur-sm">
             {language === 'zh' ? '月份' : 'Month'} {turnData.month} / 12
            </div>
            {founder && (
                <div className="bg-indigo-900/80 border border-indigo-500/50 px-4 py-1 rounded-full text-xs font-mono text-indigo-300 uppercase tracking-widest shadow-lg backdrop-blur-sm flex items-center gap-2">
                    <span>{founder.name[language]}</span>
                    <span className="text-slate-400">|</span>
                    <span className={founder.assignedBuff?.id ? 'text-green-400' : ''}>{founder.assignedBuff?.name[language]}</span>
                    <span className={founder.assignedDebuff?.id ? 'text-red-400' : ''}>{founder.assignedDebuff?.name[language]}</span>
                </div>
            )}
        </div>

        {/* Narrative Container */}
        <div className="relative w-full bg-slate-900/95 border-y-4 md:border-4 border-slate-700/50 md:rounded-2xl p-6 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl overflow-hidden group min-h-[300px] flex flex-col">
          {/* Background Decor */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>
          <div className="absolute -right-10 -top-10 text-slate-800/20 group-hover:text-slate-800/30 transition-colors duration-700 rotate-12">
            <Terminal size={200} />
          </div>

          <div className="relative z-10 space-y-6">
            
            {/* Outcome of previous turn */}
            {turnData.outcomeText && (
               <div className="p-4 bg-slate-800/50 rounded-lg border-l-4 border-indigo-500 mb-6 animate-in slide-in-from-top-2 fade-in duration-700">
                  <p className="text-sm md:text-base text-indigo-200 italic font-serif">
                    {turnData.outcomeText}
                  </p>
                  {turnData.statsChange && (
                      <div className="flex gap-3 mt-2 text-xs font-mono opacity-80">
                          {Object.entries(turnData.statsChange).map(([key, val]) => (
                              <span key={key} className={(val as number) > 0 ? 'text-green-400' : (val as number) < 0 ? 'text-red-400' : 'text-slate-400'}>
                                  {key}: {(val as number) > 0 ? '+' : ''}{val as number}
                              </span>
                          ))}
                      </div>
                  )}
               </div>
            )}

            {/* Current Scenario */}
            <div className="space-y-4 animate-in fade-in duration-1000 delay-300">
                <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight drop-shadow-sm leading-tight font-serif">
                {turnData.title}
                </h1>
                <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed font-serif whitespace-pre-line">
                {turnData.description}
                </p>
            </div>
          </div>

          {isLoading && (
              <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center z-50 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-primary" size={48} />
                      <p className="text-primary font-mono animate-pulse">
                          {language === 'zh' ? 'AI 正在推演未来...' : 'AI is simulating the future...'}
                      </p>
                  </div>
              </div>
          )}
        </div>
      </div>

      {/* 2. BOTTOM SECTION: Choices */}
      <div className="w-full max-w-6xl px-4 py-6 md:py-8 space-y-4 md:space-y-6">
        
        {/* Preset Choices */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {turnData.choices.map((choice, idx) => (
                <button
                    key={choice.id || idx}
                    onClick={() => onChoice(choice.text)}
                    disabled={isLoading}
                    className="group relative flex flex-col bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700 hover:border-primary rounded-xl p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                     <div className="flex items-start justify-between mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${choice.type === 'risky' ? 'bg-red-500/20 text-red-400' : choice.type === 'wild' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {choice.type || 'Option'}
                        </span>
                        <span className="text-slate-600 font-mono text-xs">0{idx + 1}</span>
                     </div>
                     <p className="text-slate-200 font-medium leading-snug group-hover:text-white">
                        {choice.text}
                     </p>
                     <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center text-xs text-primary font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                        {language === 'zh' ? '执行' : 'Execute'} <ArrowRight size={12} className="ml-1" />
                     </div>
                </button>
            ))}
        </div>

        {/* Custom Input */}
        <div className="w-full">
            <form onSubmit={handleCustomSubmit} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-xl overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                    <div className="pl-4 text-slate-500">
                        <Brain size={20} />
                    </div>
                    <input 
                        type="text" 
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        disabled={isLoading}
                        placeholder={language === 'zh' ? "输入你自己的天才想法 (AI 将会推演结果)..." : "Type your own genius solution (AI will simulate the outcome)..."}
                        className="w-full bg-transparent border-none text-white px-4 py-4 focus:ring-0 placeholder:text-slate-600 font-medium"
                    />
                    <button 
                        type="submit" 
                        disabled={!customInput.trim() || isLoading}
                        className="mr-2 p-2 bg-slate-800 hover:bg-primary text-slate-300 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>

      </div>
    </div>
  );
};

export default GameUI;