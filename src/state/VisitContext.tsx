import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { reducer, type Action, type State } from './reducer';
import { loadState, safeStorage, saveState, STORAGE_KEY } from './storage';

interface VisitValue {
  state: State;
  dispatch: (action: Action) => Promise<State | null>;
  /** false when this browser blocks localStorage */
  storageOk: boolean;
}

const VisitContext = createContext<VisitValue | null>(null);

async function withStorageLock<T>(write: () => T): Promise<T> {
  const locks = window.navigator.locks;
  if (!locks) return write();

  let acquired = false;
  try {
    return await locks.request(STORAGE_KEY, () => {
      acquired = true;
      return write();
    });
  } catch (error) {
    if (acquired) throw error;
    return write();
  }
}

export function VisitProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => loadState());
  const [storageOk, setStorageOk] = useState(true);
  const latest = useRef(state);
  const hasUnsavedChanges = useRef(false);

  const persist = useCallback((next: State, storage: Storage | null) => {
    const saved = saveState(next, storage);
    hasUnsavedChanges.current = !saved;
    latest.current = next;
    setState(next);
    setStorageOk(saved);
  }, []);

  const dispatch = useCallback<VisitValue['dispatch']>(async (action) => {
    try {
      return await withStorageLock(() => {
        const storage = safeStorage();
        const current = hasUnsavedChanges.current ? latest.current : loadState(storage, latest.current);
        const next = reducer(current, action);
        persist(next, storage);
        return next;
      });
    } catch (error) {
      console.error('Could not update visit state', error);
      return null;
    }
  }, [persist]);

  useEffect(() => {
    const storage = safeStorage();
    let active = true;
    void withStorageLock(() => {
      if (active) persist(loadState(storage, latest.current), storage);
    }).catch((error: unknown) => {
      console.error('Could not initialize visit state', error);
      if (active) setStorageOk(false);
    });

    function sync(event: StorageEvent) {
      if (event.key !== STORAGE_KEY || event.storageArea !== storage || hasUnsavedChanges.current) return;
      const next = loadState(storage);
      latest.current = next;
      setState(next);
    }

    window.addEventListener('storage', sync);
    return () => {
      active = false;
      window.removeEventListener('storage', sync);
    };
  }, [persist]);

  return <VisitContext.Provider value={{ state, dispatch, storageOk }}>{children}</VisitContext.Provider>;
}

export function useVisit(): VisitValue {
  const value = useContext(VisitContext);
  if (!value) throw new Error('useVisit must be used inside VisitProvider');
  return value;
}
