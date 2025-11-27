
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  max?: number;
  suffix?: string;
  trend?: number; // Positive or negative change to animate
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, max = 100, suffix = '', trend }) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-lg p-2 md:p-3 flex flex-col justify-between relative overflow-hidden group hover:border-slate-500 transition-colors">
      {trend !== undefined && trend !== 0 && (
        <div className={`absolute top-1 right-2 text-[10px] md:text-xs font-bold animate-pulse ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '▲' : '▼'}{Math.abs(trend)}
        </div>
      )}
      
      <div className="flex items-center gap-1 md:gap-2">
        <Icon size={14} className={`${color} shrink-0 md:w-4 md:h-4`} />
        <div className="flex items-baseline gap-1 overflow-hidden">
          <span className="text-sm md:text-xl font-bold text-slate-100 font-mono tracking-tight leading-none">{value}</span>
          <span className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase truncate">{suffix || label}</span>
        </div>
      </div>

      <div className="w-full bg-slate-800 h-1 mt-1 md:mt-2 rounded-full overflow-hidden opacity-50 group-hover:opacity-100 transition-opacity">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${color.replace('text-', 'bg-')}`} 
          style={{ width: `${Math.min(100, Math.max(0, (value / max) * 100))}%` }}
        />
      </div>
    </div>
  );
};

export default StatCard;
