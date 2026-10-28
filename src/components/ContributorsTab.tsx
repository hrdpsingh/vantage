import React from 'react';
import {
  Users,
  ExternalLink,
  Award,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  FileText,
  FileCode,
  BookOpen,
  HeartHandshake,
} from 'lucide-react';
import { GitHubContributor, CommunityProfile, GitHubRepo } from '../types/github';
import { formatNumber, formatExactNumber } from '../utils/formatters';

interface ContributorsTabProps {
  contributors: GitHubContributor[];
  communityProfile: CommunityProfile | null;
  repo: GitHubRepo;
  loading: boolean;
}

export const ContributorsTab: React.FC<ContributorsTabProps> = ({
  contributors,
  communityProfile,
  repo,
  loading,
}) => {
  const totalTopContributions = contributors.reduce((acc, curr) => acc + curr.contributions, 0);

  const standards = [
    {
      title: 'README File',
      desc: 'Project introduction and quickstart documentation',
      present: Boolean(communityProfile?.files.readme),
      url: communityProfile?.files.readme?.html_url || `${repo.html_url}#readme`,
      icon: FileText,
    },
    {
      title: 'Open Source License',
      desc: 'Terms of usage, modification, and distribution',
      present: Boolean(repo.license || communityProfile?.files.license),
      url: communityProfile?.files.license?.html_url || (repo.license?.url ?? undefined),
      icon: ShieldCheck,
    },
    {
      title: 'Contributing Guidelines',
      desc: 'Instructions on code style, testing, and submitting pull requests',
      present: Boolean(communityProfile?.files.contributing),
      url: communityProfile?.files.contributing?.html_url,
      icon: BookOpen,
    },
    {
      title: 'Code of Conduct',
      desc: 'Community standards, values, and pledge',
      present: Boolean(communityProfile?.files.code_of_conduct),
      url: communityProfile?.files.code_of_conduct?.html_url,
      icon: HeartHandshake,
    },
    {
      title: 'Issue Templates',
      desc: 'Standardized issue reporting forms for bugs and features',
      present: Boolean(communityProfile?.files.issue_template),
      url: communityProfile?.files.issue_template?.html_url,
      icon: FileCode,
    },
    {
      title: 'Pull Request Template',
      desc: 'Pre-filled checklist for PR submissions',
      present: Boolean(communityProfile?.files.pull_request_template),
      url: communityProfile?.files.pull_request_template?.html_url,
      icon: FileCode,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Community Standards Checklist Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Community Health Standards & Compliance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit of repository documentation and open-source hygiene
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Health Score:</span>
            <span className="text-sm font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {communityProfile?.health_percentage ?? 80}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {standards.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-lg p-3.5 flex items-start justify-between gap-3 shadow-xs"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">{s.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-1">{s.desc}</div>
                    {s.url && s.present && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline mt-1 font-medium"
                      >
                        View file <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="shrink-0 mt-0.5">
                  {s.present ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Contributors Leaderboard */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Top Contributors ({contributors.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            {formatExactNumber(totalTopContributions)} total commits by top list
          </span>
        </div>

        {loading ? (
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                  <div className="h-2.5 bg-slate-200/60 dark:bg-slate-800/60 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : contributors.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
            No contributor data available.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 divide-slate-100 dark:divide-slate-800/80 p-4 gap-3">
            {contributors.map((c, index) => {
              const share = totalTopContributions > 0
                ? ((c.contributions / totalTopContributions) * 100).toFixed(1)
                : '0';

              return (
                <div
                  key={c.id}
                  className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/70 rounded-lg p-3 hover:border-indigo-400 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800/30 transition-colors flex items-center justify-between gap-3 group shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono tabular-nums text-slate-400 dark:text-slate-500 w-5 text-right font-medium">
                      #{index + 1}
                    </span>
                    <img
                      src={c.avatar_url}
                      alt={c.login}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shrink-0 object-cover"
                    />
                    <div className="min-w-0">
                      <a
                        href={c.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 hover:underline transition-colors truncate block"
                      >
                        {c.login}
                      </a>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        {formatExactNumber(c.contributions)} commits ({share}%)
                      </span>
                    </div>
                  </div>

                  <a
                    href={c.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors shrink-0"
                    title={`View @${c.login} on GitHub`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
