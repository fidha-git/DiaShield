import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MENU_ITEMS = [
  { label: 'Dashboard',       path: '/dashboard',    icon: 'dashboard' },
  { label: 'Profile',         path: '/profile',      icon: 'person' },
  { label: 'Medical History', path: '/history',      icon: 'history' },
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
    console.log(`Navigating to /history → ${item.path} (${item.label})`);
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
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none select-none">
        search
      </span>

      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => query.trim() && setOpen(true)}
        placeholder={placeholder}
        className="w-full bg-surface-container-high border border-white/10 rounded-lg pl-10 pr-8 py-2 text-body-sm text-on-surface focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all placeholder:text-on-surface-variant/50 outline-none"
      />

      {/* Clear button */}
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
          tabIndex={-1}
          aria-label="Clear search"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl overflow-hidden shadow-xl border border-white/10 bg-[#0A122F]">
          {results.length > 0 ? (
            <ul>
              {results.map(item => (
                <li key={item.path}>
                  <button
                    onMouseDown={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-white hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-cyan-400/70">
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-400">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}
