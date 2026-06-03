import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MENU_ITEMS = [
  { label: 'Dashboard',       path: '/dashboard',    icon: 'dashboard' },
  { label: 'Profile',         path: '/profile',      icon: 'person' },
  { label: 'Health Timeline',  path: '/history',      icon: 'timeline' },
  { label: 'Health Records',  path: '/records',      icon: 'description' },
  { label: 'Predictions',     path: '/prediction',   icon: 'query_stats' },
  { label: 'Appointments',    path: '/appointments', icon: 'calendar_today' },
  { label: 'Chat Assistant',  path: '/chat',         icon: 'smart_toy' },
];

export default function SearchBar({ placeholder = 'Search records, appointments...' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  // Filter items case-insensitively
  const results = query.trim()
    ? MENU_ITEMS.filter(item =>
        item.label.toLowerCase().includes(query.trim().toLowerCase())
      )
    : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    setOpen(val.trim().length > 0);
  }

  function handleSelect(item) {
navigate(item.path);
    setQuery('');
    setOpen(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && results.length > 0) {
      handleSelect(results[0]);
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  function handleClear() {
    setQuery('');
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative w-full md:w-64">
      {/* Search icon */}
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none select-none">
        search
      </span>

      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => query.trim() && setOpen(true)}
        placeholder={placeholder}
        className="w-full bg-white dark:bg-slate-800/90 border border-sky-100 dark:border-slate-700 rounded-lg pl-10 pr-8 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none shadow-sm"
      />

      {/* Clear button */}
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          tabIndex={-1}
          aria-label="Clear search"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl overflow-hidden shadow-lg border border-sky-100 dark:border-slate-700 bg-white dark:bg-slate-800/95">
          {results.length > 0 ? (
            <ul>
              {results.map(item => (
                <li key={item.path}>
                  <button
                    onMouseDown={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-sky-500">
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-slate-400">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}
