import { useEffect, useSyncExternalStore } from 'react';
import { getServerSnapshot, getSnapshot, hydrate, subscribe } from '../../lib/planner/store';

export function usePlanner() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    hydrate();
  }, []);
  return snapshot;
}
