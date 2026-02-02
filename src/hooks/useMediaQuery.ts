'use client';

import { useSyncExternalStore } from 'react';

function getServerSnapshot(): boolean {
  return false; // Default for SSR
}

export function useMediaQuery(query: string): boolean {
  const subscribe = (callback: () => void) => {
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
  };

  const getSnapshot = () => {
    return window.matchMedia(query).matches;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Preset breakpoint hooks
export function useIsMobile(): boolean {
  return !useMediaQuery('(min-width: 640px)');
}

export function useIsTablet(): boolean {
  const isAboveSm = useMediaQuery('(min-width: 640px)');
  const isAboveLg = useMediaQuery('(min-width: 1024px)');
  return isAboveSm && !isAboveLg;
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

// Breakpoint values matching Tailwind defaults
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
