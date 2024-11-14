import { FunctionComponent } from 'react';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { translate } from '@waldur/i18n';
import { useTheme } from '@waldur/theme/useTheme';

export const ThemeSwitcher: FunctionComponent = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="menu-item px-5" data-kt-menu-trigger="click">
      <div className="px-5 menu-link">
        <AwesomeCheckbox
          label={translate('Dark theme')}
          value={theme === 'dark'}
          onChange={toggleTheme}
        />
      </div>
    </div>
  );
};
