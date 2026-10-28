import React, { useState, useMemo } from 'react';
import {
  FileText,
  Copy,
  Check,
  ExternalLink,
  Download,
  BookOpen,
  Code2,
  FileCode,
} from 'lucide-react';
import { marked } from 'marked';
import { GitHubReadme, GitHubRepo } from '../types/github';
import { decodeBase64Utf8, formatBytes } from '../utils/formatters';

interface ReadmeTabProps {
  readme: GitHubReadme | null;
  loading: boolean;
  repo: GitHubRepo;
}

export const ReadmeTab: React.FC<ReadmeTabProps> = ({ readme, loading, repo }) => {
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('rendered');
  const [copied, setCopied] = useState(false);

  // Decode content
  const rawContent = useMemo(() => {
    if (!readme) return '';
    if (readme.content && readme.encoding === 'base64') {
      return decodeBase64Utf8(readme.content);
    }
    return '';
  }, [readme]);

  // Parse markdown HTML
  const renderedHtml = useMemo(() => {
    if (!rawContent) return '';
    try {
      return marked.parse(rawContent) as string;
    } catch {
      return '<p class="text-rose-400">Failed to render markdown content.</p>';
    }
  }, [rawContent]);

  // Extract headings for Table of Contents
  const headings = useMemo(() => {
    if (!rawContent) return [];
    const lines = rawContent.split('\n');
    const list: { level: number; text: string; id: string }[] = [];
    for (const line of lines) {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].replace(/[#*`_\[\]]/g, '').trim();
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        if (text) {
          list.push({ level, text, id });
        }
      }
    }
    return list.slice(0, 14); // Limit to top 14 sections
  }, [rawContent]);

  const handleCopy = () => {
    if (!rawContent) return;
    navigator.clipboard.writeText(rawContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!rawContent) return;
    const blob = new Blob([rawContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = readme ? readme.name : 'README.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white truncate">
                {readme ? readme.name : 'README.md'}
              </h3>
              {readme && (
                <span className="text-[11px] font-mono tabular-nums text-slate-500">
                  ({formatBytes(readme.size)})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Official project documentation from branch <span className="font-mono text-indigo-300">{repo.default_branch}</span>
            </p>
          </div>
        </div>

        {/* View mode toggle & Action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Formatted vs Raw */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('rendered')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'rendered'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'raw'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Raw</span>
            </button>
          </div>

          {/* Copy Button */}
          {rawContent && (
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
              title="Copy markdown text"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}

          {/* Download Button */}
          {rawContent && (
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
              title="Download README file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}

          {/* External GitHub link */}
          <a
            href={readme?.html_url || `${repo.html_url}#readme`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            title="View on GitHub"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Table of Contents sidebar if headings exist */}
        {headings.length > 3 && viewMode === 'rendered' && (
          <div className="hidden lg:block lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 sticky top-[110px] space-y-3">
            <span className="text-xs font-semibold text-slate-200 block uppercase tracking-wider text-[11px]">
              Table of Contents
            </span>
            <div className="space-y-1.5 text-xs">
              {headings.map((h, idx) => (
                <div
                  key={idx}
                  style={{ paddingLeft: `${(h.level - 1) * 10}px` }}
                  className="truncate text-slate-400 hover:text-indigo-300 transition-colors"
                >
                  <span className="cursor-default select-none truncate block">
                    {h.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Viewer */}
        <div
          className={`${
            headings.length > 3 && viewMode === 'rendered' ? 'lg:col-span-3' : 'lg:col-span-4'
          } bg-slate-900 border border-slate-800 rounded-xl overflow-hidden`}
        >
          <div className="p-6 sm:p-8">
            {loading ? (
              <div className="space-y-4 py-8">
                <div className="h-7 w-1/3 bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-full bg-slate-800/60 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-slate-800/60 rounded animate-pulse" />
                <div className="h-32 bg-slate-800/40 rounded animate-pulse mt-4" />
                <div className="h-4 w-2/3 bg-slate-800/60 rounded animate-pulse" />
              </div>
            ) : rawContent ? (
              viewMode === 'rendered' ? (
                <div
                  className="markdown-body max-w-none overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              ) : (
                <pre className="text-xs font-mono bg-slate-950 p-5 rounded-lg overflow-x-auto text-slate-300 border border-slate-800 leading-relaxed whitespace-pre-wrap">
                  {rawContent}
                </pre>
              )
            ) : (
              <div className="py-16 text-center space-y-2">
                <FileCode className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-300">
                  No README found in repository
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  This repository has no default README.md in the root directory.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
