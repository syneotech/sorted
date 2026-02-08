import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMediaQuery, useIsMobile, useIsDesktop, useIsTablet, BREAKPOINTS } from '../useMediaQuery';

describe('useMediaQuery', () => {
  // Store original matchMedia
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    // Mock matchMedia
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('should return false when query does not match', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 640px)'));
    expect(result.current).toBe(false);
  });

  it('should return true when query matches', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(min-width: 640px)'));
    expect(result.current).toBe(true);
  });
});

describe('useIsMobile', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('should return true when viewport is below 640px', () => {
    // Mobile: min-width: 640px should NOT match (returns false), so useIsMobile returns !false = true
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false, // Below 640px
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should return false when viewport is above 640px', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: true, // Above 640px
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});

describe('useIsDesktop', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('should return true when viewport is above 1024px', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('1024px'), // Only match 1024px query
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(true);
  });

  it('should return false when viewport is below 1024px', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(false);
  });
});

describe('useIsTablet', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('should return true when viewport is between 640px and 1024px', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      // Match 640px but not 1024px
      matches: query.includes('640px'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useIsTablet());
    expect(result.current).toBe(true);
  });
});

describe('BREAKPOINTS', () => {
  it('should have correct Tailwind breakpoint values', () => {
    expect(BREAKPOINTS.sm).toBe(640);
    expect(BREAKPOINTS.md).toBe(768);
    expect(BREAKPOINTS.lg).toBe(1024);
    expect(BREAKPOINTS.xl).toBe(1280);
    expect(BREAKPOINTS['2xl']).toBe(1536);
  });
});
