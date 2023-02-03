import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

export const DocsLink: FunctionComponent = () => {
  const link = ENV.plugins.WALDUR_CORE.DOCS_URL;
  if (!link) {
    return null;
  }
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="menu-link px-2"
    >
      {translate('Documentation')}
    </a>
  );
};
