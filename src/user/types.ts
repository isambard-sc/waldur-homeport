import { ReactNode } from 'react';
import { User } from 'waldur-js-client';

export interface EditUserProps {
  user: User;
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  requiredMsg?: string;
  disabled?: boolean;
  protected?: boolean;
  protectedMsg?: string;
}
