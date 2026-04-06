import { useState, useEffect } from 'react';

const KEY = 'begin_study';

const FLOWERS = [
  { name: 'Rose',       color: '#F4A7B0', center: '#F5D98C' },
  { name: 'Bluebell',   color: '#97C4EB', center: '#F5D98C' },
  { name: 'Lavender',   color: '#C4A8D4', center: '#F5D98C' },
  { name: 'Sunflower',  color: '#F4C47C', center: '#C8860A' },
  { name: 'Daisy',      color: '#FAFAFA', center: '#F5D98C' },
  { name: 'Poppy',      color: '#F09595', center: '#2C2C2A' },
  { name: 'Violet',     color: '#AFA9EC', center: '#F5D98C' },
  { name: 'Marigold',   color: '#EF9F27', center: '#7A3A00' },
];

const defaultState = {
  streak: 0,
  lastStudyDate: null,
  totalFlowers: 0,
  totalSessions: 0,
  totalMinutes: 0,
  todaySessions: 0,
  todayMinutes: 0,
  garden: [],
};

export function useStudyStore() {
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState;
      const parsed = JSON.parse(raw);
      const today = new Date().toDateString();
      if (parsed.lastStudyDate !== today) {
        return {
          ...parsed,
          todaySessions: 0,
          todayMinutes: 0,
          garden: [],
        };
      }
      return parsed;
    } catch { return defaultState; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data));
  }, [data]);

  function completeSession(minutes) {
    const today = new Date().toDateString();
    const flowerIdx = data.totalFlowers % FLOWERS.length;
    const flower = { ...FLOWERS[flowerIdx], id: Date.now() };

    setData(prev => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = prev.lastStudyDate === yesterday.toDateString();
      const newStreak = wasYesterday || prev.lastStudyDate === today
        ? prev.streak + (prev.lastStudyDate !== today ? 1 : 0)
        : 1;

      return {
        ...prev,
        streak: newStreak,
        lastStudyDate: today,
        totalFlowers: prev.totalFlowers + 1,
        totalSessions: prev.totalSessions + 1,
        totalMinutes: prev.totalMinutes + minutes,
        todaySessions: prev.todaySessions + 1,
        todayMinutes: prev.todayMinutes + minutes,
        garden: [...prev.garden, flower],
      };
    });

    return flower;
  }

  function resetForTomorrow() {
    setData(prev => ({
      ...prev,
      todaySessions: 0,
      todayMinutes: 0,
      garden: [],
    }));
  }

  function getNextFlower() {
    return FLOWERS[data.totalFlowers % FLOWERS.length];
  }

  function fmtMinutes(m) {
    if (m < 60) return `${m}m`;
    return `${Math.floor(m / 60)}h ${m % 60 > 0 ? m % 60 + 'm' : ''}`.trim();
  }

  return { ...data, completeSession, resetForTomorrow, getNextFlower, fmtMinutes };
}
