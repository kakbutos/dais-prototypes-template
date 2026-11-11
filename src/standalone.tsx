import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from './AppProviders';
import Screen, { meta } from 'virtual:dais-prototype';
import { PreviewBoundary } from './PreviewBoundary';
import './assets/fonts/fonts.css';
import './styles.css';

document.title = meta.title;
createRoot(document.getElementById('root')!).render(
  <StrictMode><AppProviders><PreviewBoundary><Screen /></PreviewBoundary></AppProviders></StrictMode>,
);
