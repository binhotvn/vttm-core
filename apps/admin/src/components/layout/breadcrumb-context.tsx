'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type OverrideMap = Record<string, string>;

interface BreadcrumbContextValue {
  overrides: OverrideMap;
  setOverride: (segment: string, label: string) => void;
  clearOverrides: () => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue>({
  overrides: {},
  setOverride: () => {},
  clearOverrides: () => {},
});

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<OverrideMap>({});

  const setOverride = useCallback((segment: string, label: string) => {
    setOverrides((prev) => ({ ...prev, [segment]: label }));
  }, []);

  const clearOverrides = useCallback(() => {
    setOverrides({});
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ overrides, setOverride, clearOverrides }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbOverride() {
  return useContext(BreadcrumbContext);
}
