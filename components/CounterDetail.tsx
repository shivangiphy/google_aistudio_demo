
import React, { useMemo } from 'react';
import { Counter } from '../types';

interface Props {
  counter: Counter;
  total: number;
  onBack: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
  onViewHistory: () => void;
  onDelete: () => void;
}

const CounterDetail: React.FC<Props> = ({ 
  counter, 
  total, 
  onBack, 
  onIncrement, 
  onDecrement, 
  onReset, 
  onViewHistory,
  onDelete
}) => {
  const progress = useMemo(() => {
    if (!counter.goal) return null;
    return Math.min(100, Math.max(0, (total / counter.goal) * 100));
  }, [total, counter.goal]);

  const isGoalReached = counter.goal ? total >= counter.goal : false;

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
           <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Counter Info</h2>
           <span className="text-[10px] text-primary font-bold">{counter.unit}</span>
        </div>
        <button 
          onClick={() => {
            if (confirm('Are you sure you want to delete this counter?')) onDelete();
          }}
          className="size-10 flex items-center justify-center rounded-full hover:bg-red-500/10 text-red-400 transition-colors"
        >
          <span className="material-symbols-outlined">delete_outline</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-between pb-8">
        <div className="flex flex-col items-center justify-center text-center w-full px-6">
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
              {total}
            </h1>
            <span className="text-sm font-black text-slate-500 uppercase tracking-widest -mt-4">{counter.unit}</span>
          </div>

          {counter.goal && (
            <div className="w-full max-w-xs mt-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                <span>Progress</span>
                <span>{total} / {counter.goal}</span>
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
              {isGoalReached && (
                <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest mt-2 animate-pulse">
                  Goal Achieved! 🏆
                </p>
              )}
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
                <span>Timeseries History</span>
              </div>
              <span className="material-symbols-outlined text-slate-600">chevron_right</span>
            </button>
            
            <div className="flex gap-2">
               <button 
                onClick={onReset}
                className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl text-slate-500 text-xs font-bold hover:bg-white/5 transition-all"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                Reset Data
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CounterDetail;
