'use client';

import { useEffect, useRef } from 'react';
import { useDevice } from '@/hooks/useDevice';

export default function DeviceProvider({ children }) {
  const { device } = useDevice();
  const isFirst = useRef(true);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    document.body.dataset.device = device;
  }, [device]);

  return children;
}
