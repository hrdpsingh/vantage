import React, { useState, useEffect } from 'react';
import { Search, Key, GitCompare, Download, Activity, Sun, Moon } from 'lucide-react';
import { subscribeRateLimit, getCurrentRateLimit, getStoredToken } from '../services/githubApi';
import { RateLimitInfo } from '../types/github';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentRepo: string;
  onOpenSearch: () => void;
  onOpenToken: () => void;
  onOpenCompare: () => void;
  onOpenExport: () => void;
  onQuickSelect: (owner: string, repo: string) => void;
  onResetHome?: () => void;
}

const QUICK_PRESETS = [
  { label: 'React', owner: 'facebook', repo: 'react' },
  { label: 'Next.js', owner: 'vercel', repo: 'next.js' },
  { label: 'Tailwind', owner: 'tailwindlabs', repo: 'tailwindcss' },
  { label: 'Linux', owner: 'torvalds', repo: 'linux' },
  { label: 'uv', owner: 'astral-sh', repo: 'uv' },
];

export const Header: React.FC<HeaderProps> = ({
  currentRepo,
  onOpenSearch,
  onOpenToken,
  onOpenCompare,
  onOpenExport,
  onQuickSelect,
  onResetHome,
}) => {
  const [rateLimit, setRateLimit] = useState<RateLimitInfo>(getCurrentRateLimit());
  const hasCustomToken = Boolean(getStoredToken());
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    return subscribeRateLimit((info) => {
      setRateLimit(info);
    });
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Single element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Activity className="w-4 h-4" />
          </div>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (onResetHome) {
                onResetHome();
              } else {
                onOpenSearch();
              }
            }}
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Vantage
          </a>
        </div>

        {/* Zone 2: 4-5 clean single-line text presets */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium whitespace-nowrap">
          <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Popular:</span>
          {QUICK_PRESETS.map((preset) => {
            const isActive = currentRepo.toLowerCase() === `${preset.owner}/${preset.repo}`.toLowerCase();
            return (
              <button
                key={preset.label}
                onClick={() => onQuickSelect(preset.owner, preset.repo)}
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick search input trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="Search or enter repository"
          >
            <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Search repo</span>
          </button>

          {/* Compare button */}
          <button
            onClick={onOpenCompare}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="Compare with another repository"
          >
            <GitCompare className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Compare</span>
          </button>

          {/* Export button */}
          <button
            onClick={onOpenExport}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="Export repository report"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export</span>
          </button>

          {/* Rate limit status & Token modal trigger */}
          <button
            onClick={onOpenToken}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono tabular-nums rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              hasCustomToken
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60'
                : rateLimit.remaining <= 10
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800/60'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title={`GitHub API Rate Limit: ${rateLimit.remaining}/${rateLimit.limit} remaining. Click to configure API token.`}
          >
            <Key className="w-3 h-3 text-slate-400" />
            <span>{rateLimit.remaining}/{rateLimit.limit}</span>
          </button>

          {/* Theme switcher toggle button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors shrink-0"
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

