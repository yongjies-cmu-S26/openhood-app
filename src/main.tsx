import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AppRoutes, Providers } from './App';
import './styles/oh.css';
import './styles/app.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Providers>
        <AppRoutes />
      </Providers>
    </HashRouter>
  </StrictMode>,
);
