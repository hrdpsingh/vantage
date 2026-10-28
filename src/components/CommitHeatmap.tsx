import React, { useState, useMemo } from 'react';
import { Flame, Clock, Calendar, Info } from 'lucide-react';
import { GitHubCommit, WeeklyCommitActivity } from '../types/github';
import { formatExactNumber } from '../utils/formatters';

interface CommitHeatmapProps {
  commits: GitHubCommit[];
  commitActivity: WeeklyCommitActivity[] | null;
  punchCard: [number, number, number][] | null;
}

type HeatmapView = 'calendar' | 'punchCard';

interface DayCell {
  date: Date;
  dateStr: string;
  dayOfWeek: number; // 0..6
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const CommitHeatmap: React.FC<CommitHeatmapProps> = ({
  commits,
  commitActivity,
  punchCard,
}) => {
  const [view, setView] = useState<HeatmapView>('calendar');
  const [hoveredCell, setHoveredCell] = useState<{
    title: string;
    count: number;
    subtext?: string;
  } | null>(null);

  // Compute Calendar Heatmap (Last 26 weeks or from commitActivity)
  const { weeks, totalYearCommits, maxDayCount, activeDaysCount } = useMemo(() => {
    // If commitActivity exists (52 weeks of 7 days)
    if (commitActivity && commitActivity.length > 0) {
      // Take last 30 weeks for clean horizontal view
      const displayWeeks = commitActivity.slice(-30);
      let total = 0;
      let maxCount = 0;
      let activeDays = 0;

      const formattedWeeks: DayCell[][] = displayWeeks.map((w) => {
        const weekStartDate = new Date(w.week * 1000);
        return w.days.map((dayCount, dayIdx) => {
          total += dayCount;
          if (dayCount > maxCount) maxCount = dayCount;
          if (dayCount > 0) activeDays += 1;

          const cellDate = new Date(weekStartDate);
          cellDate.setDate(weekStartDate.getDate() + dayIdx);

          let level: 0 | 1 | 2 | 3 | 4 = 0;
          if (dayCount > 0) {
            if (dayCount <= 2) level = 1;
            else if (dayCount <= 6) level = 2;
            else if (dayCount <= 12) level = 3;
            else level = 4;
          }

          return {
            date: cellDate,
            dateStr: cellDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            dayOfWeek: dayIdx,
            count: dayCount,
            level,
          };
        });
      });

      return {
        weeks: formattedWeeks,
        totalYearCommits: total,
        maxDayCount: maxCount,
        activeDaysCount: activeDays,
      };
    }

    // Fallback: Aggregate from the loaded commits list across the past 12 weeks
    const map = new Map<string, number>();
    commits.forEach((c) => {
      try {
        const d = new Date(c.commit.author.date);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        map.set(key, (map.get(key) || 0) + 1);
      } catch {
        // ignore
      }
    });

    // Generate past 24 weeks grid
    const generatedWeeks: DayCell[][] = [];
    const today = new Date();
    // Start from 24 weeks ago Sunday
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 24 * 7 - today.getDay());

    let total = 0;
    let maxCount = 0;
    let activeDays = 0;

    for (let w = 0; w < 24; w++) {
      const weekCols: DayCell[] = [];
      for (let d = 0; d < 7; d++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + w * 7 + d);
        const key = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
        const count = map.get(key) || 0;
        total += count;
        if (count > maxCount) maxCount = count;
        if (count > 0) activeDays += 1;

        let level: 0 | 1 | 2 | 3 | 4 = 0;
        if (count > 0) {
          if (count === 1) level = 1;
          else if (count <= 3) level = 2;
          else if (count <= 6) level = 3;
          else level = 4;
        }

        weekCols.push({
          date: currentDate,
          dateStr: currentDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          dayOfWeek: d,
          count,
          level,
        });
      }
      generatedWeeks.push(weekCols);
    }

    return {
      weeks: generatedWeeks,
      totalYearCommits: total,
      maxDayCount: maxCount,
      activeDaysCount: activeDays,
    };
  }, [commits, commitActivity]);

  // Compute Punch Card Data (Day x Hour matrix)
  const punchMatrix = useMemo(() => {
    // 7 rows (days 0..6), 24 cols (hours 0..23)
    const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    let max = 0;
    let peakDay = 0;
    let peakHour = 0;

    if (punchCard && punchCard.length > 0) {
      punchCard.forEach(([day, hour, count]) => {
        if (matrix[day] && matrix[day][hour] !== undefined) {
          matrix[day][hour] = count;
          if (count > max) {
            max = count;
            peakDay = day;
            peakHour = hour;
          }
        }
      });
    } else {
      // Fallback from commits list
      commits.forEach((c) => {
        try {
          const d = new Date(c.commit.author.date);
          const day = d.getDay();
          const hour = d.getHours();
          matrix[day][hour] += 1;
          if (matrix[day][hour] > max) {
            max = matrix[day][hour];
            peakDay = day;
            peakHour = hour;
          }
        } catch {
          // ignore
        }
      });
    }

    return {
      matrix,
      max: Math.max(max, 1),
      peakDay,
      peakHour,
    };
  }, [punchCard, commits]);

  // Color mapper for level
  const getCellBg = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-emerald-100 border border-emerald-300 hover:border-emerald-500 dark:bg-emerald-950 dark:border-emerald-800/80 dark:hover:border-emerald-500';
      case 2:
        return 'bg-emerald-300 border border-emerald-400 hover:border-emerald-500 dark:bg-emerald-700/80 dark:border-emerald-600/80 dark:hover:border-emerald-400';
      case 3:
        return 'bg-emerald-500 border border-emerald-500 hover:border-emerald-400 dark:bg-emerald-500 dark:border-emerald-400 dark:hover:border-emerald-300';
      case 4:
        return 'bg-emerald-600 border border-emerald-500 shadow-xs dark:bg-emerald-400 dark:border-emerald-300 dark:shadow-emerald-400/30';
      default:
        return 'bg-slate-100 border border-slate-200 hover:border-slate-300 dark:bg-slate-950/80 dark:border-slate-800/40 dark:hover:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs transition-colors">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              Commit Density Heatmap
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 font-normal hidden sm:inline">
                ({formatExactNumber(totalYearCommits)} commits sampled · {activeDaysCount} active days)
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Push cadence, temporal distribution, and day-by-day density
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setView('calendar');
              setHoveredCell(null);
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              view === 'calendar'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Calendar View
          </button>
          <button
            type="button"
            onClick={() => {
              setView('punchCard');
              setHoveredCell(null);
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              view === 'punchCard'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Punch Card (Day × Hour)
          </button>
        </div>
      </div>

      {/* Main Heatmap Container */}
      <div className="pt-2">
        {view === 'calendar' ? (
          <div className="space-y-3">
            {/* Calendar Grid Container */}
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[680px]">
                {/* Day labels + week columns */}
                <div className="flex gap-1.5">
                  {/* Y-axis days */}
                  <div className="flex flex-col justify-between py-1 text-[10px] font-mono text-slate-400 dark:text-slate-500 w-7 shrink-0 select-none">
                    <span>Sun</span>
                    <span>Tue</span>
                    <span>Thu</span>
                    <span>Sat</span>
                  </div>

                  {/* Weeks grid */}
                  <div className="flex gap-1 flex-1">
                    {weeks.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-1 flex-1">
                        {week.map((cell, dIdx) => (
                          <div
                            key={dIdx}
                            onMouseEnter={() =>
                              setHoveredCell({
                                title: cell.dateStr,
                                count: cell.count,
                                subtext: cell.count === 1 ? '1 commit' : `${cell.count} commits`,
                              })
                            }
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`w-full aspect-square min-w-[11px] min-h-[11px] rounded-xs cursor-pointer transition-colors ${getCellBg(
                              cell.level
                            )}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom info & legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              {/* Tooltip / Active cell description */}
              <div className="min-h-[20px] flex items-center gap-2">
                {hoveredCell ? (
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    <strong className="text-slate-900 dark:text-white">{hoveredCell.count} commits</strong> on {hoveredCell.title}
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5 text-[11px]">
                    <Info className="w-3.5 h-3.5" /> Hover over any tile to view exact daily commit volume
                  </span>
                )}
              </div>

              {/* Intensity Legend */}
              <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 shrink-0">
                <span>Less</span>
                <div className="flex gap-1 items-center">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/60" />
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800" />
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-300 dark:bg-emerald-700" />
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 dark:bg-emerald-500" />
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 dark:bg-emerald-400" />
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        ) : (
          /* Punch Card View: Day of week vs Hour of day matrix */
          <div className="space-y-3">
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[720px] space-y-1">
                {/* Hour Header labels (0..23) */}
                <div className="flex pl-12 pr-2 text-[10px] font-mono text-slate-400 dark:text-slate-500 justify-between select-none pb-1">
                  <span>12a</span>
                  <span>3a</span>
                  <span>6a</span>
                  <span>9a</span>
                  <span>12p</span>
                  <span>3p</span>
                  <span>6p</span>
                  <span>9p</span>
                  <span>11p</span>
                </div>

                {/* 7 Days rows */}
                {DAY_LABELS.map((dayName, dayIdx) => (
                  <div key={dayName} className="flex items-center gap-2">
                    <span className="w-10 text-[11px] font-mono text-slate-600 dark:text-slate-400 select-none text-right">
                      {dayName}
                    </span>
                    <div
                      className="flex-1 grid gap-1 bg-slate-50 dark:bg-slate-950/40 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800/60"
                      style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
                    >
                      {punchMatrix.matrix[dayIdx].map((count, hour) => {
                        const ratio = punchMatrix.max > 0 ? count / punchMatrix.max : 0;
                        const isHovered =
                          hoveredCell?.title === `${dayName} at ${hour}:00`;

                        return (
                          <div
                            key={hour}
                            onMouseEnter={() =>
                              setHoveredCell({
                                title: `${dayName} at ${hour}:00`,
                                count,
                                subtext: `${count} commits pushed`,
                              })
                            }
                            onMouseLeave={() => setHoveredCell(null)}
                            className="aspect-square flex items-center justify-center cursor-pointer relative group"
                          >
                            <div
                              style={{
                                width: count > 0 ? `${Math.max(ratio * 100, 30)}%` : '20%',
                                height: count > 0 ? `${Math.max(ratio * 100, 30)}%` : '20%',
                                opacity: count > 0 ? Math.max(ratio, 0.35) : 0.15,
                              }}
                              className={`rounded-full transition-all duration-200 ${
                                count > 0
                                  ? isHovered
                                    ? 'bg-emerald-600 dark:bg-emerald-300 scale-125'
                                    : 'bg-emerald-500 dark:bg-emerald-400'
                                  : 'bg-slate-300 dark:bg-slate-700'
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom punch card summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <div className="min-h-[20px] flex items-center gap-2">
                {hoveredCell ? (
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    <strong className="text-slate-900 dark:text-white">{hoveredCell.count} commits</strong> on {hoveredCell.title}
                  </span>
                ) : (
                  <span className="text-slate-500 text-[11px]">
                    Peak Cadence: <strong>{DAY_LABELS[punchMatrix.peakDay]} at {punchMatrix.peakHour}:00</strong> ({formatExactNumber(punchMatrix.max)} commits)
                  </span>
                )}
              </div>

              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                Bubble radius corresponds to commit density
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
