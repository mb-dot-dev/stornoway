// Dev-server entry only: production ships the prerendered HTML and CSS with no JavaScript (see build.ts).
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './main.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
