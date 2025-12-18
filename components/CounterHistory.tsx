
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Counter, CounterEntry, TimeRange } from '../types';

interface Props {
  counter: Counter;
  entries: CounterEntry[];
  onBack: () => void;
}

const CounterHistory: React.FC<Props> = ({ counter, entries, onBack }) => {
  const [range, setRange] = useState<TimeRange>('Week');

  const chartData = useMemo(() => {
    const now = new Date();
    const data: { name: string; val: number }[] = [];
    
    if (range === 'Week') {
      // Last 7 days aggregation
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        
        // Sum up all entries before or equal to the end of this day
        const endOfDay = d.getTime() + 24 * 3600000 - 1;
        const totalAtPoint = entries
          .filter(e => e.timestamp <= endOfDay)
          .reduce((acc, curr) => acc + curr.value, 0) + counter.initialCount;

        data.push({ name: dayName, val: totalAtPoint });
      }
    } else if (range === 'Day') {
        // Last 24 hours in 3-hour chunks
        for (let i = 8; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 3 * 3600000);
            const label = `${d.getHours()}:00`;
            const totalAtPoint = entries
                .filter(e => e.timestamp <= d.getTime())
                .reduce((acc, curr) => acc + curr.value, 0) + counter.initialCount;
            data.push({ name: label, val: totalAtPoint });
        }
    } else {
        // Generic daily view for Month (simplified)
        for (let i = 29; i >= 0; i -= 3) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const label = `${d.getMonth() + 1}/${d.getDate()}`;
            const totalAtPoint = entries
                .filter(e => e.timestamp <= d.getTime())
                .reduce((acc, curr) => acc + curr.value, 0) + counter.initialCount;
            data.push({ name: label, val: totalAtPoint });
        }
    }
    return data;
  }, [range, entries, counter.initialCount]);

  const historyLogs = useMemo(() => {
    return [...entries].sort((a, b) => b.timestamp - a.timestamp).slice(0, 15);
  }, [entries]);

  const total = useMemo(() => 
    counter.initialCount + entries.reduce((acc, curr) => acc + curr.value, 0),
    [counter, entries]
  );

  const average = useMemo(() => {
    if (entries.length === 0) return 0;
    // Calculate span of days
    const timestamps = entries.map(e => e.timestamp);
    const min = Math.min(...timestamps, Date.now());
    const max = Math.max(...timestamps, Date.now());
    const days = Math.max(1, Math.ceil((max - min) / (1000 * 60 * 60 * 24)));
    return (total / days).toFixed(1);
  }, [total, entries]);

  const peak = useMemo(() => {
    if (entries.length === 0) return 0;
    // Find day with highest increment
    const dayMap: Record<string, number> = {};
    entries.forEach(e => {
        const d = new Date(e.timestamp).toDateString();
        dayMap[d] = (dayMap[d] || 0) + Math.max(0, e.value);
    });
    return Math.max(0, ...Object.values(dayMap));
  }, [entries]);

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar bg-background-dark text-white">
      <header className="sticky top-0 z-20 bg-background-dark/90 backdrop-blur-xl p-4 flex items-center justify-between border-b border-white/5">
        <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <div className="text-center">
            <h2 className="text-sm font-black uppercase tracking-widest">{counter.name}</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Performance Analysis</p>
        </div>
        <div className="size-10" />
      </header>

      <div className="px-4 py-6">
        <div className="flex h-12 w-full items-center justify-center rounded-2xl bg-surface-dark border border-white/5 p-1.5 mb-8">
          {(['Day', 'Week', 'Month'] as TimeRange[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`flex-1 h-full rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                range === r ? 'bg-primary text-background-dark shadow-xl' : 'text-slate-500 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-6 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <span className="material-symbols-outlined text-7xl" style={{ color: counter.color }}>insights</span>
          </div>
          
          <div className="relative z-10 flex justify-between items-start mb-10">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Cumulative Growth</p>
              <div className="flex items-baseline gap-2">
                <p className="text-white text-5xl font-black tracking-tighter tabular-nums">{total}</p>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">{counter.unit}</span>
              </div>
            </div>
          </div>

          <div className="h-[220px] w-full -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={counter.color} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={counter.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 800 }} 
                />
                <Tooltip 
                  cursor={{ stroke: counter.color, strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ backgroundColor: '#101f22', border: '1px solid #203236', borderRadius: '16px', padding: '12px' }}
                  itemStyle={{ color: counter.color, fontWeight: '900', fontSize: '14px' }}
                  labelStyle={{ color: '#9db4b9', marginBottom: '4px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="val" 
                  stroke={counter.color} 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorVal)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 px-2">Statistical Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-5 rounded-2xl bg-surface-dark border border-white/5 flex flex-col justify-between">
            <div className="flex items-center gap-2 opacity-50 mb-2">
              <span className="material-symbols-outlined text-sm">equalizer</span>
              <span className="text-[9px] font-black uppercase tracking-widest">Daily Average</span>
            </div>
            <div>
                <p className="text-2xl font-black text-white leading-none mb-1">{average}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{counter.unit}/day</p>
            </div>
          </div>
          
          <div className="p-5 rounded-2xl bg-surface-dark border border-white/5 flex flex-col justify-between">
            <div className="flex items-center gap-2 opacity-50 mb-2">
              <span className="material-symbols-outlined text-sm">rocket_launch</span>
              <span className="text-[9px] font-black uppercase tracking-widest">One-Day Peak</span>
            </div>
            <div>
                <p className="text-2xl font-black text-white leading-none mb-1">{peak}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Best performance</p>
            </div>
          </div>
          
          <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20 col-span-2 flex items-center justify-between">
             <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-orange-400 text-sm">local_fire_department</span>
                  <span className="text-[10px] font-black text-orange-500/70 uppercase tracking-widest">Current Momentum</span>
                </div>
                <p className="text-2xl font-black text-white">Consistent Streak</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Keep up the good work!</p>
             </div>
             <div className="size-14 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/10">
                <span className="material-symbols-outlined text-orange-500 text-3xl font-black">bolt</span>
             </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-10 pb-12">
        <div className="flex items-center justify-between mb-5 px-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Activity Log</h3>
          <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Clear Logs</button>
        </div>
        
        <div className="space-y-3">
          {historyLogs.map(entry => (
            <div key={entry.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-dark border border-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`size-10 rounded-xl flex items-center justify-center border ${
                    entry.value > 0 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  <span className="material-symbols-outlined font-black">{entry.value > 0 ? 'add' : 'remove'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black uppercase tracking-tighter">
                    {entry.value > 0 ? 'Increment' : 'Decrement'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {new Date(entry.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <span className={`text-lg font-black tabular-nums ${entry.value > 0 ? 'text-primary' : 'text-red-500'}`}>
                {entry.value > 0 ? `+${entry.value}` : entry.value}
              </span>
            </div>
          ))}

          {historyLogs.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-600">
               <span className="material-symbols-outlined text-4xl mb-2 opacity-20">history_toggle_off</span>
               <p className="text-xs font-bold uppercase tracking-widest italic opacity-50">No activity recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CounterHistory;
