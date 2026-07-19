'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import { getEmissiveColor } from '@/lib/animation/colorUtils';
import { NODE_PHASE } from '@/lib/animation/AnimationEngine';

/**
 * CityMesh — 3D miniature city rendering of the pathfinding grid.
 *
 * Uses THREE separate InstancedMeshes for maximum visual fidelity:
 * 1. Roads    — flat asphalt tiles for all cells (glow during animation)
 * 2. Buildings — tall boxes for wall cells with randomized heights & window glow
 * 3. Trees    — cone shapes for weight cells (parks)
 *
 * Spring physics drive all transitions for satisfying pop-up/bounce effects.
 * Reads AnimationEngine shared buffers for pathfinding visualization overlays.
 */

// ─── CONSTANTS ───
const BUILDING_HEIGHTS = [0.5, 0.7, 0.9, 1.1, 1.4];
const getBuildingHeight = (row: number, col: number) =>
  BUILDING_HEIGHTS[(row * 31 + col * 17) % BUILDING_HEIGHTS.length];

// Road phase colors
const ROAD_BASE = 0x1e293b;
const ROAD_WEIGHT = 0x0f766e;
const ROAD_VISITED = 0x6366f1;
const ROAD_PATH = 0x06b6d4;
const ROAD_CURRENT = 0xf8fafc;

export default function CityMesh() {
  const roadRef = useRef<THREE.InstancedMesh>(null);
  const buildingRef = useRef<THREE.InstancedMesh>(null);
  const treeRef = useRef<THREE.InstancedMesh>(null);

  const grid = useVisualizerStore((s) => s.grid);
  const rows = useVisualizerStore((s) => s.rows);
  const cols = useVisualizerStore((s) => s.cols);
  const animationEngine = useVisualizerStore((s) => s.animationEngine);

  const count = rows * cols;

  // Temp objects (reused every frame)
  const tmpObj = useMemo(() => new THREE.Object3D(), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);
  const tmpEmColor = useMemo(() => new THREE.Color(), []);

  // Per-instance spring state for all three meshes
  const stateRef = useRef<{
    roadH: Float32Array; roadV: Float32Array; roadC: THREE.Color[]; roadE: Float32Array;
    bldgH: Float32Array; bldgV: Float32Array;
    treeS: Float32Array; treeV: Float32Array;
  } | null>(null);
  const needsRenderRef = useRef(true);

  // (Re)initialize spring state when grid size changes
  useEffect(() => {
    stateRef.current = {
      roadH: new Float32Array(count).fill(0.08),
      roadV: new Float32Array(count),
      roadC: Array.from({ length: count }, () => new THREE.Color(ROAD_BASE)),
      roadE: new Float32Array(count),
      bldgH: new Float32Array(count),
      bldgV: new Float32Array(count),
      treeS: new Float32Array(count),
      treeV: new Float32Array(count),
    };
    needsRenderRef.current = true;
  }, [count]);

  // Trigger re-render when grid or animation engine changes
  useEffect(() => { needsRenderRef.current = true; }, [animationEngine, grid]);

  // ─── PER-FRAME UPDATE ───
  useFrame((_, delta) => {
    const S = stateRef.current;
    if (!roadRef.current || !buildingRef.current || !treeRef.current || !grid?.length || !S) return;
    if (!animationEngine && !needsRenderRef.current) return;
    const forceUpload = needsRenderRef.current;

    const buffers = animationEngine?.getBuffers();
    const dt = Math.min(delta, 0.05);
    let dirty = false;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i = row * cols + col;
        const node = grid[row]?.[col];
        if (!node) continue;

        const active = buffers?.activeNodes[i] === 1 ? buffers : null;
        const phase = active ? active.nodePhase[i] : NODE_PHASE.IDLE;
        const x = col - cols / 2 + 0.5;
        const z = row - rows / 2 + 0.5;

        // ════════════════════════════════════════
        //  ROAD TILE
        // ════════════════════════════════════════
        // Target height: flat normally, slight pop during animation
        let rTgtH = 0.08;
        if (phase === NODE_PHASE.CURRENT) rTgtH = 0.18;
        else if (phase === NODE_PHASE.VISITED) rTgtH = 0.13;
        else if (phase === NODE_PHASE.PATH) rTgtH = 0.22;
        // Baked visual state (post-animation)
        else if (node.visualState === 'path') rTgtH = 0.22;
        else if (node.visualState === 'visited') rTgtH = 0.13;

        // Spring physics
        let rK = 200, rD = 20;
        if (phase === NODE_PHASE.CURRENT) { rK = 400; rD = 28; }
        else if (phase === NODE_PHASE.VISITED) { rK = 180; rD = 12; }
        else if (phase === NODE_PHASE.PATH) { rK = 120; rD = 8; }

        const rDisp = rTgtH - S.roadH[i];
        S.roadV[i] += (rK * rDisp - rD * S.roadV[i]) * dt;
        S.roadH[i] += S.roadV[i] * dt;
        if (Math.abs(rDisp) < 0.001 && Math.abs(S.roadV[i]) < 0.001) {
          S.roadH[i] = rTgtH; S.roadV[i] = 0;
        } else { dirty = true; }

        // Road emissive intensity
        let rTgtE = 0;
        if (active) { rTgtE = active.targetEmissives[i]; }
        else if (node.visualState === 'visited') rTgtE = 1.5;
        else if (node.visualState === 'path') rTgtE = 3.0;
        else if (node.visualState === 'current') rTgtE = 2.5;

        const eLerp = 1 - Math.pow(0.001, dt);
        if (Math.abs(S.roadE[i] - rTgtE) > 0.01) {
          S.roadE[i] += (rTgtE - S.roadE[i]) * eLerp;
          dirty = true;
        } else { S.roadE[i] = rTgtE; }

        // Road color
        let rHex = ROAD_BASE;
        if (node.type === 'weight') rHex = ROAD_WEIGHT;
        // Animation phase overrides
        if (phase === NODE_PHASE.CURRENT) rHex = ROAD_CURRENT;
        else if (phase === NODE_PHASE.VISITED) rHex = ROAD_VISITED;
        else if (phase === NODE_PHASE.PATH) rHex = ROAD_PATH;
        // Baked visual state overrides
        else if (node.visualState === 'visited') rHex = ROAD_VISITED;
        else if (node.visualState === 'path') rHex = ROAD_PATH;
        else if (node.visualState === 'current') rHex = ROAD_CURRENT;

        tmpColor.set(rHex);

        // Emissive bloom blend
        if (S.roadE[i] > 0.1) {
          const emHex = phase === NODE_PHASE.VISITED ? ROAD_VISITED
            : phase === NODE_PHASE.PATH ? ROAD_PATH
            : phase === NODE_PHASE.CURRENT ? ROAD_CURRENT
            : getEmissiveColor(node);
          tmpEmColor.set(emHex);
          tmpColor.lerp(tmpEmColor, Math.min(S.roadE[i] * 0.15, 0.6));
        }

        // Smooth color lerp
        const cLerp = 1 - Math.pow(0.0005, dt);
        if (
          Math.abs(S.roadC[i].r - tmpColor.r) > 0.005 ||
          Math.abs(S.roadC[i].g - tmpColor.g) > 0.005 ||
          Math.abs(S.roadC[i].b - tmpColor.b) > 0.005
        ) { S.roadC[i].lerp(tmpColor, cLerp); dirty = true; }
        else { S.roadC[i].copy(tmpColor); }

        // Apply road instance
        tmpObj.position.set(x, S.roadH[i] / 2, z);
        tmpObj.scale.set(1.0, Math.max(0.01, S.roadH[i]), 1.0); // Solid grid width
        tmpObj.updateMatrix();
        roadRef.current!.setMatrixAt(i, tmpObj.matrix);
        roadRef.current!.setColorAt(i, S.roadC[i]);

        // ════════════════════════════════════════
        //  BUILDING
        // ════════════════════════════════════════
        const bTgtH = node.type === 'wall' ? getBuildingHeight(row, col) : 0;
        const bK = node.type === 'wall' ? 150 : 200;
        const bD = node.type === 'wall' ? 10 : 20;
        const bDisp = bTgtH - S.bldgH[i];
        S.bldgV[i] += (bK * bDisp - bD * S.bldgV[i]) * dt;
        S.bldgH[i] += S.bldgV[i] * dt;
        if (Math.abs(bDisp) < 0.001 && Math.abs(S.bldgV[i]) < 0.001) {
          S.bldgH[i] = bTgtH; S.bldgV[i] = 0;
        } else { dirty = true; }

        if (S.bldgH[i] > 0.01) {
          tmpObj.position.set(x, 0.08 + S.bldgH[i] / 2, z);
          tmpObj.scale.set(0.82, S.bldgH[i], 0.82);
        } else {
          tmpObj.position.set(x, -10, z);
          tmpObj.scale.set(0, 0, 0);
        }
        tmpObj.updateMatrix();
        buildingRef.current!.setMatrixAt(i, tmpObj.matrix);

        // ════════════════════════════════════════
        //  TREE (park weight indicator)
        // ════════════════════════════════════════
        const tTgt = node.type === 'weight' ? 1 : 0;
        const tDisp = tTgt - S.treeS[i];
        S.treeV[i] += (200 * tDisp - 18 * S.treeV[i]) * dt;
        S.treeS[i] += S.treeV[i] * dt;
        if (Math.abs(tDisp) < 0.001 && Math.abs(S.treeV[i]) < 0.001) {
          S.treeS[i] = tTgt; S.treeV[i] = 0;
        } else { dirty = true; }

        if (S.treeS[i] > 0.01) {
          const ts = S.treeS[i];
          tmpObj.position.set(x, 0.12 + 0.28 * ts, z);
          tmpObj.scale.set(ts, ts, ts);
        } else {
          tmpObj.position.set(x, -10, z);
          tmpObj.scale.set(0, 0, 0);
        }
        tmpObj.updateMatrix();
        treeRef.current!.setMatrixAt(i, tmpObj.matrix);
      }
    }

    if (dirty || forceUpload) {
      roadRef.current!.instanceMatrix.needsUpdate = true;
      if (roadRef.current!.instanceColor) roadRef.current!.instanceColor.needsUpdate = true;
      buildingRef.current!.instanceMatrix.needsUpdate = true;
      treeRef.current!.instanceMatrix.needsUpdate = true;
    }
    if (!animationEngine) needsRenderRef.current = dirty;
  });

  return (
    <group>
      {/* Road tiles — flat surface for all cells */}
      <instancedMesh ref={roadRef} args={[undefined, undefined, count]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          vertexColors
          roughness={0.8}
          metalness={0.1}
          emissive="#6366f1"
          emissiveIntensity={0.2}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Buildings — sleek slate structures with cyan window glow */}
      <instancedMesh ref={buildingRef} args={[undefined, undefined, count]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#475569"
          roughness={0.5}
          metalness={0.4}
          emissive="#38bdf8"
          emissiveIntensity={0.2}
        />
      </instancedMesh>

      {/* Trees — pine cones for park/weight cells */}
      <instancedMesh ref={treeRef} args={[undefined, undefined, count]} castShadow>
        <coneGeometry args={[0.28, 0.55, 6]} />
        <meshStandardMaterial
          color="#14b8a6"
          roughness={0.7}
          metalness={0.1}
          emissive="#0d9488"
          emissiveIntensity={0.15}
        />
      </instancedMesh>
    </group>
  );
}
