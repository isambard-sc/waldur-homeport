import flatpickr from 'flatpickr';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import darkTheme from 'flatpickr/dist/themes/dark.css?url';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import lighTheme from 'flatpickr/dist/themes/light.css?url';
import { useEffect } from 'react';

import { LanguageUtilsService } from '@waldur/i18n/LanguageUtilsService';
import { ThemeName } from '@waldur/theme/types';
import { useTheme } from '@waldur/theme/useTheme';

const themes = {
  dark: darkTheme,
  light: lighTheme,
};

let styleTag: HTMLLinkElement;

function loadTheme(theme: ThemeName) {
  if (!styleTag) {
    styleTag = document.createElement('link');
    styleTag.rel = 'stylesheet';
    styleTag.type = 'text/css';
    styleTag.crossOrigin = '';
    document.head.appendChild(styleTag);
  }
  styleTag.href = themes[theme];
}

export const useFlatpickrTheme = () => {
  // Initialize flatpickr with current language
  const language = LanguageUtilsService.getCurrentLanguage();
  flatpickr.localize(flatpickr.l10ns[language.code]);
  flatpickr.l10ns.default.firstDayOfWeek = 1; // Monday

  const { theme } = useTheme();
  useEffect(() => {
    loadTheme(theme);
  }, [theme]);
};
