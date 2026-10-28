import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  GitPullRequest,
  Search,
  MessageSquare,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { GitHubIssue, GitHubRepo } from '../types/github';
import { formatRelativeTime } from '../utils/formatters';

interface IssuesTabProps {
  issues: GitHubIssue[];
  repo: GitHubRepo;
  loading: boolean;
}

export const IssuesTab: React.FC<IssuesTabProps> = ({ issues, repo, loading }) => {
  const [typeFilter, setTypeFilter] = useState<'all' | 'issues' | 'pulls'>('all');
  const [stateFilter, setStateFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string>('all');

  // Extract all unique labels
  const allLabels = useMemo(() => {
    const map = new Map<string, { color: string; count: number }>();
    issues.forEach((item) => {
      item.labels.forEach((l) => {
        const existing = map.get(l.name);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(l.name, { color: l.color, count: 1 });
        }
      });
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [issues]);

  const filteredItems = useMemo(() => {
    return issues.filter((item) => {
      const isPR = Boolean(item.pull_request);
      if (typeFilter === 'issues' && isPR) return false;
      if (typeFilter === 'pulls' && !isPR) return false;

      if (stateFilter !== 'all' && item.state !== stateFilter) return false;

      if (selectedLabel !== 'all' && !item.labels.some((l) => l.name === selectedLabel)) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNum = item.number.toString().includes(q);
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesAuthor = item.user?.login.toLowerCase().includes(q);
        if (!matchesNum && !matchesTitle && !matchesAuthor) return false;
      }

      return true;
    });
  }, [issues, typeFilter, stateFilter, searchQuery, selectedLabel]);

  // Counts
  const issueCounts = useMemo(() => {
    let openCount = 0;
    let closedCount = 0;
    let prCount = 0;
    issues.forEach((i) => {
      if (i.pull_request) prCount++;
      if (i.state === 'open') openCount++;
      else closedCount++;
    });
    return { openCount, closedCount, prCount };
  }, [issues]);

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segmented Type Tabs (functional interactive controls) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All Activity ({issues.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('issues')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                typeFilter === 'issues'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Issues ({issues.length - issueCounts.prCount})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('pulls')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                typeFilter === 'pulls'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Pull Requests ({issueCounts.prCount})
            </button>
          </div>

          {/* State Filter Buttons */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setStateFilter(stateFilter === 'open' ? 'all' : 'open')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors shadow-xs ${
                stateFilter === 'open'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Open ({issueCounts.openCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setStateFilter(stateFilter === 'closed' ? 'all' : 'closed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors shadow-xs ${
                stateFilter === 'closed'
                  ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Closed ({issueCounts.closedCount})</span>
            </button>
          </div>
        </div>

        {/* Search & Label filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, #number, or author..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {allLabels.length > 0 && (
            <select
              value={selectedLabel}
              onChange={(e) => setSelectedLabel(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-300 focus:outline-hidden focus:border-indigo-500 max-w-xs shadow-xs"
            >
              <option value="all">All Labels ({allLabels.length})</option>
              {allLabels.slice(0, 20).map((l) => (
                <option key={l.name} value={l.name}>
                  {l.name} ({l.count})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80 shadow-xs transition-colors">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 mt-1" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                  <div className="h-3 bg-slate-200/60 dark:bg-slate-800/60 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
            No issues or pull requests matching your filters.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isPR = Boolean(item.pull_request);
            const isOpen = item.state === 'open';

            return (
              <div
                key={item.id}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-4 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Status Icon */}
                  <div className="mt-1 shrink-0">
                    {isPR ? (
                      <GitPullRequest
                        className={`w-4 h-4 ${isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400'}`}
                      />
                    ) : (
                      <AlertCircle
                        className={`w-4 h-4 ${isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400'}`}
                      />
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={item.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {item.title}
                      </a>

                      {/* Labels */}
                      {item.labels.map((label) => (
                        <span
                          key={label.id}
                          style={{
                            backgroundColor: `#${label.color}20`,
                            color: `#${label.color}`,
                            borderColor: `#${label.color}40`,
                          }}
                          className="px-2 py-0.5 rounded text-[11px] font-medium border font-mono"
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>

                    {/* Metadata line */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="font-mono text-slate-400 dark:text-slate-500">#{item.number}</span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                      <span>
                        opened {formatRelativeTime(item.created_at)} by{' '}
                        <strong className="text-slate-700 dark:text-slate-300 font-normal">
                          {item.user?.login || 'ghost'}
                        </strong>
                      </span>
                      {item.closed_at && (
                        <>
                          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                          <span>closed {formatRelativeTime(item.closed_at)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comments & External Link */}
                <div className="flex items-center gap-3 shrink-0">
                  {item.comments > 0 && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>{item.comments}</span>
                    </div>
                  )}

                  <a
                    href={item.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    title="View on GitHub"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
