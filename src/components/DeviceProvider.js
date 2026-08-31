'use client';

import { useEffect } from 'react';
import { useDevice } from '@/hooks/useDevice';

export default function DeviceProvider({ children }) {
  const { device } = useDevice();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.dataset.device = device;
    }
  }, [device]);

  return children;
}
