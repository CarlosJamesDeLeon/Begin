import { useState, useEffect } from 'react';

const PREFS_KEY = 'begin_prefs';

export const DEFAULTS = {
  name: '',
  avatarColor: '#6B7FD4',
  currency: '₱',
  currencyLocale: 'en-PH',
  gpaScale: '4.0', // '4.0' | 'philippine'
};

export const CURRENCY_OPTIONS = [
  { symbol: '₱', locale: 'en-PH',  label: 'PHP – Philippine Peso' },
  { symbol: '$', locale: 'en-US',  label: 'USD – US Dollar' },
  { symbol: '€', locale: 'de-DE',  label: 'EUR – Euro' },
  { symbol: '£', locale: 'en-GB',  label: 'GBP – British Pound' },
  { symbol: '¥', locale: 'ja-JP',  label: 'JPY – Japanese Yen' },
  { symbol: '₩', locale: 'ko-KR',  label: 'KRW – Korean Won' },
];

export const AVATAR_COLORS = [
  '#6B7FD4', '#5DAA88', '#E2A95B', '#C47DB8',
  '#E05858', '#4EADD4', '#8B7FD4', '#5A8A6A',
];

export function usePrefsStore() {
  const [prefs, setPrefs] = useState(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const update = (updates) => setPrefs(p => ({ ...p, ...updates }));

  const exportAllData = () => {
    const allData = {};
    ['begin_goals', 'begin_finance', 'begin_study', 'begin_notebooks', 'begin_notes', PREFS_KEY].forEach(key => {
      const raw = localStorage.getItem(key);
      if (raw) allData[key] = JSON.parse(raw);
    });
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `begin-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    ['begin_goals', 'begin_finance', 'begin_study', 'begin_notebooks', 'begin_notes'].forEach(key => {
      localStorage.removeItem(key);
    });
    window.location.reload();
  };

  return { ...prefs, update, exportAllData, clearAllData };
}
