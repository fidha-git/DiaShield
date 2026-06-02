import React, { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Light theme is default for consistent portal appearance.
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-sky-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-700/50 hover:shadow-md hover:shadow-sky-500/5 transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm relative group"
      aria-label="Toggle Theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <span className="material-symbols-outlined text-[20px] transition-transform duration-500 group-hover:rotate-90">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}
