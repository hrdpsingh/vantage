import React, { useState, useMemo } from 'react';
import { BarChart3, Calendar, Users, TrendingUp, Sparkles } from 'lucide-react';
import { GitHubCommit, GitHubContributor, WeeklyCommitActivity } from '../types/github';
import { formatNumber, formatExactNumber } from '../utils/formatters';

interface CommitBarChartProps {
  commits: GitHubCommit[];
  contributors: GitHubContributor[];
  commitActivity: WeeklyCommitActivity[] | null;
}

type ChartMode = 'weekly' | 'dayOfWeek' | 'contributors';

export const CommitBarChart: React.FC<CommitBarChartProps> = ({
  commits,
  contributors,
  commitActivity,
}) => {
  const [mode, setMode] = useState<ChartMode>('dayOfWeek');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 1. Day of week distribution (Mon - Sun)
  const dayOfWeekData = useMemo(() => {
    const days = [
      { label: 'Sun', fullName: 'Sunday', count: 0 },
      { label: 'Mon', fullName: 'Monday', count: 0 },
      { label: 'Tue', fullName: 'Tuesday', count: 0 },
      { label: 'Wed', fullName: 'Wednesday', count: 0 },
      { label: 'Thu', fullName: 'Thursday', count: 0 },
      { label: 'Fri', fullName: 'Friday', count: 0 },
      { label: 'Sat', fullName: 'Saturday', count: 0 },
    ];

    if (commitActivity && commitActivity.length > 0) {
      // Sum days from commitActivity weeks
      commitActivity.forEach((week) => {
        if (Array.isArray(week.days)) {
          week.days.forEach((dayCount, dayIdx) => {
            if (days[dayIdx]) {
              days[dayIdx].count += dayCount;
            }
          });
        }
      });
    } else {
      // Fallback: aggregate from commits array
      commits.forEach((c) => {
        try {
          const d = new Date(c.commit.author.date);
          const dayIdx = d.getDay();
          days[dayIdx].count += 1;
        } catch {
          // ignore
        }
      });
    }

    const total = days.reduce((sum, d) => sum + d.count, 0);
    const max = Math.max(...days.map((d) => d.count), 1);

    return {
      items: days.map((d) => ({
        ...d,
        percentage: total > 0 ? ((d.count / total) * 100).toFixed(1) : '0',
      })),
      total,
      max,
    };
  }, [commits, commitActivity]);

  // 2. Weekly commit velocity (recent 16 weeks)
  const weeklyData = useMemo(() => {
    if (commitActivity && commitActivity.length > 0) {
      const recentWeeks = commitActivity.slice(-16);
      const total = recentWeeks.reduce((acc, w) => acc + w.total, 0);
      const max = Math.max(...recentWeeks.map((w) => w.total), 1);
      return {
        items: recentWeeks.map((w, idx) => {
          const date = new Date(w.week * 1000);
          const label = `${date.toLocaleString('en-US', { month: 'short' })} ${date.getDate()}`;
          return {
            label,
            fullName: `Week of ${date.toLocaleDateString()}`,
            count: w.total,
            percentage: total > 0 ? ((w.total / total) * 100).toFixed(1) : '0',
          };
        }),
        total,
        max,
      };
    }

    // Fallback: Group commits by week (recent 8 buckets)
    const buckets: Record<string, number> = {};
    commits.forEach((c) => {
      try {
        const d = new Date(c.commit.author.date);
        // Round to start of week
        const startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - d.getDay());
        const key = `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()}`;
        buckets[key] = (buckets[key] || 0) + 1;
      } catch {
        // ignore
      }
    });

    const entries = Object.entries(buckets).slice(-12);
    const total = entries.reduce((acc, [, count]) => acc + count, 0);
    const max = Math.max(...entries.map(([, count]) => count), 1);

    return {
      items: entries.map(([label, count]) => ({
        label,
        fullName: `Week of ${label}`,
        count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0',
      })),
      total,
      max,
    };
  }, [commits, commitActivity]);

  // 3. Top Contributors Volume
  const contributorData = useMemo(() => {
    const top = contributors.slice(0, 10);
    const total = top.reduce((acc, c) => acc + c.contributions, 0);
    const max = Math.max(...top.map((c) => c.contributions), 1);
    return {
      items: top.map((c) => ({
        label: c.login,
        fullName: `@${c.login}`,
        count: c.contributions,
        percentage: total > 0 ? ((c.contributions / total) * 100).toFixed(1) : '0',
      })),
      total,
      max,
    };
  }, [contributors]);

  // Current active data set
  const currentDataSet =
    mode === 'dayOfWeek' ? dayOfWeekData : mode === 'weekly' ? weeklyData : contributorData;

  const peakItem = useMemo(() => {
    if (!currentDataSet.items.length) return null;
    return [...currentDataSet.items].sort((a, b) => b.count - a.count)[0];
  }, [currentDataSet]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs transition-colors">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              Commit Velocity Bar Chart
              {peakItem && peakItem.count > 0 && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal hidden sm:inline">
                  · Peak: <strong className="text-indigo-600 dark:text-indigo-300 font-semibold">{peakItem.fullName}</strong> ({formatExactNumber(peakItem.count)} commits)
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparative activity distribution and cadence breakdown
            </p>
          </div>
        </div>

        {/* View Mode Tabs (functional interactive controls) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setMode('dayOfWeek');
              setHoveredIndex(null);
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              mode === 'dayOfWeek'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Day of Week
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('weekly');
              setHoveredIndex(null);
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              mode === 'weekly'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Weekly Velocity
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('contributors');
              setHoveredIndex(null);
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              mode === 'contributors'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Top Authors
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="pt-2">
        {currentDataSet.items.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
            No commit data available for this chart.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Visual Bar Area */}
            <div className="relative h-52 w-full pt-6 pb-6 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 rounded-lg">
              {/* Background horizontal guide lines */}
              <div className="absolute inset-x-2 top-6 border-b border-slate-200 dark:border-slate-800/40 pointer-events-none" />
              <div className="absolute inset-x-2 top-1/2 border-b border-slate-200 dark:border-slate-800/40 pointer-events-none" />

              {/* Y-axis reference max value */}
              <div className="absolute right-3 top-2 text-[10px] font-mono text-slate-400 dark:text-slate-500 tabular-nums">
                max: {formatNumber(currentDataSet.max)} commits
              </div>

              {currentDataSet.items.map((item, idx) => {
                const heightPercent =
                  currentDataSet.max > 0 ? Math.max((item.count / currentDataSet.max) * 100, 3) : 3;
                const isHovered = hoveredIndex === idx;
                const isPeak = item.count === currentDataSet.max && item.count > 0;

                return (
                  <div
                    key={item.label + idx}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="flex-1 h-full flex flex-col justify-end items-center relative group cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-14 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 py-1.5 shadow-xl text-center pointer-events-none whitespace-nowrap">
                        <div className="text-[11px] font-semibold text-slate-900 dark:text-slate-200">
                          {item.fullName}
                        </div>
                        <div className="text-[10px] font-mono tabular-nums text-indigo-600 dark:text-indigo-300">
                          {formatExactNumber(item.count)} commits ({item.percentage}%)
                        </div>
                      </div>
                    )}

                    {/* Bar graphic */}
                    <div className="w-full max-w-[48px] h-full flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          isHovered
                            ? 'bg-indigo-500 dark:bg-indigo-400 shadow-md shadow-indigo-500/20'
                            : isPeak
                            ? 'bg-indigo-600 dark:bg-indigo-500'
                            : 'bg-indigo-500/70 dark:bg-indigo-600/70 hover:bg-indigo-600 dark:hover:bg-indigo-500/90'
                        }`}
                      />
                    </div>

                    {/* X-axis label */}
                    <span
                      className={`text-[11px] font-mono tabular-nums mt-2 transition-colors truncate max-w-[60px] text-center ${
                        isHovered || isPeak
                          ? 'text-indigo-600 dark:text-indigo-300 font-semibold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                      title={item.fullName}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom summary info */}
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1 pt-1">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>
                  Sampled <strong>{formatExactNumber(currentDataSet.total)}</strong> commits across{' '}
                  {currentDataSet.items.length} data points
                </span>
              </span>

              <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                Average: {(currentDataSet.total / (currentDataSet.items.length || 1)).toFixed(1)} / bucket
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
