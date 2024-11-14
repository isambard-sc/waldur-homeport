// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import dark from '@waldur/metronic/sass/style.dark.scss?url';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import light from '@waldur/metronic/sass/style.scss?url';

import { ENV } from '@waldur/configs/default';

import * as ThemeStorage from './ThemeStorage';
import { ThemeName } from './types';

const hrefs = { dark, light };

let styleTag: HTMLLinkElement;

export function loadTheme(newTheme: ThemeName) {
  if (!styleTag) {
    styleTag = document.createElement('link');
    styleTag.rel = 'stylesheet';
    styleTag.type = 'text/css';
    styleTag.crossOrigin = '';
    document.head.appendChild(styleTag);
  }
  styleTag.href = hrefs[newTheme];
}

function getPreference(): ThemeName {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/** Get initial theme from local storage or user preference */
export const getInitialTheme = () => {
  let currentTheme = ThemeStorage.getTheme();
  if (!currentTheme) {
    currentTheme = getPreference();
  }
  if (ENV.plugins.WALDUR_CORE.DISABLE_DARK_THEME) {
    currentTheme = 'light';
  }
  ThemeStorage.setTheme(currentTheme);
  return currentTheme;
};
