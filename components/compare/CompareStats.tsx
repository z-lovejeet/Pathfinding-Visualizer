'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ALGORITHM_INFO } from '@/lib/constants';
import type { CompareStats } from '@/store/useCompareStore';
import type { AlgorithmType } from '@/lib/grid/types';

interface CompareStatsProps {
  stats1: CompareStats | null;
  stats2: CompareStats | null;
  algo1: AlgorithmType;
  algo2: AlgorithmType;
}

/**
 * CompareStats — Side-by-side stat comparison with Recharts bar chart
 * and auto-generated insight text.
 */
export default function CompareStatsPanel({ stats1, stats2, algo1, algo2 }: CompareStatsProps) {
  if (!stats1 || !stats2) return null;

  const name1 = ALGORITHM_INFO[algo1].name;
  const name2 = ALGORITHM_INFO[algo2].name;
  const series1 = 'algorithm1';
  const series2 = 'algorithm2';

  const chartData = [
    {
      metric: 'Nodes Visited',
      [series1]: stats1.nodesVisited,
      [series2]: stats2.nodesVisited,
    },
    {
      metric: 'Path Length',
      [series1]: stats1.pathLength,
      [series2]: stats2.pathLength,
    },
    {
      metric: 'Time (ms)',
      [series1]: stats1.executionTime,
      [series2]: stats2.executionTime,
    },
  ];

  // Generate insight
  const fewerNodes = stats1.nodesVisited < stats2.nodesVisited ? name1 : name2;
  const moreNodes = stats1.nodesVisited < stats2.nodesVisited ? name2 : name1;
  const fewerCount = Math.min(stats1.nodesVisited, stats2.nodesVisited);
  const moreCount = Math.max(stats1.nodesVisited, stats2.nodesVisited);
  const pctDiff = moreCount > 0 ? Math.round(((moreCount - fewerCount) / moreCount) * 100) : 0;

  const samePath = stats1.pathLength === stats2.pathLength && stats1.found && stats2.found;

  let insight = '';
  if (pctDiff > 0 && samePath) {
    insight = `${fewerNodes} visited ${pctDiff}% fewer nodes than ${moreNodes} while finding the same path length of ${stats1.pathLength}.`;
  } else if (pctDiff > 0) {
    insight = `${fewerNodes} visited ${pctDiff}% fewer nodes than ${moreNodes}. Path lengths differ: ${name1} = ${stats1.pathLength}, ${name2} = ${stats2.pathLength}.`;
  } else {
    insight = `Both algorithms visited the same number of nodes (${stats1.nodesVisited}).`;
  }

  if (!stats1.found || !stats2.found) {
    const notFound = !stats1.found ? name1 : name2;
    insight += ` ⚠️ ${notFound} did not find a path.`;
  }

  return (
    <div className="glass-elevated rounded-2xl p-6 flex flex-col gap-6">
      <h3 className="text-lg font-bold text-white font-outfit">Comparison Results</h3>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard name={name1} stats={stats1} color="#00d4ff" />
        <StatCard name={name2} stats={stats2} color="#a855f7" />
      </div>

      {/* Bar chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="metric"
              tick={{ fill: '#8888aa', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
            />
            <YAxis
              tick={{ fill: '#8888aa', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(10,10,15,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(20px)',
                color: '#f0f0f5',
                fontSize: '13px',
              }}
            />
            <Bar dataKey={series1} name={name1} radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-1-${index}`} fill="#00d4ff" fillOpacity={0.7} />
              ))}
            </Bar>
            <Bar dataKey={series2} name={name2} radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-2-${index}`} fill="#a855f7" fillOpacity={0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insight text */}
      <p className="text-sm text-[#aaaacc] leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">
        💡 {insight}
      </p>
    </div>
  );
}

function StatCard({
  name,
  stats,
  color,
}: {
  name: string;
  stats: CompareStats;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm font-semibold text-white">{name}</span>
      </div>
      <div className="grid grid-cols-2 gap-y-1 text-xs">
        <span className="text-[#8888aa]">Visited:</span>
        <span className="text-white font-mono tabular-nums">{stats.nodesVisited}</span>
        <span className="text-[#8888aa]">Path:</span>
        <span className="text-white font-mono tabular-nums">{stats.pathLength}</span>
        <span className="text-[#8888aa]">Cost:</span>
        <span className="text-white font-mono tabular-nums">{stats.pathCost}</span>
        <span className="text-[#8888aa]">Time:</span>
        <span className="text-white font-mono tabular-nums">{stats.executionTime}ms</span>
        <span className="text-[#8888aa]">Found:</span>
        <span className={stats.found ? 'text-emerald-400' : 'text-red-400'}>
          {stats.found ? '✅ Yes' : '❌ No'}
        </span>
      </div>
    </div>
  );
}
