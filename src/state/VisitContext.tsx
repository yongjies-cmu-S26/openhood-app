import { createContext, useCallback, useContext, useEffect, useRef, useState, type Dispatch, type ReactNode } from 'react';
import { reducer, type Action, type State } from './reducer';
import { loadState, safeStorage, saveState, STORAGE_KEY } from './storage';

interface VisitValue {
  state: State;
  dispatch: Dispatch<Action>;
  /** false when this browser blocks localStorage */
  storageOk: boolean;
}

const VisitContext = createContext<VisitValue | null>(null);

function withStorageLock(write: () => void) {
  const locks = window.navigator.locks;
  if (!locks) {
    write();
    return;
  }

  let acquired = false;
  void locks.request(STORAGE_KEY, () => {
    acquired = true;
    write();
  }).catch((error: unknown) => {
    if (acquired) throw error;
    write();
  });
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

  const dispatch = useCallback<Dispatch<Action>>((action) => {
    withStorageLock(() => {
      const storage = safeStorage();
      const current = hasUnsavedChanges.current ? latest.current : loadState(storage, latest.current);
      persist(reducer(current, action), storage);
    });
  }, [persist]);

  useEffect(() => {
    const storage = safeStorage();
    let active = true;
    withStorageLock(() => {
      if (active) persist(loadState(storage, latest.current), storage);
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
