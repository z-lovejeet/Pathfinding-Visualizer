'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import { isAlgorithmType, isSharedGridData } from '@/lib/share/validation';

export default function ShareLoader() {
  const searchParams = useSearchParams();
  const shareId = searchParams.get('share');
  const loadGrid = useVisualizerStore((s) => s.loadGrid);

  useEffect(() => {
    if (!shareId) return;

    const controller = new AbortController();

    fetch(`/api/share/${encodeURIComponent(shareId)}`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<unknown>;
      })
      .then((data) => {
        if (data && typeof data === 'object') {
          const sharedGrid = data as Record<string, unknown>;

          if (
            isSharedGridData(sharedGrid.gridData) &&
            isAlgorithmType(sharedGrid.algorithm)
          ) {
            loadGrid(sharedGrid.gridData, sharedGrid.algorithm);
          }
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Unable to load a shared grid.', error);
      });

    return () => controller.abort();
  }, [shareId, loadGrid]);

  return null;
}
