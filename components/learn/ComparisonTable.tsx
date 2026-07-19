'use client';

import React, { useState } from 'react';
import { LEARN_DATA } from '@/lib/learn/algorithmData';

/**
 * ComparisonTable — All-algorithms comparison table from Blueprint §17.
 * Interactive rows, missing columns (space complexity), responsive scroll.
 */
export default function ComparisonTable() {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  
  const pathfinding = LEARN_DATA.filter((a) => a.category === 'pathfinding');
  const mazes = LEARN_DATA.filter((a) => a.category === 'maze');

  const renderRow = (algo: typeof LEARN_DATA[0]) => {
    const isHovered = hoveredRow === algo.id;
    const isDimmed = hoveredRow !== null && !isHovered;

    return (
      <tr
        key={algo.id}
        onMouseEnter={() => setHoveredRow(algo.id)}
        onMouseLeave={() => setHoveredRow(null)}
        className={`border-b border-white/[0.03] transition-all duration-200 whitespace-nowrap ${
          isHovered ? 'bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(255,255,255,0.1)]' : ''
        } ${isDimmed ? 'opacity-40 saturate-50' : 'opacity-100'}`}
      >
        <td className="py-3 px-4 text-white font-medium">{algo.name.split('(')[0].trim()}</td>
        <td className="py-3 px-4">
          <span className={algo.category === 'pathfinding' ? 'text-cyan-400' : 'text-purple-400'}>
            {algo.category === 'pathfinding' ? 'Pathfinding' : 'Maze Gen'}
          </span>
        </td>
        <td className="py-3 px-4">
          {algo.category === 'pathfinding' ? (
            <span className={algo.guaranteesShortestPath ? 'text-emerald-400' : 'text-red-400'}>
              {algo.guaranteesShortestPath ? '✅ Yes' : '❌ No'}
            </span>
          ) : (
            <span className="text-[#555577]">-</span>
          )}
        </td>
        <td className="py-3 px-4">
          {algo.category === 'pathfinding' ? (
            <span className={algo.handlesWeights ? 'text-emerald-400' : 'text-red-400'}>
              {algo.handlesWeights ? '✅ Yes' : '❌ No'}
            </span>
          ) : (
             <span className="text-[#555577]">-</span>
          )}
        </td>
        <td className="py-3 px-4 text-[#e2e8f0] font-medium">{algo.nodesExplored}</td>
        <td className="py-3 px-4 text-[#a78bfa] font-mono text-xs">{algo.dataStructure}</td>
        <td className="py-3 px-4 font-mono text-xs text-[#fbbf24]">{algo.timeComplexity}</td>
        <td className="py-3 px-4 font-mono text-xs text-[#38bdf8]">{algo.spaceComplexity}</td>
        <td className="py-3 px-4 text-[#94a3b8] text-xs max-w-[200px] truncate" title={algo.visualBehavior3D}>
          {algo.visualBehavior3D}
        </td>
      </tr>
    );
  };

  return (
    <div className="glass-elevated rounded-2xl p-6 overflow-hidden flex flex-col">
      <h2 className="text-xl font-bold text-white mb-4 font-outfit shrink-0">
        Algorithm Complexity & Features
      </h2>

      <div className="overflow-x-auto overflow-y-hidden -mx-6 px-6 custom-scrollbar pb-4">
        <table className="w-full text-sm border-collapse" style={{ tableLayout: 'auto' }}>
          <thead>
            <tr className="text-left text-[#8888aa] border-b border-white/10 whitespace-nowrap bg-white/[0.02]">
              <th className="py-3 px-4 font-medium rounded-tl-lg">Algorithm</th>
              <th className="py-3 px-4 font-medium">Type</th>
              <th className="py-3 px-4 font-medium">Shortest?</th>
              <th className="py-3 px-4 font-medium">Weighted?</th>
              <th className="py-3 px-4 font-medium">Nodes Explored</th>
              <th className="py-3 px-4 font-medium">Data Structure</th>
              <th className="py-3 px-4 font-medium">Time (Worst)</th>
              <th className="py-3 px-4 font-medium">Space (Worst)</th>
              <th className="py-3 px-4 font-medium rounded-tr-lg">3D Visual</th>
            </tr>
          </thead>
          <tbody>
            {pathfinding.map(renderRow)}
            {mazes.map(renderRow)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
