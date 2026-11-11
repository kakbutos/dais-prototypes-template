import type { ReactNode } from 'react';
import { GlobalStyle, PopupProvider } from '@daisforge/ui';

// Общее окружение компонентов для галереи и автономного HTML.
export function AppProviders({ children }: { children: ReactNode }) {
  return <><GlobalStyle theme="light" /><PopupProvider>{children}</PopupProvider></>;
}
