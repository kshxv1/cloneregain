import React, { useState } from 'react';
import {
  X,
  Smartphone,
  TrendingDown,
  ArrowUpRight,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { MOCK_INSTALLED_APPS } from '../services/NativeBridge';

export const ScreenTimeDetailModal: React.FC = () => {
  const { showScreenTimeDetail, setShowScreenTimeDetail, todayFocusedMinutes } = useApp();
  const [selectedRange, setSelectedRange] = useState<'today' | 'week'>('today');

  if (!showScreenTimeDetail) return null;

  // Realistic mock usage sorted desc
  const sortedApps = [...MOCK_INSTALLED_APPS].sort((a, b) => b.dailyUsageMin - a.dailyUsageMin);
  const totalScreenMin = Math.max(todayFocusedMinutes + 45, 185);
  const productiveMin = Math.min(todayFocusedMinutes + 30, totalScreenMin);
  const distractedMin = totalScreenMin - productiveMin;
  const totalPickups = 58;

  const formatHoursMin = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  // Mock hourly activity across 24h
  const hourlyActivity = [
    0, 0, 0, 0, 0, 10, 25, 40, 30, 45, 50, 35,
    20, 30, 45, 55, 40, 25, 30, 40, 50, 35, 15, 5
  ];
  const maxHourly = Math.max(...hourlyActivity);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#141925] border border-[#273049] rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden select-none">
        {/* Header */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-[#273049]/60">
          <div>
            <h3 className="text-lg font-bold font-display text-[#F2F5FA]">
              Screen Time Insights
            </h3>
            <p className="text-xs text-[#8B95AD]">
              Detailed digital balance & device pickup patterns
            </p>
          </div>
          <button
            onClick={() => setShowScreenTimeDetail(false)}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8B95AD] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Top Summary Card */}
          <div className="bg-[#1C2333]/70 border border-[#273049] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold font-display text-[#F2F5FA]">
                  {formatHoursMin(totalScreenMin)}
                </span>
                <span className="text-xs text-[#8B95AD] block">Total on screen today</span>
              </div>

              {/* Reduced badge */}
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <TrendingDown size={14} />
                <span>-22% vs last week</span>
              </div>
            </div>

            {/* Split bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2.5 rounded-full bg-[#0B0E14] overflow-hidden flex">
                <div
                  className="h-full bg-emerald-400 rounded-l-full"
                  style={{ width: `${(productiveMin / totalScreenMin) * 100}%` }}
                />
                <div
                  className="h-full bg-rose-500/80 rounded-r-full"
                  style={{ width: `${(distractedMin / totalScreenMin) * 100}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-[#8B95AD]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Productive: {formatHoursMin(productiveMin)}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                  Distractions: {formatHoursMin(distractedMin)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics: Pickups & Longest Session */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1C2333]/50 border border-[#273049] rounded-2xl p-3.5">
              <span className="text-xs text-[#8B95AD] block font-medium">Device Pickups</span>
              <div className="text-xl font-bold font-display text-[#F2F5FA] my-0.5">
                {totalPickups} <span className="text-xs text-[#8B95AD]">times</span>
              </div>
              <span className="text-[11px] text-emerald-400">8 fewer than yesterday</span>
            </div>

            <div className="bg-[#1C2333]/50 border border-[#273049] rounded-2xl p-3.5">
              <span className="text-xs text-[#8B95AD] block font-medium">Longest Stillness</span>
              <div className="text-xl font-bold font-display text-[var(--color-primary)] my-0.5">
                90 <span className="text-xs text-[#8B95AD]">mins</span>
              </div>
              <span className="text-[11px] text-[#8B95AD]">Deep Block study</span>
            </div>
          </div>

          {/* Hourly Usage Distribution */}
          <div className="bg-[#1C2333]/50 border border-[#273049] rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#F2F5FA] uppercase tracking-wider">
                Hourly Activity
              </span>
              <span className="text-xs text-[#8B95AD]">24-Hour spread</span>
            </div>

            <div className="h-20 flex items-end gap-1 pt-2">
              {hourlyActivity.map((val, idx) => {
                const heightPct = maxHourly > 0 ? (val / maxHourly) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className="flex-1 rounded-t bg-[#273049] hover:bg-[var(--color-primary)] transition-colors relative group"
                    style={{ height: `${Math.max(8, heightPct)}%` }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-[#0B0E14] text-[9px] px-1.5 py-0.5 rounded border border-[#273049] whitespace-nowrap z-20">
                      {idx}:00 - {val}m
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[10px] text-[#8B95AD]">
              <span>12am</span>
              <span>6am</span>
              <span>12pm</span>
              <span>6pm</span>
              <span>11pm</span>
            </div>
          </div>

          {/* App Usage Ranking */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#F2F5FA] uppercase tracking-wider">
                Most Used Applications
              </span>
              <span className="text-xs text-[#8B95AD]">Sorted by time</span>
            </div>

            <div className="space-y-2">
              {sortedApps.slice(0, 8).map(app => {
                const pct = (app.dailyUsageMin / totalScreenMin) * 100;
                return (
                  <div
                    key={app.id}
                    className="p-3 bg-[#1C2333]/40 border border-[#273049]/60 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${app.iconBg} flex items-center justify-center text-white shadow-sm`}>
                        <Smartphone size={16} />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[#F2F5FA] block">
                          {app.name}
                        </span>
                        <span className="text-[10px] text-[#8B95AD] capitalize">
                          {app.category} • {app.pickups} pickups
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold font-display text-[#F2F5FA] block">
                        {app.dailyUsageMin}m
                      </span>
                      <span className="text-[10px] text-[#8B95AD]">
                        {Math.round(pct)}% of day
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#273049] bg-[#141925]">
          <button
            onClick={() => setShowScreenTimeDetail(false)}
            className="w-full py-3 bg-[#1C2333] hover:bg-[#273049] text-xs font-bold text-[#F2F5FA] rounded-full"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
