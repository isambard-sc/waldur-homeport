import { ReactNode } from 'react';

export interface Tab {
  title: ReactNode;
  to?: string;
  redirectTo?: { state; params? } | string;
  params?: Record<string, any>;
  disabled?: boolean;
  visible?: boolean;
  children?: Tab[];
}
