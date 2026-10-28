import React, { useState, useEffect, useRef } from 'react';
import { Search, X, History, Star, ArrowRight, Sparkles, BookOpen, Clock } from 'lucide-react';
import { searchRepositories } from '../services/githubApi';
import { GitHubRepo } from '../types/github';
import { formatNumber, getLanguageColor } from '../utils/formatters';

interface RepoSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRepo: (owner: string, repo: string) => void;
  recentRepos: string[];
  onClearRecent: () => void;
}

const CURATED_REPOS = [
  { owner: 'facebook', repo: 'react', desc: 'The library for web and native user interfaces', lang: 'JavaScript', stars: 224000 },
  { owner: 'vercel', repo: 'next.js', desc: 'The React Framework for the Web', lang: 'JavaScript', stars: 122000 },
  { owner: 'tailwindlabs', repo: 'tailwindcss', desc: 'A utility-first CSS framework for rapid UI development', lang: 'TypeScript', stars: 84000 },
  { owner: 'torvalds', repo: 'linux', desc: 'Linux kernel source tree', lang: 'C', stars: 175000 },
  { owner: 'astral-sh', repo: 'uv', desc: 'An extremely fast Python package and project manager in Rust', lang: 'Rust', stars: 45000 },
  { owner: 'shadcn-ui', repo: 'ui', desc: 'Beautifully designed components that you can copy and paste', lang: 'TypeScript', stars: 74000 },
  { owner: 'vuejs', repo: 'core', desc: 'Progressive JavaScript Framework core monorepo', lang: 'TypeScript', stars: 46000 },
  { owner: 'golang', repo: 'go', desc: 'The Go programming language', lang: 'Go', stars: 125000 },
];

export const RepoSearchModal: React.FC<RepoSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectRepo,
  recentRepos,
  onClearRecent,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setError(null);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    // If query contains a slash, user might be typing owner/repo directly
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchRepositories(query.trim());
        setResults(data.items || []);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Search failed';
        setError(message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '');
    const parts = clean.split('/').filter(Boolean);
    if (parts.length >= 2) {
      onSelectRepo(parts[0], parts[1]);
      onClose();
    }
  };

  const handleSelect = (fullName: string) => {
    const parts = fullName.split('/');
    if (parts.length === 2) {
      onSelectRepo(parts[0], parts[1]);
      onClose();
    }
  };

  const isDirectOwnerRepo = query.trim().includes('/') && query.trim().split('/').filter(Boolean).length === 2;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full text-slate-800 dark:text-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-colors">
        {/* Search Input Bar */}
        <form onSubmit={handleDirectSubmit} className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search repository or type 'owner/repo' (e.g. facebook/react)"
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Esc
          </button>
        </form>

        {/* Content list */}
        <div className="overflow-y-auto p-4 space-y-6 flex-1">
          {/* Direct match banner */}
          {isDirectOwnerRepo && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 rounded-lg flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs text-indigo-900 dark:text-indigo-200">
                  Open repository: <strong className="text-slate-900 dark:text-white font-mono">{query.trim()}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleSelect(query.trim())}
                className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors flex items-center gap-1 shadow-xs"
              >
                Inspect <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Search results */}
          {loading && (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              Searching GitHub repositories...
            </div>
          )}

          {error && !loading && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Search Results ({results.length})</div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950/40 shadow-xs">
                {results.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.full_name)}
                    className="w-full text-left p-3 hover:bg-white dark:hover:bg-slate-800/60 transition-colors flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors truncate">
                        {item.full_name}
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{item.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                        {item.language && (
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getLanguageColor(item.language) }}
                            />
                            {item.language}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 dark:text-amber-400 fill-amber-500/20" />
                          <span className="font-mono tabular-nums">{formatNumber(item.stargazers_count)}</span>
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300 shrink-0 mt-1 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent searches */}
          {recentRepos.length > 0 && results.length === 0 && !loading && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Recent Repositories
                </span>
                <button
                  onClick={onClearRecent}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
                >
                  Clear History
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recentRepos.map((fullName) => (
                  <button
                    key={fullName}
                    onClick={() => handleSelect(fullName)}
                    className="text-left px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group shadow-xs"
                  >
                    <span className="text-xs font-mono text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 truncate">
                      {fullName}
                    </span>
                    <History className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Curated Popular Repositories */}
          {results.length === 0 && !loading && (
            <div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Popular Repositories
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CURATED_REPOS.map((item) => (
                  <button
                    key={`${item.owner}/${item.repo}`}
                    onClick={() => handleSelect(`${item.owner}/${item.repo}`)}
                    className="text-left p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors space-y-1 group shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                        {item.owner}/{item.repo}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        <Star className="w-3 h-3 text-amber-500 dark:text-amber-400 fill-amber-500/20" />
                        {formatNumber(item.stars)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{item.desc}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: getLanguageColor(item.lang) }}
                      />
                      <span>{item.lang}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
