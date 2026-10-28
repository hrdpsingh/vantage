import React, { useState, useMemo } from 'react';
import { GitCommit, Copy, Check, ExternalLink, Search, User, Calendar, GitBranch } from 'lucide-react';
import { GitHubCommit, GitHubRepo, GitHubContributor, WeeklyCommitActivity } from '../types/github';
import { formatRelativeTime, formatDateTime } from '../utils/formatters';
import { CommitBarChart } from './CommitBarChart';
import { CommitHeatmap } from './CommitHeatmap';

interface CommitsTabProps {
  commits: GitHubCommit[];
  repo: GitHubRepo;
  loading: boolean;
  contributors?: GitHubContributor[];
  commitActivity?: WeeklyCommitActivity[] | null;
  punchCard?: [number, number, number][] | null;
}

export const CommitsTab: React.FC<CommitsTabProps> = ({
  commits,
  repo,
  loading,
  contributors = [],
  commitActivity = null,
  punchCard = null,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  // Author breakdown
  const authorCounts = useMemo(() => {
    const map = new Map<string, { count: number; avatar?: string }>();
    commits.forEach((c) => {
      const name = c.author?.login || c.commit.author.name || 'Anonymous';
      const existing = map.get(name);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(name, {
          count: 1,
          avatar: c.author?.avatar_url,
        });
      }
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [commits]);

  // Filtered commits
  const filteredCommits = useMemo(() => {
    return commits.filter((c) => {
      const authorName = c.author?.login || c.commit.author.name;
      const matchesAuthor =
        selectedAuthor === 'all' || authorName.toLowerCase() === selectedAuthor.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        c.commit.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.sha.toLowerCase().includes(searchQuery.toLowerCase()) ||
        authorName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesAuthor && matchesSearch;
    });
  }, [commits, selectedAuthor, searchQuery]);

  const copySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Activity Heatmap */}
      <CommitHeatmap
        commits={commits}
        commitActivity={commitActivity}
        punchCard={punchCard}
      />

      {/* Velocity Bar Chart */}
      <CommitBarChart
        commits={commits}
        contributors={contributors}
        commitActivity={commitActivity}
      />

      {/* Top Filter & Velocity Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Recent Commits
              <span className="text-xs font-mono tabular-nums text-slate-400 font-normal">
                ({commits.length} loaded from {repo.default_branch})
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Activity log and push telemetry on default branch
            </p>
          </div>
        </div>

        {/* Search & Author Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter commit message or SHA..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {authorCounts.length > 1 && (
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Authors ({commits.length})</option>
              {authorCounts.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name} ({a.count})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Author distribution strip */}
      {authorCounts.length > 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-3 block">
            Recent Committers ({authorCounts.length})
          </span>
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {authorCounts.slice(0, 8).map((author) => (
              <button
                key={author.name}
                onClick={() =>
                  setSelectedAuthor(selectedAuthor === author.name ? 'all' : author.name)
                }
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-colors ${
                  selectedAuthor === author.name
                    ? 'bg-indigo-950/60 border-indigo-700 text-indigo-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {author.avatar ? (
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-4 h-4 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{author.name}</span>
                <span className="font-mono tabular-nums text-slate-500 text-[11px]">
                  {author.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Commit List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800/60 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCommits.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No commits matching your filter criteria.
          </div>
        ) : (
          filteredCommits.map((item) => {
            const authorName = item.author?.login || item.commit.author.name || 'Anonymous';
            const authorAvatar = item.author?.avatar_url;
            const lines = item.commit.message.split('\n');
            const title = lines[0];
            const body = lines.slice(1).join('\n').trim();
            const isCopied = copiedSha === item.sha;

            return (
              <div
                key={item.sha}
                className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {authorAvatar ? (
                    <img
                      src={authorAvatar}
                      alt={authorName}
                      className="w-8 h-8 rounded-full border border-slate-700 bg-slate-950 shrink-0 mt-0.5 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}

                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors break-words">
                      {title}
                    </p>
                    {body && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 font-mono whitespace-pre-wrap">
                        {body}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                      <span className="text-slate-300 font-medium">{authorName}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span title={formatDateTime(item.commit.author.date)}>
                        committed {formatRelativeTime(item.commit.author.date)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SHA & GitHub Link */}
                <div className="flex items-center gap-2 self-start sm:self-center shrink-0 pl-11 sm:pl-0">
                  <button
                    type="button"
                    onClick={() => copySha(item.sha)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[11px] text-slate-300 hover:text-white transition-colors"
                    title="Copy full commit SHA"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>{item.sha.substring(0, 7)}</span>
                      </>
                    )}
                  </button>

                  <a
                    href={item.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                    title="View commit on GitHub"
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
