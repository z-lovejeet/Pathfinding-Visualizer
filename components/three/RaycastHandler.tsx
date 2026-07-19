'use client';

import React, { useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useVisualizerStore } from '@/store/useVisualizerStore';

/**
 * RaycastHandler — Invisible plane for mouse → grid coordinate translation.
 *
 * Handles click, drag, and pointer events to toggle walls, place weights,
 * and drag start/end beacons.
 */
export default function RaycastHandler() {
  const planeRef = useRef<THREE.Mesh>(null);
  const rows = useVisualizerStore((s) => s.rows);
  const cols = useVisualizerStore((s) => s.cols);
  const interactionMode = useVisualizerStore((s) => s.interactionMode);
  const isVisualizing = useVisualizerStore((s) => s.isVisualizing);
  const toggleWall = useVisualizerStore((s) => s.toggleWall);
  const setWeight = useVisualizerStore((s) => s.setWeight);
  const clearCell = useVisualizerStore((s) => s.clearCell);
  const setStart = useVisualizerStore((s) => s.setStart);
  const setEnd = useVisualizerStore((s) => s.setEnd);
  const setMouseDown = useVisualizerStore((s) => s.setMouseDown);
  const isMouseDown = useVisualizerStore((s) => s.isMouseDown);
  const grid = useVisualizerStore((s) => s.grid);

  const lastCell = useRef<{ row: number; col: number } | null>(null);

  /**
   * Convert 3D intersection point to grid row/col.
   */
  const pointToGridCell = useCallback(
    (point: THREE.Vector3): { row: number; col: number } | null => {
      const col = Math.floor(point.x + cols / 2);
      const row = Math.floor(point.z + rows / 2);
      if (row >= 0 && row < rows && col >= 0 && col < cols) {
        return { row, col };
      }
      return null;
    },
    [rows, cols]
  );

  const handleInteraction = useCallback(
    (cell: { row: number; col: number }) => {
      if (isVisualizing) return;
      if (interactionMode === 'none') return;

      const node = grid[cell.row]?.[cell.col];
      if (!node) return;

      // Check if clicking on start or end node
      if (node.type === 'start' || node.type === 'end') return;

      switch (interactionMode) {
        case 'wall':
          toggleWall(cell.row, cell.col);
          break;
        case 'weight':
          setWeight(cell.row, cell.col, 5);
          break;
        case 'erase':
          if (node.type === 'wall' || node.type === 'weight') {
            clearCell(cell.row, cell.col);
          }
          break;
        case 'start':
          setStart(cell.row, cell.col);
          break;
        case 'end':
          setEnd(cell.row, cell.col);
          break;
      }
    },
    [interactionMode, isVisualizing, grid, toggleWall, setWeight, clearCell, setStart, setEnd]
  );

  const onPointerDown = useCallback(
    (e: { point: THREE.Vector3; stopPropagation: () => void; nativeEvent: MouseEvent }) => {
      // Only handle left-click (button 0) — let right-click pass through for camera pan
      if (e.nativeEvent.button !== 0) return;

      e.stopPropagation();
      setMouseDown(true);

      const cell = pointToGridCell(e.point);
      if (cell) {
        lastCell.current = cell;
        handleInteraction(cell);
      }
    },
    [pointToGridCell, handleInteraction, setMouseDown]
  );

  const onPointerMove = useCallback(
    (e: { point: THREE.Vector3 }) => {
      if (!isMouseDown) return;

      const cell = pointToGridCell(e.point);
      if (cell && (cell.row !== lastCell.current?.row || cell.col !== lastCell.current?.col)) {
        lastCell.current = cell;
        handleInteraction(cell);
      }
    },
    [isMouseDown, pointToGridCell, handleInteraction]
  );

  const onPointerUp = useCallback(() => {
    setMouseDown(false);
    lastCell.current = null;
  }, [setMouseDown]);

  return (
    <mesh
      ref={planeRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.5, 0]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      visible={false}
    >
      <planeGeometry args={[cols + 2, rows + 2]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}
