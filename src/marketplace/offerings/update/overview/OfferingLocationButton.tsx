import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { updateProviderOffering } from '@waldur/marketplace/common/api';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getUser } from '@waldur/workspace/selectors';

import { ARCHIVED } from '../../store/constants';

const SetLocationDialog = lazyComponent(
  () => import('@waldur/map/SetLocationDialog'),
  'SetLocationDialog',
);

export const OfferingLocationButton = ({ offering, refetch }) => {
  const user = useSelector(getUser);
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(SetLocationDialog, {
        resolve: {
          data: offering,
          setLocationFn: async (formData) => {
            try {
              await updateProviderOffering(offering.uuid, formData);
              dispatch(
                showSuccess(translate('Location has been saved successfully.')),
              );
              refetch();
              dispatch(closeModalDialog());
            } catch (error) {
              dispatch(
                showErrorResponse(error, translate('Unable to save location.')),
              );
            }
          },
          label: translate('Location of {name} offering', {
            name: offering.name,
          }),
        },
        size: 'lg',
      }),
    );
  if (!user.is_staff) {
    return null;
  }
  if (offering.state === ARCHIVED) {
    return null;
  }
  return (
    <Button onClick={callback} size="sm" className="me-3">
      <i className="fa fa-pencil" /> {translate('Edit')}
    </Button>
  );
};
