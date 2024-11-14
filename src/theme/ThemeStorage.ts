import { ThemeName } from './types';

const key = 'waldur/theme/name';

export const getTheme = () => localStorage.getItem(key) as ThemeName;

export const setTheme = (value: ThemeName) => localStorage.setItem(key, value);
