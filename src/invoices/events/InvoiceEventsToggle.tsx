import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const InvoiceEventsDialog = lazyComponent(
  () => import('./InvoiceEventsDialog'),
  'InvoiceEventsDialog',
);

export const InvoiceEventsToggle: FunctionComponent<{ resource: string }> = ({
  resource,
}) => {
  const dispatch = useDispatch();
  const showEvents = () => {
    dispatch(
      openModalDialog(InvoiceEventsDialog, {
        resolve: {
          resource,
        },
        size: 'lg',
      }),
    );
  };
  if (!isFeatureVisible('invoice.events')) {
    return null;
  }
  return (
    <div className="hidden-print">
      <small>
        <a onClick={showEvents}>{translate('Show events')}</a>
      </small>
    </div>
  );
};
