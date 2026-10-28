import React, { useState } from 'react';
import {
  Search,
  Star,
  ArrowRight,
  Clock,
  Sparkles,
  Key,
  Layers,
  History,
} from 'lucide-react';
import { formatNumber, getLanguageColor } from '../utils/formatters';

interface InitialLaunchViewProps {
  onSelectRepo: (owner: string, repo: string) => void;
  recentRepos: string[];
  onOpenToken: () => void;
}

const FEATURED_PROJECTS = [
  { owner: 'facebook', repo: 'react', name: 'React', desc: 'The library for web and native user interfaces', lang: 'JavaScript', stars: 224000 },
  { owner: 'vercel', repo: 'next.js', name: 'Next.js', desc: 'The React Framework for the Web', lang: 'JavaScript', stars: 122000 },
  { owner: 'tailwindlabs', repo: 'tailwindcss', name: 'Tailwind CSS', desc: 'A utility-first CSS framework for rapid UI development', lang: 'TypeScript', stars: 84000 },
  { owner: 'torvalds', repo: 'linux', name: 'Linux Kernel', desc: 'Linux kernel source tree', lang: 'C', stars: 175000 },
  { owner: 'astral-sh', repo: 'uv', name: 'uv', desc: 'An extremely fast Python package and project manager in Rust', lang: 'Rust', stars: 45000 },
  { owner: 'oven-sh', repo: 'bun', name: 'Bun', desc: 'Incredibly fast JavaScript runtime, bundler, test runner, and package manager', lang: 'Zig', stars: 73000 },
  { owner: 'vuejs', repo: 'core', name: 'Vue Core', desc: 'Progressive JavaScript Framework core monorepo', lang: 'TypeScript', stars: 46000 },
  { owner: 'golang', repo: 'go', name: 'Go', desc: 'The Go programming language', lang: 'Go', stars: 125000 },
];

export const InitialLaunchView: React.FC<InitialLaunchViewProps> = ({
  onSelectRepo,
  recentRepos,
  onOpenToken,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputVal.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '');
    const parts = clean.split('/').filter(Boolean);
    if (parts.length >= 2) {
      setInputError(null);
      onSelectRepo(parts[0], parts[1]);
    } else {
      setInputError('Please enter in owner/repo format (e.g. facebook/react)');
    }
  };

  const handleQuickSelect = (fullName: string) => {
    const parts = fullName.split('/');
    if (parts.length === 2) {
      onSelectRepo(parts[0], parts[1]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-10">
      {/* Hero Welcome */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-1">
          <Layers className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Inspect Any GitHub Repository
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Enter an open-source repository or pick a featured project below to generate an interactive intelligence dossier with commit heatmaps, velocity charts, and health metrics.
        </p>
      </div>

      {/* Main Search Input Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-sm dark:shadow-lg focus-within:border-indigo-500/80 transition-colors">
          <div className="flex items-center gap-3 px-3 py-2 flex-1 min-w-0">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder="e.g. facebook/react or https://github.com/vercel/next.js"
              className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
          >
            <span>Inspect Repository</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {inputError && (
          <p className="text-xs text-rose-500 dark:text-rose-400 text-center font-mono">{inputError}</p>
        )}
      </form>

      {/* Recent Repositories */}
      {recentRepos.length > 0 && (
        <div className="space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            Recently Inspected Repositories
          </span>
          <div className="flex flex-wrap gap-2">
            {recentRepos.slice(0, 6).map((fullName) => (
              <button
                key={fullName}
                type="button"
                onClick={() => handleQuickSelect(fullName)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 group shadow-xs"
              >
                <span>{fullName}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Featured Projects Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            Featured Open-Source Repositories
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-500">1-click inspect</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURED_PROJECTS.map((proj) => (
            <button
              key={`${proj.owner}/${proj.repo}`}
              type="button"
              onClick={() => onSelectRepo(proj.owner, proj.repo)}
              className="text-left p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-850 transition-all space-y-2 group shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors truncate">
                  {proj.owner}/{proj.repo}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                  <Star className="w-3 h-3 text-amber-500 dark:text-amber-400 fill-amber-500/20" />
                  {formatNumber(proj.stars)}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {proj.desc}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: getLanguageColor(proj.lang) }}
                />
                <span>{proj.lang}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* API Rate Limit Notice Box */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Key className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
          <span>
            GitHub API permits 60 anonymous requests/hr. Add a Personal Access Token to increase your limit to 5,000 requests/hr.
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenToken}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline whitespace-nowrap shrink-0 font-medium"
        >
          Configure Token →
        </button>
      </div>
    </div>
  );
};
