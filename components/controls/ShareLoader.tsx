'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useVisualizerStore } from '@/store/useVisualizerStore';

export default function ShareLoader() {
  const searchParams = useSearchParams();
  const shareId = searchParams.get('share');
  const loadGrid = useVisualizerStore((s) => s.loadGrid);

  useEffect(() => {
    if (shareId) {
      fetch(`/api/share/${shareId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.gridData && data.algorithm) {
            loadGrid(data.gridData, data.algorithm);
          }
        })
        .catch((err) => console.error('Error loading shared grid:', err));
    }
  }, [shareId, loadGrid]);

  return null;
}
