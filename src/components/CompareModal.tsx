import React, { useState } from 'react';
import {
  GitCompare,
  X,
  Search,
  Star,
  GitFork,
  AlertCircle,
  HardDrive,
  Scale,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { GitHubRepo } from '../types/github';
import { fetchRepository } from '../services/githubApi';
import {
  formatNumber,
  formatExactNumber,
  formatRepoSize,
  formatDate,
  formatRelativeTime,
  getLanguageColor,
} from '../utils/formatters';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseRepo: GitHubRepo;
  onSwitchRepo: (owner: string, repo: string) => void;
}

const POPULAR_COMPARE_TARGETS = [
  'facebook/react',
  'vuejs/core',
  'sveltejs/svelte',
  'vercel/next.js',
  'tailwindlabs/tailwindcss',
  'astral-sh/uv',
  'oven-sh/bun',
];

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  baseRepo,
  onSwitchRepo,
}) => {
  const [targetInput, setTargetInput] = useState('');
  const [targetRepo, setTargetRepo] = useState<GitHubRepo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFetchTarget = async (query: string) => {
    const clean = query.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '');
    const parts = clean.split('/').filter(Boolean);
    if (parts.length < 2) {
      setError('Enter in format owner/repo (e.g. vuejs/core)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchRepository(parts[0], parts[1]);
      setTargetRepo(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch repository';
      setError(msg);
      setTargetRepo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetInput.trim()) {
      handleFetchTarget(targetInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full p-6 text-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors p-1"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Repository Comparison</h2>
            <p className="text-xs text-slate-400">
              Benchmark <span className="font-mono text-indigo-300 font-medium">{baseRepo.full_name}</span> against any peer repository
            </p>
          </div>
        </div>

        {/* Target search form */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                placeholder="Enter target repository (e.g. vuejs/core, vercel/next.js)"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !targetInput.trim()}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
            >
              {loading ? 'Fetching...' : 'Compare'}
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-400">
            <span>Quick picks:</span>
            {POPULAR_COMPARE_TARGETS.filter((t) => t.toLowerCase() !== baseRepo.full_name.toLowerCase()).slice(0, 5).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setTargetInput(preset);
                  handleFetchTarget(preset);
                }}
                className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors font-mono text-[11px]"
              >
                {preset}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-xs text-rose-300">
              {error}
            </div>
          )}
        </form>

        {/* Comparison Grid */}
        {targetRepo && (
          <div className="space-y-6">
            {/* Headers row */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <img
                    src={baseRepo.owner.avatar_url}
                    alt={baseRepo.owner.login}
                    className="w-6 h-6 rounded-md object-cover border border-slate-700"
                  />
                  <span className="font-bold text-white text-base truncate font-mono">
                    {baseRepo.full_name}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">{baseRepo.description}</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={targetRepo.owner.avatar_url}
                      alt={targetRepo.owner.login}
                      className="w-6 h-6 rounded-md object-cover border border-slate-700"
                    />
                    <span className="font-bold text-white text-base truncate font-mono">
                      {targetRepo.full_name}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const parts = targetRepo.full_name.split('/');
                      onSwitchRepo(parts[0], parts[1]);
                      onClose();
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">{targetRepo.description}</p>
              </div>
            </div>

            {/* Metrics Matrix */}
            <div className="space-y-2 text-xs">
              {/* Stars */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg grid grid-cols-3 items-center">
                <div className="font-medium text-slate-400 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400" /> Stars
                </div>
                <div className="font-mono tabular-nums text-slate-200">
                  {formatExactNumber(baseRepo.stargazers_count)}
                  {baseRepo.stargazers_count > targetRepo.stargazers_count && (
                    <span className="ml-2 text-[10px] text-emerald-400 font-sans font-semibold">▲ HIGHER</span>
                  )}
                </div>
                <div className="font-mono tabular-nums text-slate-200">
                  {formatExactNumber(targetRepo.stargazers_count)}
                  {targetRepo.stargazers_count > baseRepo.stargazers_count && (
                    <span className="ml-2 text-[10px] text-emerald-400 font-sans font-semibold">▲ HIGHER</span>
                  )}
                </div>
              </div>

              {/* Forks */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg grid grid-cols-3 items-center">
                <div className="font-medium text-slate-400 flex items-center gap-1.5">
                  <GitFork className="w-3.5 h-3.5 text-indigo-400" /> Forks
                </div>
                <div className="font-mono tabular-nums text-slate-200">
                  {formatExactNumber(baseRepo.forks_count)}
                  {baseRepo.forks_count > targetRepo.forks_count && (
                    <span className="ml-2 text-[10px] text-emerald-400 font-sans font-semibold">▲ HIGHER</span>
                  )}
                </div>
                <div className="font-mono tabular-nums text-slate-200">
                  {formatExactNumber(targetRepo.forks_count)}
                  {targetRepo.forks_count > baseRepo.forks_count && (
                    <span className="ml-2 text-[10px] text-emerald-400 font-sans font-semibold">▲ HIGHER</span>
                  )}
                </div>
              </div>

              {/* Open Issues */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg grid grid-cols-3 items-center">
                <div className="font-medium text-slate-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Open Issues
                </div>
                <div className="font-mono tabular-nums text-slate-200">
                  {formatExactNumber(baseRepo.open_issues_count)}
                </div>
                <div className="font-mono tabular-nums text-slate-200">
                  {formatExactNumber(targetRepo.open_issues_count)}
                </div>
              </div>

              {/* Repo Size */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg grid grid-cols-3 items-center">
                <div className="font-medium text-slate-400 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-violet-400" /> Disk Size
                </div>
                <div className="font-mono tabular-nums text-slate-200">
                  {formatRepoSize(baseRepo.size)}
                </div>
                <div className="font-mono tabular-nums text-slate-200">
                  {formatRepoSize(targetRepo.size)}
                </div>
              </div>

              {/* Primary Language */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg grid grid-cols-3 items-center">
                <div className="font-medium text-slate-400">Primary Language</div>
                <div className="flex items-center gap-1.5">
                  {baseRepo.language && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getLanguageColor(baseRepo.language) }}
                    />
                  )}
                  <span>{baseRepo.language || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {targetRepo.language && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getLanguageColor(targetRepo.language) }}
                    />
                  )}
                  <span>{targetRepo.language || 'N/A'}</span>
                </div>
              </div>

              {/* License */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg grid grid-cols-3 items-center">
                <div className="font-medium text-slate-400 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-slate-400" /> License
                </div>
                <div className="text-slate-200">
                  {baseRepo.license?.spdx_id || baseRepo.license?.name || 'None'}
                </div>
                <div className="text-slate-200">
                  {targetRepo.license?.spdx_id || targetRepo.license?.name || 'None'}
                </div>
              </div>

              {/* Created */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg grid grid-cols-3 items-center">
                <div className="font-medium text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Created Date
                </div>
                <div className="font-mono tabular-nums text-slate-200">
                  {formatDate(baseRepo.created_at)}
                </div>
                <div className="font-mono tabular-nums text-slate-200">
                  {formatDate(targetRepo.created_at)}
                </div>
              </div>

              {/* Last Push */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg grid grid-cols-3 items-center">
                <div className="font-medium text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Last Push
                </div>
                <div className="font-mono tabular-nums text-slate-200">
                  {formatRelativeTime(baseRepo.pushed_at)}
                </div>
                <div className="font-mono tabular-nums text-slate-200">
                  {formatRelativeTime(targetRepo.pushed_at)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
