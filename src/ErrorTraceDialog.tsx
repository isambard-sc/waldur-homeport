import { FallbackRender } from '@sentry/react';

import { translate } from '@waldur/i18n';

import { MetronicModalDialog } from './modal/MetronicModalDialog';

export const ErrorTraceDialog: FallbackRender = (props) => {
  return (
    <MetronicModalDialog title={translate('Error trace')} closeButton>
      <div className="text-muted mh-300px scroll-y">
        {props.componentStack || (props.error as Error).stack}
      </div>
    </MetronicModalDialog>
  );
};
