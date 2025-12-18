
import React, { useState, useMemo } from 'react';
import { Counter, CounterEntry } from '../types';

interface Props {
  counters: Counter[];
  entries: CounterEntry[];
  onSelectCounter: (id: string) => void;
  onAddCounter: () => void;
  onQuickAdd: (id: string) => void;
  onQuickSub: (id: string) => void;
  getCounterTotal: (id: string) => number;
}

const CountersList: React.FC<Props> = ({ 
  counters, 
  onSelectCounter, 
  onAddCounter, 
  onQuickAdd, 
  onQuickSub,
  getCounterTotal
}) => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    counters.forEach(c => c.tags.forEach(t => tagsSet.add(t)));
    return ['All', ...Array.from(tagsSet)];
  }, [counters]);

  const filteredCounters = useMemo(() => {
    return counters.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesTag = selectedTag === 'All' || c.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [counters, search, selectedTag]);

  return (
    <div className="flex flex-col h-full overflow-hidden pb-24">
      <header className="px-5 pt-8 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">My Counters</h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Track your habits & goals</p>
          </div>
          <button className="h-10 w-10 flex items-center justify-center rounded-full bg-white dark:bg-card-dark text-slate-400 border border-slate-200 dark:border-transparent">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      <div className="px-5 py-2 sticky top-0 z-10 bg-background-light dark:bg-background-dark/95 backdrop-blur-sm">
        <div className="relative group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">search</span>
          <input 
            className="block w-full rounded-xl border-none bg-white dark:bg-card-dark py-3.5 pl-10 pr-4 text-sm dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/50 shadow-sm"
            placeholder="Search counters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto px-5 py-4 no-scrollbar shrink-0">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`flex h-9 shrink-0 items-center justify-center rounded-full px-5 text-sm font-bold transition-all ${
              selectedTag === tag 
                ? 'bg-primary text-[#101f22] shadow-lg shadow-primary/20' 
                : 'bg-white dark:bg-card-dark text-slate-400 border border-slate-200 dark:border-transparent'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-2 flex flex-col gap-4 no-scrollbar">
        {filteredCounters.map(counter => (
          <div 
            key={counter.id} 
            className="group flex flex-col rounded-2xl bg-white dark:bg-card-dark p-5 shadow-sm border border-transparent hover:border-primary/20 transition-all"
          >
            <div className="flex items-start justify-between mb-5" onClick={() => onSelectCounter(counter.id)}>
              <div className="flex flex-col gap-1 cursor-pointer">
                <span className="text-lg font-bold leading-tight">{counter.name}</span>
                <div className="flex items-center gap-2">
                  {counter.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button className="text-gray-400 hover:text-white p-1">
                <span className="material-symbols-outlined text-[20px]">more_vert</span>
              </button>
            </div>
            
            <div className="flex items-center justify-between bg-slate-50 dark:bg-[#131f22] rounded-xl p-1.5 border border-slate-100 dark:border-transparent">
              <button 
                onClick={() => onQuickSub(counter.id)}
                className="flex h-12 w-14 items-center justify-center rounded-lg bg-white dark:bg-[#1e2f33] text-slate-900 dark:text-white shadow-sm hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 transition-all active:scale-90"
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
              
              <div 
                className="flex flex-col items-center justify-center px-4 cursor-pointer"
                onClick={() => onSelectCounter(counter.id)}
              >
                <span className="text-3xl font-bold dark:text-primary tabular-nums tracking-tight">
                  {getCounterTotal(counter.id)}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{counter.unit}</span>
              </div>
              
              <button 
                onClick={() => onQuickAdd(counter.id)}
                className="flex h-12 w-14 items-center justify-center rounded-lg bg-primary text-[#101f22] shadow-md shadow-primary/20 hover:brightness-110 active:scale-90 transition-all"
              >
                <span className="material-symbols-outlined font-bold">add</span>
              </button>
            </div>
          </div>
        ))}

        {filteredCounters.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <span className="material-symbols-outlined text-6xl mb-4">analytics</span>
            <p>No counters found</p>
          </div>
        )}
      </div>

      <button 
        onClick={onAddCounter}
        className="fixed bottom-6 right-6 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-[#101f22] shadow-xl shadow-primary/25 hover:scale-105 active:scale-90 transition-all"
      >
        <span className="material-symbols-outlined text-[32px] font-bold">add</span>
      </button>
    </div>
  );
};

export default CountersList;
