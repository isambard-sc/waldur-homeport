import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';

const PaymentProfileUpdateDialogContainer = lazyComponent(() =>
  import('./PaymentProfileUpdateDialog').then((module) => ({
    default: module.PaymentProfileUpdateDialogContainer,
  })),
);

export const PaymentProfileEditButton = (props) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(PaymentProfileUpdateDialogContainer, {
        resolve: { profile: props.row, refetch: props.refetch },
      }),
    );

  return (
    <EditAction action={callback} {...props.tooltipAndDisabledAttributes} />
  );
};
