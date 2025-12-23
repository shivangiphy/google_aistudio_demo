
import React, { useMemo, useState } from 'react';
import { Counter, CounterEntry } from '../types';

interface Props {
  counter: Counter;
  entries: CounterEntry[];
  onBack: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
  onViewHistory: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

type AggregationLevel = 'Day' | 'Week' | 'Month' | 'Year' | 'Overall';

const CounterDetail: React.FC<Props> = ({ 
  counter, 
  entries, 
  onBack, 
  onIncrement, 
  onDecrement, 
  onReset, 
  onViewHistory,
  onEdit,
  onDelete
}) => {
  const [aggLevel, setAggLevel] = useState<AggregationLevel>('Overall');

  const displayTotal = useMemo(() => {
    if (aggLevel === 'Overall') {
      const sum = entries.reduce((acc, curr) => acc + curr.value, 0);
      return counter.initialCount + sum;
    }

    const now = new Date();
    let startTimestamp = 0;

    if (aggLevel === 'Day') {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      startTimestamp = d.getTime();
    } else if (aggLevel === 'Week') {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
      d.setHours(0, 0, 0, 0);
      startTimestamp = d.getTime();
    } else if (aggLevel === 'Month') {
      const d = new Date(now);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      startTimestamp = d.getTime();
    } else if (aggLevel === 'Year') {
      const d = new Date(now);
      d.setMonth(0, 1);
      d.setHours(0, 0, 0, 0);
      startTimestamp = d.getTime();
    }

    return entries
      .filter(e => e.timestamp >= startTimestamp)
      .reduce((acc, curr) => acc + curr.value, 0);
  }, [aggLevel, entries, counter.initialCount]);

  const progress = useMemo(() => {
    if (!counter.goal) return null;
    return Math.min(100, Math.max(0, (displayTotal / counter.goal) * 100));
  }, [displayTotal, counter.goal]);

  const isGoalReached = counter.goal ? displayTotal >= counter.goal : false;

  return (
    <div className="flex flex-col h-full p-4 text-white">
      <header className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="size-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <div className="flex flex-col items-center">
           <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Analytics View</h2>
           <span className="text-[10px] text-primary font-bold">{counter.unit}</span>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={onEdit}
            className="size-10 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to delete this counter?')) onDelete();
            }}
            className="size-10 flex items-center justify-center rounded-full hover:bg-red-500/10 text-red-400 transition-colors"
          >
            <span className="material-symbols-outlined">delete_outline</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-between pb-8 overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-center justify-center text-center w-full px-6">
          <div className="flex h-10 w-full max-w-xs items-center justify-center rounded-xl bg-surface-dark border border-white/5 p-1 mb-6">
            {(['Day', 'Week', 'Month', 'Overall'] as AggregationLevel[]).map(level => (
              <button
                key={level}
                onClick={() => setAggLevel(level)}
                className={`flex-1 h-full rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  aggLevel === level ? 'bg-primary text-background-dark shadow-lg' : 'text-slate-500 hover:text-white'
                }`}
              >
                {level === 'Day' ? 'Today' : level}
              </button>
            ))}
          </div>

          <div 
            className="size-24 rounded-full flex items-center justify-center overflow-hidden border-4 border-surface-highlight shadow-2xl bg-surface-dark mb-4 shrink-0"
            style={{ color: counter.iconType === 'icon' ? counter.color : 'inherit' }}
          >
              {counter.iconType === 'icon' ? (
                <i className={`${counter.icon || 'fa-solid fa-star'} text-4xl`}></i>
              ) : (
                <img src={counter.icon} className="w-full h-full object-cover" alt="" />
              )}
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {counter.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-black uppercase text-slate-400">
                {tag}
              </span>
            ))}
          </div>
          
          <h1 className="text-4xl font-black text-white mb-2 leading-tight">{counter.name}</h1>
          
          <div className="relative py-8 w-full flex flex-col items-center">
            {isGoalReached && (
              <div className="absolute top-0 animate-bounce">
                <span className="material-symbols-outlined text-yellow-400 text-4xl">workspace_premium</span>
              </div>
            )}
            <h1 className="text-white tracking-tighter text-[160px] font-black leading-none tabular-nums select-none drop-shadow-2xl" style={{ color: counter.color }}>
              {displayTotal}
            </h1>
            <span className="text-sm font-black text-slate-500 uppercase tracking-widest -mt-4">
              {aggLevel === 'Overall' ? counter.unit : `Units ${aggLevel}`}
            </span>
          </div>

          {counter.goal && (
            <div className="w-full max-w-xs mt-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                <span>Period Progress</span>
                <span>{displayTotal} / {counter.goal}</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full transition-all duration-700 ease-out rounded-full shadow-[0_0_15px_rgba(43,205,238,0.3)]"
                  style={{ 
                    width: `${progress}%`,
                    backgroundColor: isGoalReached ? '#ffd93d' : counter.color 
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="w-full flex flex-col gap-6 mt-8">
          <div className="flex gap-4">
            <button 
              onClick={onDecrement}
              className="group flex-1 h-28 flex flex-col items-center justify-center rounded-[32px] bg-surface-highlight border border-white/5 hover:bg-white/5 active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-red-500 transition-colors">remove</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-1">Subtract</span>
            </button>
            <button 
              onClick={onIncrement}
              className="flex-1 h-28 flex flex-col items-center justify-center rounded-[32px] shadow-2xl active:scale-90 transition-all"
              style={{ backgroundColor: counter.color }}
            >
              <span className="material-symbols-outlined text-5xl font-black text-background-dark">add</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-background-dark/60 mt-0">Add {counter.unit}</span>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button 
              onClick={onViewHistory}
              className="w-full h-16 flex items-center justify-between px-6 rounded-2xl bg-surface-dark border border-white/5 text-white font-bold hover:bg-white/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">analytics</span>
                <span>Trends & History</span>
              </div>
              <span className="material-symbols-outlined text-slate-600">chevron_right</span>
            </button>
            
            <button 
              onClick={onReset}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              Clear Log History
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CounterDetail;
