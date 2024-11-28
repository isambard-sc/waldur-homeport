import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';

import { rejectBooking } from '@waldur/booking/api';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface RejectBookingButtonProps {
  resourceUuid: string;
  pending: boolean;
  isServiceProviderContext: boolean;
  refetch?: () => void;
}

export const RejectBookingButton: FC<RejectBookingButtonProps> = ({
  resourceUuid,
  pending,
  isServiceProviderContext,
  refetch,
}) => {
  const [isRejecting, setIsRejecting] = useState(false);
  const dispatch = useDispatch();

  const rejectRequest = async () => {
    try {
      setIsRejecting(true);
      await rejectBooking(resourceUuid);
      setIsRejecting(false);
      if (refetch) refetch();
      dispatch(showSuccess(translate('Booking has been cancelled.')));
      dispatch(closeModalDialog());
    } catch (e) {
      setIsRejecting(false);
      dispatch(showErrorResponse(e, translate('Unable to cancel booking.')));
    }
  };

  return (
    <SubmitButton
      disabled={pending}
      submitting={isRejecting}
      label={
        isServiceProviderContext ? translate('Deny') : translate('Cancel order')
      }
      className="btn btn-danger"
      onClick={rejectRequest}
    />
  );
};
