import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from './Icon';

const ToastContext = createContext<(text: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [text, setText] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((next: string) => {
    setText(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setText(null), 4000);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-region" aria-live="polite">
        {text && (
          <div className="oh-toast">
            <span className="oh-toast__icon">
              <Icon name="check" />
            </span>
            <div>
              <b>{text}</b>
              <div className="oh-toast__meta">Saved on this device</div>
            </div>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): (text: string) => void {
  return useContext(ToastContext);
}
