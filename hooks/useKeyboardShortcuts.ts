'use client';

import { useEffect } from 'react';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import { AlgorithmType } from '@/lib/grid/types';

const ALGORITHM_KEYS: Record<string, AlgorithmType> = {
  '1': 'bfs',
  '2': 'dfs',
  '3': 'dijkstra',
  '4': 'astar',
  '5': 'greedy',
  '6': 'bidirectional',
};

/**
 * useKeyboardShortcuts — Binds keyboard shortcuts for the visualizer.
 *
 * Space  — Run / Pause / Resume
 * Escape — Stop algorithm
 * C      — Clear path
 * X      — Clear board
 * M      — Generate maze
 * W      — Toggle weight placement mode
 * E      — Toggle erase mode
 * R      — Reset camera angle
 * + / =  — Increase speed
 * -      — Decrease speed
 * 1-6    — Select algorithm
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/select/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      const store = useVisualizerStore.getState();

      switch (e.key.toLowerCase()) {
        case ' ': {
          e.preventDefault();
          if (store.isVisualizing && !store.isPaused) {
            store.pauseAlgorithm();
          } else if (store.isPaused) {
            store.resumeAlgorithm();
          } else {
            store.runAlgorithm();
          }
          break;
        }

        case 'escape': {
          if (store.isVisualizing) {
            store.stopAlgorithm();
          }
          break;
        }

        case 'c': {
          if (!store.isVisualizing) {
            store.clearPath();
          }
          break;
        }

        case 'x': {
          if (!store.isVisualizing) {
            store.clearBoard();
          }
          break;
        }

        case 'm': {
          if (!store.isVisualizing) {
            store.generateMaze();
          }
          break;
        }

        case 'w': {
          if (!store.isVisualizing) {
            store.setInteractionMode(
              store.interactionMode === 'weight' ? 'wall' : 'weight'
            );
          }
          break;
        }

        case 'e': {
          if (!store.isVisualizing) {
            store.setInteractionMode(
              store.interactionMode === 'erase' ? 'wall' : 'erase'
            );
          }
          break;
        }

        case 'r': {
          store.resetCamera();
          break;
        }

        case '+':
        case '=': {
          const newSpeed = Math.min(100, store.speed + 10);
          store.setSpeed(newSpeed);
          break;
        }

        case '-': {
          const newSpeed = Math.max(1, store.speed - 10);
          store.setSpeed(newSpeed);
          break;
        }

        default: {
          // Number keys 1-6 for algorithm selection
          const algo = ALGORITHM_KEYS[e.key];
          if (algo && !store.isVisualizing) {
            store.setAlgorithm(algo);
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
