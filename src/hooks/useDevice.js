'use client';

import { useState, useEffect } from 'react';

const getDevice = (width) => {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

export function useDevice() {
  const [device, setDevice] = useState(() =>
    typeof window !== 'undefined' ? getDevice(window.innerWidth) : 'desktop'
  );

  useEffect(() => {
    setDevice(getDevice(window.innerWidth));
    const handle = () => setDevice(getDevice(window.innerWidth));
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  return {
    device,
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',
  };
}
