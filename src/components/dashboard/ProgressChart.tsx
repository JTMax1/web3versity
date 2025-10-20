import React from 'react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';
import { useXPHistory } from '../../hooks/useStats';

interface ProgressChartProps {
  userId: string;
  days?: number;
}

export function ProgressChart({ userId, days = 30 }: ProgressChartProps) {
  const { data: xpHistory, isLoading, error } = useXPHistory(userId, days);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#0084C7] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-600">Failed to load XP history</p>
      </div>
    );
  }

  if (!xpHistory || xpHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 mb-2">No XP data yet</p>
        <p className="text-sm text-gray-500">
          Complete lessons to see your progress!
        </p>
      </div>
    );
  }

  // Calculate total XP earned in period
  const totalXpEarned = xpHistory.reduce((sum, point) => sum + point.xpEarned, 0);
  const averageDailyXp = Math.round(totalXpEarned / days);

  // Format data for chart
  const chartData = xpHistory.map(point => ({
    date: format(new Date(point.date), 'MMM d'),
    fullDate: format(new Date(point.date), 'MMM d, yyyy'),
    xp: point.xpEarned,
    cumulative: point.cumulativeXp,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-xl p-3 shadow-[0_8px_24px_rgba(0,0,0,0.15)] border border-gray-100">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {payload[0].payload.fullDate}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#0084C7] rounded-full" />
            <p className="text-sm text-gray-600">
              XP Earned: <span className="font-medium text-[#0084C7]">{payload[0].value}</span>
            </p>
          </div>
          {payload[1] && (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <p className="text-sm text-gray-600">
                Total: <span className="font-medium text-green-600">{payload[1].value}</span>
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-[#0084C7]/10 to-[#00a8e8]/20 rounded-2xl p-4 shadow-[inset_0_2px_8px_rgba(0,132,199,0.1)]">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-[#0084C7]" />
            <span className="text-sm text-gray-600">Total XP ({days}d)</span>
          </div>
          <p className="text-2xl font-bold text-[#0084C7]">
            +{totalXpEarned.toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">📊</span>
            </div>
            <span className="text-sm text-gray-600">Daily Average</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {averageDailyXp} <span className="text-sm">XP/day</span>
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_-2px_-2px_8px_rgba(0,0,0,0.02),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-1">XP Progress Over Time</h4>
          <p className="text-xs text-gray-500">Daily XP earned and cumulative total</p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0084C7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0084C7" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Daily XP */}
            <Area
              type="monotone"
              dataKey="xp"
              stroke="#0084C7"
              strokeWidth={2}
              fill="url(#colorXp)"
              animationDuration={1000}
            />

            {/* Cumulative XP */}
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: '#22c55e', r: 3 }}
              activeDot={{ r: 5 }}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#0084C7] rounded-sm" />
            <span className="text-gray-600">Daily XP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-sm" />
            <span className="text-gray-600">Cumulative XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
