import { NODE_COLORS } from '../constants';
import { GridNode } from '../grid/types';

/**
 * Get the Three.js hex color for a node based on its current state.
 */
export function getNodeColor(node: GridNode): number {
  // Prioritize visual state during/after visualization
  if (node.visualState === 'path') return NODE_COLORS.path.hex;
  if (node.visualState === 'current') return NODE_COLORS.current.hex;
  if (node.visualState === 'visited') return NODE_COLORS.visited.hex;

  // Fall back to node type
  switch (node.type) {
    case 'start': return NODE_COLORS.start.hex;
    case 'end': return NODE_COLORS.end.hex;
    case 'wall': return NODE_COLORS.wall.hex;
    case 'weight': return NODE_COLORS.weight.hex;
    default: return NODE_COLORS.empty.hex;
  }
}

/**
 * Get the emissive color for 3D glow effect.
 */
export function getEmissiveColor(node: GridNode): number {
  if (node.visualState === 'path') return NODE_COLORS.path.emissive;
  if (node.visualState === 'current') return NODE_COLORS.current.emissive;
  if (node.visualState === 'visited') return NODE_COLORS.visited.emissive;

  switch (node.type) {
    case 'start': return NODE_COLORS.start.emissive;
    case 'end': return NODE_COLORS.end.emissive;
    case 'weight': return NODE_COLORS.weight.emissive;
    default: return NODE_COLORS.empty.emissive;
  }
}

/**
 * Get emissive intensity for bloom strength.
 */
export function getEmissiveIntensity(node: GridNode): number {
  if (node.visualState === 'path') return NODE_COLORS.path.intensity;
  if (node.visualState === 'current') return NODE_COLORS.current.intensity;
  if (node.visualState === 'visited') return NODE_COLORS.visited.intensity;

  switch (node.type) {
    case 'start': return NODE_COLORS.start.intensity;
    case 'end': return NODE_COLORS.end.intensity;
    case 'weight': return NODE_COLORS.weight.intensity;
    default: return NODE_COLORS.empty.intensity;
  }
}

/**
 * Get the target Y height for a node (used for 3D rise animation).
 */
export function getNodeHeight(node: GridNode): number {
  if (node.visualState === 'path') return NODE_COLORS.path.height;
  if (node.visualState === 'current') return NODE_COLORS.current.height;
  if (node.visualState === 'visited') return NODE_COLORS.visited.height;

  switch (node.type) {
    case 'start': return NODE_COLORS.start.height;
    case 'end': return NODE_COLORS.end.height;
    case 'wall': return NODE_COLORS.wall.height;
    case 'weight': return NODE_COLORS.weight.height;
    default: return NODE_COLORS.empty.height;
  }
}
