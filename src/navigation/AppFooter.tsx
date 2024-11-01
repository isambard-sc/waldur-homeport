import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { BackendHealthStatusIndicator } from '@waldur/navigation/BackendHealthStatusIndicator';

import { FooterLinks } from './FooterLinks';

export const AppFooter: FunctionComponent = () => {
  return (
    <div className="footer py-4 d-flex flex-lg-column">
      <div className="container-fluid d-flex flex-column flex-md-row align-items-center justify-content-between">
        <div className="text-dark order-2 order-md-1">
          <BackendHealthStatusIndicator />
          {translate('Version')}: {ENV.buildId}
        </div>

        <FooterLinks />
      </div>
    </div>
  );
};
