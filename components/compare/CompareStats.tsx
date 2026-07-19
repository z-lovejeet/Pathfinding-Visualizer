'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { ALGORITHM_INFO } from '@/lib/constants';
import { Trophy, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
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
 * and auto-generated insight text and winner badges.
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
      metric: 'Path Cost',
      [series1]: stats1.pathCost,
      [series2]: stats2.pathCost,
    },
  ];

  // Logic for Winners
  const visitedWinner = stats1.nodesVisited < stats2.nodesVisited ? 1 : stats2.nodesVisited < stats1.nodesVisited ? 2 : 0;
  // Generate insight
  const fewerNodes = stats1.nodesVisited < stats2.nodesVisited ? name1 : name2;
  const moreNodes = stats1.nodesVisited < stats2.nodesVisited ? name2 : name1;
  const fewerCount = Math.min(stats1.nodesVisited, stats2.nodesVisited);
  const moreCount = Math.max(stats1.nodesVisited, stats2.nodesVisited);
  const pctDiff = moreCount > 0 ? Math.round(((moreCount - fewerCount) / moreCount) * 100) : 0;

  const samePath = stats1.pathLength === stats2.pathLength && stats1.found && stats2.found;

  let insight = '';
  if (pctDiff > 0 && samePath) {
    insight = `${fewerNodes} is more efficient here, visiting ${pctDiff}% fewer nodes than ${moreNodes} while finding the same path length of ${stats1.pathLength}.`;
  } else if (pctDiff > 0) {
    insight = `${fewerNodes} visited ${pctDiff}% fewer nodes than ${moreNodes}. Path lengths differ: ${name1} = ${stats1.pathLength}, ${name2} = ${stats2.pathLength}.`;
  } else {
    insight = `Both algorithms performed equally well, visiting ${stats1.nodesVisited} nodes.`;
  }

  if (!stats1.found || !stats2.found) {
    const notFound = !stats1.found ? name1 : name2;
    insight += ` However, ${notFound} did not find a path.`;
  }

  return (
    <div className="glass-elevated rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00d4ff] via-transparent to-[#a855f7] opacity-50" />
      
      <h3 className="text-lg font-bold text-white font-outfit">Comparison Results</h3>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard name={name1} stats={stats1} color="#00d4ff" isWinner={visitedWinner === 1} />
        <StatCard name={name2} stats={stats2} color="#a855f7" isWinner={visitedWinner === 2} />
      </div>

      {/* Bar chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="metric"
              tick={{ fill: '#8888aa', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#8888aa', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              content={CustomTooltip}
            />
            <Bar dataKey={series1} name={name1} radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-1-${index}`} fill="#00d4ff" fillOpacity={0.8} />
              ))}
            </Bar>
            <Bar dataKey={series2} name={name2} radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-2-${index}`} fill="#a855f7" fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insight text */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 text-sm text-[#aaaacc] leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5"
      >
        <div className="text-[#00d4ff] mt-0.5">
          <AlertCircle size={18} />
        </div>
        <p>{insight}</p>
      </motion.div>
    </div>
  );
}

function StatCard({
  name,
  stats,
  color,
  isWinner
}: {
  name: string;
  stats: CompareStats;
  color: string;
  isWinner: boolean;
}) {
  return (
    <div className={`rounded-xl bg-white/[0.02] border p-4 flex flex-col gap-2 relative overflow-hidden transition-colors duration-300 ${isWinner ? 'border-yellow-500/30' : 'border-white/5'}`}>
      
      {isWinner && (
        <div className="absolute top-2 right-2 text-yellow-500/70" title="Most Efficient (Fewer Nodes)">
          <Trophy size={16} />
        </div>
      )}

      <div className="flex items-center gap-2 mb-1">
        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
        <span className="text-sm font-semibold text-white pr-6 truncate">{name}</span>
      </div>
      <div className="grid grid-cols-2 gap-y-1.5 text-xs">
        <span className="text-[#8888aa]">Visited:</span>
        <span className={`font-mono tabular-nums font-medium ${isWinner ? 'text-yellow-400' : 'text-white'}`}>{stats.nodesVisited}</span>
        
        <span className="text-[#8888aa]">Path:</span>
        <span className="text-white font-mono tabular-nums">{stats.pathLength}</span>
        
        <span className="text-[#8888aa]">Cost:</span>
        <span className="text-white font-mono tabular-nums">{stats.pathCost}</span>
        
        <span className="text-[#8888aa]">Found:</span>
        <span className={stats.found ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
          {stats.found ? '✅ Yes' : '❌ No'}
        </span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: TooltipContentProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-elevated rounded-xl p-4 border border-white/10 shadow-2xl backdrop-blur-xl min-w-[200px]">
        <p className="text-white font-bold mb-3 pb-2 border-b border-white/10">{label}</p>
        <div className="flex flex-col gap-2.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ 
                    backgroundColor: entry.color || entry.fill || '#fff',
                    boxShadow: `0 0 6px ${entry.color || entry.fill || '#fff'}`
                  }} 
                />
                <span className="text-[#aaaacc]">{entry.name}</span>
              </div>
              <span className="text-white font-mono font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};
