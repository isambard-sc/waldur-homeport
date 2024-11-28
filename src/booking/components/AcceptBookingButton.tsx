import { FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { acceptBooking } from '@waldur/booking/api';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

interface AcceptBookingButtonProps {
  resourceUuid: string;
  pending: boolean;
  refetch?: () => void;
}

export const AcceptBookingButton: FC<AcceptBookingButtonProps> = ({
  resourceUuid,
  pending,
  refetch,
}) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);

  const acceptRequest = async () => {
    try {
      setIsAccepting(true);
      await acceptBooking(resourceUuid);
      setIsAccepting(false);
      if (refetch) refetch();
      dispatch(showSuccess(translate('Booking has been accepted.')));
      dispatch(closeModalDialog());
    } catch (e) {
      setIsAccepting(false);
      dispatch(showErrorResponse(e, translate('Unable to accept booking.')));
    }
  };

  return (
    <SubmitButton
      disabled={
        pending ||
        !hasPermission(user, {
          permission: PermissionEnum.ACCEPT_BOOKING_REQUEST,
          customerId: customer.uuid,
        })
      }
      submitting={isAccepting}
      label={translate('Accept')}
      className="btn btn-success me-2"
      onClick={acceptRequest}
    />
  );
};
