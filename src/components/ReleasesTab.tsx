import React, { useState } from 'react';
import {
  Tag,
  Download,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileArchive,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { marked } from 'marked';
import { GitHubRelease, GitHubRepo } from '../types/github';
import { formatRelativeTime, formatDate, formatBytes, formatExactNumber } from '../utils/formatters';

interface ReleasesTabProps {
  releases: GitHubRelease[];
  repo: GitHubRepo;
  loading: boolean;
}

export const ReleasesTab: React.FC<ReleasesTabProps> = ({ releases, repo, loading }) => {
  const [expandedReleases, setExpandedReleases] = useState<Record<number, boolean>>({
    // Expand the latest release by default
    ...(releases.length > 0 ? { [releases[0].id]: true } : {}),
  });

  const toggleExpand = (id: number) => {
    setExpandedReleases((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Releases & Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Changelogs, tags, and downloadable binaries
            </p>
          </div>
        </div>

        <a
          href={`${repo.html_url}/releases`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline flex items-center gap-1 font-medium"
        >
          <span>All Releases</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 animate-pulse space-y-3 shadow-xs">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-4 bg-slate-200/60 dark:bg-slate-800/60 rounded w-1/2" />
              <div className="h-16 bg-slate-200/40 dark:bg-slate-800/40 rounded w-full" />
            </div>
          ))}
        </div>
      ) : releases.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-2 shadow-xs transition-colors">
          <Tag className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-300">No official releases published</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            This repository has not published tagged releases via GitHub Releases yet. Code can still be cloned or downloaded from tags.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {releases.map((release) => {
            const isExpanded = Boolean(expandedReleases[release.id]);
            const renderedNotes = release.body ? (marked.parse(release.body) as string) : '';
            const totalAssetDownloads = release.assets.reduce((sum, a) => sum + a.download_count, 0);

            return (
              <div
                key={release.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors shadow-xs"
              >
                {/* Release Title Header */}
                <div
                  onClick={() => toggleExpand(release.id)}
                  className="p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5">
                      <Tag className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                          {release.tag_name}
                        </span>
                        {release.name && release.name !== release.tag_name && (
                          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                            — {release.name}
                          </span>
                        )}
                        {release.prerelease && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-mono">
                            Pre-release
                          </span>
                        )}
                        {release.draft && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                            Draft
                          </span>
                        )}
                      </div>

                      {/* Unboxed metadata line */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span>Released {formatRelativeTime(release.published_at || release.created_at)}</span>
                        <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                        <span>{formatDate(release.published_at || release.created_at)}</span>
                        {release.author && (
                          <>
                            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                            <span>by {release.author.login}</span>
                          </>
                        )}
                        {release.assets.length > 0 && (
                          <>
                            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                            <span className="font-mono tabular-nums">
                              {release.assets.length} assets ({formatExactNumber(totalAssetDownloads)} downloads)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                    <a
                      href={release.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                      title="View release on GitHub"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      className="text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1"
                      aria-label={isExpanded ? 'Collapse release notes' : 'Expand release notes'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
                    {/* Release Notes */}
                    {release.body ? (
                      <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-lg p-4">
                        <div
                          className="markdown-body max-w-none text-xs"
                          dangerouslySetInnerHTML={{ __html: renderedNotes }}
                        />
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic">
                        No release notes provided for this tag.
                      </div>
                    )}

                    {/* Downloadable Assets */}
                    {release.assets.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                          <Download className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                          Assets & Binaries ({release.assets.length})
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {release.assets.map((asset) => (
                            <a
                              key={asset.id}
                              href={asset.browser_download_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs group transition-colors shadow-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileArchive className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 shrink-0" />
                                <span className="font-mono text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 truncate font-medium">
                                  {asset.name}
                                </span>
                              </div>
                              <div className="text-right shrink-0 pl-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                                <div>{formatBytes(asset.size)}</div>
                                <div className="text-slate-400 dark:text-slate-500">{formatExactNumber(asset.download_count)} DLs</div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
