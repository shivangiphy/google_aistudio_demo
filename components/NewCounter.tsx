
import React, { useState } from 'react';
import { Counter } from '../types';
import { PRESET_COLORS } from '../constants';

interface Props {
  onSave: (counter: Counter) => void;
  onCancel: () => void;
}

const NewCounter: React.FC<Props> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('Units');
  const [initialCount, setInitialCount] = useState(0);
  const [goal, setGoal] = useState<number | ''>('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const newCounter: Counter = {
      id: Math.random().toString(36).substring(7),
      name: name.trim(),
      unit: unit.trim() || 'Units',
      color: selectedColor,
      tags,
      initialCount,
      goal: goal === '' ? undefined : Number(goal),
      createdAt: Date.now()
    };
    onSave(newCounter);
  };

  return (
    <div className="flex flex-col h-full bg-background-dark text-white">
      <header className="sticky top-0 z-10 bg-background-dark/95 backdrop-blur-md border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <button onClick={onCancel} className="text-slate-400 font-medium px-2 py-1">Cancel</button>
          <h1 className="text-lg font-bold">Create Counter</h1>
          <button 
            onClick={handleSave}
            disabled={!name.trim()}
            className="text-primary font-bold px-2 py-1 disabled:opacity-30"
          >
            Done
          </button>
        </div>
      </header>

      <main className="flex-1 p-5 space-y-8 overflow-y-auto no-scrollbar pb-28">
        <section className="space-y-3">
          <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Basic Info</label>
          <div className="space-y-4">
            <div className="relative group">
              <input 
                autoFocus
                className="block w-full rounded-2xl border-0 bg-surface-dark py-4 px-5 text-lg font-medium text-white ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-primary transition-all"
                placeholder="Counter Name (e.g. Reading)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 ml-1">Unit</label>
                <input 
                  className="block w-full rounded-xl border-0 bg-surface-dark py-3 px-4 text-white ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-primary"
                  placeholder="Pages, km, etc."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 ml-1">Goal (Optional)</label>
                <input 
                  type="number"
                  className="block w-full rounded-xl border-0 bg-surface-dark py-3 px-4 text-white ring-1 ring-inset ring-gray-700 focus:ring-2 focus:ring-primary"
                  placeholder="e.g. 50"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Initial Value</label>
          <div className="flex items-center justify-between bg-surface-dark rounded-2xl p-2 ring-1 ring-gray-700">
            <button 
              onClick={() => setInitialCount(prev => Math.max(0, prev - 1))}
              className="flex h-12 w-16 items-center justify-center rounded-xl bg-background-dark text-white hover:bg-gray-800 transition-all active:scale-90"
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
            <span className="text-3xl font-bold text-white tabular-nums">{initialCount}</span>
            <button 
              onClick={() => setInitialCount(prev => prev + 1)}
              className="flex h-12 w-16 items-center justify-center rounded-xl bg-primary text-background-dark hover:brightness-110 transition-all active:scale-90"
            >
              <span className="material-symbols-outlined font-bold">add</span>
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tags</label>
          <div className="bg-surface-dark rounded-2xl p-4 ring-1 ring-gray-700 min-h-[80px] flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <div key={tag} className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary border border-primary/30 uppercase tracking-wider">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="p-0.5 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </div>
              ))}
              {tags.length === 0 && <span className="text-slate-600 text-xs italic">No tags added yet</span>}
            </div>
            <div className="flex items-center gap-2 border-t border-gray-700/50 pt-3 mt-auto">
              <span className="material-symbols-outlined text-slate-500 text-lg">tag</span>
              <input 
                className="block w-full border-0 bg-transparent p-0 text-white placeholder:text-gray-500 focus:ring-0 text-sm"
                placeholder="Type tag and press enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <button onClick={handleAddTag} className="text-xs font-black text-primary uppercase p-1">Add</button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Accent Color</label>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-12 h-12 shrink-0 rounded-full transition-all border-4 flex items-center justify-center ${
                  selectedColor === color ? 'border-white ring-2 ring-primary' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              >
                {selectedColor === color && <span className="material-symbols-outlined text-background-dark font-black">check</span>}
              </button>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-dark via-background-dark to-transparent pt-10">
        <button 
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full flex items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-lg font-black text-background-dark shadow-xl shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
        >
          <span className="material-symbols-outlined font-black">check_circle</span>
          Save Counter
        </button>
      </div>
    </div>
  );
};

export default NewCounter;
