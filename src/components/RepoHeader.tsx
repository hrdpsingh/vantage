import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Globe,
  GitBranch,
  Scale,
  Star,
  GitFork,
  Eye,
  Archive,
  Terminal,
} from 'lucide-react';
import { GitHubRepo } from '../types/github';
import { formatNumber, formatRelativeTime } from '../utils/formatters';

interface RepoHeaderProps {
  repo: GitHubRepo;
  onTopicClick?: (topic: string) => void;
}

export const RepoHeader: React.FC<RepoHeaderProps> = ({ repo, onTopicClick }) => {
  const [copiedClone, setCopiedClone] = useState(false);
  const [cloneProtocol, setCloneProtocol] = useState<'https' | 'ssh'>('https');

  const cloneCommand =
    cloneProtocol === 'https'
      ? `git clone ${repo.clone_url}`
      : `git clone ${repo.ssh_url || `git@github.com:${repo.full_name}.git`}`;

  const copyCloneCmd = () => {
    navigator.clipboard.writeText(cloneCommand);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 pt-6 pb-6 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Top identity row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <img
              src={repo.owner.avatar_url}
              alt={repo.owner.login}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-950 shrink-0 object-cover shadow-sm"
            />
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={repo.owner.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors text-base"
                >
                  {repo.owner.login}
                </a>
                <span className="text-slate-400 dark:text-slate-600">/</span>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate"
                >
                  {repo.name}
                </a>
                {repo.archived && (
                  <span className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded">
                    <Archive className="w-3 h-3" /> Archived
                  </span>
                )}
                {repo.is_template && (
                  <span className="text-xs text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded">
                    Template
                  </span>
                )}
              </div>

              {/* Zero-Pill Unboxed Metadata Line with typographic separators */}
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                <span className="text-slate-800 dark:text-slate-300 font-medium">{repo.visibility === 'public' ? 'Public' : 'Private'}</span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                {repo.license ? (
                  <span className="flex items-center gap-1 text-slate-800 dark:text-slate-300">
                    <Scale className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    {repo.license.spdx_id || repo.license.name}
                  </span>
                ) : (
                  <span>No license specified</span>
                )}
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="font-mono text-slate-800 dark:text-slate-300">{repo.default_branch}</span>
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                <span>Updated {formatRelativeTime(repo.pushed_at || repo.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Quick External Actions & Clone snippet */}
          <div className="flex flex-wrap items-center gap-2 self-start">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <span>View on GitHub</span>
              <ExternalLink className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            </a>

            {/* Clone snippet popover / button */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs font-mono overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setCloneProtocol(cloneProtocol === 'https' ? 'ssh' : 'https')}
                className="px-2 py-1.5 text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-200 dark:bg-slate-900 border-r border-slate-300 dark:border-slate-800 transition-colors uppercase"
                title="Toggle HTTPS/SSH"
              >
                {cloneProtocol}
              </button>
              <div className="px-2.5 py-1.5 text-slate-700 dark:text-slate-400 hidden lg:block truncate max-w-[220px]">
                {cloneCommand}
              </div>
              <button
                type="button"
                onClick={copyCloneCmd}
                className="px-2.5 py-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                title="Copy git clone command"
              >
                {copiedClone ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-sans">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                    <span className="text-[11px] font-sans">Clone</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Description & Website */}
        {repo.description && (
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl">
            {repo.description}
          </p>
        )}

        {repo.homepage && (
          <div className="flex items-center gap-1.5 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <a
              href={repo.homepage.startsWith('http') ? repo.homepage : `https://${repo.homepage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline truncate"
            >
              {repo.homepage}
            </a>
          </div>
        )}

        {/* Topics (Functional Buttons for Interactive Filter/Search) */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {repo.topics.map((topic) => (
              <button
                key={topic}
                onClick={() => onTopicClick?.(topic)}
                className="px-2.5 py-1 text-xs font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/40 rounded-md transition-colors shadow-xs"
              >
                #{topic}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
