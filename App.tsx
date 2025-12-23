
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Counter, CounterEntry, AppState } from './types';
import * as DB from './db';
import CountersList from './components/CountersList';
import CounterDetail from './components/CounterDetail';
import CounterForm from './components/CounterForm';
import CounterHistory from './components/CounterHistory';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<AppState>({ counters: [], entries: [] });
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'new' | 'edit' | 'history'>('list');
  const [selectedCounterId, setSelectedCounterId] = useState<string | null>(null);

  const refreshState = useCallback(() => {
    setState({
      counters: DB.getAllCounters(),
      entries: DB.getAllEntries()
    });
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        await DB.initDB();
        refreshState();
      } catch (e) {
        console.error("Failed to initialize SQLite database", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [refreshState]);

  const addCounter = useCallback((counter: Counter) => {
    DB.addCounter(counter);
    refreshState();
    setCurrentView('list');
  }, [refreshState]);

  const updateCounter = useCallback((counter: Counter) => {
    DB.updateCounter(counter);
    refreshState();
    setCurrentView('detail');
  }, [refreshState]);

  const deleteCounter = useCallback((id: string) => {
    DB.deleteCounter(id);
    refreshState();
    setCurrentView('list');
  }, [refreshState]);

  const addEntry = useCallback((counterId: string, value: number) => {
    const newEntry: CounterEntry = {
      id: Math.random().toString(36).substring(7),
      counterId,
      timestamp: Date.now(),
      value
    };
    DB.addEntry(newEntry);
    refreshState();
  }, [refreshState]);

  const resetCounter = useCallback((counterId: string) => {
    DB.clearEntries(counterId);
    refreshState();
  }, [refreshState]);

  const selectedCounter = useMemo(() => 
    state.counters.find(c => c.id === selectedCounterId),
    [state.counters, selectedCounterId]
  );

  const getCounterTotal = useCallback((counterId: string) => {
    const counter = state.counters.find(c => c.id === counterId);
    if (!counter) return 0;
    const entriesValue = state.entries
      .filter(e => e.counterId === counterId)
      .reduce((acc, curr) => acc + curr.value, 0);
    return counter.initialCount + entriesValue;
  }, [state.counters, state.entries]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 text-center">
        <div className="relative size-20 mb-8">
           <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
           <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-black text-white mb-2 uppercase tracking-widest">Initializing SQLite</h2>
        <p className="text-slate-500 text-sm font-bold">Spinning up your local database instance...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'list':
        return (
          <CountersList 
            counters={state.counters}
            entries={state.entries}
            onSelectCounter={(id) => {
              setSelectedCounterId(id);
              setCurrentView('detail');
            }}
            onAddCounter={() => setCurrentView('new')}
            onQuickAdd={(id) => addEntry(id, 1)}
            onQuickSub={(id) => addEntry(id, -1)}
            getCounterTotal={getCounterTotal}
          />
        );
      case 'detail':
        if (!selectedCounter) return null;
        return (
          <CounterDetail 
            counter={selectedCounter}
            entries={state.entries.filter(e => e.counterId === selectedCounter.id)}
            onBack={() => setCurrentView('list')}
            onIncrement={() => addEntry(selectedCounter.id, 1)}
            onDecrement={() => addEntry(selectedCounter.id, -1)}
            onReset={() => resetCounter(selectedCounter.id)}
            onViewHistory={() => setCurrentView('history')}
            onEdit={() => setCurrentView('edit')}
            onDelete={() => deleteCounter(selectedCounter.id)}
          />
        );
      case 'new':
        return (
          <CounterForm 
            onSave={addCounter}
            onCancel={() => setCurrentView('list')}
          />
        );
      case 'edit':
        if (!selectedCounter) return null;
        return (
          <CounterForm 
            initialData={selectedCounter}
            onSave={updateCounter}
            onCancel={() => setCurrentView('detail')}
          />
        );
      case 'history':
        if (!selectedCounter) return null;
        return (
          <CounterHistory 
            counter={selectedCounter}
            entries={state.entries.filter(e => e.counterId === selectedCounter.id)}
            onBack={() => setCurrentView('detail')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="max-w-md mx-auto min-h-screen bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden flex flex-col relative">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
