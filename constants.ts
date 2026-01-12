
import { Counter, CounterEntry } from './types';

export const PRESET_COLORS = [
  '#2bcdee', // Primary Cyan
  '#ff6b6b', // Red
  '#ffd93d', // Yellow
  '#6c5ce7', // Purple
  '#a8e6cf', // Mint
  '#ff8fab', // Pink
  '#fb923c', // Orange
];

export const STORAGE_KEY = 'quantify_app_data';

export const INITIAL_DATA: { counters: Counter[], entries: CounterEntry[] } = {
  counters: [
    {
      id: '1',
      name: 'Daily Water Intake',
      unit: 'Glasses',
      color: '#2bcdee',
      tags: ['Health', 'Daily'],
      initialCount: 0,
      goal: 10,
      createdAt: Date.now() - 86400000 * 7,
      icon: 'fa-solid fa-droplet',
      iconType: 'icon'
    },
    {
      id: '2',
      name: 'Push-ups',
      unit: 'Reps',
      color: '#ff6b6b',
      tags: ['Fitness'],
      initialCount: 0,
      createdAt: Date.now() - 86400000 * 7,
      icon: 'fa-solid fa-dumbbell',
      iconType: 'icon'
    },
    {
      id: '3',
      name: 'Coffee Intake',
      unit: 'Cups',
      color: '#fb923c',
      tags: ['Health'],
      initialCount: 0,
      createdAt: Date.now() - 86400000 * 7,
      icon: 'fa-solid fa-coffee',
      iconType: 'icon'
    }
  ],
  entries: [
    { id: 'e1', counterId: '1', timestamp: Date.now() - 3600000, value: 1 },
    { id: 'e2', counterId: '1', timestamp: Date.now() - 7200000, value: 1 },
    { id: 'e3', counterId: '2', timestamp: Date.now() - 14400000, value: 25 },
    { id: 'e4', counterId: '3', timestamp: Date.now() - 10000, value: 1 },
  ]
};
