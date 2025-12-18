
export interface CounterEntry {
  id: string;
  counterId: string;
  timestamp: number;
  value: number; // usually +1 or -1
}

export interface Counter {
  id: string;
  name: string;
  unit: string;
  color: string;
  tags: string[];
  initialCount: number;
  goal?: number;
  createdAt: number;
}

export type TimeRange = 'Day' | 'Week' | 'Month' | 'Year';

export interface AppState {
  counters: Counter[];
  entries: CounterEntry[];
}
