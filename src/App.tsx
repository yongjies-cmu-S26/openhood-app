import type { ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ToastProvider } from './components/Toast';
import { VisitProvider } from './state/VisitContext';
import NotFound from './screens/NotFound';
import Inspect from './screens/Inspect';
import Findings from './screens/Findings';
import Home from './screens/Home';
import Finding from './screens/Finding';
import Evidence from './screens/Evidence';
import Help from './screens/Help';
import Summary from './screens/Summary';
import Ask from './screens/Ask';
import Live from './screens/Live';

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
        <Route index element={<Home />} />
        <Route path="findings/:id" element={<Finding />} />
        <Route path="findings/:id/evidence" element={<Evidence />} />
        <Route path="help" element={<Help />} />
        <Route path="help/:term" element={<Help />} />
        <Route path="summary" element={<Summary />} />
        <Route path="ask" element={<Ask />} />
        <Route path="live" element={<Live />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
