import { ReactNode, useEffect, useState } from 'react';

import * as ThemeStorage from './ThemeStorage';
import { ThemeContext, ThemeName } from './types';
import { getInitialTheme, loadTheme } from './utils';

/** ThemeProvider is a wrapper component that provides theme context to its children  */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeName>();

  // Switch theme and save it to local storage and cache
  const switchTheme = (name: ThemeName) => {
    setTheme(name);
    ThemeStorage.setTheme(name);
    loadTheme(name);
  };

  useEffect(() => {
    switchTheme(getInitialTheme());
  }, []);

  const toggleTheme = () => {
    switchTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
