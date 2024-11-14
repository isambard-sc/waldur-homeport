import { createContext } from 'react';

export type ThemeName = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeName;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});
