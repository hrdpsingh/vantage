import React, { useState } from 'react';
import { Download, X, Copy, Check, FileText, Code2, ShieldAlert } from 'lucide-react';
import {
  GitHubRepo,
  RepoLanguages,
  GitHubContributor,
  GitHubRelease,
  CommunityProfile,
} from '../types/github';
import {
  formatExactNumber,
  formatRepoSize,
  formatDate,
  calculateLanguagePercentages,
  formatBytes,
} from '../utils/formatters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  repo: GitHubRepo;
  languages: RepoLanguages;
  contributors: GitHubContributor[];
  releases: GitHubRelease[];
  communityProfile: CommunityProfile | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  repo,
  languages,
  contributors,
  releases,
  communityProfile,
}) => {
  const [activeFormat, setActiveFormat] = useState<'markdown' | 'json' | 'badges'>('markdown');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const langPercentages = calculateLanguagePercentages(languages);

  // Generate Markdown report
  const generateMarkdownReport = (): string => {
    return `# Repository Intelligence Report: ${repo.full_name}

Generated on ${new Date().toUTCString()} via Vantage.

## Summary
- **Repository**: [${repo.full_name}](${repo.html_url})
- **Description**: ${repo.description || 'No description provided'}
- **Homepage**: ${repo.homepage || 'N/A'}
- **Visibility**: ${repo.visibility}
- **License**: ${repo.license?.spdx_id || repo.license?.name || 'None'}
- **Default Branch**: \`${repo.default_branch}\`
- **Creation Date**: ${formatDate(repo.created_at)}
- **Last Push**: ${new Date(repo.pushed_at).toUTCString()}

## Telemetry & Metrics
| Metric | Value |
| :--- | :--- |
| **Stars** | ${formatExactNumber(repo.stargazers_count)} |
| **Forks** | ${formatExactNumber(repo.forks_count)} |
| **Open Issues / PRs** | ${formatExactNumber(repo.open_issues_count)} |
| **Watchers** | ${formatExactNumber(repo.subscribers_count ?? repo.watchers_count)} |
| **Disk Size** | ${formatRepoSize(repo.size)} |
| **Community Health Score** | ${communityProfile?.health_percentage ?? 'N/A'}% |

## Language Breakdown
${
  langPercentages.length > 0
    ? langPercentages.map((l) => `- **${l.name}**: ${l.percentage}% (${formatBytes(l.bytes)})`).join('\n')
    : 'No language data available.'
}

## Top Contributors (${contributors.length})
${
  contributors.length > 0
    ? contributors
        .slice(0, 10)
        .map((c, i) => `${i + 1}. [@${c.login}](${c.html_url}) - ${formatExactNumber(c.contributions)} commits`)
        .join('\n')
    : 'No contributor data loaded.'
}

## Latest Releases
${
  releases.length > 0
    ? releases
        .slice(0, 5)
        .map(
          (r) =>
            `- **${r.tag_name}** (${formatDate(r.published_at || r.created_at)}): [View on GitHub](${r.html_url})`
        )
        .join('\n')
    : 'No releases tagged.'
}
`;
  };

  // Generate JSON report
  const generateJsonReport = (): string => {
    const payload = {
      exported_at: new Date().toISOString(),
      repository: {
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        html_url: repo.html_url,
        description: repo.description,
        homepage: repo.homepage,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        open_issues: repo.open_issues_count,
        size_kb: repo.size,
        default_branch: repo.default_branch,
        license: repo.license,
        created_at: repo.created_at,
        pushed_at: repo.pushed_at,
        topics: repo.topics,
      },
      languages: langPercentages,
      top_contributors: contributors.slice(0, 20).map((c) => ({
        login: c.login,
        contributions: c.contributions,
        url: c.html_url,
      })),
      recent_releases: releases.slice(0, 10).map((r) => ({
        tag: r.tag_name,
        name: r.name,
        published_at: r.published_at,
        prerelease: r.prerelease,
        assets_count: r.assets.length,
      })),
      community_health: communityProfile,
    };
    return JSON.stringify(payload, null, 2);
  };

  // Generate Shields Badges
  const generateBadges = (): string => {
    const [owner, name] = repo.full_name.split('/');
    return `<!-- GitHub Shields.io Badges for ${repo.full_name} -->
[![GitHub Stars](https://img.shields.io/github/stars/${owner}/${name}?style=flat-square)](${repo.html_url})
[![GitHub Forks](https://img.shields.io/github/forks/${owner}/${name}?style=flat-square)](${repo.html_url}/network)
[![GitHub Issues](https://img.shields.io/github/issues/${owner}/${name}?style=flat-square)](${repo.html_url}/issues)
${
  repo.license
    ? `[![License](https://img.shields.io/github/license/${owner}/${name}?style=flat-square)](${repo.html_url})`
    : ''
}
`;
  };

  const currentContent =
    activeFormat === 'markdown'
      ? generateMarkdownReport()
      : activeFormat === 'json'
      ? generateJsonReport()
      : generateBadges();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = activeFormat === 'json' ? 'json' : 'md';
    const filename = `${repo.full_name.replace('/', '_')}_report.${ext}`;
    const blob = new Blob([currentContent], {
      type: activeFormat === 'json' ? 'application/json' : 'text/markdown',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full p-6 text-slate-200 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors p-1"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 shrink-0">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Export Repository Report</h2>
            <p className="text-xs text-slate-400">
              Download or copy telemetry dossier for <span className="font-mono text-indigo-300">{repo.full_name}</span>
            </p>
          </div>
        </div>

        {/* Format selector tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs shrink-0 mb-4">
          <button
            type="button"
            onClick={() => setActiveFormat('markdown')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeFormat === 'markdown'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Markdown Summary</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFormat('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeFormat === 'json'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>JSON Telemetry</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFormat('badges')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeFormat === 'badges'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Shields.io Badges</span>
          </button>
        </div>

        {/* Code Content Preview */}
        <div className="flex-1 overflow-y-auto mb-4 bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
          {currentContent}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 shrink-0 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>

          {activeFormat !== 'badges' && (
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
