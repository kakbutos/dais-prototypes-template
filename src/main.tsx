import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from './AppProviders';
import { App } from './App';
import './assets/fonts/fonts.css';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><AppProviders><App /></AppProviders></StrictMode>,
);
