import React from 'react';
import { BookOpen, Route, Grid3X3 } from 'lucide-react';
import { LEARN_DATA } from '@/lib/learn/algorithmData';
import AlgorithmCard from '@/components/learn/AlgorithmCard';
import ComplexityTable from '@/components/learn/ComplexityTable';

/**
 * Learn Page — Deep dive into all pathfinding and maze algorithms.
 *
 * Server-rendered page with Shiki pseudocode highlighting.
 * Uses <details>/<summary> for zero-JS expand/collapse on algorithm cards.
 */

export const metadata = {
  title: 'Learn Algorithms | Pathfinding Visualizer',
  description: 'Deep dive into BFS, DFS, Dijkstra, A*, Greedy BFS, Bidirectional BFS, and 4 maze generation algorithms with pseudocode, complexity analysis, and step-by-step explanations.',
};

export default function LearnPage() {
  const pathfinding = LEARN_DATA.filter((a) => a.category === 'pathfinding');
  const maze = LEARN_DATA.filter((a) => a.category === 'maze');

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-[#8b5cf6]/20 flex items-center justify-center border border-white/5">
            <BookOpen size={20} className="text-[#00d4ff]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-outfit">
            Learn the Algorithms
          </h1>
        </div>
        <p className="text-[#8888aa] text-base max-w-2xl leading-relaxed">
          Deep dive into how each pathfinding and maze generation algorithm works.
          Expand any card to see pseudocode, step-by-step walkthroughs, and key insights.
        </p>
      </div>

      {/* Pathfinding Section */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Route size={18} className="text-[#00d4ff]" />
          <h2 className="text-xl font-bold text-white font-outfit">
            Pathfinding Algorithms
          </h2>
          <span className="text-xs text-[#555577] ml-2">({pathfinding.length} algorithms)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pathfinding.map((algo) => (
            <AlgorithmCard key={algo.id} data={algo} />
          ))}
        </div>
      </section>

      {/* Maze Section */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Grid3X3 size={18} className="text-[#a78bfa]" />
          <h2 className="text-xl font-bold text-white font-outfit">
            Maze Generation Algorithms
          </h2>
          <span className="text-xs text-[#555577] ml-2">({maze.length} algorithms)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {maze.map((algo) => (
            <AlgorithmCard key={algo.id} data={algo} />
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section>
        <ComplexityTable />
      </section>
    </div>
  );
}
