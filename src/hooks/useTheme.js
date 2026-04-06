import { useState, useEffect } from 'react';

export function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('begin_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('begin_theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('begin_theme', 'light');
    }
  }, [dark]);

  const toggle = () => setDark(d => !d);

  return { dark, toggle };
}
