import { useContext } from 'react';

import { ThemeContext } from './types';

export const useTheme = () => useContext(ThemeContext);
