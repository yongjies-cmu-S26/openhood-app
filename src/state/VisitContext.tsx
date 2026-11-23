import { createContext, useContext, useEffect, useReducer, useState, type Dispatch, type ReactNode } from 'react';
import { reducer, type Action, type State } from './reducer';
import { loadState, saveState } from './storage';

interface VisitValue {
  state: State;
  dispatch: Dispatch<Action>;
  /** false when this browser blocks localStorage */
  storageOk: boolean;
}

const VisitContext = createContext<VisitValue | null>(null);

export function VisitProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState());
  const [storageOk, setStorageOk] = useState(true);

  useEffect(() => {
    setStorageOk(saveState(state));
  }, [state]);

  return <VisitContext.Provider value={{ state, dispatch, storageOk }}>{children}</VisitContext.Provider>;
}

export function useVisit(): VisitValue {
  const value = useContext(VisitContext);
  if (!value) throw new Error('useVisit must be used inside VisitProvider');
  return value;
}
