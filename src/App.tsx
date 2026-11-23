import type { ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ToastProvider } from './components/Toast';
import { VisitProvider } from './state/VisitContext';
import NotFound from './screens/NotFound';
import Inspect from './screens/Inspect';
import Findings from './screens/Findings';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <VisitProvider>
      <ToastProvider>{children}</ToastProvider>
    </VisitProvider>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* ROUTES: each later task adds its <Route> lines directly above the catch-all */}
        <Route path="inspect" element={<Inspect />} />
        <Route path="findings" element={<Findings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
