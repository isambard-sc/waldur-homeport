import { Eye } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const OfferingDetailsDialog = lazyComponent(
  () => import('./OfferingDetailsDialog'),
  'OfferingDetailsDialog',
);

export const openOfferingDetailsDialog = (offering: any) =>
  openModalDialog(OfferingDetailsDialog, {
    resolve: { offering },
    size: 'lg',
  });

interface OfferingDetailsButtonProps {
  offering: string;
}

export const OfferingDetailsButton: FC<OfferingDetailsButtonProps> = ({
  offering,
}) => {
  const dispatch = useDispatch();

  return (
    <ActionButton
      title={translate('Offering details')}
      iconNode={<Eye />}
      action={() => {
        dispatch(openOfferingDetailsDialog(offering));
      }}
      className="me-3"
    />
  );
};
