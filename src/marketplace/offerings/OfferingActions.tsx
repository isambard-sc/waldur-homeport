import { ButtonGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { isOwnerOrStaff, isSupportOnly } from '@waldur/workspace/selectors';

import { OfferingItemActions } from './actions/OfferingItemActions';
import { PreviewOfferingButton } from './PreviewOfferingButton';

export const OfferingActions = ({ row, fetch }) => {
  const actionsEnabled = useSelector(isOwnerOrStaff);
  const hideOfferingItemActions = useSelector(isSupportOnly);
  if (!actionsEnabled) {
    return null;
  }
  return (
    <ButtonGroup>
      {!hideOfferingItemActions && (
        <OfferingItemActions offering={row} refreshOffering={fetch} />
      )}
      <PreviewOfferingButton offering={row} />
    </ButtonGroup>
  );
};
