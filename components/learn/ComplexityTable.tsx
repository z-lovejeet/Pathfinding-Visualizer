import React from 'react';
import { LEARN_DATA } from '@/lib/learn/algorithmData';

/**
 * ComplexityTable — All-algorithms comparison table from Blueprint §17.
 * Server component — no client JS needed.
 */
export default function ComplexityTable() {
  const pathfinding = LEARN_DATA.filter((a) => a.category === 'pathfinding');

  return (
    <div className="glass-elevated rounded-2xl p-6 overflow-x-auto">
      <h2 className="text-xl font-bold text-white mb-4 font-outfit">
        Algorithm Comparison
      </h2>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-[#8888aa] border-b border-white/5">
            <th className="py-3 px-3 font-medium">Algorithm</th>
            <th className="py-3 px-3 font-medium">Shortest?</th>
            <th className="py-3 px-3 font-medium">Weighted?</th>
            <th className="py-3 px-3 font-medium">Heuristic?</th>
            <th className="py-3 px-3 font-medium">Data Structure</th>
            <th className="py-3 px-3 font-medium">Time</th>
            <th className="py-3 px-3 font-medium">Space</th>
          </tr>
        </thead>
        <tbody>
          {pathfinding.map((algo) => (
            <tr
              key={algo.id}
              className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
            >
              <td className="py-3 px-3 text-white font-medium">{algo.name.split('(')[0].trim()}</td>
              <td className="py-3 px-3">
                <span className={algo.guaranteesShortestPath ? 'text-emerald-400' : 'text-red-400'}>
                  {algo.guaranteesShortestPath ? '✅' : '❌'}
                </span>
              </td>
              <td className="py-3 px-3">
                <span className={algo.handlesWeights ? 'text-emerald-400' : 'text-red-400'}>
                  {algo.handlesWeights ? '✅' : '❌'}
                </span>
              </td>
              <td className="py-3 px-3">
                <span className={algo.usesHeuristic ? 'text-emerald-400' : 'text-red-400'}>
                  {algo.usesHeuristic ? '✅' : '❌'}
                </span>
              </td>
              <td className="py-3 px-3 text-[#a78bfa] font-mono text-xs">{algo.dataStructure}</td>
              <td className="py-3 px-3 font-mono text-xs text-[#fbbf24]">{algo.timeComplexity}</td>
              <td className="py-3 px-3 font-mono text-xs text-[#8888aa]">{algo.spaceComplexity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
