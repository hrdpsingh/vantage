import React, { useState, useMemo } from 'react';
import {
  Star,
  GitFork,
  AlertCircle,
  HardDrive,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Copy,
  Check,
  Code,
  Flame,
  Calendar,
  Layers,
  MessageSquare,
  Globe,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  GitHubRepo,
  RepoLanguages,
  CommunityProfile,
  GitHubCommit,
  GitHubContributor,
  WeeklyCommitActivity,
} from '../types/github';
import {
  formatNumber,
  formatExactNumber,
  formatRepoSize,
  formatDate,
  formatRelativeTime,
  calculateLanguagePercentages,
  formatBytes,
} from '../utils/formatters';
import { CommitBarChart } from './CommitBarChart';
import { CommitHeatmap } from './CommitHeatmap';

interface OverviewTabProps {
  repo: GitHubRepo;
  languages: RepoLanguages;
  communityProfile: CommunityProfile | null;
  commits: GitHubCommit[];
  contributors: GitHubContributor[];
  commitActivity: WeeklyCommitActivity[] | null;
  punchCard: [number, number, number][] | null;
  onSelectTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  repo,
  languages,
  communityProfile,
  commits,
  contributors,
  commitActivity,
  punchCard,
  onSelectTab,
}) => {
  const langPercentages = useMemo(() => calculateLanguagePercentages(languages), [languages]);

  // Activity calculation
  const lastPushDate = repo.pushed_at ? new Date(repo.pushed_at) : null;
  const daysSincePush = lastPushDate
    ? Math.floor((Date.now() - lastPushDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      {/* 4-6 Primary Metric Grid with Tabular Figures */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs mb-1.5">
            <span>Stars</span>
            <Star className="w-4 h-4 text-amber-500 dark:text-amber-400 fill-amber-500/20" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {formatNumber(repo.stargazers_count)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5">
            {formatExactNumber(repo.stargazers_count)} total
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs mb-1.5">
            <span>Forks</span>
            <GitFork className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {formatNumber(repo.forks_count)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5">
            {formatExactNumber(repo.forks_count)} forks
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs mb-1.5">
            <span>Open Issues & PRs</span>
            <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {formatNumber(repo.open_issues_count)}
          </div>
          <button
            onClick={() => onSelectTab('issues')}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline mt-0.5 inline-block text-left font-medium"
          >
            Inspect issues →
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs mb-1.5">
            <span>Watchers</span>
            <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {formatNumber(repo.subscribers_count ?? repo.watchers_count)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5">
            Subscribers
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs mb-1.5">
            <span>Repo Size</span>
            <HardDrive className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {formatRepoSize(repo.size)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5">
            {formatExactNumber(repo.size)} KB
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs mb-1.5">
            <span>Health Standard</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {communityProfile?.health_percentage ?? 85}%
          </div>
          <button
            onClick={() => onSelectTab('contributors')}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline mt-0.5 inline-block text-left font-medium"
          >
            View standards →
          </button>
        </div>
      </div>

      {/* Visual Analytics: Commit Density Heatmap */}
      <CommitHeatmap
        commits={commits}
        commitActivity={commitActivity}
        punchCard={punchCard}
      />

      {/* Visual Analytics: Commit Velocity Bar Chart */}
      <CommitBarChart
        commits={commits}
        contributors={contributors}
        commitActivity={commitActivity}
      />

      {/* Two-column layout: Language Stack on Left, Pulse & Features on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Language Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              Language Distribution
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {langPercentages.length} languages detected
            </span>
          </div>

          {/* Stacked color bar */}
          {langPercentages.length > 0 ? (
            <div className="space-y-4">
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden flex shadow-inner">
                {langPercentages.map((lang) => (
                  <div
                    key={lang.name}
                    style={{
                      width: `${lang.percentage}%`,
                      backgroundColor: lang.color,
                    }}
                    title={`${lang.name}: ${lang.percentage}% (${formatBytes(lang.bytes)})`}
                    className="h-full transition-all duration-300 hover:brightness-110"
                  />
                ))}
              </div>

              {/* Languages Table / Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4 pt-1">
                {langPercentages.slice(0, 9).map((lang) => (
                  <div key={lang.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: lang.color }}
                      />
                      <span className="text-slate-700 dark:text-slate-300 truncate">{lang.name}</span>
                    </span>
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400 pl-2">
                      {lang.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
              No language data available or binary repository.
            </div>
          )}
        </div>

        {/* Pulse & Repository Architecture */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            Repository Pulse
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Last Push
              </span>
              <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                {formatRelativeTime(repo.pushed_at)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Created On
              </span>
              <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                {formatDate(repo.created_at)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Default Branch
              </span>
              <span className="font-mono text-indigo-600 dark:text-indigo-300 font-medium">
                {repo.default_branch}
              </span>
            </div>

            <div className="pt-2 space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
                Features Enabled
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  {repo.has_issues ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                  )}
                  <span>Issues</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  {repo.has_discussions ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                  )}
                  <span>Discussions</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  {repo.has_wiki ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                  )}
                  <span>Wiki</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  {repo.has_pages ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                  )}
                  <span>GitHub Pages</span>
                </div>
              </div>
            </div>

            {/* Quick documentation jump */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <a
                href={`${repo.html_url}#readme`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors group shadow-xs"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                  <span>Repository README</span>
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                  GitHub ↗
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
