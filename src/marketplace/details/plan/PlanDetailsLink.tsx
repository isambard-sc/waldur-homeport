import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';

import { showPlanDetailsDialog } from './actions';

interface OwnProps {
  resource: string;
}

export const PlanDetailsLink: FunctionComponent<OwnProps> = ({ resource }) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(showPlanDetailsDialog(resource));
  };

  return (
    <Button variant="link" className="btn-flush" onClick={handleClick}>
      {translate('Show')}
    </Button>
  );
};
